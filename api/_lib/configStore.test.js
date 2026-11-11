import { describe, it, expect, beforeEach } from 'vitest';
import { maskSecret, clearConfigCache } from './configStore.js';
import { DEFAULT_SETTINGS, DEFAULT_SAFETY } from './data/defaults.js';
import seedPrices from './data/seedPrices.json' with { type: 'json' };

describe('api/_lib/configStore', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  describe('maskSecret', () => {
    it('masks full key to only show last 4 characters', () => {
      expect(maskSecret('AIzaSyD-12345678AbCd')).toBe('••••AbCd');
      expect(maskSecret('usdaKey9999')).toBe('••••9999');
      expect(maskSecret('1234')).toBe('••••1234');
    });

    it('handles empty or non-string gracefully', () => {
      expect(maskSecret('')).toBe('');
      expect(maskSecret(null)).toBe('');
      expect(maskSecret(undefined)).toBe('');
    });
  });

  describe('defaults and seed prices', () => {
    it('provides valid default settings', () => {
      expect(DEFAULT_SETTINGS.mealsPerType).toBe(2);
      expect(DEFAULT_SETTINGS.budgetDivisor).toBe(21);
      expect(DEFAULT_SETTINGS.rateLimitPerHour).toBe(10);
      expect(DEFAULT_SETTINGS.retryOnOverBudget).toBe(true);
    });

    it('provides valid default safety thresholds', () => {
      expect(DEFAULT_SAFETY.hypertensionSodiumMg).toBe(700);
      expect(DEFAULT_SAFETY.diabetesSugarG).toBe(15);
      expect(DEFAULT_SAFETY.diabetesCarbsG).toBe(90);
      expect(DEFAULT_SAFETY.obesityCalories).toBe(700);
    });

    it('includes required Nigerian staple ingredient seed prices with null prices', () => {
      expect(Array.isArray(seedPrices)).toBe(true);
      expect(seedPrices.length).toBeGreaterThanOrEqual(30);

      const egusi = seedPrices.find((p) => p.item === 'egusi');
      expect(egusi).toBeDefined();
      expect(egusi.unit).toBe('100g');
      expect(egusi.priceNGN).toBeNull();

      const palmOil = seedPrices.find((p) => p.item === 'palm oil');
      expect(palmOil).toBeDefined();
      expect(palmOil.unit).toBe('100ml');

      const plantain = seedPrices.find((p) => p.item === 'plantain');
      expect(plantain).toBeDefined();
      expect(plantain.unit).toBe('piece');
    });
  });
});
