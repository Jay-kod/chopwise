import { encrypt } from './crypto.js';
import { DEFAULT_SETTINGS, DEFAULT_SAFETY } from './data/defaults.js';
import seedPrices from './data/seedPrices.json' with { type: 'json' };
import { settingsSchema, safetySchema, pricesSchema } from './schemas.js';
import { AppError } from './http.js';
import { loadDoc, saveDoc, clearConfigCache } from './configBase.js';
import { getGeminiConfig, getEdamamConfig } from './configStore.js';

export async function saveConfig(section, values) {
  const now = new Date().toISOString();

  if (section === 'gemini') {
    const existing = await getGeminiConfig();
    const apiKey = values.apiKey ? String(values.apiKey).trim() : existing.apiKey;
    const model = values.model ? String(values.model).trim() : existing.model;
    const dataToSave = { model, updatedAt: now };
    if (apiKey) dataToSave.apiKeyEnc = encrypt(apiKey);

    const doc = (await loadDoc('integrations')) || {};
    await saveDoc('integrations', { ...doc, gemini: { ...(doc.gemini || {}), ...dataToSave } });
    clearConfigCache('gemini');
    return;
  }

  if (section === 'edamam') {
    const existing = await getEdamamConfig();
    const appId = values.appId ? String(values.appId).trim() : existing.appId;
    const appKey = values.appKey ? String(values.appKey).trim() : existing.appKey;
    const enabled = values.enabled !== undefined ? Boolean(values.enabled) : existing.enabled;
    const dataToSave = { enabled, updatedAt: now };
    if (appId) dataToSave.appIdEnc = encrypt(appId);
    if (appKey) dataToSave.appKeyEnc = encrypt(appKey);

    const doc = (await loadDoc('integrations')) || {};
    await saveDoc('integrations', { ...doc, edamam: { ...(doc.edamam || {}), ...dataToSave } });
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
