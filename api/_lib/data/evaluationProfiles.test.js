import { describe, it, expect } from 'vitest';
import { EVALUATION_PROFILES } from './evaluationProfiles.js';
import { profileSchema } from '../schemas.js';

describe('api/_lib/data/evaluationProfiles', () => {
  it('contains exactly 10 distinct evaluation cases', () => {
    expect(EVALUATION_PROFILES).toHaveLength(10);
  });

  it('verifies every profile matches the canonical profile schema', () => {
    EVALUATION_PROFILES.forEach((item, index) => {
      expect(item.index).toBe(index);
      expect(item.name).toBeTruthy();
      expect(item.persona).toBeTruthy();

      const parseResult = profileSchema.safeParse(item.profile);
      expect(
        parseResult.success,
        `Profile #${index} (${item.name}) failed validation: ${JSON.stringify(parseResult.error?.issues)}`
      ).toBe(true);
    });
  });

  it('covers all medical conditions across test cases', () => {
    const allConditions = new Set();
    EVALUATION_PROFILES.forEach((item) => {
      item.profile.conditions.forEach((c) => allConditions.add(c));
    });

    expect(allConditions.has('hypertension')).toBe(true);
    expect(allConditions.has('diabetes')).toBe(true);
    expect(allConditions.has('obesity')).toBe(true);
    expect(allConditions.has('ulcer')).toBe(true);
  });

  it('includes varied budget tiers from ₦5,000 to ₦50,000', () => {
    const budgets = EVALUATION_PROFILES.map((p) => p.profile.weeklyBudgetNGN);
    expect(Math.min(...budgets)).toBe(5000);
    expect(Math.max(...budgets)).toBe(50000);
  });
});
