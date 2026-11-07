import { describe, it, expect } from 'vitest';
import {
  buildIngredientLines,
  computeIngredientsHash,
  formatAiEstimateNutrients,
  extractNutrientsFromEdamam,
} from './nutritionService.js';

describe('api/_lib/services/nutritionService', () => {
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

  describe('extractNutrientsFromEdamam', () => {
    it('extracts calories, macronutrients, and vitamins from Edamam response payload', () => {
      const edamamData = {
        calories: 620,
        totalNutrients: {
          PROCNT: { quantity: 35.4, unit: 'g' },
          CHOCDF: { quantity: 72.1, unit: 'g' },
          FAT: { quantity: 20.8, unit: 'g' },
          NA: { quantity: 510.3, unit: 'mg' },
          SUGAR: { quantity: 6.2, unit: 'g' },
          VITC: { quantity: 18.5, unit: 'mg' },
          FE: { quantity: 4.2, unit: 'mg' },
        },
      };

      const result = extractNutrientsFromEdamam(edamamData);
      expect(result.calories).toBe(620);
      expect(result.proteinG).toBe(35);
      expect(result.carbsG).toBe(72);
      expect(result.fatG).toBe(21);
      expect(result.sodiumMg).toBe(510);
      expect(result.sugarG).toBe(6);

      expect(result.vitamins).toHaveLength(2);
      const vitC = result.vitamins.find((v) => v.name === 'Vitamin C');
      expect(vitC).toBeDefined();
      expect(vitC.amount).toBe(18.5);
      expect(vitC.unit).toBe('mg');
    });
  });
});

