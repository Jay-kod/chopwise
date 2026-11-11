import { afterEach, describe, expect, it, vi } from 'vitest';
import { analyzeIngredients } from './usda.js';

const API_KEY = 'test-usda-key';

function foodResponse(item, foodNutrients) {
  return {
    foods: [{ description: item, foodNutrients }],
  };
}

describe('USDA FoodData Central client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('searches and aggregates gram-based ingredient nutrients per serving', async () => {
    const fetchMock = vi.fn(async (url, options) => {
      expect(new URL(url).searchParams.get('api_key')).toBe(API_KEY);
      const { query } = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => foodResponse(query, [
          { nutrientId: 1008, value: query === 'rice' ? 365 : 155 },
          { nutrientId: 1003, value: query === 'rice' ? 7 : 13 },
          { nutrientId: 1005, value: query === 'rice' ? 80 : 1 },
          { nutrientId: 1004, value: query === 'rice' ? 1 : 11 },
          { nutrientId: 1093, value: 10 },
          { nutrientId: 2000, value: 1 },
          { nutrientId: 1162, value: 2 },
        ]),
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await analyzeIngredients(
      [
        { item: 'rice', quantity: 100, unit: 'g' },
        { item: 'egg', quantity: 50, unit: 'g' },
      ],
      { apiKey: API_KEY }
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.source).toBe('usda');
    expect(result.nutrition).toMatchObject({
      calories: 443,
      proteinG: 14,
      carbsG: 81,
      fatG: 7,
      sodiumMg: 15,
      sugarG: 2,
      vitamins: [{ name: 'Vitamin C', amount: 3, unit: 'mg' }],
    });
  });

  it('rejects non-gram amounts rather than guessing ingredient weights', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const analysis = analyzeIngredients(
      [{ item: 'rice', quantity: 1, unit: 'cup' }],
      { apiKey: API_KEY }
    );
    await expect(analysis).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      details: {
        ingredients: expect.stringContaining('requires ingredient weights in grams'),
      },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an ingredient without a usable USDA match', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({ foods: [] }) }))
    );

    await expect(
      analyzeIngredients([{ item: 'unmatched food', quantity: 100, unit: 'g' }], {
        apiKey: API_KEY,
      })
    ).rejects.toThrow('could not find a usable match for "unmatched food"');
  });

  it('does not expose the API key when USDA rejects it', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 403 })));

    const error = await analyzeIngredients(
      [{ item: 'rice', quantity: 100, unit: 'g' }],
      { apiKey: API_KEY }
    ).catch((reason) => reason);
    expect(error.message).toBe('USDA FoodData Central rejected the API key. Check the key in Admin → USDA.');
    expect(error.message).not.toContain(API_KEY);
  });
});
