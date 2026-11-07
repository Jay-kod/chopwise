import { getAdminDb } from './firebaseAdmin.js';
import { encrypt, decrypt } from './crypto.js';
import { DEFAULT_SETTINGS, DEFAULT_SAFETY } from './data/defaults.js';
import seedPrices from './data/seedPrices.json' with { type: 'json' };
import {
  settingsSchema,
  safetySchema,
  pricesSchema,
} from './schemas.js';
import { AppError } from './http.js';

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const cache = new Map(); // section -> { data, expiresAt }

export function clearConfigCache(section) {
  if (section) {
    cache.delete(section);
  } else {
    cache.clear();
  }
}

/**
 * Mask a secret string to only show the last 4 characters.
 * @param {string} secret
 * @returns {string} e.g. "••••1234"
 */
export function maskSecret(secret) {
  if (!secret || typeof secret !== 'string') return '';
  const tail = secret.slice(-4);
  return `••••${tail}`;
}

/**
 * Load raw Firestore document from adminConfig/{section}
 * @param {string} section
 * @returns {Promise<object|null>}
 */
async function loadDoc(section) {
  try {
    const db = getAdminDb();
    const snap = await db.collection('adminConfig').doc(section).get();
    return snap.exists ? snap.data() : null;
  } catch (err) {
    // If Firebase Admin is not yet configured or permission denied
    return null;
  }
}

/**
 * Save raw document to adminConfig/{section}
 * @param {string} section
 * @param {object} data
 */
async function saveDoc(section, data) {
  const db = getAdminDb();
  await db.collection('adminConfig').doc(section).set(data, { merge: true });
  clearConfigCache(section);
}

/**
 * Fetch and decrypt Gemini integration config.
 * Resolution: Firestore -> Environment fallback -> null.
 */
export async function getGeminiConfig() {
  const now = Date.now();
  const cached = cache.get('gemini');
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

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

  // Fallback to environment
  if (!apiKey && process.env.GEMINI_API_KEY) {
    apiKey = process.env.GEMINI_API_KEY;
  }

  let model = stored.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const data = {
    apiKey,
    model,
    updatedAt: stored.updatedAt || null,
  };

  cache.set('gemini', { data, expiresAt: now + CACHE_TTL_MS });
  return data;
}

/**
 * Fetch and decrypt Edamam integration config.
 * Resolution: Firestore -> Environment fallback -> null.
 */
export async function getEdamamConfig() {
  const now = Date.now();
  const cached = cache.get('edamam');
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

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

  if (!appId && process.env.EDAMAM_APP_ID) {
    appId = process.env.EDAMAM_APP_ID;
  }
  if (!appKey && process.env.EDAMAM_APP_KEY) {
    appKey = process.env.EDAMAM_APP_KEY;
  }

  const enabled = stored.enabled !== undefined ? Boolean(stored.enabled) : Boolean(appId && appKey);

  const data = {
    appId,
    appKey,
    enabled,
    updatedAt: stored.updatedAt || null,
  };

  cache.set('edamam', { data, expiresAt: now + CACHE_TTL_MS });
  return data;
}

/**
 * Fetch recommendation settings with default fallbacks.
 */
export async function getSettingsConfig() {
  const now = Date.now();
  const cached = cache.get('settings');
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const doc = await loadDoc('settings');
  const merged = { ...DEFAULT_SETTINGS, ...(doc || {}) };
  const validated = settingsSchema.parse(merged);

  cache.set('settings', { data: validated, expiresAt: now + CACHE_TTL_MS });
  return validated;
}

/**
 * Fetch safety thresholds with default fallbacks.
 */
export async function getSafetyConfig() {
  const now = Date.now();
  const cached = cache.get('safety');
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const doc = await loadDoc('safety');
  const merged = { ...DEFAULT_SAFETY, ...(doc || {}) };
  const validated = safetySchema.parse(merged);

  cache.set('safety', { data: validated, expiresAt: now + CACHE_TTL_MS });
  return validated;
}

/**
 * Fetch ingredient price table with seed fallback.
 */
export async function getPricesConfig() {
  const now = Date.now();
  const cached = cache.get('prices');
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const doc = await loadDoc('prices');
  const items = doc?.items && Array.isArray(doc.items) ? doc.items : seedPrices;
  const validated = pricesSchema.parse({
    items,
    updatedAt: doc?.updatedAt || null,
  });

  cache.set('prices', { data: validated, expiresAt: now + CACHE_TTL_MS });
  return validated;
}

/**
 * Save a config section safely.
 * @param {'gemini'|'edamam'|'settings'|'safety'|'prices'} section
 * @param {object} values
 */
export async function saveConfig(section, values) {
  const now = new Date().toISOString();

  if (section === 'gemini') {
    const existing = await getGeminiConfig();
    const apiKey = values.apiKey ? String(values.apiKey).trim() : existing.apiKey;
    const model = values.model ? String(values.model).trim() : existing.model;

    const dataToSave = {
      model,
      updatedAt: now,
    };
    if (apiKey) {
      dataToSave.apiKeyEnc = encrypt(apiKey);
    }

    const doc = (await loadDoc('integrations')) || {};
    await saveDoc('integrations', {
      ...doc,
      gemini: { ...(doc.gemini || {}), ...dataToSave },
    });
    clearConfigCache('gemini');
    return;
  }

  if (section === 'edamam') {
    const existing = await getEdamamConfig();
    const appId = values.appId ? String(values.appId).trim() : existing.appId;
    const appKey = values.appKey ? String(values.appKey).trim() : existing.appKey;
    const enabled = values.enabled !== undefined ? Boolean(values.enabled) : existing.enabled;

    const dataToSave = {
      enabled,
      updatedAt: now,
    };
    if (appId) dataToSave.appIdEnc = encrypt(appId);
    if (appKey) dataToSave.appKeyEnc = encrypt(appKey);

    const doc = (await loadDoc('integrations')) || {};
    await saveDoc('integrations', {
      ...doc,
      edamam: { ...(doc.edamam || {}), ...dataToSave },
    });
    clearConfigCache('edamam');
    return;
  }

  if (section === 'settings') {
    const validated = settingsSchema.parse({ ...values, updatedAt: now });
    await saveDoc('settings', validated);
    clearConfigCache('settings');
    return;
  }

  if (section === 'safety') {
    const validated = safetySchema.parse({ ...values, updatedAt: now });
    await saveDoc('safety', validated);
    clearConfigCache('safety');
    return;
  }

  if (section === 'prices') {
    const validated = pricesSchema.parse({ items: values.items || [], updatedAt: now });
    await saveDoc('prices', validated);
    clearConfigCache('prices');
    return;
  }

  throw AppError.validation({ section: `Unknown config section: ${section}` });
}

/**
 * Reset a section to its default values.
 * @param {'settings'|'safety'|'prices'} section
 */
export async function resetSection(section) {
  const now = new Date().toISOString();

  if (section === 'settings') {
    await saveDoc('settings', { ...DEFAULT_SETTINGS, updatedAt: now });
    clearConfigCache('settings');
    return;
  }

  if (section === 'safety') {
    await saveDoc('safety', { ...DEFAULT_SAFETY, updatedAt: now });
    clearConfigCache('safety');
    return;
  }

  if (section === 'prices') {
    await saveDoc('prices', { items: seedPrices, updatedAt: now });
    clearConfigCache('prices');
    return;
  }

  throw AppError.validation({ section: `Cannot reset section: ${section}` });
}
