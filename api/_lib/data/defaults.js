/**
 * System defaults for ChopWise configuration sections.
 * Source: docs/AI_AND_NUTRITION_SPEC.md
 */

export const DEFAULT_SETTINGS = {
  mealsPerType: 2, // 1 to 3
  budgetDivisor: 21, // 7 to 42
  rateLimitPerHour: 10, // 1 to 100
  retryOnOverBudget: true,
  heroImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
  appName: 'ChopWise',
  appTagline: 'Nigerian meals that fit your health and your wallet.',
  appIcon: '🍲',
};

export const DEFAULT_SAFETY = {
  hypertensionSodiumMg: 700,
  diabetesSugarG: 15,
  diabetesCarbsG: 90,
  obesityCalories: 700,
};

