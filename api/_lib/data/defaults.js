/**
 * System defaults for ChopWise configuration sections.
 * Source: docs/AI_AND_NUTRITION_SPEC.md
 */

export const DEFAULT_SETTINGS = {
  mealsPerType: 2, // 1 to 3
  budgetDivisor: 21, // 7 to 42
  rateLimitPerHour: 10, // 1 to 100
  retryOnOverBudget: true,
};

export const DEFAULT_SAFETY = {
  hypertensionSodiumMg: 700,
  diabetesSugarG: 15,
  diabetesCarbsG: 90,
  obesityCalories: 700,
};
