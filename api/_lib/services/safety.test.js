import { describe, it, expect } from 'vitest';
import { evaluateMealSafety } from './safety.js';

describe('api/_lib/services/safety', () => {
  const defaultThresholds = {
    hypertensionSodiumMg: 700,
    diabetesSugarG: 15,
    diabetesCarbsG: 90,
    obesityCalories: 700,
  };

  it('flags high sodium for hypertension', () => {
    const meal = {
      aiNutritionEstimate: { sodiumMg: 850, sugarG: 5, carbsG: 40, calories: 500 },
    };

    const flagsWithCondition = evaluateMealSafety(meal, ['hypertension'], defaultThresholds);
    expect(flagsWithCondition).toContain('High sodium for hypertension');

    // Does not flag if hypertension was not declared
    const flagsWithoutCondition = evaluateMealSafety(meal, [], defaultThresholds);
    expect(flagsWithoutCondition).toHaveLength(0);
  });

  it('flags high sugar or high carbs for diabetes', () => {
    const mealHighSugar = {
      aiNutritionEstimate: { sodiumMg: 300, sugarG: 22, carbsG: 60, calories: 450 },
    };
    expect(
      evaluateMealSafety(mealHighSugar, ['diabetes'], defaultThresholds)
    ).toContain('High sugar/carbs for diabetes');

    const mealHighCarbs = {
      aiNutritionEstimate: { sodiumMg: 300, sugarG: 8, carbsG: 110, calories: 550 },
    };
    expect(
      evaluateMealSafety(mealHighCarbs, ['diabetes'], defaultThresholds)
    ).toContain('High sugar/carbs for diabetes');
  });

  it('flags high calories for obesity', () => {
    const meal = {
      aiNutritionEstimate: { sodiumMg: 400, sugarG: 5, carbsG: 70, calories: 850 },
    };
    expect(
      evaluateMealSafety(meal, ['obesity'], defaultThresholds)
    ).toContain('High calories for weight management');
  });

  it('flags ulcer irritant keywords in ingredients, caution notes, or steps', () => {
    const mealWithPepper = {
      ingredients: [{ item: 'fresh scotch bonnet pepper' }],
      steps: ['Boil beans'],
      cautionNotes: '',
      aiNutritionEstimate: { calories: 300, sodiumMg: 200, sugarG: 2, carbsG: 40 },
    };
    expect(
      evaluateMealSafety(mealWithPepper, ['ulcer'], defaultThresholds)
    ).toContain('May irritate ulcers');

    const mealWithFried = {
      ingredients: [{ item: 'ripe plantain' }],
      steps: ['Deep fried plantains in hot oil until golden brown'],
      cautionNotes: '',
      aiNutritionEstimate: { calories: 300, sodiumMg: 200, sugarG: 2, carbsG: 40 },
    };
    expect(
      evaluateMealSafety(mealWithFried, ['ulcer'], defaultThresholds)
    ).toContain('May irritate ulcers');
  });

  it('combines multiple conditions cleanly', () => {
    const meal = {
      ingredients: [{ item: 'spicy fried fish' }],
      steps: ['Fry fish'],
      cautionNotes: '',
      aiNutritionEstimate: { sodiumMg: 900, sugarG: 20, carbsG: 95, calories: 750 },
    };

    const flags = evaluateMealSafety(
      meal,
      ['hypertension', 'diabetes', 'obesity', 'ulcer'],
      defaultThresholds
    );

    expect(flags).toContain('High sodium for hypertension');
    expect(flags).toContain('High sugar/carbs for diabetes');
    expect(flags).toContain('High calories for weight management');
    expect(flags).toContain('May irritate ulcers');
    expect(flags).toHaveLength(4);
  });
});
