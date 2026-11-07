import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import Disclaimer from '../components/Disclaimer';
import MealCard from '../features/meals/MealCard';
import FilterBar from '../features/meals/FilterBar';
import { useRecommendations } from '../features/meals/useRecommendations';
import { useAuth } from '../features/auth/useAuth';
import { formatNaira } from '../lib/format';
import { apiClient } from '../lib/apiClient';

export default function Dashboard() {
  const { user } = useAuth();
  const {
    meals,
    perMealCapNGN,
    generatedAt,
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

  async function handleConfirmRegenerate() {
    setShowRegenerateConfirm(false);
    setRegenerating(true);
    await regenerate();
    setRegenerating(false);
  }

  const filteredMeals = meals.filter((m) => {
    if (filters.mealType !== 'all' && m.mealType !== filters.mealType) {
      return false;
    }
    if (filters.condition !== 'all' && !m.suitableFor?.includes(filters.condition)) {
      return false;
    }
    if (filters.budget === 'under-cap' && m.costNGN > perMealCapNGN) {
      return false;
    }
    if (filters.budget === 'over-cap' && m.costNGN <= perMealCapNGN) {
      return false;
    }
    return true;
  });

  return (
    <Layout>
      <div className="space-y-6 py-2 sm:py-4">
        {/* Header Greeting & Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-fg">
              Personalised Nigerian Meal Plan
            </h1>
            <p className="mt-1 text-xs text-muted">
              Nutritious meals tailored to your health conditions and wallet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {perMealCapNGN > 0 && (
              <span className="rounded-lg border border-line bg-surface-muted px-3 py-1.5 text-xs text-fg">
                Target per meal:{' '}
                <strong className="text-primary">{formatNaira(perMealCapNGN)}</strong>
              </span>
            )}

            <Button
              variant="secondary"
              onClick={() => setShowRegenerateConfirm(true)}
              disabled={loading || regenerating}
              className="text-xs min-h-9 px-3"
            >
              {regenerating ? <Spinner label="Generating…" /> : '⚡ Regenerate Plan'}
            </Button>
          </div>
        </div>

        {/* Regenerate Confirmation Dialog */}
        {showRegenerateConfirm && (
          <div
            className="rounded-xl border border-line bg-surface p-5 shadow-lg"
            role="dialog"
            aria-labelledby="regenerate-title"
          >
            <h3 id="regenerate-title" className="text-base font-bold text-fg">
              Generate new meal plan?
            </h3>
            <p className="mt-1 text-xs text-muted">
              Regenerating will call Gemini for new Nigerian recipes and count toward your hourly request limit.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowRegenerateConfirm(false)}
                className="text-xs min-h-9 px-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRegenerate}
                className="text-xs min-h-9 px-4"
              >
                Yes, Regenerate
              </Button>
            </div>
          </div>
        )}

        {/* Error Handling States */}
        {error && (
          <div>
            {error.code === 'NOT_CONFIGURED' ? (
              <Card className="p-6 text-center">
                <span className="text-3xl" aria-hidden="true">
                  ⚙️
                </span>
                <h3 className="mt-2 text-base font-bold text-fg">
                  Recommendation Service Not Configured
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-muted">
                  The AI meal recommendation engine is currently being set up with its Google Gemini credentials.
                </p>
                {isAdmin && (
                  <div className="mt-4">
                    <Link to="/admin">
                      <Button className="text-xs min-h-9">
                        Open Admin Portal to add API key
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            ) : error.code === 'RATE_LIMITED' ? (
              <div
                className="rounded-xl border border-warn-line bg-warn-bg p-6 text-center text-warn-fg"
                role="alert"
              >
                <span className="text-3xl" aria-hidden="true">
                  ⏳
                </span>
                <h3 className="mt-2 text-base font-bold">Hourly Request Limit Reached</h3>
                <p className="mt-1 text-xs">
                  {error.message ||
                    'You have reached your hourly meal recommendation limit. Please try again later.'}
                </p>
              </div>
            ) : (
              <ErrorState
                message={error.message || 'Failed to load recommendations.'}
                onRetry={refresh}
              />
            )}
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-4">
            <div className="flex justify-center py-6">
              <Spinner label="Preparing your Nigerian meal recommendations…" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-xl border border-line bg-surface-muted"
                />
              ))}
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {!loading && !error && meals.length > 0 && (
          <div className="space-y-6">
            {/* Filter Bar & Cache Status */}
            <div className="space-y-2">
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

            {/* Meals Grid */}
            {filteredMeals.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              /* Empty Filter State (FR8: empty state offers Regenerate) */
              <Card className="p-8 text-center space-y-3">
                <span className="text-3xl" aria-hidden="true">
                  🔍
                </span>
                <h3 className="text-base font-bold text-fg">
                  No meals match your active filters
                </h3>
                <p className="mx-auto max-w-md text-xs text-muted">
                  Try clearing some filter criteria, or generate a fresh meal plan.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setFilters({
                        mealType: 'all',
                        condition: 'all',
                        budget: 'all',
                      })
                    }
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

        {/* Persistent Medical Disclaimer */}
        <div className="pt-4">
          <Disclaimer />
        </div>
      </div>
    </Layout>
  );
}
