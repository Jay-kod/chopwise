import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  generateJson: vi.fn(),
  getMealForUser: vi.fn(),
}));

vi.mock('../clients/gemini.js', () => ({ generateJson: mocks.generateJson }));
vi.mock('./nutritionService.js', () => ({ getMealForUser: mocks.getMealForUser }));

import { getMealFoodFeedback } from './mealFeedbackService.js';

const meal = {
  name: 'Jollof rice',
  description: 'Smoky rice with tomatoes.',
  ingredients: [{ item: 'rice', quantity: 150, unit: 'g' }],
  steps: ['Cook the rice until tender.'],
  aiNutritionEstimate: { calories: 450, proteinG: 10 },
};

const feedback = {
  summary: 'A filling meal with a source of protein.',
  strengths: ['Rice provides energy.'],
  cautions: [],
  improvements: ['Add a vegetable side.'],
};

describe('mealFeedbackService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMealForUser.mockResolvedValue(meal);
    mocks.generateJson.mockResolvedValue(feedback);
  });

  it('uses the stored meal and requests general non-medical AI feedback', async () => {
    await expect(getMealFoodFeedback('user-1', 'meal-1')).resolves.toEqual(feedback);
    expect(mocks.getMealForUser).toHaveBeenCalledWith('user-1', 'meal-1');
    const [systemInstruction, userContent] = mocks.generateJson.mock.calls[0];
    expect(systemInstruction).toContain('medical advice');
    expect(userContent).toMatchObject({
      name: 'Jollof rice',
      ingredients: [{ item: 'rice', quantity: 150, unit: 'g' }],
    });
    expect(userContent).not.toHaveProperty('conditions');
  });

  it('rejects malformed Gemini feedback with a safe AI error', async () => {
    mocks.generateJson.mockResolvedValue({ summary: '', strengths: [], cautions: [], improvements: [] });
    await expect(getMealFoodFeedback('user-1', 'meal-1')).rejects.toMatchObject({
      code: 'AI_FAILED',
    });
  });
});
