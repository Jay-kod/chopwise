import { decrypt } from './crypto.js';
import { DEFAULT_SETTINGS, DEFAULT_SAFETY } from './data/defaults.js';
import seedPrices from './data/seedPrices.json' with { type: 'json' };
import { settingsSchema, safetySchema, pricesSchema } from './schemas.js';
import {
  CACHE_TTL_MS,
  cache,
  clearConfigCache,
  maskSecret,
  loadDoc,
  saveDoc,
} from './configBase.js';
import { saveConfig, resetSection } from './configSavers.js';

export { clearConfigCache, maskSecret, saveConfig, resetSection };

export async function getGeminiConfig() {
  const now = Date.now();
  const cached = cache.get('gemini');
  if (cached && cached.expiresAt > now) return cached.data;

  const doc = await loadDoc('integrations');
  const stored = doc?.gemini || {};

  let apiKey = null;
  if (stored.apiKeyEnc) {
    try {
      apiKey = decrypt(stored.apiKeyEnc);
    } catch {
      apiKey = null;
    }
  }
  if (!apiKey && process.env.GEMINI_API_KEY) apiKey = process.env.GEMINI_API_KEY;

  const data = {
    apiKey,
    model: stored.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    updatedAt: stored.updatedAt || null,
  };

  cache.set('gemini', { data, expiresAt: now + CACHE_TTL_MS });
  return data;
}

export async function getEdamamConfig() {
  const now = Date.now();
  const cached = cache.get('edamam');
  if (cached && cached.expiresAt > now) return cached.data;

  const doc = await loadDoc('integrations');
  const stored = doc?.edamam || {};

  let appId = null;
  let appKey = null;

  if (stored.appIdEnc) {
    try {
      appId = decrypt(stored.appIdEnc);
    } catch {
      appId = null;
    }
  }
  if (stored.appKeyEnc) {
    try {
      appKey = decrypt(stored.appKeyEnc);
    } catch {
      appKey = null;
    }
  }

  if (!appId && process.env.EDAMAM_APP_ID) appId = process.env.EDAMAM_APP_ID;
  if (!appKey && process.env.EDAMAM_APP_KEY) appKey = process.env.EDAMAM_APP_KEY;

  const enabled = stored.enabled !== undefined ? Boolean(stored.enabled) : Boolean(appId && appKey);
  const data = { appId, appKey, enabled, updatedAt: stored.updatedAt || null };

  cache.set('edamam', { data, expiresAt: now + CACHE_TTL_MS });
  return data;
}

export async function getSettingsConfig() {
  const now = Date.now();
  const cached = cache.get('settings');
  if (cached && cached.expiresAt > now) return cached.data;

  const doc = await loadDoc('settings');
  const merged = { ...DEFAULT_SETTINGS, ...(doc || {}) };
  const validated = settingsSchema.parse(merged);

  cache.set('settings', { data: validated, expiresAt: now + CACHE_TTL_MS });
  return validated;
}

export async function getSafetyConfig() {
  const now = Date.now();
  const cached = cache.get('safety');
  if (cached && cached.expiresAt > now) return cached.data;

  const doc = await loadDoc('safety');
  const merged = { ...DEFAULT_SAFETY, ...(doc || {}) };
  const validated = safetySchema.parse(merged);

  cache.set('safety', { data: validated, expiresAt: now + CACHE_TTL_MS });
  return validated;
}

export async function getPricesConfig() {
  const now = Date.now();
  const cached = cache.get('prices');
  if (cached && cached.expiresAt > now) return cached.data;

  const doc = await loadDoc('prices');
  const items = doc?.items && Array.isArray(doc.items) ? doc.items : seedPrices;
  const validated = pricesSchema.parse({
    items,
    updatedAt: doc?.updatedAt || null,
  });

  cache.set('prices', { data: validated, expiresAt: now + CACHE_TTL_MS });
  return validated;
}
