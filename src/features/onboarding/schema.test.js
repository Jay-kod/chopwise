import { describe, it, expect } from 'vitest';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  profileSchema,
} from './schema';

describe('onboarding schema validation', () => {
  it('validates step 1 demographics within limits', () => {
    expect(step1Schema.safeParse({ age: 25, gender: 'female', weightKg: 65 }).success).toBe(true);
    expect(step1Schema.safeParse({ age: 8, gender: 'female', weightKg: 65 }).success).toBe(false);
    expect(step1Schema.safeParse({ age: 25, gender: 'other', weightKg: 65 }).success).toBe(false);
    expect(step1Schema.safeParse({ age: 25, gender: 'male', weightKg: 15 }).success).toBe(false);
  });

  it('validates step 2 conditions subset', () => {
    expect(step2Schema.safeParse({ conditions: ['hypertension', 'diabetes'] }).success).toBe(true);
    expect(step2Schema.safeParse({ conditions: [] }).success).toBe(true);
    expect(step2Schema.safeParse({ conditions: ['invalid_condition'] }).success).toBe(false);
  });

  it('validates step 3 preferences and avoid text length limit', () => {
    expect(
      step3Schema.safeParse({
        preferences: ['vegetarian', 'no-pork'],
        avoidText: 'no groundnuts',
      }).success
    ).toBe(true);

    expect(
      step3Schema.safeParse({
        preferences: ['vegetarian'],
        avoidText: 'a'.repeat(101),
      }).success
    ).toBe(false);
  });

  it('validates step 4 weekly budget in naira (1,000 to 500,000)', () => {
    expect(step4Schema.safeParse({ weeklyBudgetNGN: 15000 }).success).toBe(true);
    expect(step4Schema.safeParse({ weeklyBudgetNGN: 500 }).success).toBe(false);
    expect(step4Schema.safeParse({ weeklyBudgetNGN: 600000 }).success).toBe(false);
  });

  it('validates complete profile structure', () => {
    const validProfile = {
      age: 28,
      gender: 'male',
      weightKg: 78,
      conditions: ['ulcer'],
      preferences: ['no-pork'],
      avoidText: 'excess pepper',
      weeklyBudgetNGN: 20000,
    };
    expect(profileSchema.safeParse(validProfile).success).toBe(true);
  });

  it('accepts an optional display name and enforces its limit', () => {
    const validProfile = {
      age: 28,
      gender: 'male',
      weightKg: 78,
      conditions: ['ulcer'],
      preferences: ['no-pork'],
      avoidText: 'excess pepper',
      weeklyBudgetNGN: 20000,
    };
    expect(profileSchema.safeParse({ ...validProfile, displayName: 'Amina' }).success).toBe(true);
    expect(profileSchema.safeParse({ ...validProfile, displayName: 'a'.repeat(101) }).success).toBe(false);
  });
});

