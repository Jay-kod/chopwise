import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';

/**
 * Custom hook to load and manage personalized meal recommendations.
 */
export function useRecommendations() {
  const [meals, setMeals] = useState([]);
  const [perMealCapNGN, setPerMealCapNGN] = useState(0);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async (regenerate = false) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient('/api/recommend', { regenerate });
      setMeals(res.meals || []);
      setPerMealCapNGN(res.perMealCapNGN || 0);
      setGeneratedAt(res.generatedAt || null);
      setFromCache(Boolean(res.fromCache));
      return res;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations(false);
  }, [fetchRecommendations]);

  const regenerate = useCallback(() => {
    return fetchRecommendations(true);
  }, [fetchRecommendations]);

  return {
    meals,
    perMealCapNGN,
    generatedAt,
    fromCache,
    loading,
    error,
    refresh: () => fetchRecommendations(false),
    regenerate,
  };
}
