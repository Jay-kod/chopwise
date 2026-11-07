import { describe, it, expect } from 'vitest';
import {
  sanitizeAvoidText,
  computeProfileHash,
  buildRecommendationPayload,
} from './prompt.js';

describe('api/_lib/services/prompt', () => {
  describe('sanitizeAvoidText', () => {
    it('truncates text to 100 characters max', () => {
      const longText = 'a'.repeat(150);
      const sanitized = sanitizeAvoidText(longText);
      expect(sanitized.length).toBe(100);
    });

    it('removes control characters', () => {
      const dirty = 'no nuts\x00\x08 and \x1Bno shell';
      const clean = sanitizeAvoidText(dirty);
      expect(clean).toBe('no nuts   and  no shell');
    });

    it('handles empty or non-string inputs', () => {
      expect(sanitizeAvoidText('')).toBe('');
      expect(sanitizeAvoidText(null)).toBe('');
      expect(sanitizeAvoidText(undefined)).toBe('');
    });
  });

  describe('computeProfileHash stability', () => {
    it('produces the exact same hash regardless of condition/preference array ordering', () => {
      const profile1 = {
        age: 30,
        gender: 'female',
        weightKg: 68,
        conditions: ['diabetes', 'hypertension'],
        preferences: ['low-carb', 'no-pork'],
        avoidText: 'no groundnuts',
        weeklyBudgetNGN: 25000,
      };

      const profile2 = {
        weeklyBudgetNGN: 25000,
        preferences: ['no-pork', 'low-carb'],
        gender: 'female',
        conditions: ['hypertension', 'diabetes'],
        age: 30,
        weightKg: 68,
        avoidText: 'no groundnuts',
      };

      const hash1 = computeProfileHash(profile1);
      const hash2 = computeProfileHash(profile2);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{40}$/); // valid SHA-1 hex
    });

    it('produces different hash when values change', () => {
      const base = {
        age: 30,
        gender: 'female',
        weightKg: 68,
        conditions: ['hypertension'],
        preferences: [],
        avoidText: '',
        weeklyBudgetNGN: 25000,
      };

      const altered = { ...base, weeklyBudgetNGN: 30000 };
      expect(computeProfileHash(base)).not.toBe(computeProfileHash(altered));
    });
  });

  describe('buildRecommendationPayload', () => {
    it('contains no personal identifiers', () => {
      const userDocProfile = {
        age: 26,
        gender: 'male',
        weightKg: 75,
        conditions: ['ulcer'],
        preferences: ['vegetarian'],
        avoidText: 'spicy foods',
        weeklyBudgetNGN: 18000,
        // sensitive user fields that must never be sent to AI
        uid: 'user-uid-12345',
        email: 'person@example.com',
        name: 'Ada Obi',
      };

      const payload = buildRecommendationPayload(userDocProfile, 1200, 2, [
        { item: 'yam', unit: '100g', priceNGN: 300 },
      ]);

      const serialized = JSON.stringify(payload);
      expect(serialized).not.toContain('user-uid-12345');
      expect(serialized).not.toContain('person@example.com');
      expect(serialized).not.toContain('Ada Obi');
      expect(payload.userProfile.age).toBe(26);
      expect(payload.perMealCapNGN).toBe(1200);
      expect(payload.mealsPerType).toBe(2);
    });
  });
});

