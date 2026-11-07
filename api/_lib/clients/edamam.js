import { getEdamamConfig } from '../configStore.js';
import { AppError } from '../http.js';

const EDAMAM_NUTRITION_ENDPOINT = 'https://api.edamam.com/api/nutrition-details';

/**
 * Call Edamam Nutrition Analysis API for an ingredient list.
 * @param {string} title - Meal or recipe title
 * @param {string[]} ingredientLines - Natural language ingredient strings
 * @returns {Promise<{ calories: number, totalNutrients: object, source: 'edamam', raw: object }>}
 */
export async function analyzeIngredients(title, ingredientLines) {
  const config = await getEdamamConfig();

  if (!config.enabled) {
    throw AppError.notConfigured(
      ['edamam'],
      'Edamam Nutrition Analysis integration is currently disabled.'
    );
  }

  if (!config.appId || !config.appKey) {
    throw AppError.notConfigured(
      ['edamam'],
      'Edamam credentials are not configured. Add your App ID and App Key in /admin.'
    );
  }

  const url = `${EDAMAM_NUTRITION_ENDPOINT}?app_id=${encodeURIComponent(
    config.appId
  )}&app_key=${encodeURIComponent(config.appKey)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        title: title || 'Nigerian Meal',
        ingr: ingredientLines,
        yield: 1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Edamam returned HTTP ${res.status}: ${errText.slice(0, 100)}`);
    }

    const data = await res.json();
    return {
      calories: Math.round(data?.calories || 0),
      totalNutrients: data?.totalNutrients || {},
      source: 'edamam',
      raw: data,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

