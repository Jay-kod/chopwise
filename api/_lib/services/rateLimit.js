import { getAdminDb } from '../firebaseAdmin.js';
import { getSettingsConfig } from '../configStore.js';
import { AppError } from '../http.js';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check and increment the per-user hourly rate limit.
 * Uses a Firestore transaction on rateLimits/{uid}.
 * @param {string} uid - Firebase user UID
 * @throws {AppError} 429 RATE_LIMITED if quota is exceeded
 */
export async function checkRateLimit(uid) {
  if (!uid) return;

  const settings = await getSettingsConfig();
  const limit = settings.rateLimitPerHour || 10;

  const db = getAdminDb();
  const ref = db.collection('rateLimits').doc(uid);
  const now = Date.now();

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(ref);
    const data = doc.exists ? doc.data() : null;

    if (!data || !data.windowStart || now - data.windowStart >= WINDOW_MS) {
      // First request in a new 1-hour window
      transaction.set(ref, {
        windowStart: now,
        count: 1,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    // Within current window
    if (data.count >= limit) {
      const remainingMs = data.windowStart + WINDOW_MS - now;
      const retryAfterSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
      throw AppError.rateLimited(retryAfterSeconds);
    }

    // Increment count
    transaction.update(ref, {
      count: data.count + 1,
      updatedAt: new Date().toISOString(),
    });
  });
}

