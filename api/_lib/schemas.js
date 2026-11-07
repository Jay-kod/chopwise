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
  updatedAt: z.string().optional(),
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

