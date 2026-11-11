import crypto from 'node:crypto';
import { query } from '../mysql.js';
import { getUsdaConfig, getSafetyConfig } from '../configStore.js';
import { analyzeIngredients } from '../clients/usda.js';
import { evaluateMealSafety } from './safety.js';
import { AppError } from '../http.js';

export function buildIngredientLines(ingredients = []) {
  return (ingredients || []).map((ingr) => {
    const qty = ingr.quantity != null ? String(ingr.quantity) : '1';
    const unit = (ingr.unit || '').trim().toLowerCase();
    const item = (ingr.item || '').trim();
    if (unit === 'piece') return `${qty} ${item}`;
    return `${qty} ${unit} ${item}`.replace(/\s+/g, ' ').trim();
  });
}

export function computeIngredientsHash(lines = []) {
  const normalized = (lines || [])
    .map((l) => l.toLowerCase().trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .sort();
  return crypto.createHash('sha1').update(normalized.join('|'), 'utf8').digest('hex');
}

export function formatAiEstimateNutrients(estimate = {}) {
  return {
    calories: Math.round(Number(estimate.calories) || 0),
    proteinG: Math.round(Number(estimate.proteinG) || 0),
    carbsG: Math.round(Number(estimate.carbsG) || 0),
    fatG: Math.round(Number(estimate.fatG) || 0),
    sodiumMg: Math.round(Number(estimate.sodiumMg) || 0),
    sugarG: Math.round(Number(estimate.sugarG) || 0),
    vitamins: [],
  };
}

async function fetchMealFromDb(uid, mealId, includeConditions = true) {
  let userConditions = [];
  let meal = null;
  if (includeConditions) {
    const userRows = await query('SELECT profile FROM users WHERE id = ? LIMIT 1', [uid]);
    if (userRows?.[0]?.profile) {
      const p = typeof userRows[0].profile === 'string' ? JSON.parse(userRows[0].profile) : userRows[0].profile;
      userConditions = p?.conditions || [];
    }
  }
  const recRows = await query('SELECT meals FROM latest_recs WHERE user_id = ? LIMIT 1', [uid]);
  if (recRows?.[0]?.meals) {
    const meals = typeof recRows[0].meals === 'string' ? JSON.parse(recRows[0].meals) : recRows[0].meals;
    meal = meals.find((m) => m.id === mealId);
  }
  if (!meal) {
    const saved = await query('SELECT meal FROM saved_meals WHERE user_id = ? AND meal_id = ? LIMIT 1', [uid, mealId]);
    if (saved?.[0]?.meal) {
      meal = typeof saved[0].meal === 'string' ? JSON.parse(saved[0].meal) : saved[0].meal;
    }
  }
  if (!meal) {
    const cat = await query('SELECT id, recipe FROM recipe_catalog WHERE id = ? LIMIT 1', [mealId]);
    if (cat?.[0]?.recipe) {
      const catRecipe = typeof cat[0].recipe === 'string' ? JSON.parse(cat[0].recipe) : cat[0].recipe;
      meal = { ...catRecipe, id: cat[0].id };
    }
  }
  return { meal, userConditions };
}

async function resolveUsda(ingredients) {
  try {
    return { result: await analyzeIngredients(ingredients), message: '' };
  } catch (error) {
    const detail = error?.details?.ingredients;
    if (error?.code === 'VALIDATION_ERROR' && detail) return { result: null, message: detail };
    if (String(error?.message).includes('could not find a usable match')) {
      return { result: null, message: 'USDA could not match every ingredient. Showing the AI estimate.' };
    }
    if (String(error?.message).toLowerCase().includes('rate limit')) {
      return { result: null, message: 'USDA is rate-limited right now. Showing the AI estimate; try again later.' };
    }
    return { result: null, message: 'USDA could not complete this lookup. Showing the AI estimate.' };
  }
}

async function findCachedNutrition(hash, meal, userConditions, thresholds, forceRefresh) {
  if (!hash || forceRefresh) return null;
  const rows = await query('SELECT nutrition, source FROM nutrition_cache WHERE ingredients_hash = ? LIMIT 1', [hash]);
  if (!rows?.[0]?.nutrition) return null;
  const nutrition = typeof rows[0].nutrition === 'string' ? JSON.parse(rows[0].nutrition) : rows[0].nutrition;
  return {
    nutrition,
    source: rows[0].source || 'usda',
    safetyFlags: evaluateMealSafety({ ...meal, nutrition }, userConditions, thresholds),
    cached: true,
    ...(rows[0].source === 'ai-estimate' ? {
      sourceMessage: 'USDA did not return complete data for this meal; showing the AI estimate. Select Check USDA to try again.',
    } : {}),
  };
}

async function calculateMealNutrition(meal) {
  const conf = await getUsdaConfig();
  const ingredients = meal.ingredients || [];
  if (!conf.enabled || !conf.apiKey) {
    return {
      source: 'ai-estimate',
      nutrition: formatAiEstimateNutrients(meal.aiNutritionEstimate),
      sourceMessage: 'USDA is not configured. Showing the AI estimate.',
    };
  }
  if (!ingredients.length) {
    return {
      source: 'ai-estimate',
      nutrition: formatAiEstimateNutrients(meal.aiNutritionEstimate),
      sourceMessage: 'This meal has no ingredients to look up in USDA. Showing the AI estimate.',
    };
  }
  const usda = await resolveUsda(ingredients);
  return {
    source: usda.result?.source || 'ai-estimate',
    nutrition: usda.result?.nutrition || formatAiEstimateNutrients(meal.aiNutritionEstimate),
    sourceMessage: usda.message,
  };
}

async function saveNutritionCache(hash, nutrition, source) {
  if (!hash) return;
  await query(
    `INSERT INTO nutrition_cache (ingredients_hash, nutrition, source, fetched_at)
     VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE nutrition = VALUES(nutrition), source = VALUES(source), fetched_at = NOW()`,
    [hash, JSON.stringify(nutrition), source]
  );
}

export async function getMealNutrition(uid, mealId, options = {}) {
  const { sampleMeal = null, userConditions = [], forceRefresh = false } = options;
  let meal = sampleMeal;
  let conditions = userConditions;
  if (!meal) {
    if (!mealId || typeof mealId !== 'string') throw AppError.validation({ mealId: 'Valid mealId required.' });
    const fetched = await fetchMealFromDb(uid, mealId);
    meal = fetched.meal;
    conditions = fetched.userConditions;
    if (!meal) throw AppError.notFound('Meal not found.');
  }

  const hash = computeIngredientsHash(buildIngredientLines(meal.ingredients || []));
  const thresholds = await getSafetyConfig();
  const cached = await findCachedNutrition(hash, meal, conditions, thresholds, forceRefresh);
  if (cached) return cached;

  const result = await calculateMealNutrition(meal);
  await saveNutritionCache(hash, result.nutrition, result.source);
  return {
    nutrition: result.nutrition,
    source: result.source,
    ...(result.source === 'ai-estimate' ? { sourceMessage: result.sourceMessage } : {}),
    safetyFlags: evaluateMealSafety({ ...meal, nutrition: result.nutrition }, conditions, thresholds),
    cached: false,
  };
}

/**
 * Loads a meal owned by the signed-in user, or a published catalogue recipe.
 * @param {string} uid
 * @param {string} mealId
 * @returns {Promise<object>}
 */
export async function getMealForUser(uid, mealId) {
  if (!mealId || typeof mealId !== 'string') throw AppError.validation({ mealId: 'Valid mealId required.' });
  const { meal } = await fetchMealFromDb(uid, mealId, false);
  if (!meal) throw AppError.notFound(`Meal "${mealId}" not found in recommendations or saved meals.`);
  return meal;
}
