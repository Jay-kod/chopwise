import { z } from 'zod';

export const profileSchema = z.object({
  age: z.number().int().min(10).max(100),
  gender: z.enum(['female', 'male']),
  weightKg: z.number().min(20).max(300),
  conditions: z.array(z.enum(['hypertension', 'diabetes', 'obesity', 'ulcer'])).default([]),
  preferences: z
    .array(
      z.enum([
        'vegetarian',
        'no-pork',
        'no-fish',
        'no-beef',
        'low-carb',
        'high-protein',
      ])
    )
    .default([]),
  avoidText: z.string().max(100).default(''),
  weeklyBudgetNGN: z.number().int().min(1000).max(500000),
  avatar: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const settingsSchema = z.object({
  mealsPerType: z.number().int().min(1).max(3),
  budgetDivisor: z.number().int().min(7).max(42),
  rateLimitPerHour: z.number().int().min(1).max(100),
  retryOnOverBudget: z.boolean(),
  heroImageUrl: z.string().url().or(z.literal('')).optional(),
  appName: z.string().min(1).max(50).optional(),
  appTagline: z.string().max(200).optional(),
  appIcon: z.string().max(50).optional(),
  updatedAt: z.string().optional(),
});

export const safetySchema = z.object({
  hypertensionSodiumMg: z.number().min(0),
  diabetesSugarG: z.number().min(0),
  diabetesCarbsG: z.number().min(0),
  obesityCalories: z.number().min(0),
  updatedAt: z.string().optional(),
});

export const priceItemSchema = z.object({
  item: z.string().min(1),
  unit: z.enum(['100g', '100ml', 'piece']),
  priceNGN: z.number().min(0).nullable(),
});

export const pricesSchema = z.object({
  items: z.array(priceItemSchema),
  updatedAt: z.string().nullable().optional(),
});

export const geminiIngredientSchema = z.object({
  item: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.enum(['g', 'ml', 'piece', 'tbsp', 'tsp', 'cup']),
  estCostNGN: z.number().nonnegative(),
});

export const geminiNutritionEstimateSchema = z.object({
  calories: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
  sodiumMg: z.number().nonnegative(),
  sugarG: z.number().nonnegative(),
});

export const geminiMealItemSchema = z.object({
  name: z.string().min(1),
  mealType: z.enum(['breakfast', 'lunch', 'dinner']),
  description: z.string().max(160),
  prepTimeMinutes: z.number().int().positive(),
  ingredients: z.array(geminiIngredientSchema).min(1),
  steps: z.array(z.string().min(1)).min(1),
  suitableFor: z.array(
    z.enum(['hypertension', 'diabetes', 'obesity', 'ulcer', 'general'])
  ),
  cautionNotes: z.string().default(''),
  aiNutritionEstimate: geminiNutritionEstimateSchema,
});

export const geminiResponseSchema = z.object({
  meals: z.array(geminiMealItemSchema),
});

export const enrichedMealSchema = geminiMealItemSchema.extend({
  id: z.string().min(1),
  costNGN: z.number().nonnegative(),
  costSource: z.enum(['table', 'mixed', 'ai']),
  overBudget: z.boolean(),
  safetyFlags: z.array(z.string()).default([]),
});

export const catalogRecipeSchema = geminiMealItemSchema.extend({
  costNGN: z.number().nonnegative(),
  costSource: z.enum(['table', 'mixed', 'ai']),
});

export const ADMIN_PAGE_SIZE = 25;
export const MAX_ADMIN_PAGE_SIZE = 100;
export const MAX_ADMIN_OFFSET = 1000000;

export const adminListSchema = z.object({
  search: z.string().trim().max(100).default(''),
  offset: z.number().int().min(0).max(MAX_ADMIN_OFFSET).default(0),
  limit: z.number().int().min(1).max(MAX_ADMIN_PAGE_SIZE).default(ADMIN_PAGE_SIZE),
});

export const catalogListSchema = adminListSchema;

export const accountIdSchema = z.object({
  userId: z.string().uuid(),
});

export const updateCustomerSchema = accountIdSchema.extend({
  email: z.string().trim().email().max(255),
});

export const customerActiveSchema = accountIdSchema.extend({
  active: z.boolean(),
});

export const grantAdminSchema = z.object({
  email: z.string().trim().email().max(255),
});

export const recipeIdSchema = z.object({
  id: z.string().uuid(),
});

export const recipeMutationSchema = z.object({
  recipe: catalogRecipeSchema,
});

export const recipeUpdateSchema = recipeIdSchema.extend({
  recipe: catalogRecipeSchema,
});

export const draftRecipeSchema = z.object({
  mealName: z.string().trim().min(2).max(100),
  mealType: z.enum(['breakfast', 'lunch', 'dinner']).optional(),
});

export const analyzeRecipeNutritionSchema = z.object({
  title: z.string().trim().min(1).max(100),
  ingredients: z
    .array(
      z.object({
        item: z.string().trim().min(1),
        quantity: z.number().positive(),
        unit: z.string().trim().min(1),
      })
    )
    .min(1),
});

export const nutritionRequestSchema = z.object({
  mealId: z.string().trim().min(1),
  action: z.enum(['nutrition', 'refresh-usda', 'ai-feedback']).default('nutrition'),
});

export const mealFeedbackSchema = z.object({
  summary: z.string().trim().min(1).max(400),
  strengths: z.array(z.string().trim().min(1).max(180)).max(4),
  cautions: z.array(z.string().trim().min(1).max(180)).max(4),
  improvements: z.array(z.string().trim().min(1).max(180)).max(4),
});
