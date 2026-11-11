import { describe, it, expect } from 'vitest';
import { draftRecipeSchema, analyzeRecipeNutritionSchema } from '../schemas.js';

describe('api/_lib/services/recipeCatalogService helpers', () => {
  it('validates meal names and meal types for AI recipe drafting', () => {
    expect(draftRecipeSchema.parse({ mealName: 'Afang Soup' })).toEqual({
      mealName: 'Afang Soup',
    });
    expect(
      draftRecipeSchema.parse({ mealName: '  Moi Moi  ', mealType: 'breakfast' })
    ).toEqual({
      mealName: 'Moi Moi',
      mealType: 'breakfast',
    });
    expect(draftRecipeSchema.safeParse({ mealName: 'A' }).success).toBe(false);
  });

  it('validates recipe ingredients payload for USDA nutrition analysis', () => {
    const valid = {
      title: 'Egusi Soup',
      ingredients: [
        { item: 'egusi', quantity: 100, unit: 'g' },
        { item: 'tomatoes', quantity: 150, unit: 'g' },
      ],
    };
    expect(analyzeRecipeNutritionSchema.safeParse(valid).success).toBe(true);
    expect(
      analyzeRecipeNutritionSchema.safeParse({ title: 'Egusi Soup', ingredients: [] }).success
    ).toBe(false);
  });
});
