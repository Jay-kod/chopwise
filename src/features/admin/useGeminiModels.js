import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../../lib/apiClient';

/**
 * Hook to fetch and manage available Gemini models for the admin interface.
 * Auto-queries when an API key is entered or if the key is already configured.
 *
 * @param {{
 *   apiKey?: string,
 *   isConfigured?: boolean,
 *   currentModel?: string,
 *   onModelChange?: (modelId: string) => void
 * }} params
 */
export function useGeminiModels({
  apiKey = '',
  isConfigured = false,
  currentModel = '',
  onModelChange = () => {},
}) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastFetchedKeyRef = useRef('');
  const hasInitialFetchedRef = useRef(false);

  const fetchModels = useCallback(
    async (explicitKey) => {
      const keyToUse = explicitKey !== undefined ? explicitKey : apiKey;
      const trimmed = (keyToUse || '').trim();

      if (!trimmed && !isConfigured) {
        setModels([]);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const payload = { action: 'listGeminiModels' };
        if (trimmed) payload.apiKey = trimmed;

        const res = await apiClient('/api/admin', payload);
        const list = res.models || [];
        setModels(list);
        lastFetchedKeyRef.current = trimmed;

        if (list.length > 0) {
          const exists = list.some((m) => m.id === currentModel);
          if (!currentModel || !exists) {
            onModelChange(list[0].id);
          }
        }
      } catch (err) {
        const msg = err.message || 'Failed to retrieve available Gemini models.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [apiKey, isConfigured, currentModel, onModelChange]
  );

  // Initial fetch if already configured
  useEffect(() => {
    if (isConfigured && !apiKey && !hasInitialFetchedRef.current) {
      hasInitialFetchedRef.current = true;
      fetchModels();
    }
  }, [isConfigured, apiKey, fetchModels]);

  // Debounced fetch when API key is entered or pasted
  useEffect(() => {
    const trimmed = (apiKey || '').trim();
    if (trimmed.length >= 15 && trimmed !== lastFetchedKeyRef.current) {
      const timer = setTimeout(() => {
        fetchModels(trimmed);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [apiKey, fetchModels]);

  return {
    models,
    loading,
    error,
    fetchModels,
  };
}

