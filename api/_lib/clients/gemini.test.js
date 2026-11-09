import { describe, it, expect } from 'vitest';
import {
  sortGeminiModels,
  parseGeminiModels,
  listAvailableModels,
} from './gemini.js';

describe('api/_lib/clients/gemini', () => {
  describe('sortGeminiModels', () => {
    it('prioritizes 2.5-flash, then 2.0-flash, 1.5-flash, pro, then others', () => {
      const input = [
        { id: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro' },
        { id: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' },
        { id: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash' },
        { id: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
        { id: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro' },
        { id: 'gemini-custom', displayName: 'Gemini Custom' },
      ];

      const sorted = sortGeminiModels(input);
      expect(sorted.map((m) => m.id)).toEqual([
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.5-pro',
        'gemini-custom',
      ]);
    });
  });

  describe('parseGeminiModels', () => {
    it('filters out non-gemini models and models without generateContent', async () => {
      const raw = [
        {
          name: 'models/gemini-2.5-flash',
          displayName: 'Gemini 2.5 Flash',
          supportedActions: ['generateContent', 'countTokens'],
          description: 'Fast and intelligent',
        },
        {
          name: 'models/text-embedding-004',
          displayName: 'Text Embedding 004',
          supportedActions: ['embedContent'],
          description: 'Embeddings only',
        },
        {
          name: 'models/imagen-3.0-generate-002',
          displayName: 'Imagen 3',
          supportedActions: ['generateImages'],
          description: 'Image generator',
        },
        {
          name: 'models/gemini-1.5-pro',
          displayName: 'Gemini 1.5 Pro',
          supportedActions: ['generateContent'],
          description: 'Pro model',
        },
      ];

      const result = await parseGeminiModels(raw);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('gemini-2.5-flash');
      expect(result[0].displayName).toBe('Gemini 2.5 Flash');
      expect(result[1].id).toBe('gemini-1.5-pro');
    });

    it('handles models with no models/ prefix and missing displayName', async () => {
      const raw = [
        {
          name: 'gemini-2.0-flash',
          supportedActions: ['generateContent'],
        },
      ];
      const result = await parseGeminiModels(raw);
      expect(result[0].id).toBe('gemini-2.0-flash');
      expect(result[0].displayName).toBe('gemini-2.0-flash');
    });
  });

  describe('listAvailableModels validation', () => {
    it('throws validation error if no key provided and none configured', async () => {
      await expect(listAvailableModels('')).rejects.toThrow();
    });
  });
});

