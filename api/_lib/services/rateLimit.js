import { getSupabaseAdmin } from '../supabaseAdmin.js';
import { getSettingsConfig } from '../configStore.js';
import { AppError } from '../http.js';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check and increment the per-user hourly rate limit.
 * Stores window state in public.rate_limits table.
 * @param {string} uid - User ID
 * @throws {AppError} 429 RATE_LIMITED if quota is exceeded
 */
export async function checkRateLimit(uid) {
  if (!uid) return;

  const settings = await getSettingsConfig();
  const limit = settings.rateLimitPerHour || 10;

  const supabase = getSupabaseAdmin();
  const now = Date.now();

  const { data, error } = await supabase
    .from('rate_limits')
    .select('window_start, count')
    .eq('user_id', uid)
    .maybeSingle();

  if (error || !data || !data.window_start || now - Number(data.window_start) >= WINDOW_MS) {
    await supabase.from('rate_limits').upsert({
      user_id: uid,
      window_start: now,
      count: 1,
    });
    return;
  }

  if (data.count >= limit) {
    const remainingMs = Number(data.window_start) + WINDOW_MS - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
    throw AppError.rateLimited(retryAfterSeconds);
  }

  await supabase
    .from('rate_limits')
    .update({ count: data.count + 1 })
    .eq('user_id', uid);
}
