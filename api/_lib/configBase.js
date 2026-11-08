import { query } from './mysql.js';

export const CACHE_TTL_MS = 60 * 1000;
export const cache = new Map();

export function clearConfigCache(section) {
  if (section) {
    cache.delete(section);
  } else {
    cache.clear();
  }
}

export function maskSecret(secret) {
  if (!secret || typeof secret !== 'string') return '';
  return `••••${secret.slice(-4)}`;
}

export async function loadDoc(section) {
  try {
    const rows = await query('SELECT config FROM admin_config WHERE section = ? LIMIT 1', [section]);
    if (!rows || rows.length === 0) return null;
    const raw = rows[0].config;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export async function saveDoc(section, data) {
  const existing = (await loadDoc(section)) || {};
  const merged = { ...existing, ...data };
  await query(
    `INSERT INTO admin_config (section, config, updated_at)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE config = VALUES(config), updated_at = NOW()`,
    [section, JSON.stringify(merged)]
  );
  clearConfigCache(section);
}

