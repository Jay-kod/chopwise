import crypto from 'node:crypto';
import { withHandler, AppError } from './_lib/http.js';
import { query } from './_lib/mysql.js';
import { hashPassword, verifyPassword, signToken } from './_lib/authTokens.js';
import { verifyRequest, checkIsAdmin } from './_lib/auth.js';
import { profileSchema } from './_lib/schemas.js';

const parseJson = (val, fb = {}) => {
  try { return typeof val === 'string' ? JSON.parse(val) : (val || fb); } catch { return fb; }
};

function formatUser(row, profile = {}) {
  const name = row.name || profile.displayName || (row.email ? row.email.split('@')[0] : '');
  return {
    id: row.id, uid: row.id, email: row.email, name,
    profileComplete: Boolean(row.profile_complete),
    profile: { ...profile, displayName: name },
    avatar: row.avatar || profile.avatar || null,
  };
}

export default withHandler(async (req, res) => {
  const body = req.body || {};
  const action = body.action;
  if (!action) throw AppError.validation({ action: 'Action is required.' });

  // 1. Action: register
  if (action === 'register') {
    const { name, email, password, consent } = body;
    if (!email || !password) throw AppError.validation({ form: 'Email and password are required.' });
    const cleanName = typeof name === 'string' ? name.trim() : '';
    if (!cleanName) throw AppError.validation({ name: 'Full name is required.' });
    if (cleanName.length > 100) throw AppError.validation({ name: 'Name must be 100 characters or fewer.' });
    if (password.length < 8) throw AppError.validation({ password: 'Password must be at least 8 characters long.' });
    if (!consent) throw AppError.validation({ consent: 'Consent to health data storage is required.' });

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    if (existing.length > 0) {
      throw new AppError('USER_EXISTS', 'An account with this email already exists. Please log in.', 409);
    }

    const id = crypto.randomUUID();
    const passwordHash = hashPassword(password);
    const now = new Date();
    const initialProfile = { displayName: cleanName };

    await query(
      `INSERT INTO users (id, email, name, password_hash, created_at, consent_at, profile_complete, profile)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [id, normalizedEmail, cleanName, passwordHash, now, now, JSON.stringify(initialProfile)]
    );

    const token = signToken({ uid: id, email: normalizedEmail });
    const user = { id, uid: id, name: cleanName, email: normalizedEmail, profileComplete: false, profile: initialProfile };
    return res.status(200).json({ ok: true, token, user });
  }

  // 2. Action: login
  if (action === 'login') {
    const { email, password } = body;
    if (!email || !password) throw AppError.validation({ form: 'Email and password are required.' });

    const normalizedEmail = email.trim().toLowerCase();
    const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    if (rows.length === 0 || !verifyPassword(password, rows[0].password_hash)) {
      throw AppError.unauthorized('Incorrect email or password. Please try again.');
    }

    const row = rows[0];
    if (!Boolean(row.is_active)) {
      throw AppError.unauthorized('This account has been disabled. Contact support for assistance.');
    }
    const profile = parseJson(row.profile);
    const token = signToken({ uid: row.id, email: row.email });
    return res.status(200).json({ ok: true, token, user: formatUser(row, profile) });
  }

  // Authenticated actions below require valid token
  const authSession = await verifyRequest(req);
  const uid = authSession.uid;

  // 3. Action: me
  if (action === 'me') {
    const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [uid]);
    if (rows.length === 0) throw AppError.notFound('User record not found.');
    const row = rows[0];
    const profile = parseJson(row.profile);
    return res.status(200).json({ user: formatUser(row, profile), isAdmin: await checkIsAdmin(row.id) });
  }

  // 4. Action: update-profile
  if (action === 'update-profile') {
    const rawProfile = body.profile || {};
    const parsed = profileSchema.safeParse(rawProfile);
    if (!parsed.success) throw AppError.validation({ profile: 'Invalid profile data structure.' });

    const rows = await query('SELECT name, avatar FROM users WHERE id = ? LIMIT 1', [uid]);
    const avatar = parsed.data.avatar || rows?.[0]?.avatar || null;
    const name = parsed.data.displayName || rows?.[0]?.name || null;
    const profileData = { ...parsed.data, displayName: name || '', ...(avatar ? { avatar } : {}), updatedAt: new Date().toISOString() };

    await query(
      'UPDATE users SET profile = ?, name = COALESCE(?, name), avatar = COALESCE(?, avatar), profile_complete = 1, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(profileData), name, avatar, uid]
    );
    return res.status(200).json({ ok: true, profile: profileData, avatar });
  }

  // 4b. Action: update-avatar
  if (action === 'update-avatar') {
    const avatar = typeof body.avatar === 'string' ? body.avatar.trim() : '';
    if (!avatar) throw AppError.validation({ avatar: 'Avatar selection or image data is required.' });
    if (avatar.length > 300000) throw AppError.validation({ avatar: 'Avatar is too large. Choose under 200KB.' });

    const rows = await query('SELECT profile FROM users WHERE id = ? LIMIT 1', [uid]);
    if (rows.length === 0) throw AppError.notFound('User record not found.');

    const currentProfile = parseJson(rows[0].profile);
    currentProfile.avatar = avatar;
    currentProfile.updatedAt = new Date().toISOString();

    await query('UPDATE users SET avatar = ?, profile = ?, updated_at = NOW() WHERE id = ?', [avatar, JSON.stringify(currentProfile), uid]);
    return res.status(200).json({ ok: true, avatar });
  }

  // 5. Action: get-saved-meals
  if (action === 'get-saved-meals') {
    const rows = await query(
      'SELECT id, meal_id, meal, saved_at FROM saved_meals WHERE user_id = ? ORDER BY saved_at DESC',
      [uid]
    );
    const savedMeals = rows.map((r) => ({ id: r.meal_id || r.id, meal: parseJson(r.meal), savedAt: r.saved_at }));
    return res.status(200).json({ savedMeals });
  }

  // 6. Action: save-meal
  if (action === 'save-meal') {
    const meal = body.meal;
    if (!meal || !meal.id) throw AppError.validation({ meal: 'Meal object with an id is required.' });

    const id = `${uid}_${meal.id}`;
    await query(
      `INSERT INTO saved_meals (id, user_id, meal_id, meal, saved_at) VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE meal = VALUES(meal), saved_at = NOW()`,
      [id, uid, meal.id, JSON.stringify(meal)]
    );
    return res.status(200).json({ ok: true });
  }

  // 7. Action: delete-saved-meal
  if (action === 'delete-saved-meal') {
    const mealId = body.mealId;
    if (!mealId) throw AppError.validation({ mealId: 'mealId is required.' });
    await query('DELETE FROM saved_meals WHERE user_id = ? AND meal_id = ?', [uid, mealId]);
    return res.status(200).json({ ok: true });
  }

  // 8. Action: get-meal
  if (action === 'get-meal') {
    const mealId = body.mealId;
    if (!mealId) throw AppError.validation({ mealId: 'mealId is required.' });

    let meal = null;
    let isSaved = false;

    const savedRows = await query('SELECT meal FROM saved_meals WHERE user_id = ? AND meal_id = ? LIMIT 1', [uid, mealId]);
    if (savedRows.length > 0) {
      isSaved = true;
      meal = parseJson(savedRows[0].meal, null);
    }

    if (!meal) {
      const recRows = await query('SELECT meals FROM latest_recs WHERE user_id = ? LIMIT 1', [uid]);
      if (recRows.length > 0) {
        const meals = parseJson(recRows[0].meals, []);
        if (Array.isArray(meals)) meal = meals.find((m) => m.id === mealId) || null;
      }
    }

    if (!meal) {
      const catRows = await query('SELECT id, recipe FROM recipe_catalog WHERE id = ? LIMIT 1', [mealId]);
      if (catRows.length > 0) {
        const catRecipe = parseJson(catRows[0].recipe, null);
        if (catRecipe) meal = { ...catRecipe, id: catRows[0].id };
      }
    }

    return res.status(200).json({ meal, isSaved });
  }

  throw AppError.validation({ action: `Unknown auth action: ${action}` });
});
