import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Spinner from '../components/Spinner';
import NutritionPanel from '../features/meals/NutritionPanel';
import AnalysisHero from '../features/analysis/AnalysisHero';
import MealSelectorTabs from '../features/analysis/MealSelectorTabs';
import SelectedMealSummary from '../features/analysis/SelectedMealSummary';
import ClinicalThresholdsCard from '../features/analysis/ClinicalThresholdsCard';
import { apiClient } from '../lib/apiClient';
import { ROUTES } from '../lib/routes';

function mapSavedMeals(response) {
  return (response?.savedMeals || []).map(({ id, meal }) => ({
    ...meal,
    id: meal?.id || id,
    source: 'Saved meals',
  }));
}

function mapCatalogueMeals(response) {
  return (response?.items || []).map(({ id, recipe }) => ({
    ...recipe,
    id,
    source: 'Recipe catalogue',
  }));
}

function getMealKey(meal) {
  return meal ? `${meal.source}:${meal.id}` : '';
}

function firstMeal(sources) {
  const meal = sources.recommended[0];
  if (meal) return { ...meal, source: 'Current meal plan' };
  return sources.saved[0] || sources.catalogue[0] || null;
}

export default function CustomerAnalysis() {
  const [sources, setSources] = useState({ recommended: [], saved: [], catalogue: [] });
  const [sourceErrors, setSourceErrors] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMeals = useCallback(async () => {
    setLoading(true);
    setSourceErrors([]);
    const results = await Promise.allSettled([
      apiClient('/api/recommend', { regenerate: false }),
      apiClient('/api/auth', { action: 'get-saved-meals' }),
      apiClient('/api/catalog', { action: 'list', limit: 100 }),
    ]);
    const nextSources = {
      recommended: results[0].status === 'fulfilled' ? (results[0].value?.meals || []) : [],
      saved: results[1].status === 'fulfilled' ? mapSavedMeals(results[1].value) : [],
      catalogue: results[2].status === 'fulfilled' ? mapCatalogueMeals(results[2].value) : [],
    };
    const nextMeals = [
      ...nextSources.recommended.map((meal) => ({ ...meal, source: 'Current meal plan' })),
      ...nextSources.saved,
      ...nextSources.catalogue,
    ];
    const labels = ['Current meal plan', 'Saved meals', 'Recipe catalogue'];
    setSources(nextSources);
    setSourceErrors(results.flatMap((result, index) => (
      result.status === 'rejected'
        ? [`${labels[index]}: ${result.reason?.message || 'could not be loaded.'}`]
        : []
    )));
    setSelectedKey((current) => (
      nextMeals.some((meal) => getMealKey(meal) === current)
        ? current
        : getMealKey(firstMeal(nextSources))
    ));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const meals = useMemo(() => [
    ...sources.recommended.map((meal) => ({ ...meal, source: 'Current meal plan' })),
    ...sources.saved,
    ...sources.catalogue,
  ], [sources]);

  const selectedMeal = meals.find((meal) => getMealKey(meal) === selectedKey);

  return (
    <AppShell pathname={ROUTES.customer.analysis}>
      <div className="space-y-6">
        <AnalysisHero
          totalCount={meals.length}
          planCount={sources.recommended.length}
          savedCount={sources.saved.length}
          catalogueCount={sources.catalogue.length}
        />

        {sourceErrors.length > 0 && (
          <ErrorState
            message={sourceErrors.join(' ')}
            onRetry={loadMeals}
            className="p-3 text-xs"
          />
        )}

        {loading ? (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <Spinner label="Loading your meal portfolio…" />
          </Card>
        ) : meals.length > 0 ? (
          <>
            <MealSelectorTabs
              meals={meals}
              selectedKey={selectedKey}
              onSelectKey={setSelectedKey}
            />

            {selectedMeal ? (
              <section aria-label={`Analysis for ${selectedMeal.name}`} className="space-y-6">
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
                  {/* Left Column: Selected Meal Overview & Deep Nutrition Breakdown */}
                  <div className="space-y-6">
                    <SelectedMealSummary meal={selectedMeal} />
                    <NutritionPanel key={selectedMeal.id} mealId={selectedMeal.id} />
                  </div>

                  {/* Right Column: Evidence-Based Clinical Nutrition Guardrails Reference */}
                  <div className="space-y-6 lg:sticky lg:top-20">
                    <ClinicalThresholdsCard />
                  </div>
                </div>
              </section>
            ) : (
              <Card className="p-6 text-center text-xs text-muted">
                Select a dish above to inspect its nutritional composition and AI feedback.
              </Card>
            )}
          </>
        ) : (
          <EmptyState
            title="No meals available to analyze"
            description="Generate a fresh Nigerian meal plan or save recipes to inspect full nutritional telemetry."
            action={
              <Link to={ROUTES.customer.dashboard}>
                <Button variant="primary">Go to Dashboard</Button>
              </Link>
            }
          />
        )}
      </div>
    </AppShell>
  );
}
