import { encrypt } from './crypto.js';
import { DEFAULT_SETTINGS, DEFAULT_SAFETY } from './data/defaults.js';
import seedPrices from './data/seedPrices.json' with { type: 'json' };
import { settingsSchema, safetySchema, pricesSchema } from './schemas.js';
import { AppError } from './http.js';
import { loadDoc, saveDoc, clearConfigCache } from './configBase.js';
import { getGeminiConfig, getUsdaConfig } from './configStore.js';

function requireConfigEncryptionKey() {
  const key = process.env.CONFIG_ENCRYPTION_KEY;
  if (!key || Buffer.from(key, 'base64').length !== 32) {
    throw AppError.notConfigured(
      ['CONFIG_ENCRYPTION_KEY'],
      'Cannot save integration credentials: configure CONFIG_ENCRYPTION_KEY as a valid 32-byte base64 key in the server environment, then restart the API.'
    );
  }
}

export async function saveConfig(section, values) {
  const now = new Date().toISOString();

  if (section === 'gemini') {
    const enteredApiKey = values.apiKey ? String(values.apiKey).trim() : '';
    if (enteredApiKey) requireConfigEncryptionKey();
    const existing = await getGeminiConfig();
    const apiKey = enteredApiKey || existing.apiKey;
    const model = values.model ? String(values.model).trim() : existing.model;
    const dataToSave = { model, updatedAt: now };
    if (apiKey) dataToSave.apiKeyEnc = encrypt(apiKey);

    const doc = (await loadDoc('integrations')) || {};
    await saveDoc('integrations', { ...doc, gemini: { ...(doc.gemini || {}), ...dataToSave } });
    clearConfigCache('gemini');
    return;
  }

  if (section === 'usda') {
    const enteredApiKey = values.apiKey ? String(values.apiKey).trim() : '';
    if (enteredApiKey) requireConfigEncryptionKey();
    const existing = await getUsdaConfig();
    const apiKey = enteredApiKey || existing.apiKey;
    const enabled = values.enabled !== undefined ? Boolean(values.enabled) : existing.enabled;
    const dataToSave = { enabled, updatedAt: now };
    if (apiKey) dataToSave.apiKeyEnc = encrypt(apiKey);

    const doc = (await loadDoc('integrations')) || {};
    await saveDoc('integrations', { ...doc, usda: { ...(doc.usda || {}), ...dataToSave } });
    clearConfigCache('usda');
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
