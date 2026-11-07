import { describe, it, expect } from 'vitest';
import {
  profileSchema,
  settingsSchema,
  safetySchema,
  pricesSchema,
  geminiIngredientSchema,
  enrichedMealSchema,
} from './schemas.js';

describe('api/_lib/schemas', () => {
  describe('profileSchema', () => {
    it('validates a complete user profile', () => {
      const valid = {
        age: 30,
        gender: 'female',
        weightKg: 65,
        conditions: ['hypertension'],
        preferences: ['low-carb'],
        avoidText: 'shrimp',
        weeklyBudgetNGN: 15000,
      };
      const res = profileSchema.safeParse(valid);
      expect(res.success).toBe(true);
      expect(res.data.conditions).toEqual(['hypertension']);
    });

    it('rejects invalid age or budget boundaries', () => {
      const underAge = {
        age: 8,
        gender: 'male',
        weightKg: 50,
        conditions: [],
        preferences: [],
        weeklyBudgetNGN: 15000,
      };
      expect(profileSchema.safeParse(underAge).success).toBe(false);

      const underBudget = {
        age: 25,
        gender: 'male',
        weightKg: 70,
        conditions: [],
        preferences: [],
        weeklyBudgetNGN: 500, // below 1000 minimum
      };
      expect(profileSchema.safeParse(underBudget).success).toBe(false);
    });
  });

  describe('settingsSchema', () => {
    it('accepts valid system settings', () => {
      const settings = {
        mealsPerType: 2,
        budgetDivisor: 21,
        rateLimitPerHour: 10,
        retryOnOverBudget: true,
      };
      expect(settingsSchema.safeParse(settings).success).toBe(true);
    });

    it('rejects out of range values', () => {
      const bad = {
        mealsPerType: 5, // max 3
        budgetDivisor: 21,
        rateLimitPerHour: 10,
        retryOnOverBudget: true,
      };
      expect(settingsSchema.safeParse(bad).success).toBe(false);
    });
  });

  describe('safetySchema and pricesSchema', () => {
    it('validates safety thresholds and prices', () => {
      const safety = {
        hypertensionSodiumMg: 600,
        diabetesSugarG: 10,
        diabetesCarbsG: 45,
        obesityCalories: 500,
      };
      expect(safetySchema.safeParse(safety).success).toBe(true);

      const prices = {
        items: [
          { item: 'rice', unit: '100g', priceNGN: 150 },
          { item: 'egg', unit: 'piece', priceNGN: 200 },
        ],
      };
      expect(pricesSchema.safeParse(prices).success).toBe(true);
    });
  });

  describe('gemini schemas & enrichedMealSchema', () => {
    it('validates ingredient structure', () => {
      const ingr = {
        item: 'beans',
        quantity: 200,
        unit: 'g',
        estCostNGN: 300,
      };
      expect(geminiIngredientSchema.safeParse(ingr).success).toBe(true);
    });

    it('validates enriched meal structure', () => {
      const meal = {
        id: 'meal-123',
        name: 'Nigerian Jollof',
        mealType: 'lunch',
        description: 'Smoky party jollof rice with rich tomato base.',
        prepTimeMinutes: 45,
        ingredients: [
          { item: 'rice', quantity: 150, unit: 'g', estCostNGN: 250 },
        ],
        steps: ['Boil tomato puree', 'Add parboiled rice and simmer until tender.'],
        suitableFor: ['general'],
        cautionNotes: '',
        aiNutritionEstimate: {
          calories: 450,
          proteinG: 10,
          carbsG: 75,
          fatG: 12,
          sodiumMg: 350,
          sugarG: 4,
        },
        costNGN: 750,
        costSource: 'mixed',
        overBudget: false,
        safetyFlags: [],
      };
      expect(enrichedMealSchema.safeParse(meal).success).toBe(true);
    });
  });
});
