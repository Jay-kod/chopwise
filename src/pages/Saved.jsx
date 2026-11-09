import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/Toast';
import { AppShell } from '@/components/app-shell';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { MealTypeChip, SuitableForChip } from '../features/meals/SafetyBadge';
import { formatNaira } from '../lib/format';
import { ROUTES } from '../lib/routes';

export default function Saved() {
  const { user } = useAuth();
  const addToast = useToast();
  const [savedMeals, setSavedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [mealToRemove, setMealToRemove] = useState(null);

  const loadSaved = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiClient('/api/auth', { action: 'get-saved-meals' });
      setSavedMeals(res?.savedMeals || []);
    } catch {
      setSavedMeals([]);
    } finally {
      setLoadingSaved(false);
    }
  }, [user]);

  function setLoadingSaved(val) {
    setLoading(val);
  }

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  function promptRemove(mealId) {
    const target = savedMeals.find((s) => s.id === mealId || s.meal?.id === mealId);
    setMealToRemove(target || { id: mealId, meal: { name: 'this recipe' } });
  }

  async function confirmRemove() {
    if (!mealToRemove) return;
    const mealId = mealToRemove.id;
    try {
      setRemovingId(mealId);
      await apiClient('/api/auth', { action: 'delete-saved-meal', mealId });
      setSavedMeals((prev) => prev.filter((s) => s.id !== mealId && s.meal?.id !== mealId));
      addToast('Recipe removed from saved meals.', 'ok');
    } catch (err) {
      addToast(err?.message || 'Failed to remove saved recipe.', 'error');
    } finally {
      setRemovingId(null);
      setMealToRemove(null);
    }
  }

  const filteredMeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return savedMeals;
    return savedMeals.filter((s) =>
      s.meal?.name?.toLowerCase().includes(q) ||
      s.meal?.description?.toLowerCase().includes(q)
    );
  }, [savedMeals, search]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
              Saved Meals
            </h1>
            <p className="mt-0.5 text-xs text-muted">
              Your bookmarked Nigerian recipes for quick planning and cooking.
            </p>
          </div>
          <Link to={ROUTES.customer.dashboard}>
            <Button variant="secondary" className="text-xs min-h-9 px-3">
              ← Back to Recommendations
            </Button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner label="Loading your saved meals…" />
          </div>
        ) : savedMeals.length === 0 ? (
          <EmptyState
            title="No saved recipes yet"
            description="Explore your meal recommendations and click Save Recipe on any meal to bookmark it here."
            action={
              <Link to={ROUTES.customer.dashboard}>
                <Button className="text-xs min-h-9 px-4">Browse Meals</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {/* Filter Search */}
            <div className="flex items-center justify-between gap-4">
              <Input
                id="search-saved"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved recipes by name..."
                className="max-w-xs text-xs"
              />
              <span className="text-xs text-muted">
                {filteredMeals.length} of {savedMeals.length} saved
              </span>
            </div>

            {/* Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMeals.map(({ id, meal }) => (
                <Card
                  key={id}
                  className="flex flex-col justify-between p-4 shadow-xs hover:border-field-line transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <MealTypeChip type={meal.mealType} />
                      <span className="text-sm font-bold text-primary">
                        {formatNaira(meal.costNGN)}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-fg leading-snug">
                        {meal.name}
                      </h4>
                      <p className="mt-1 text-xs text-muted line-clamp-2">
                        {meal.description}
                      </p>
                    </div>

                    {meal.suitableFor?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {meal.suitableFor.map((cond, idx) => (
                          <SuitableForChip key={idx} condition={cond} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <Link to={ROUTES.customer.meal(meal.id || id)}>
                      <Button variant="secondary" className="text-xs min-h-8 px-3">
                        View Recipe →
                      </Button>
                    </Link>

                    <button
                      type="button"
                      onClick={() => promptRemove(id)}
                      disabled={removingId === id}
                      className="text-xs text-danger-fg hover:underline cursor-pointer"
                      aria-label={`Remove ${meal.name} from saved recipes`}
                    >
                      {removingId === id ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Remove Confirmation */}
        <ConfirmModal
          isOpen={Boolean(mealToRemove)}
          onClose={() => setMealToRemove(null)}
          onConfirm={confirmRemove}
          title="Remove from saved recipes?"
          message={`Are you sure you want to remove "${mealToRemove?.meal?.name || 'this recipe'}" from your saved recipes?`}
          confirmText="Remove recipe"
          cancelText="Keep recipe"
          variant="danger"
          loading={Boolean(removingId)}
          icon="🗑️"
        />
      </div>
    </AppShell>
  );
}
