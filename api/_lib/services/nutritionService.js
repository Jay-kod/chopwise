import crypto from 'node:crypto';
import { query } from '../mysql.js';
import { getEdamamConfig, getSafetyConfig } from '../configStore.js';
import { analyzeIngredients } from '../clients/edamam.js';
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

export function extractNutrientsFromEdamam(edamamData = {}) {
  const nutrients = edamamData.totalNutrients || {};
  const getAmount = (k) => nutrients[k]?.quantity != null ? Math.round(nutrients[k].quantity) : 0;
  const vitamins = [];
  const map = [
    { key: 'VITA_RAE', name: 'Vitamin A', unit: 'µg' }, { key: 'VITC', name: 'Vitamin C', unit: 'mg' },
    { key: 'VITD', name: 'Vitamin D', unit: 'µg' }, { key: 'TOCPHA', name: 'Vitamin E', unit: 'mg' },
    { key: 'VITB6A', name: 'Vitamin B6', unit: 'mg' }, { key: 'VITB12', name: 'Vitamin B12', unit: 'µg' },
    { key: 'CA', name: 'Calcium', unit: 'mg' }, { key: 'FE', name: 'Iron', unit: 'mg' }, { key: 'K', name: 'Potassium', unit: 'mg' },
  ];
  for (const v of map) {
    if (nutrients[v.key]?.quantity > 0) {
      vitamins.push({
        name: v.name,
        amount: Math.round(nutrients[v.key].quantity * 10) / 10,
        unit: nutrients[v.key].unit || v.unit,
      });
    }
  }
  return {
    calories: Math.round(edamamData.calories || 0),
    proteinG: getAmount('PROCNT'),
    carbsG: getAmount('CHOCDF'),
    fatG: getAmount('FAT'),
    sodiumMg: getAmount('NA'),
    sugarG: getAmount('SUGAR'),
    vitamins,
  };
}

async function fetchMealFromDb(uid, mealId) {
  let userConditions = [];
  let meal = null;
  try {
    const userRows = await query('SELECT profile FROM users WHERE id = ? LIMIT 1', [uid]);
    if (userRows?.[0]?.profile) {
      const p = typeof userRows[0].profile === 'string' ? JSON.parse(userRows[0].profile) : userRows[0].profile;
      userConditions = p?.conditions || [];
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
  } catch {}
  return { meal, userConditions };
}

async function resolveEdamam(lines, mealName) {
  try {
    const res = await analyzeIngredients(mealName, lines);
    if (res?.calories > 0) {
      return { nutrition: extractNutrientsFromEdamam(res.raw), source: 'edamam' };
    }
  } catch {}
  return null;
}

export async function getMealNutrition(uid, mealId, options = {}) {
  let { sampleMeal: meal = null, userConditions = [] } = options;
  if (!meal) {
    if (!mealId || typeof mealId !== 'string') throw AppError.validation({ mealId: 'Valid mealId required.' });
    const fetched = await fetchMealFromDb(uid, mealId);
    meal = fetched.meal;
    userConditions = fetched.userConditions;
    if (!meal) throw AppError.notFound(`Meal "${mealId}" not found in recommendations or saved meals.`);
  }

  const lines = buildIngredientLines(meal.ingredients || []);
  const hash = computeIngredientsHash(lines);
  const thresholds = await getSafetyConfig();

  if (hash) {
    try {
      const rows = await query('SELECT nutrition, source FROM nutrition_cache WHERE ingredients_hash = ? LIMIT 1', [hash]);
      if (rows?.[0]?.nutrition) {
        const nut = typeof rows[0].nutrition === 'string' ? JSON.parse(rows[0].nutrition) : rows[0].nutrition;
        return {
          nutrition: nut,
          source: rows[0].source || 'edamam',
          safetyFlags: evaluateMealSafety({ ...meal, nutrition: nut }, userConditions, thresholds),
          cached: true,
        };
      }
    } catch {}
  }

  const conf = await getEdamamConfig();
  let resolved = conf.enabled && conf.appId && conf.appKey && lines.length > 0 ? await resolveEdamam(lines, meal.name) : null;
  const source = resolved?.source || 'ai-estimate';
  const nutrition = resolved?.nutrition || formatAiEstimateNutrients(meal.aiNutritionEstimate);

  if (hash) {
    try {
      await query(
        `INSERT INTO nutrition_cache (ingredients_hash, nutrition, source, fetched_at)
         VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE nutrition = VALUES(nutrition), source = VALUES(source), fetched_at = NOW()`,
        [hash, JSON.stringify(nutrition), source]
      );
    } catch {}
  }

  return {
    nutrition,
    source,
    safetyFlags: evaluateMealSafety({ ...meal, nutrition }, userConditions, thresholds),
    cached: false,
  };
}
