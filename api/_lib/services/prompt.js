import crypto from 'node:crypto';

/**
 * Sanitise user avoid text:
 * - Truncate to 100 characters max
 * - Remove control characters
 * @param {string} [text]
 * @returns {string}
 */
export function sanitizeAvoidText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .slice(0, 100)
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .trim();
}

/**
 * Compute stable SHA-1 hash for a user profile.
 * Canonicalizes keys and sorts array values to ensure hash stability.
 * @param {object} profile
 * @returns {string} SHA-1 hex digest
 */
export function computeProfileHash(profile) {
  if (!profile || typeof profile !== 'object') return '';

  const canonical = {
    age: Number(profile.age) || 0,
    gender: String(profile.gender || ''),
    weightKg: Number(profile.weightKg) || 0,
    conditions: Array.isArray(profile.conditions)
      ? [...profile.conditions].sort()
      : [],
    preferences: Array.isArray(profile.preferences)
      ? [...profile.preferences].sort()
      : [],
    avoidText: sanitizeAvoidText(profile.avoidText),
    weeklyBudgetNGN: Number(profile.weeklyBudgetNGN) || 0,
  };

  const jsonStr = JSON.stringify(canonical);
  return crypto.createHash('sha1').update(jsonStr).digest('hex');
}

/**
 * System instruction for Google Gemini.
 * Follows docs/AI_AND_NUTRITION_SPEC.md exactly.
 */
export const RECOMMENDATION_SYSTEM_INSTRUCTION = `You are a Nigerian nutrition-aware meal planner. Suggest only real, commonly cooked Nigerian meals made from ingredients sold in Nigerian markets.
Each meal is for ONE person, ONE serving.
Medical conditions are hard constraints:
- hypertension: low sodium, minimal salt and seasoning cubes.
- diabetes: low added sugar, controlled refined carbs.
- obesity: calorie-conscious portions.
- ulcer: avoid very spicy, acidic and heavily fried meals.
Respect dietary preferences and the "avoid" list.
Each meal's cost must not exceed perMealCapNGN.
For any ingredient in the supplied price list, use its exact name and express quantity in that item's unit (g, ml or piece).
Return ONLY JSON matching the schema.`;

/**
 * Build the structured payload sent to Gemini.
 * Sanitises input and excludes all personal identifiers (no email, name, or UID).
 * @param {object} profile
 * @param {number} perMealCapNGN
 * @param {number} mealsPerType
 * @param {Array<{item: string, unit: string, priceNGN: number|null}>} priceList
 * @returns {object} Payload for Gemini contents
 */
export function buildRecommendationPayload(profile, perMealCapNGN, mealsPerType = 2, priceList = []) {
  // Strip null prices and unneeded fields for a clean prompt
  const compactPriceList = (priceList || []).map((p) => ({
    item: p.item,
    unit: p.unit,
    ...(p.priceNGN != null ? { priceNGN: p.priceNGN } : {}),
  }));

  return {
    userProfile: {
      age: profile.age,
      gender: profile.gender,
      weightKg: profile.weightKg,
      conditions: profile.conditions || [],
      preferences: profile.preferences || [],
      avoidText: sanitizeAvoidText(profile.avoidText),
    },
    perMealCapNGN,
    mealsPerType,
    priceList: compactPriceList,
  };
}

/**
 * Gemini response schema definition for structured JSON mode.
 */
export const GEMINI_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    meals: {
      type: 'ARRAY',
      description: 'List of recommended Nigerian meals, balanced across requested meal types.',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING', description: 'Real Nigerian dish name, e.g. Egusi Soup with Oatmeal Swallow' },
          mealType: { type: 'STRING', enum: ['breakfast', 'lunch', 'dinner'] },
          description: { type: 'STRING', description: 'Brief description under 160 characters' },
          prepTimeMinutes: { type: 'INTEGER', description: 'Estimated preparation and cooking time in minutes' },
          ingredients: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                item: { type: 'STRING', description: 'Exact ingredient name matching price table when possible' },
                quantity: { type: 'NUMBER', description: 'Numeric quantity' },
                unit: { type: 'STRING', enum: ['g', 'ml', 'piece', 'tbsp', 'tsp', 'cup'] },
                estCostNGN: { type: 'NUMBER', description: 'Estimated cost in Naira' },
              },
              required: ['item', 'quantity', 'unit', 'estCostNGN'],
            },
          },
          steps: {
            type: 'ARRAY',
            description: 'Numbered cooking steps',
            items: { type: 'STRING' },
          },
          suitableFor: {
            type: 'ARRAY',
            items: { type: 'STRING', enum: ['hypertension', 'diabetes', 'obesity', 'ulcer', 'general'] },
          },
          cautionNotes: { type: 'STRING', description: 'Specific health precautions or ingredient substitutions' },
          aiNutritionEstimate: {
            type: 'OBJECT',
            properties: {
              calories: { type: 'NUMBER' },
              proteinG: { type: 'NUMBER' },
              carbsG: { type: 'NUMBER' },
              fatG: { type: 'NUMBER' },
              sodiumMg: { type: 'NUMBER' },
              sugarG: { type: 'NUMBER' },
            },
            required: ['calories', 'proteinG', 'carbsG', 'fatG', 'sodiumMg', 'sugarG'],
          },
        },
        required: [
          'name',
          'mealType',
          'description',
          'prepTimeMinutes',
          'ingredients',
          'steps',
          'suitableFor',
          'cautionNotes',
          'aiNutritionEstimate',
        ],
      },
    },
  },
  required: ['meals'],
};
