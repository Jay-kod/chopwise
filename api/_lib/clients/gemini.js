import { GoogleGenAI } from '@google/genai';
import { getGeminiConfig } from '../configStore.js';
import { AppError } from '../http.js';

/**
 * Sort Gemini models: Flash models first, then Pro models, then others.
 * @param {Array<{ id: string, name: string, displayName: string, description: string }>} models
 * @returns {Array<{ id: string, name: string, displayName: string, description: string }>}
 */
export function sortGeminiModels(models) {
  const getPriority = (item) => {
    const idLower = item.id.toLowerCase();
    if (idLower.includes('2.5-flash')) return 1;
    if (idLower.includes('2.0-flash')) return 2;
    if (idLower.includes('1.5-flash')) return 3;
    if (idLower.includes('flash')) return 4;
    if (idLower.includes('pro')) return 5;
    return 6;
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
  for await (const m of rawModels) {
    if (m.supportedActions && m.supportedActions.length > 0 && !m.supportedActions.includes('generateContent')) {
      continue;
    }
    const rawName = m.name || '';
    const id = rawName.replace(/^models\//, '');
    if (!id || !id.toLowerCase().startsWith('gemini')) {
      continue;
    }
    models.push({
      id,
      name: rawName,
      displayName: m.displayName || id,
      description: m.description || '',
    });
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
    const response = await ai.models.list();
    return await parseGeminiModels(response);
  } catch (err) {
    if (err instanceof AppError) throw err;
    const msg = err.message || 'unknown error';
    throw AppError.aiFailed(`Failed to list Gemini models: ${msg}`);
  }
}

/**
 * Call Google Gemini API in structured JSON mode.
 * @param {string} systemInstruction
 * @param {string|object} userContent - String or object to be stringified as JSON
 * @param {object} [responseSchema] - Optional JSON schema for structured output
 * @param {string} [modelOverride]
 * @returns {Promise<any>} Parsed JSON response
 */
export async function generateJson(
  systemInstruction,
  userContent,
  responseSchema,
  modelOverride
) {
  const config = await getGeminiConfig();
  if (!config.apiKey) {
    throw AppError.notConfigured(
      ['gemini'],
      'Google Gemini API is not configured. Add your API key in /admin.'
    );
  }

  const model = modelOverride || config.model || 'gemini-2.5-flash';
  const ai = new GoogleGenAI({ apiKey: config.apiKey });

  const promptText =
    typeof userContent === 'string' ? userContent : JSON.stringify(userContent);

  const requestConfig = {
    systemInstruction,
    responseMimeType: 'application/json',
  };

  if (responseSchema) {
    requestConfig.responseSchema = responseSchema;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: promptText,
      config: requestConfig,
    });

    const text = response?.text;
    if (!text) {
      throw AppError.aiFailed('Gemini returned an empty response.');
    }

    try {
      return JSON.parse(text);
    } catch (parseErr) {
      throw AppError.aiFailed('Failed to parse Gemini output as JSON.');
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw AppError.aiFailed(`Gemini generation error: ${err.message || 'unknown'}`);
  }
}

