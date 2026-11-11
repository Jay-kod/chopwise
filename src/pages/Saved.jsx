import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, XIcon } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/Toast';
import { AppShell } from '@/components/app-shell';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import SavedHero from '../features/meals/SavedHero';
import SavedMealCard from '../features/meals/SavedMealCard';
import { ROUTES } from '../lib/routes';

const PERIOD_TABS = [
  { id: 'all', label: 'All Dishes' },
  { id: 'breakfast', label: '🌅 Breakfast' },
  { id: 'lunch', label: '☀️ Lunch' },
  { id: 'dinner', label: '🌙 Dinner' },
];

function SavedFilterBar({ search, setSearch, activePeriod, setActivePeriod, savedMeals }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-line bg-surface p-4 shadow-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        {PERIOD_TABS.map((tab) => {
          const count = tab.id === 'all'
            ? savedMeals.length
            : savedMeals.filter((s) => s.meal?.mealType === tab.id).length;
          const active = activePeriod === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePeriod(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border shadow-2xs flex items-center gap-1.5 ${
                active
                  ? 'border-field-line bg-primary text-on-primary shadow-xs'
                  : 'border-line bg-surface text-fg hover:bg-surface-muted hover:border-field-line'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                active ? 'bg-primary-hover text-on-primary' : 'bg-surface-muted text-muted'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative min-w-[200px] sm:max-w-xs">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          id="search-saved"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter favourite meals…"
          className="w-full rounded-xl border border-field-line bg-surface pl-8 pr-7 py-1.5 text-xs text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-fg p-0.5"
            aria-label="Clear search"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function SavedMealsGrid({ filteredMeals, promptRemove, removingId }) {
  if (filteredMeals.length === 0) {
    return (
      <Card className="p-8 text-center space-y-2">
        <span className="text-3xl" aria-hidden="true">🔍</span>
        <h3 className="text-sm font-bold text-fg">No favourite meals match your filter</h3>
        <p className="text-xs text-muted">Try clearing your search query or selecting a different meal period.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredMeals.map(({ id, meal }) => (
        <SavedMealCard
          key={id}
          id={id}
          meal={meal}
          onRemove={promptRemove}
          isRemoving={removingId === id}
        />
      ))}
    </div>
  );
}

function useSavedLoader(user) {
  const [savedMeals, setSavedMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiClient('/api/auth', { action: 'get-saved-meals' });
      setSavedMeals(res?.savedMeals || []);
    } catch {
      setSavedMeals([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadSaved(); }, [loadSaved]);
  return { savedMeals, setSavedMeals, loading };
}

function useSavedState(user, addToast) {
  const { savedMeals, setSavedMeals, loading } = useSavedLoader(user);
  const [removingId, setRemovingId] = useState(null);
  const [mealToRemove, setMealToRemove] = useState(null);

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

  return { savedMeals, loading, removingId, mealToRemove, setMealToRemove, confirmRemove };
}

function usePeriodFilter(savedMeals, activePeriod, search) {
  return useMemo(() => {
    return savedMeals.filter((s) => {
      if (activePeriod !== 'all' && s.meal?.mealType !== activePeriod) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return s.meal?.name?.toLowerCase().includes(q) || s.meal?.description?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [savedMeals, activePeriod, search]);
}

function SavedContent({ loading, savedMeals, filteredMeals, search, setSearch, activePeriod, setActivePeriod, setMealToRemove, removingId }) {
  if (loading) {
    return <div className="flex justify-center py-12"><Spinner label="Loading your favourite meals…" /></div>;
  }
  if (savedMeals.length === 0) {
    return (
      <EmptyState
        title="No favourite meals yet"
        description="Explore your meal recommendations and click the heart icon on any meal to save it here."
        action={<Link to={ROUTES.customer.meals}><Button className="text-xs min-h-9 px-4">Browse Meals</Button></Link>}
      />
    );
  }
  return (
    <div className="space-y-4">
      <SavedFilterBar search={search} setSearch={setSearch} activePeriod={activePeriod} setActivePeriod={setActivePeriod} savedMeals={savedMeals} />
      <SavedMealsGrid filteredMeals={filteredMeals} promptRemove={(id) => setMealToRemove(savedMeals.find((s) => s.id === id || s.meal?.id === id) || { id })} removingId={removingId} />
    </div>
  );
}

function SavedRemoveDialog({ mealToRemove, setMealToRemove, confirmRemove, removingId }) {
  return (
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
  );
}

export default function Saved() {
  const { user } = useAuth();
  const addToast = useToast();
  const [search, setSearch] = useState('');
  const [activePeriod, setActivePeriod] = useState('all');
  const { savedMeals, loading, removingId, mealToRemove, setMealToRemove, confirmRemove } = useSavedState(user, addToast);

  const bCount = savedMeals.filter((s) => s.meal?.mealType === 'breakfast').length;
  const lCount = savedMeals.filter((s) => s.meal?.mealType === 'lunch').length;
  const dCount = savedMeals.filter((s) => s.meal?.mealType === 'dinner').length;
  const filteredMeals = usePeriodFilter(savedMeals, activePeriod, search);

  return (
    <AppShell pathname={ROUTES.customer.saved}>
      <div className="space-y-6">
        <SavedHero totalCount={savedMeals.length} breakfastCount={bCount} lunchCount={lCount} dinnerCount={dCount} />
        <SavedContent
          loading={loading}
          savedMeals={savedMeals}
          filteredMeals={filteredMeals}
          search={search}
          setSearch={setSearch}
          activePeriod={activePeriod}
          setActivePeriod={setActivePeriod}
          setMealToRemove={setMealToRemove}
          removingId={removingId}
        />
        <SavedRemoveDialog
          mealToRemove={mealToRemove}
          setMealToRemove={setMealToRemove}
          confirmRemove={confirmRemove}
          removingId={removingId}
        />
      </div>
    </AppShell>
  );
}
