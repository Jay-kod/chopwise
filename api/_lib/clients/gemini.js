import { GoogleGenAI } from '@google/genai';
import { getGeminiConfig } from '../configStore.js';
import { AppError } from '../http.js';

export const RESILIENT_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
];

/**
 * Sort Gemini models: Active Flash models first, then Pro models, then others.
 * @param {Array<{ id: string, name: string, displayName: string, description: string }>} models
 * @returns {Array<{ id: string, name: string, displayName: string, description: string }>}
 */
export function sortGeminiModels(models) {
  const getPriority = (item) => {
    const idLower = item.id.toLowerCase();
    if (idLower.includes('3.5-flash-lite')) return 1;
    if (idLower.includes('3.5-flash')) return 2;
    if (idLower.includes('3.1-flash-lite')) return 3;
    if (idLower.includes('3.6-flash')) return 4;
    if (idLower.includes('3.8-flash')) return 5;
    if (idLower.includes('2.5-flash')) return 6;
    if (idLower.includes('flash')) return 7;
    if (idLower.includes('pro')) return 8;
    return 9;
  };
  return [...models].sort((a, b) => {
    const diff = getPriority(a) - getPriority(b);
    return diff !== 0 ? diff : a.id.localeCompare(b.id);
  });
}

/**
 * Filter and format raw models from GoogleGenAI models list.
 * @param {AsyncIterable<any>|Iterable<any>} rawModels
 * @returns {Promise<Array<{ id: string, name: string, displayName: string, description: string }>>}
 */
export async function parseGeminiModels(rawModels) {
  const models = [];
  try {
    for await (const m of rawModels) {
      if (m.supportedActions && m.supportedActions.length > 0 && !m.supportedActions.includes('generateContent')) {
        continue;
      }
      const rawName = m.name || '';
      const id = rawName.replace(/^models\//, '');
      if (!id || !id.toLowerCase().startsWith('gemini')) {
        continue;
      }
      const idLower = id.toLowerCase();
      // Exclude internal/experimental or zero-quota models like argon, embed, aqa
      if (idLower.includes('argon') || idLower.includes('embed') || idLower.includes('aqa')) {
        continue;
      }
      models.push({
        id,
        name: rawName,
        displayName: m.displayName || id,
        description: m.description || '',
      });
      // Do not keep requesting additional pages beyond 30 available models
      if (models.length >= 30) {
        break;
      }
    }
  } catch (err) {
    if (models.length === 0) throw err;
  }
  return sortGeminiModels(models);
}

/**
 * Fetch available Gemini models that support generateContent.
 * @param {string} [apiKeyOverride] - Optional API key
 * @returns {Promise<Array<{ id: string, name: string, displayName: string, description: string }>>}
 */
export async function listAvailableModels(apiKeyOverride) {
  let apiKey = apiKeyOverride ? String(apiKeyOverride).trim() : null;
  if (!apiKey) {
    const config = await getGeminiConfig();
    apiKey = config.apiKey;
  }

  if (!apiKey) {
    throw AppError.validation({
      apiKey: 'Google Gemini API key is required to list available models.',
    });
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const listPromise = (async () => {
      const response = await ai.models.list();
      return await parseGeminiModels(response);
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Querying Gemini models timed out after 10s.')), 10000)
    );

    return await Promise.race([listPromise, timeoutPromise]);
  } catch (err) {
    if (err instanceof AppError) throw err;
    const msg = err.message || 'unknown error';
    throw AppError.aiFailed(`Failed to list Gemini models: ${msg}`);
  }
}

/**
 * Check if a Gemini error indicates model unreachability or transient demand spikes.
 * @param {any} err
 * @returns {boolean}
 */
function isTransientOrUnavailableError(err) {
  const msg = String(err?.message || '');
  return (
    err?.status === 503 ||
    err?.status === 429 ||
    err?.status === 404 ||
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('high demand') ||
    msg.includes('limit: 0') ||
    msg.includes('quota') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('no longer available') ||
    msg.includes('NOT_FOUND')
  );
}

/**
 * Execute generation attempt with a specific model.
 * @param {GoogleGenAI} ai
 * @param {string} model
 * @param {string} promptText
 * @param {object} requestConfig
 * @returns {Promise<any>}
 */
async function tryGenerateWithModel(ai, model, promptText, requestConfig) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Gemini request to ${model} timed out after 12s`)), 12000)
  );
  const response = await Promise.race([
    ai.models.generateContent({
      model,
      contents: promptText,
      config: requestConfig,
    }),
    timeoutPromise,
  ]);
  const text = response?.text;
  if (!text) throw AppError.aiFailed('Gemini returned an empty response.');
  try {
    return JSON.parse(text);
  } catch {
    throw AppError.aiFailed('Failed to parse Gemini output as JSON.');
  }
}

/**
 * Call Google Gemini API in structured JSON mode with automatic multi-model failover.
 * @param {string} systemInstruction
 * @param {string|object} userContent - String or object to be stringified as JSON
 * @param {object} [responseSchema] - Optional JSON schema for structured output
 * @param {string} [modelOverride]
 * @param {string} [keyOverride]
 * @returns {Promise<any>} Parsed JSON response
 */
export async function generateJson(
  systemInstruction,
  userContent,
  responseSchema,
  modelOverride,
  keyOverride
) {
  const config = await getGeminiConfig();
  const apiKey = keyOverride ? String(keyOverride).trim() : config.apiKey;
  if (!apiKey) {
    throw AppError.notConfigured(
      ['gemini'],
      'Google Gemini API is not configured. Add your API key in /admin.'
    );
  }

  const configured = modelOverride || config.model || RESILIENT_MODELS[0];
  const ai = new GoogleGenAI({ apiKey });
  const promptText = typeof userContent === 'string' ? userContent : JSON.stringify(userContent);
  const requestConfig = {
    systemInstruction,
    responseMimeType: 'application/json',
  };
  if (responseSchema) {
    requestConfig.responseSchema = responseSchema;
  }

  const candidateModels = [configured, ...RESILIENT_MODELS].filter(
    (m, i, arr) => m && arr.indexOf(m) === i
  );

  let lastError = null;
  for (const model of candidateModels) {
    try {
      return await tryGenerateWithModel(ai, model, promptText, requestConfig);
    } catch (err) {
      lastError = err;
      if (!isTransientOrUnavailableError(err)) {
        break;
      }
    }
  }

  if (lastError instanceof AppError) throw lastError;
  throw AppError.aiFailed(`Gemini generation error: ${lastError?.message || 'unknown'}`);
}

