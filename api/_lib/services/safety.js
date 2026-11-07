/**
 * Pure safety screening rules for ChopWise meal recommendations.
 * Source: docs/AI_AND_NUTRITION_SPEC.md
 */

const ULCER_IRRITANTS = [
  'pepper',
  'chili',
  'chilli',
  'scotch bonnet',
  'rodo',
  'fried',
  'spicy',
];

export const MEDICAL_DISCLAIMER =
  'General guidance only, not medical advice. Consult a doctor or dietitian for medical conditions.';

/**
 * Check if meal text or ingredients contain ulcer irritant keywords.
 * @param {object} meal
 * @returns {boolean}
 */
function containsUlcerIrritants(meal) {
  const parts = [];

  // Check ingredients
  if (Array.isArray(meal.ingredients)) {
    for (const ingr of meal.ingredients) {
      if (typeof ingr === 'string') parts.push(ingr);
      else if (ingr?.item) parts.push(ingr.item);
    }
  }

  // Check caution notes
  if (meal.cautionNotes) parts.push(meal.cautionNotes);

  // Check cooking steps
  if (Array.isArray(meal.steps)) {
    parts.push(...meal.steps);
  }

  const fullText = parts.join(' ').toLowerCase();

  return ULCER_IRRITANTS.some((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(fullText);
  });
}

/**
 * Evaluate safety flags for a meal against user's declared conditions.
 * Uses nutrient estimates (from aiNutritionEstimate or real Edamam data).
 *
 * @param {object} meal
 * @param {string[]} userConditions - e.g. ['hypertension', 'diabetes']
 * @param {object} thresholds - From adminConfig/safety
 * @returns {string[]} Array of flag texts
 */
export function evaluateMealSafety(meal, userConditions = [], thresholds = {}) {
  const flags = [];
  const declared = new Set(userConditions || []);

  const nutrients = meal.aiNutritionEstimate || meal.nutrition || {};
  const sodiumMg = Number(nutrients.sodiumMg ?? nutrients.sodium) || 0;
  const sugarG = Number(nutrients.sugarG ?? nutrients.sugar) || 0;
  const carbsG = Number(nutrients.carbsG ?? nutrients.carbs) || 0;
  const calories = Number(nutrients.calories) || 0;

  // 1. Hypertension
  if (declared.has('hypertension')) {
    const maxSodium = thresholds.hypertensionSodiumMg ?? 700;
    if (sodiumMg > maxSodium) {
      flags.push('High sodium for hypertension');
    }
  }

  // 2. Diabetes
  if (declared.has('diabetes')) {
    const maxSugar = thresholds.diabetesSugarG ?? 15;
    const maxCarbs = thresholds.diabetesCarbsG ?? 90;
    if (sugarG > maxSugar || carbsG > maxCarbs) {
      flags.push('High sugar/carbs for diabetes');
    }
  }

  // 3. Obesity
  if (declared.has('obesity')) {
    const maxCalories = thresholds.obesityCalories ?? 700;
    if (calories > maxCalories) {
      flags.push('High calories for weight management');
    }
  }

  // 4. Ulcer
  if (declared.has('ulcer')) {
    if (containsUlcerIrritants(meal)) {
      flags.push('May irritate ulcers');
    }
  }

  return flags;
}

