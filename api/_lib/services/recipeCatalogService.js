import { randomUUID } from 'node:crypto';
import { AppError } from '../http.js';
import { query } from '../mysql.js';
import {
  catalogListSchema,
  catalogRecipeSchema,
  draftRecipeSchema,
  analyzeRecipeNutritionSchema,
  recipeIdSchema,
  recipeMutationSchema,
  recipeUpdateSchema,
} from '../schemas.js';
import { runAuditedAdminMutation } from './adminAuditService.js';
import { getPricesConfig } from '../configStore.js';
import { generateJson } from '../clients/gemini.js';
import { calculateIngredientCost } from './budget.js';
import { analyzeIngredients } from '../clients/usda.js';

const RECIPE_DRAFT_SYSTEM = `You are a Nigerian culinary expert and nutrition-aware recipe developer for ChopWise.
Create an authentic, practical, single-serving Nigerian recipe made with ingredients commonly sold in Nigerian markets.
Follow these requirements:
1. Portion: Exactly ONE serving for ONE person.
2. Ingredients: Use real Nigerian market ingredients (e.g. egusi, ogbono, ugu, water leaf, bitter leaf, efo, okra, yam, sweet potato, plantain, ofada rice, local rice, brown beans, garri, chicken, beef, goat meat, mackerel, dried fish, stockfish, crayfish, tomatoes, onions, palm oil, vegetable oil, seasoning cubes).
3. Specify exact numeric quantity and standard units ('g', 'ml', 'piece', 'tbsp', 'tsp', 'cup').
4. For estCostNGN, provide a realistic Nigerian naira cost estimate for the specified quantity.
5. Provide concise, clear numbered steps.
6. Provide accurate aiNutritionEstimate: calories, proteinG, carbsG, fatG, sodiumMg, sugarG.
7. suitableFor: array containing applicable tags from ['hypertension', 'diabetes', 'obesity', 'ulcer', 'general'].
8. cautionNotes: brief note on substitutions or health tips (or empty string).
9. description: concise description of the meal, max 160 characters.
Return ONLY valid JSON matching the schema.`;

const SINGLE_RECIPE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING', description: 'Dish name' },
    mealType: { type: 'STRING', enum: ['breakfast', 'lunch', 'dinner'] },
    description: { type: 'STRING', description: 'Brief description under 160 characters' },
    prepTimeMinutes: { type: 'INTEGER', description: 'Cooking time in minutes' },
    ingredients: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          item: { type: 'STRING', description: 'Ingredient name' },
          quantity: { type: 'NUMBER', description: 'Quantity' },
          unit: { type: 'STRING', enum: ['g', 'ml', 'piece', 'tbsp', 'tsp', 'cup'] },
          estCostNGN: { type: 'NUMBER', description: 'Estimated cost in Naira' },
        },
        required: ['item', 'quantity', 'unit', 'estCostNGN'],
      },
    },
    steps: { type: 'ARRAY', items: { type: 'STRING' } },
    suitableFor: {
      type: 'ARRAY',
      items: { type: 'STRING', enum: ['hypertension', 'diabetes', 'obesity', 'ulcer', 'general'] },
    },
    cautionNotes: { type: 'STRING', description: 'Health precautions or notes' },
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
  required: ['name', 'mealType', 'description', 'prepTimeMinutes', 'ingredients', 'steps', 'suitableFor', 'cautionNotes', 'aiNutritionEstimate'],
};

function parseStoredRecipe(row) {
  let recipe;
  try {
    recipe = catalogRecipeSchema.parse(JSON.parse(row.recipe));
  } catch {
    throw AppError.internal('A stored catalogue recipe is invalid and could not be displayed.');
  }
  return { id: row.id, recipe, createdAt: row.created_at, updatedAt: row.updated_at };
}

/**
 * Lists shared recipes for either the admin catalogue manager or customers.
 * @param {object} input
 * @returns {Promise<{items: object[], total: number}>}
 */
export async function listRecipes(input) {
  const { search, offset, limit } = catalogListSchema.parse(input);
  const filter = search ? 'WHERE recipe LIKE ?' : '';
  const values = search ? [`%${search}%`] : [];
  const totals = await query(`SELECT COUNT(*) AS total FROM recipe_catalog ${filter}`, values);
  const rows = await query(
    `SELECT id, recipe, created_at, updated_at FROM recipe_catalog ${filter}
     ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  return { total: Number(totals[0]?.total || 0), items: rows.map(parseStoredRecipe) };
}

/**
 * Adds a validated recipe to the shared catalogue.
 * @param {string} actorId
 * @param {object} input
 * @returns {Promise<{ok: true, item: object}>}
 */
export async function createRecipe(actorId, input) {
  const { recipe } = recipeMutationSchema.parse(input);
  const id = randomUUID();
  return runAuditedAdminMutation(actorId, 'recipe.created', 'recipe', id, async (connection) => {
    await connection.execute(
      'INSERT INTO recipe_catalog (id, recipe, created_by) VALUES (?, ?, ?)',
      [id, JSON.stringify(recipe), actorId]
    );
    const now = new Date().toISOString();
    return {
      result: { ok: true, item: { id, recipe, createdAt: now, updatedAt: now } },
      auditDetails: { name: recipe.name },
    };
  });
}

/**
 * Replaces a catalogue recipe with a validated version.
 * @param {string} actorId
 * @param {object} input
 * @returns {Promise<{ok: true, item: object}>}
 */
export async function updateRecipe(actorId, input) {
  const { id, recipe } = recipeUpdateSchema.parse(input);
  return runAuditedAdminMutation(actorId, 'recipe.updated', 'recipe', id, async (connection) => {
    const [existing] = await connection.execute('SELECT id, created_at FROM recipe_catalog WHERE id = ? FOR UPDATE', [id]);
    if (!existing.length) throw AppError.notFound('Catalogue recipe not found.');
    await connection.execute('UPDATE recipe_catalog SET recipe = ? WHERE id = ?', [JSON.stringify(recipe), id]);
    return {
      result: {
        ok: true,
        item: { id, recipe, createdAt: existing[0].created_at, updatedAt: new Date().toISOString() },
      },
      auditDetails: { name: recipe.name },
    };
  });
}

/**
 * Permanently removes a recipe from the shared catalogue.
 * @param {string} actorId
 * @param {object} input
 * @returns {Promise<{ok: true}>}
 */
export async function deleteRecipe(actorId, input) {
  const { id } = recipeIdSchema.parse(input);
  return runAuditedAdminMutation(actorId, 'recipe.deleted', 'recipe', id, async (connection) => {
    const [result] = await connection.execute('DELETE FROM recipe_catalog WHERE id = ?', [id]);
    if (!result.affectedRows) throw AppError.notFound('Catalogue recipe not found.');
    return { result: { ok: true }, auditDetails: { deleted: true } };
  });
}

/**
 * Uses Gemini AI and the Nigerian price table to draft a complete catalog recipe.
 * @param {object} input
 * @returns {Promise<{ok: true, recipe: object}>}
 */
export async function draftRecipeWithAi(input) {
  const { mealName, mealType } = draftRecipeSchema.parse(input);
  const pricesData = await getPricesConfig();
  const priceTable = pricesData.items || [];
  const compactPriceList = priceTable
    .filter((p) => p.priceNGN != null)
    .map((p) => ({ item: p.item, unit: p.unit, priceNGN: p.priceNGN }));

  const userContent = {
    requestedMeal: mealName,
    ...(mealType ? { mealType } : {}),
    priceList: compactPriceList,
  };

  const rawRecipe = await generateJson(RECIPE_DRAFT_SYSTEM, userContent, SINGLE_RECIPE_SCHEMA);

  const priceMap = new Map();
  for (const p of priceTable) {
    if (p?.item) priceMap.set(p.item.toLowerCase().trim(), { unit: p.unit, priceNGN: p.priceNGN });
  }

  let totalCost = 0;
  let tableCount = 0;
  let aiCount = 0;

  const enrichedIngredients = (rawRecipe.ingredients || []).map((ingr) => {
    const { cost, source } = calculateIngredientCost(ingr, priceMap);
    totalCost += cost;
    if (source === 'table') tableCount++;
    else aiCount++;
    return { ...ingr, estCostNGN: Math.round(cost) };
  });

  const costSource = tableCount === enrichedIngredients.length ? 'table' : aiCount === enrichedIngredients.length ? 'ai' : 'mixed';
  const validated = catalogRecipeSchema.parse({
    ...rawRecipe,
    ingredients: enrichedIngredients,
    costNGN: Math.round(totalCost),
    costSource,
  });

  return { ok: true, recipe: validated };
}

/**
 * Calculates USDA FoodData Central nutrition for gram-measured recipe ingredients.
 * @param {object} input
 * @returns {Promise<{ok: true, source: 'usda', nutrition: object}>}
 */
export async function analyzeRecipeNutrition(input) {
  const { ingredients } = analyzeRecipeNutritionSchema.parse(input);
  const usdaRes = await analyzeIngredients(ingredients);
  if (!usdaRes?.nutrition) throw AppError.internal('USDA FoodData Central returned an empty response.');
  return {
    ok: true,
    source: 'usda',
    nutrition: {
      calories: usdaRes.nutrition.calories,
      proteinG: usdaRes.nutrition.proteinG,
      carbsG: usdaRes.nutrition.carbsG,
      fatG: usdaRes.nutrition.fatG,
      sodiumMg: usdaRes.nutrition.sodiumMg,
      sugarG: usdaRes.nutrition.sugarG,
    },
  };
}
