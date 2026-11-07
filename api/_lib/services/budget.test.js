import { describe, it, expect } from 'vitest';
import {
  calculatePerMealCap,
  calculateIngredientCost,
  recomputeMealBudgets,
} from './budget.js';

describe('api/_lib/services/budget', () => {
  describe('calculatePerMealCap', () => {
    it('divides weekly budget by divisor and rounds to nearest integer', () => {
      expect(calculatePerMealCap(21000, 21)).toBe(1000);
      expect(calculatePerMealCap(10000, 21)).toBe(476);
      expect(calculatePerMealCap(50000, 25)).toBe(2000);
    });

    it('defaults divisor to 21 when zero or missing', () => {
      expect(calculatePerMealCap(21000)).toBe(1000);
      expect(calculatePerMealCap(21000, 0)).toBe(1000);
    });
  });

  describe('calculateIngredientCost', () => {
    const priceMap = new Map([
      ['egusi', { unit: '100g', priceNGN: 400 }],
      ['palm oil', { unit: '100ml', priceNGN: 250 }],
      ['plantain', { unit: 'piece', priceNGN: 200 }],
      ['yam', { unit: '100g', priceNGN: null }], // unpriced
    ]);

    it('computes cost from 100g table item', () => {
      const res = calculateIngredientCost(
        { item: 'egusi', quantity: 200, unit: 'g', estCostNGN: 600 },
        priceMap
      );
      expect(res.source).toBe('table');
      expect(res.cost).toBe(800); // (200 / 100) * 400
    });

    it('computes cost from 100ml table item', () => {
      const res = calculateIngredientCost(
        { item: 'palm oil', quantity: 50, unit: 'ml', estCostNGN: 150 },
        priceMap
      );
      expect(res.source).toBe('table');
      expect(res.cost).toBe(125); // (50 / 100) * 250
    });

    it('computes cost from piece table item', () => {
      const res = calculateIngredientCost(
        { item: 'plantain', quantity: 2, unit: 'piece', estCostNGN: 500 },
        priceMap
      );
      expect(res.source).toBe('table');
      expect(res.cost).toBe(400); // 2 * 200
    });

    it('falls back to AI estimate when price is null', () => {
      const res = calculateIngredientCost(
        { item: 'yam', quantity: 300, unit: 'g', estCostNGN: 450 },
        priceMap
      );
      expect(res.source).toBe('ai');
      expect(res.cost).toBe(450);
    });

    it('falls back to AI estimate when unit cannot convert (e.g. tbsp with 100g)', () => {
      const res = calculateIngredientCost(
        { item: 'egusi', quantity: 2, unit: 'tbsp', estCostNGN: 120 },
        priceMap
      );
      expect(res.source).toBe('ai');
      expect(res.cost).toBe(120);
    });

    it('falls back to AI estimate when ingredient not in price table', () => {
      const res = calculateIngredientCost(
        { item: 'imported saffron', quantity: 5, unit: 'g', estCostNGN: 1500 },
        priceMap
      );
      expect(res.source).toBe('ai');
      expect(res.cost).toBe(1500);
    });
  });

  describe('recomputeMealBudgets', () => {
    const table = [
      { item: 'egusi', unit: '100g', priceNGN: 400 },
      { item: 'palm oil', unit: '100ml', priceNGN: 200 },
    ];

    it('tags costSource as "table" when all ingredients come from price table', () => {
      const meals = [
        {
          name: 'Egusi Soup',
          ingredients: [
            { item: 'egusi', quantity: 100, unit: 'g', estCostNGN: 350 },
            { item: 'palm oil', quantity: 50, unit: 'ml', estCostNGN: 100 },
          ],
        },
      ];

      const [res] = recomputeMealBudgets(meals, table, 1000);
      expect(res.costSource).toBe('table');
      expect(res.costNGN).toBe(500); // 400 + 100
      expect(res.overBudget).toBe(false);
    });

    it('tags costSource as "mixed" when partially matching price table', () => {
      const meals = [
        {
          name: 'Egusi with Meat',
          ingredients: [
            { item: 'egusi', quantity: 100, unit: 'g', estCostNGN: 350 },
            { item: 'special dry fish', quantity: 50, unit: 'g', estCostNGN: 300 },
          ],
        },
      ];

      const [res] = recomputeMealBudgets(meals, table, 600);
      expect(res.costSource).toBe('mixed');
      expect(res.costNGN).toBe(700); // 400 (table) + 300 (ai)
      expect(res.overBudget).toBe(true); // 700 > 600
    });

    it('tags costSource as "ai" when no ingredient matches price table', () => {
      const meals = [
        {
          name: 'Local delicacy',
          ingredients: [
            { item: 'unlisted grass', quantity: 10, unit: 'g', estCostNGN: 200 },
          ],
        },
      ];

      const [res] = recomputeMealBudgets(meals, table, 500);
      expect(res.costSource).toBe('ai');
      expect(res.costNGN).toBe(200);
      expect(res.overBudget).toBe(false);
    });
  });
});
