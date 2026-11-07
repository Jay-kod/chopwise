import crypto from 'node:crypto';
import { getAdminDb } from '../firebaseAdmin.js';
import { getEdamamConfig, getSafetyConfig } from '../configStore.js';
import { analyzeIngredients } from '../clients/edamam.js';
import { evaluateMealSafety } from './safety.js';
import { AppError } from '../http.js';

/**
 * Build ingredient lines suitable for Edamam NLP parser.
 * Format: "<qty> <unit> <item>", or "<qty> <item>" for piece units.
 * @param {Array<{ item: string, quantity: number, unit: string }>} ingredients
 * @returns {string[]}
 */
export function buildIngredientLines(ingredients = []) {
  return (ingredients || []).map((ingr) => {
    const qty = ingr.quantity != null ? String(ingr.quantity) : '1';
    const unit = (ingr.unit || '').trim().toLowerCase();
    const item = (ingr.item || '').trim();

    if (unit === 'piece') {
      return `${qty} ${item}`;
    }
    return `${qty} ${unit} ${item}`.replace(/\s+/g, ' ').trim();
  });
}

/**
 * Compute stable SHA-1 hash for ingredient lines.
 * Canonicalizes lines by trimming, lowercasing, and sorting before hashing.
 * @param {string[]} lines
 * @returns {string} SHA-1 hex digest
 */
export function computeIngredientsHash(lines = []) {
  const normalized = (lines || [])
    .map((l) => l.toLowerCase().trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .sort();

  return crypto
    .createHash('sha1')
    .update(normalized.join('|'), 'utf8')
    .digest('hex');
}

/**
 * Format fallback nutrition data from Gemini's aiNutritionEstimate.
 * AI estimates strictly return vitamins as an empty array per docs/API.md.
 * @param {object} estimate
 * @returns {object}
 */
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

/**
 * Extract clean nutrient breakdown and vitamins from Edamam response.
 * @param {object} edamamData
 * @returns {object}
 */
export function extractNutrientsFromEdamam(edamamData = {}) {
  const nutrients = edamamData.totalNutrients || {};

  const getAmount = (key) =>
    nutrients[key]?.quantity != null ? Math.round(nutrients[key].quantity) : 0;

  const vitamins = [];
  const vitaminMap = [
    { key: 'VITA_RAE', name: 'Vitamin A', unit: 'µg' },
    { key: 'VITC', name: 'Vitamin C', unit: 'mg' },
    { key: 'VITD', name: 'Vitamin D', unit: 'µg' },
    { key: 'TOCPHA', name: 'Vitamin E', unit: 'mg' },
    { key: 'VITB6A', name: 'Vitamin B6', unit: 'mg' },
    { key: 'VITB12', name: 'Vitamin B12', unit: 'µg' },
    { key: 'CA', name: 'Calcium', unit: 'mg' },
    { key: 'FE', name: 'Iron', unit: 'mg' },
    { key: 'K', name: 'Potassium', unit: 'mg' },
  ];

  for (const v of vitaminMap) {
    if (nutrients[v.key] && nutrients[v.key].quantity > 0) {
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

/**
 * Core nutrition resolution service.
 * Looks up meal server-side, checks SHA-1 ingredient hash cache, calls Edamam,
 * and falls back seamlessly to AI estimates on any failure.
 *
 * @param {string} uid - Firebase user UID
 * @param {string} mealId
 * @param {object} [options]
 * @returns {Promise<{ nutrition: object, source: 'edamam'|'ai-estimate', safetyFlags: string[], cached: boolean }>}
 */
export async function getMealNutrition(uid, mealId, options = {}) {
  const { sampleMeal = null } = options;

  let meal = sampleMeal;
  let userConditions = [];
  let db = null;

  if (!meal) {
    if (!mealId || typeof mealId !== 'string') {
      throw AppError.validation({ mealId: 'Valid mealId is required.' });
    }

    db = getAdminDb();

    // Load user conditions for accurate safety evaluation
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      userConditions = userDoc.data()?.profile?.conditions || [];
    }

    // Lookup meal from latestRecs/current first
    const latestRecsSnap = await db
      .collection('users')
      .doc(uid)
      .collection('latestRecs')
      .doc('current')
      .get();

    if (latestRecsSnap.exists) {
      const meals = latestRecsSnap.data()?.meals || [];
      meal = meals.find((m) => m.id === mealId);
    }

    // Fallback lookup in savedMeals/{mealId}
    if (!meal) {
      const savedSnap = await db
        .collection('users')
        .doc(uid)
        .collection('savedMeals')
        .doc(mealId)
        .get();

      if (savedSnap.exists) {
        meal = savedSnap.data()?.meal;
      }
    }

    if (!meal) {
      throw AppError.notFound(`Meal "${mealId}" not found in current recommendations or saved meals.`);
    }
  }

  // Build ingredient lines and compute canonical ingredients hash
  const ingredientLines = buildIngredientLines(meal.ingredients || []);
  const ingredientsHash = computeIngredientsHash(ingredientLines);

  const safetyThresholds = await getSafetyConfig();

  // 1. Check nutritionCache in Firestore
  if (db && ingredientsHash) {
    try {
      const cacheSnap = await db.collection('nutritionCache').doc(ingredientsHash).get();
      if (cacheSnap.exists) {
        const cached = cacheSnap.data();
        const safetyFlags = evaluateMealSafety(
          { ...meal, nutrition: cached.nutrition },
          userConditions,
          safetyThresholds
        );
        return {
          nutrition: cached.nutrition,
          source: cached.source || 'edamam',
          safetyFlags,
          cached: true,
        };
      }
    } catch {
      // Proceed to live resolution if cache read fails
    }
  }

  // 2. Resolve via Edamam or AI estimate fallback
  const edamamConfig = await getEdamamConfig();
  let resolvedNutrition = null;
  let source = 'ai-estimate';

  const canUseEdamam =
    edamamConfig.enabled && Boolean(edamamConfig.appId) && Boolean(edamamConfig.appKey);

  if (canUseEdamam && ingredientLines.length > 0) {
    try {
      const edamamData = await analyzeIngredients(meal.name, ingredientLines);
      if (edamamData && edamamData.calories > 0) {
        resolvedNutrition = extractNutrientsFromEdamam(edamamData.raw);
        source = 'edamam';
      }
    } catch {
      // Fallback on ANY non-2xx error, 555 unparseable dish, or timeout
      source = 'ai-estimate';
    }
  }

  // If Edamam was not used or failed parsing, use Gemini's aiNutritionEstimate
  if (!resolvedNutrition) {
    resolvedNutrition = formatAiEstimateNutrients(meal.aiNutritionEstimate);
    source = 'ai-estimate';
  }

  // 3. Cache the resolved nutrition in Firestore
  if (db && ingredientsHash) {
    try {
      await db.collection('nutritionCache').doc(ingredientsHash).set({
        nutrition: resolvedNutrition,
        source,
        fetchedAt: new Date().toISOString(),
      });
    } catch {
      // Non-fatal if cache write fails
    }
  }

  // 4. Calculate safety flags based on resolved values
  const safetyFlags = evaluateMealSafety(
    { ...meal, nutrition: resolvedNutrition },
    userConditions,
    safetyThresholds
  );

  return {
    nutrition: resolvedNutrition,
    source,
    safetyFlags,
    cached: false,
  };
}

