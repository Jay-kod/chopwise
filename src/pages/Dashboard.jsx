import { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/app-shell';
import { DashboardStats } from '@/components/stats';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Disclaimer from '../components/Disclaimer';
import ConfirmModal from '../components/ConfirmModal';
import MealCard from '../features/meals/MealCard';
import FilterBar from '../features/meals/FilterBar';
import DashboardError from '../features/meals/DashboardError';
import SavedMealsList from '../features/meals/SavedMealsList';
import { useRecommendations } from '../features/meals/useRecommendations';
import { useAuth } from '../features/auth/useAuth';
import { formatNaira } from '../lib/format';
import { apiClient } from '../lib/apiClient';

/**
 * User Dashboard page matching the responsive @efferd/dashboard-3 template.
 */
export default function Dashboard() {
  const { user } = useAuth();
  const {
    meals,
    perMealCapNGN,
    fromCache,
    loading,
    error,
    refresh,
    regenerate,
  } = useRecommendations();

  const [filters, setFilters] = useState({
    mealType: 'all',
    condition: 'all',
    budget: 'all',
  });
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [savedMeals, setSavedMeals] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    let active = true;
    if (user) {
      apiClient('/api/admin', { action: 'me' })
        .then((res) => {
          if (active) setIsAdmin(Boolean(res?.isAdmin));
        })
        .catch(() => {
          if (active) setIsAdmin(false);
        });
    }
    return () => {
      active = false;
    };
  }, [user]);

  const loadSaved = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingSaved(true);
      const res = await apiClient('/api/auth', { action: 'get-saved-meals' });
      if (res?.savedMeals) setSavedMeals(res.savedMeals);
    } catch {
      // Non-blocking
    } finally {
      setLoadingSaved(false);
    }
  }, [user]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  async function handleConfirmRegenerate() {
    setShowRegenerateConfirm(false);
    setRegenerating(true);
    await regenerate();
    setRegenerating(false);
  }

  async function handleRemoveSaved(mealId) {
    try {
      setRemovingId(mealId);
      await apiClient('/api/auth', { action: 'delete-saved-meal', mealId });
      setSavedMeals((prev) => prev.filter((m) => m.id !== mealId));
    } catch {
      // Ignored
    } finally {
      setRemovingId(null);
    }
  }

  const filteredMeals = meals.filter((m) => {
    if (filters.mealType !== 'all' && m.mealType !== filters.mealType) return false;
    if (filters.condition !== 'all' && !m.suitableFor?.includes(filters.condition)) return false;
    if (filters.budget === 'under-cap' && m.costNGN > perMealCapNGN) return false;
    if (filters.budget === 'over-cap' && m.costNGN <= perMealCapNGN) return false;
    return true;
  });

  const weeklyBudget = user?.profile?.weeklyBudgetNGN || 21000;
  const conditions = user?.profile?.conditions || [];

  const statsItems = [
    {
      label: 'Target per meal',
      value: perMealCapNGN > 0 ? formatNaira(perMealCapNGN) : '—',
      delta: 2.5,
      footnote: 'weekly budget / 21',
    },
    {
      label: 'Weekly budget',
      value: formatNaira(weeklyBudget),
      delta: 0,
      footnote: 'enforced in plan',
    },
    {
      label: 'Recommended meals',
      value: `${meals.length}`,
      delta: 1.0,
      footnote: fromCache ? 'Saved plan' : 'Freshly generated',
    },
    {
      label: 'Tracked conditions',
      value: `${conditions.length} active`,
      delta: 0,
      footnote: conditions.join(', ') || 'No restrictions',
    },
  ];

  return (
    <AppShell pathname="/dashboard" onRegenerate={() => setShowRegenerateConfirm(true)}>
      {/* Top Heading & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
            Personalised Nigerian Meal Plan
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Nutritious meals tailored to your health profile and budget.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowRegenerateConfirm(true)}
            disabled={loading || regenerating}
            className="text-xs min-h-9 px-3.5"
          >
            {regenerating ? <Spinner label="Generating…" /> : '⚡ Regenerate Plan'}
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showRegenerateConfirm}
        onClose={() => setShowRegenerateConfirm(false)}
        onConfirm={handleConfirmRegenerate}
        title="Generate new meal plan?"
        message="Regenerating will call Gemini for new Nigerian recipes and count toward your hourly request limit."
        confirmText="Yes, Regenerate"
        cancelText="Keep Current Plan"
        variant="primary"
        loading={regenerating}
        icon="⚡"
      />

      {/* Stats Cards Row (Dashboard-3 Block) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStats items={statsItems} />
      </div>

      {/* Error State */}
      <DashboardError error={error} isAdmin={isAdmin} onRetry={refresh} />

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          <div className="flex justify-center py-6">
            <Spinner label="Preparing your Nigerian meal recommendations…" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl border border-line bg-surface-muted"
              />
            ))}
          </div>
        </div>
      )}

      {/* Meal Plan Recommendations */}
      {!loading && !error && meals.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <FilterBar
              filters={filters}
              onChange={setFilters}
              perMealCapNGN={perMealCapNGN}
              totalCount={meals.length}
              filteredCount={filteredMeals.length}
            />
            {fromCache && (
              <div className="text-right text-[11px] text-muted">
                ✓ Saved plan from your profile
              </div>
            )}
          </div>

          {filteredMeals.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  perMealCapNGN={perMealCapNGN}
                  isClickable={true}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center space-y-3">
              <span className="text-3xl" aria-hidden="true">🔍</span>
              <h3 className="text-base font-bold text-fg">No meals match your active filters</h3>
              <p className="mx-auto max-w-md text-xs text-muted">
                Try clearing some filter criteria, or generate a fresh meal plan.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setFilters({ mealType: 'all', condition: 'all', budget: 'all' })}
                  className="text-xs min-h-9 px-3"
                >
                  Clear all filters
                </Button>
                <Button
                  onClick={() => setShowRegenerateConfirm(true)}
                  className="text-xs min-h-9 px-3"
                >
                  Regenerate Plan
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Saved Meals Section */}
      <div id="saved" className="pt-4 border-t border-line space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg">Saved Recipes</h2>
          <span className="text-[11px] text-muted">Your bookmarked meals</span>
        </div>
        <SavedMealsList
          savedMeals={savedMeals}
          loading={loadingSaved}
          onRemove={handleRemoveSaved}
          removingId={removingId}
        />
      </div>

      {/* Medical Disclaimer */}
      <div className="pt-2">
        <Disclaimer />
      </div>
    </AppShell>
  );
}
