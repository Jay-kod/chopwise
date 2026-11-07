/**
 * Pure budget calculation logic for ChopWise meal recommendations.
 * Source: docs/AI_AND_NUTRITION_SPEC.md
 */

/**
 * Compute the per-meal cap from weekly budget and divisor.
 * @param {number} weeklyBudgetNGN
 * @param {number} [budgetDivisor=21]
 * @returns {number}
 */
export function calculatePerMealCap(weeklyBudgetNGN, budgetDivisor = 21) {
  const divisor = budgetDivisor > 0 ? budgetDivisor : 21;
  const budget = Number(weeklyBudgetNGN) || 0;
  return Math.round(budget / divisor);
}

/**
 * Normalise ingredient name for price table lookup.
 * @param {string} name
 * @returns {string}
 */
function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().trim();
}

/**
 * Compute cost for a single ingredient against the price table.
 * @param {{ item: string, quantity: number, unit: string, estCostNGN: number }} ingr
 * @param {Map<string, { unit: string, priceNGN: number|null }>} priceMap
 * @returns {{ cost: number, source: 'table'|'ai' }}
 */
export function calculateIngredientCost(ingr, priceMap) {
  const itemName = normalizeName(ingr.item);
  const matched = priceMap.get(itemName);

  const fallbackCost = Number(ingr.estCostNGN) || 0;

  if (!matched || matched.priceNGN == null) {
    return { cost: fallbackCost, source: 'ai' };
  }

  const { unit: tableUnit, priceNGN } = matched;
  const qty = Number(ingr.quantity) || 0;
  const ingrUnit = (ingr.unit || '').toLowerCase();

  // Unit conversion rules from docs/AI_AND_NUTRITION_SPEC.md
  if (tableUnit === '100g' && ingrUnit === 'g') {
    return { cost: (qty / 100) * priceNGN, source: 'table' };
  }

  if (tableUnit === '100ml' && ingrUnit === 'ml') {
    return { cost: (qty / 100) * priceNGN, source: 'table' };
  }

  if (tableUnit === 'piece' && ingrUnit === 'piece') {
    return { cost: qty * priceNGN, source: 'table' };
  }

  // Non-convertible unit (e.g. tbsp, cup) falls back to AI estimated cost
  return { cost: fallbackCost, source: 'ai' };
}

/**
 * Recomputes cost and budget flags for a list of meals.
 * @param {Array<object>} meals
 * @param {Array<{ item: string, unit: string, priceNGN: number|null }>} priceTable
 * @param {number} perMealCapNGN
 * @returns {Array<object>}
 */
export function recomputeMealBudgets(meals, priceTable = [], perMealCapNGN = 0) {
  // Build lookup map for fast normalized matching
  const priceMap = new Map();
  for (const p of priceTable) {
    if (p && p.item) {
      priceMap.set(normalizeName(p.item), {
        unit: p.unit,
        priceNGN: p.priceNGN,
      });
    }
  }

  return (meals || []).map((meal) => {
    let totalCost = 0;
    let tableCount = 0;
    let aiCount = 0;

    const enrichedIngredients = (meal.ingredients || []).map((ingr) => {
      const { cost, source } = calculateIngredientCost(ingr, priceMap);
      totalCost += cost;
      if (source === 'table') tableCount++;
      else aiCount++;

      return {
        ...ingr,
        costNGN: Math.round(cost),
        costSource: source,
      };
    });

    const roundedCost = Math.round(totalCost);
    let costSource = 'ai';
    if (tableCount > 0 && aiCount === 0) {
      costSource = 'table';
    } else if (tableCount > 0 && aiCount > 0) {
      costSource = 'mixed';
    }

    const overBudget = roundedCost > perMealCapNGN;

    return {
      ...meal,
      ingredients: enrichedIngredients,
      costNGN: roundedCost,
      costSource,
      overBudget,
    };
  });
}

