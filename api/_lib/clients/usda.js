import { getUsdaConfig } from '../configStore.js';
import { AppError } from '../http.js';

const USDA_SEARCH_ENDPOINT = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const REQUEST_TIMEOUT_MS = 12000;
const MAX_SEARCH_CONCURRENCY = 4;
const DATA_TYPES = ['Foundation', 'SR Legacy', 'Survey (FNDDS)'];
const NUTRIENT_IDS = {
  calories: 1008,
  proteinG: 1003,
  carbsG: 1005,
  fatG: 1004,
  sodiumMg: 1093,
  sugarG: 2000,
};
const VITAMIN_IDS = [
  { id: 1106, name: 'Vitamin A', unit: 'µg' },
  { id: 1162, name: 'Vitamin C', unit: 'mg' },
  { id: 1114, name: 'Vitamin D', unit: 'µg' },
  { id: 1109, name: 'Vitamin E', unit: 'mg' },
  { id: 1175, name: 'Vitamin B6', unit: 'mg' },
  { id: 1178, name: 'Vitamin B12', unit: 'µg' },
  { id: 1087, name: 'Calcium', unit: 'mg' },
  { id: 1089, name: 'Iron', unit: 'mg' },
  { id: 1092, name: 'Potassium', unit: 'mg' },
];

function nutrientValue(food, nutrientId) {
  const nutrient = food.foodNutrients?.find((item) => item.nutrientId === nutrientId);
  return Number.isFinite(nutrient?.value) ? nutrient.value : 0;
}

async function searchFood(item, apiKey) {
  const url = new URL(USDA_SEARCH_ENDPOINT);
  url.searchParams.set('api_key', apiKey);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: item, dataType: DATA_TYPES, pageSize: 5 }),
      signal: controller.signal,
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('USDA FoodData Central rejected the API key. Check the key in Admin → USDA.');
      }
      if (response.status === 429) throw new Error('USDA FoodData Central rate limit reached. Try again later.');
      throw new Error(`USDA FoodData Central returned HTTP ${response.status}.`);
    }

    const result = await response.json();
    const food = result.foods?.find((candidate) => nutrientValue(candidate, NUTRIENT_IDS.calories) > 0);
    if (!food) throw new Error(`USDA FoodData Central could not find a usable match for "${item}".`);
    return food;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function mapWithConcurrency(items, callback) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(items.length, MAX_SEARCH_CONCURRENCY);
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex++;
        results[index] = await callback(items[index]);
      }
    })
  );
  return results;
}

function aggregateNutrition(matches) {
  const totals = Object.fromEntries(Object.keys(NUTRIENT_IDS).map((key) => [key, 0]));
  const vitaminTotals = new Map(VITAMIN_IDS.map((vitamin) => [vitamin.id, 0]));

  for (const { food, quantity } of matches) {
    const portion = quantity / 100;
    for (const [key, nutrientId] of Object.entries(NUTRIENT_IDS)) {
      totals[key] += nutrientValue(food, nutrientId) * portion;
    }
    for (const vitamin of VITAMIN_IDS) {
      vitaminTotals.set(vitamin.id, vitaminTotals.get(vitamin.id) + nutrientValue(food, vitamin.id) * portion);
    }
  }

  const vitamins = VITAMIN_IDS.flatMap((vitamin) => {
    const amount = vitaminTotals.get(vitamin.id);
    return amount > 0 ? [{ name: vitamin.name, amount: Math.round(amount * 10) / 10, unit: vitamin.unit }] : [];
  });
  return {
    ...Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, Math.round(value)])),
    vitamins,
  };
}

/**
 * Searches USDA FoodData Central and aggregates nutrients for gram-weighted ingredients.
 * @param {{ item: string, quantity: number, unit: string }[]} ingredients
 * @param {{ apiKey?: string }} [credentialsOverride]
 * @returns {Promise<{ nutrition: object, source: 'usda' }>}
 */
export async function analyzeIngredients(ingredients, credentialsOverride = null) {
  const explicitKey = credentialsOverride?.apiKey ? String(credentialsOverride.apiKey).trim() : '';
  const config = explicitKey ? null : await getUsdaConfig();
  const apiKey = explicitKey || config?.apiKey;

  if (!explicitKey && !config?.enabled) {
    throw AppError.notConfigured(['usda'], 'USDA FoodData Central is disabled.');
  }
  if (!apiKey) {
    throw AppError.notConfigured(['usda'], 'Add a USDA FoodData Central API key in /admin/usda.');
  }
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw AppError.validation({ ingredients: 'At least one ingredient is required.' });
  }

  const invalidUnit = ingredients.find((ingredient) => ingredient.unit !== 'g');
  if (invalidUnit) {
    throw AppError.validation({
      ingredients: `USDA analysis requires ingredient weights in grams; convert "${invalidUnit.item}" from ${invalidUnit.unit} to grams.`,
    });
  }

  const matches = await mapWithConcurrency(
    ingredients,
    async (ingredient) => ({
      food: await searchFood(String(ingredient.item).trim(), apiKey),
      quantity: ingredient.quantity,
    })
  );
  const nutrition = aggregateNutrition(matches);
  if (!nutrition.calories) throw new Error('USDA FoodData Central returned no usable calorie data.');
  return { nutrition, source: 'usda' };
}
