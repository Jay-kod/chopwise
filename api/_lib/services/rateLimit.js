import { query } from '../mysql.js';
import { getSettingsConfig } from '../configStore.js';
import { AppError } from '../http.js';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check and increment the per-user hourly rate limit.
 * Stores window state in MySQL rate_limits table.
 * @param {string} uid - User ID
 * @throws {AppError} 429 RATE_LIMITED if quota is exceeded
 */
export async function checkRateLimit(uid) {
  if (!uid) return;

  const settings = await getSettingsConfig();
  const limit = settings.rateLimitPerHour || 10;
  const now = Date.now();

  const rows = await query(
    'SELECT window_start, count FROM rate_limits WHERE user_id = ? LIMIT 1',
    [uid]
  );
  const data = rows && rows.length > 0 ? rows[0] : null;

  if (!data || !data.window_start || now - Number(data.window_start) >= WINDOW_MS) {
    await query(
      `INSERT INTO rate_limits (user_id, window_start, count)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE window_start = VALUES(window_start), count = 1`,
      [uid, now]
    );
    return;
  }

  if (data.count >= limit) {
    const remainingMs = Number(data.window_start) + WINDOW_MS - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
    throw AppError.rateLimited(retryAfterSeconds);
  }

  await query('UPDATE rate_limits SET count = count + 1 WHERE user_id = ?', [uid]);
}
