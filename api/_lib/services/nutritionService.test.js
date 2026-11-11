import { beforeEach, describe, it, expect, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  getUsdaConfig: vi.fn(),
  getSafetyConfig: vi.fn(),
  analyzeIngredients: vi.fn(),
}));

vi.mock('../mysql.js', () => ({ query: mocks.query }));
vi.mock('../configStore.js', () => ({
  getUsdaConfig: mocks.getUsdaConfig,
  getSafetyConfig: mocks.getSafetyConfig,
}));
vi.mock('../clients/usda.js', () => ({ analyzeIngredients: mocks.analyzeIngredients }));

import {
  buildIngredientLines,
  computeIngredientsHash,
  formatAiEstimateNutrients,
  getMealNutrition,
} from './nutritionService.js';

describe('api/_lib/services/nutritionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.mockResolvedValue([]);
    mocks.getUsdaConfig.mockResolvedValue({ enabled: true, apiKey: 'test-key' });
    mocks.getSafetyConfig.mockResolvedValue({});
    mocks.analyzeIngredients.mockResolvedValue({
      source: 'usda',
      nutrition: {
        calories: 300,
        proteinG: 12,
        carbsG: 40,
        fatG: 8,
        sodiumMg: 250,
        sugarG: 5,
        vitamins: [],
      },
    });
  });

  describe('buildIngredientLines', () => {
    it('formats metric and volumetric ingredients with units', () => {
      const ingrs = [
        { item: 'egusi (melon seeds)', quantity: 200, unit: 'g' },
        { item: 'palm oil', quantity: 2, unit: 'tbsp' },
      ];
      const lines = buildIngredientLines(ingrs);
      expect(lines).toEqual(['200 g egusi (melon seeds)', '2 tbsp palm oil']);
    });

    it('formats piece units without unit word', () => {
      const ingrs = [
        { item: 'ripe plantain', quantity: 1, unit: 'piece' },
        { item: 'eggs', quantity: 2, unit: 'piece' },
      ];
      const lines = buildIngredientLines(ingrs);
      expect(lines).toEqual(['1 ripe plantain', '2 eggs']);
    });
  });

  describe('computeIngredientsHash', () => {
    it('produces identical hash regardless of input line ordering or capitalization', () => {
      const lines1 = ['200 g Egusi', '2 tbsp Palm Oil', '1 Ripe Plantain'];
      const lines2 = ['1 ripe plantain', '2 tbsp palm oil', '200 g egusi'];

      const hash1 = computeIngredientsHash(lines1);
      const hash2 = computeIngredientsHash(lines2);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{40}$/);
    });

    it('produces different hash when ingredients differ', () => {
      const lines1 = ['200 g egusi'];
      const lines2 = ['250 g egusi'];

      expect(computeIngredientsHash(lines1)).not.toBe(computeIngredientsHash(lines2));
    });
  });

  describe('formatAiEstimateNutrients', () => {
    it('formats AI estimate with numbers and guarantees empty vitamins array', () => {
      const estimate = {
        calories: 550.4,
        proteinG: 28.2,
        carbsG: 64.8,
        fatG: 18.1,
        sodiumMg: 420.7,
        sugarG: 3.9,
      };

      const result = formatAiEstimateNutrients(estimate);
      expect(result).toEqual({
        calories: 550,
        proteinG: 28,
        carbsG: 65,
        fatG: 18,
        sodiumMg: 421,
        sugarG: 4,
        vitamins: [],
      });
    });
  });

  it('bypasses the cache when a fresh USDA lookup is requested', async () => {
    const result = await getMealNutrition('user-1', null, {
      sampleMeal: {
        ingredients: [{ item: 'rice', quantity: 100, unit: 'g' }],
        aiNutritionEstimate: { calories: 400 },
      },
      forceRefresh: true,
    });

    expect(mocks.analyzeIngredients).toHaveBeenCalledOnce();
    expect(mocks.query).toHaveBeenCalledOnce();
    expect(mocks.query.mock.calls[0][0]).toContain('INSERT INTO nutrition_cache');
    expect(result.source).toBe('usda');
  });

  it('returns the AI estimate and a reason when USDA cannot use the ingredient units', async () => {
    const unitError = Object.assign(new Error('unsupported unit'), {
      code: 'VALIDATION_ERROR',
      details: { ingredients: 'USDA requires gram amounts for rice.' },
    });
    mocks.analyzeIngredients.mockRejectedValue(unitError);

    const result = await getMealNutrition('user-1', null, {
      sampleMeal: {
        ingredients: [{ item: 'rice', quantity: 1, unit: 'cup' }],
        aiNutritionEstimate: { calories: 400 },
      },
      forceRefresh: true,
    });

    expect(result).toMatchObject({
      source: 'ai-estimate',
      sourceMessage: 'USDA requires gram amounts for rice.',
      nutrition: { calories: 400 },
    });
  });
});
