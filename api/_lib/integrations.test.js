import { describe, it, expect, vi } from 'vitest';
import { query } from './mysql.js';
import { getIntegrationsStatus, runHealthCheck } from './integrations.js';

vi.mock('./mysql.js', () => ({
  query: vi.fn(async () => []),
}));

vi.mock('./clients/usda.js', () => ({
  analyzeIngredients: vi.fn(async () => ({
    nutrition: { calories: 356 },
  })),
}));

describe('api/_lib/integrations', () => {
  describe('getIntegrationsStatus', () => {
    it('returns integrations with fields and maps testResults to lastTest', async () => {
      const mockTestResults = {
        gemini: {
          ok: true,
          message: 'Gemini API call and JSON parsing verified',
          latencyMs: 145,
          testedAt: '2026-11-09T10:00:00.000Z',
        },
      };

      const result = await getIntegrationsStatus(mockTestResults);
      expect(Array.isArray(result)).toBe(true);

      const gemini = result.find((i) => i.id === 'gemini');
      expect(gemini).toBeDefined();
      expect(gemini.lastTest).toEqual(mockTestResults.gemini);

      const usda = result.find((i) => i.id === 'usda');
      expect(usda).toBeDefined();
      expect(usda.lastTest).toBeNull();
    });
  });

  describe('runHealthCheck', () => {
    it('throws error for unsupported target', async () => {
      await expect(runHealthCheck('unknown_target')).rejects.toThrow('Target "unknown_target" is not supported.');
    });

    it('returns descriptive failure when gemini credentials are not provided', async () => {
      const result = await runHealthCheck('gemini', { apiKey: '' });
      expect(result).toHaveProperty('ok');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('latencyMs');
      expect(result).toHaveProperty('testedAt');
      expect(typeof result.latencyMs).toBe('number');
    });

    it('reports the configured AI-estimate fallback when USDA is disabled', async () => {
      const result = await runHealthCheck('usda', { apiKey: '' });
      expect(result.ok).toBe(true);
      expect(result.message).toContain('USDA FoodData Central is disabled');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('latencyMs');
      expect(result).toHaveProperty('testedAt');
    });

    it('tests an unsaved USDA key without loading saved integration settings', async () => {
      query.mockClear();
      const result = await runHealthCheck('usda', { apiKey: 'unsaved-usda-key' });

      expect(result.ok).toBe(true);
      expect(result.message).toContain('356 kcal');
      expect(query).not.toHaveBeenCalledWith(
        'SELECT config FROM admin_config WHERE section = ? LIMIT 1',
        ['integrations']
      );
    });
  });
});
