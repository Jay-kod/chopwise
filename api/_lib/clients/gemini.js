import { GoogleGenAI } from '@google/genai';
import { getGeminiConfig } from '../configStore.js';
import { AppError } from '../http.js';

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
