import crypto from 'node:crypto';
import { withHandler, AppError } from './_lib/http.js';
import { query } from './_lib/mysql.js';
import { hashPassword, verifyPassword, signToken } from './_lib/authTokens.js';
import { verifyRequest, checkIsAdmin } from './_lib/auth.js';
import { profileSchema } from './_lib/schemas.js';

export default withHandler(async (req, res) => {
  const body = req.body || {};
  const action = body.action;

  if (!action) {
    throw AppError.validation({ action: 'Action is required.' });
  }

  // 1. Action: register
  if (action === 'register') {
    const { email, password, consent } = body;
    if (!email || !password) {
      throw AppError.validation({ form: 'Email and password are required.' });
    }
    if (password.length < 8) {
      throw AppError.validation({ password: 'Password must be at least 8 characters long.' });
    }
    if (!consent) {
      throw AppError.validation({ consent: 'Consent to health data storage is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    if (existing.length > 0) {
      throw new AppError('USER_EXISTS', 'An account with this email already exists. Please log in.', 409);
    }

    const id = crypto.randomUUID();
    const passwordHash = hashPassword(password);
    const now = new Date();

    await query(
      `INSERT INTO users (id, email, password_hash, created_at, consent_at, profile_complete, profile)
       VALUES (?, ?, ?, ?, ?, 0, '{}')`,
      [id, normalizedEmail, passwordHash, now, now]
    );

    const token = signToken({ uid: id, email: normalizedEmail });
    const user = { id, uid: id, email: normalizedEmail, profileComplete: false, profile: {} };

    return res.status(200).json({ ok: true, token, user });
  }

  // 2. Action: login
  if (action === 'login') {
    const { email, password } = body;
    if (!email || !password) {
      throw AppError.validation({ form: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);

    if (rows.length === 0 || !verifyPassword(password, rows[0].password_hash)) {
      throw AppError.unauthorized('Incorrect email or password. Please try again.');
    }

    const row = rows[0];
    let profile = {};
    try {
      profile = typeof row.profile === 'string' ? JSON.parse(row.profile || '{}') : row.profile || {};
    } catch {
      profile = {};
    }

    const token = signToken({ uid: row.id, email: row.email });
    const user = {
      id: row.id,
      uid: row.id,
      email: row.email,
      profileComplete: Boolean(row.profile_complete),
      profile,
    };

    return res.status(200).json({ ok: true, token, user });
  }

  // Authenticated actions below require valid token
  const authSession = await verifyRequest(req);
  const uid = authSession.uid;

  // 3. Action: me
  if (action === 'me') {
    const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [uid]);
    if (rows.length === 0) {
      throw AppError.notFound('User record not found.');
    }
    const row = rows[0];
    let profile = {};
    try {
      profile = typeof row.profile === 'string' ? JSON.parse(row.profile || '{}') : row.profile || {};
    } catch {
      profile = {};
    }

    const user = {
      id: row.id,
      uid: row.id,
      email: row.email,
      profileComplete: Boolean(row.profile_complete),
      profile,
    };

    return res.status(200).json({ user, isAdmin: checkIsAdmin(row.id) || checkIsAdmin(row.email) });
  }

  // 4. Action: update-profile
  if (action === 'update-profile') {
    const rawProfile = body.profile || {};
    const parsed = profileSchema.safeParse(rawProfile);
    if (!parsed.success) {
      throw AppError.validation({ profile: 'Invalid profile data structure.' });
    }

    const profileData = { ...parsed.data, updatedAt: new Date().toISOString() };
    await query(
      'UPDATE users SET profile = ?, profile_complete = 1, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(profileData), uid]
    );

    return res.status(200).json({ ok: true, profile: profileData });
  }

  // 5. Action: get-saved-meals
  if (action === 'get-saved-meals') {
    const rows = await query(
      'SELECT id, meal_id, meal, saved_at FROM saved_meals WHERE user_id = ? ORDER BY saved_at DESC',
      [uid]
    );

    const savedMeals = rows.map((r) => {
      let meal = {};
      try {
        meal = typeof r.meal === 'string' ? JSON.parse(r.meal) : r.meal;
      } catch {
        meal = {};
      }
      return { id: r.meal_id || r.id, meal, savedAt: r.saved_at };
    });

    return res.status(200).json({ savedMeals });
  }

  // 6. Action: save-meal
  if (action === 'save-meal') {
    const meal = body.meal;
    if (!meal || !meal.id) {
      throw AppError.validation({ meal: 'Meal object with an id is required.' });
    }

    const id = `${uid}_${meal.id}`;
    await query(
      `INSERT INTO saved_meals (id, user_id, meal_id, meal, saved_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE meal = VALUES(meal), saved_at = NOW()`,
      [id, uid, meal.id, JSON.stringify(meal)]
    );

    return res.status(200).json({ ok: true });
  }

  // 7. Action: delete-saved-meal
  if (action === 'delete-saved-meal') {
    const mealId = body.mealId;
    if (!mealId) {
      throw AppError.validation({ mealId: 'mealId is required.' });
    }

    await query('DELETE FROM saved_meals WHERE user_id = ? AND meal_id = ?', [uid, mealId]);
    return res.status(200).json({ ok: true });
  }

  // 8. Action: get-meal
  if (action === 'get-meal') {
    const mealId = body.mealId;
    if (!mealId) throw AppError.validation({ mealId: 'mealId is required.' });

    let meal = null;
    let isSaved = false;

    const savedRows = await query(
      'SELECT meal FROM saved_meals WHERE user_id = ? AND meal_id = ? LIMIT 1',
      [uid, mealId]
    );
    if (savedRows.length > 0) {
      isSaved = true;
      meal = typeof savedRows[0].meal === 'string' ? JSON.parse(savedRows[0].meal) : savedRows[0].meal;
    }

    if (!meal) {
      const recRows = await query('SELECT meals FROM latest_recs WHERE user_id = ? LIMIT 1', [uid]);
      if (recRows.length > 0) {
        const meals = typeof recRows[0].meals === 'string' ? JSON.parse(recRows[0].meals) : recRows[0].meals;
        if (Array.isArray(meals)) {
          meal = meals.find((m) => m.id === mealId) || null;
        }
      }
    }

    return res.status(200).json({ meal, isSaved });
  }

  throw AppError.validation({ action: `Unknown auth action: ${action}` });
});
