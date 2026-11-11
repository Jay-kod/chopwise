import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Disclaimer from '../components/Disclaimer';
import CatalogHero from '../features/catalog/CatalogHero';
import CatalogFilters from '../features/catalog/CatalogFilters';
import CatalogRecipeCard from '../features/catalog/CatalogRecipeCard';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/Toast';
import { useNotifications } from '../features/notifications/NotificationContext';
import { ROUTES } from '../lib/routes';

const PAGE_SIZE = 24;

export default function RecipeCatalog() {
  const { user } = useAuth();
  const addToast = useToast();
  const { addNotification } = useNotifications();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [activeCondition, setActiveCondition] = useState('all');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [savedMealIds, setSavedMealIds] = useState(new Set());
  const [savingMealId, setSavingMealId] = useState(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient('/api/catalog', { action: 'list', search, offset, limit: PAGE_SIZE });
      setItems(response.items || []);
      setTotal(response.total || 0);
    } catch (requestError) {
      setError(requestError.message || 'The recipe catalogue could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [offset, search]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    let active = true;
    if (user) {
      apiClient('/api/auth', { action: 'get-saved-meals' })
        .then((res) => {
          if (!active) return;
          const ids = new Set((res?.savedMeals || []).map((s) => s.meal?.id || s.id));
          setSavedMealIds(ids);
        })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [user]);

  async function handleToggleSave(recipe, mealId) {
    if (!user || !mealId) return;
    const isSaved = savedMealIds.has(mealId);
    try {
      setSavingMealId(mealId);
      if (isSaved) {
        await apiClient('/api/auth', { action: 'delete-saved-meal', mealId });
        setSavedMealIds((prev) => { const n = new Set(prev); n.delete(mealId); return n; });
        addToast(`Removed "${recipe.name}" from favourite meals.`, 'ok');
        addNotification({ type: 'favourite', title: 'Removed Favourite', message: `"${recipe.name}" was removed.`, href: ROUTES.customer.saved, icon: '💔' });
      } else {
        await apiClient('/api/auth', { action: 'save-meal', meal: { ...recipe, id: mealId } });
        setSavedMealIds((prev) => new Set(prev).add(mealId));
        addToast(`Added "${recipe.name}" to favourite meals!`, 'ok');
        addNotification({ type: 'favourite', title: 'Saved Favourite', message: `"${recipe.name}" added to saved meals.`, href: ROUTES.customer.saved, icon: '❤️' });
      }
    } catch (err) {
      addToast(err?.message || 'Failed to update favourite meals.', 'error');
    } finally {
      setSavingMealId(null);
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setOffset(0);
    setSearch(searchInput.trim());
  }

  const filteredItems = useMemo(() => {
    return items.filter(({ recipe }) => {
      if (!recipe) return false;
      if (activeType !== 'all' && recipe.mealType !== activeType) return false;
      if (activeCondition !== 'all' && !recipe.suitableFor?.includes(activeCondition)) return false;
      return true;
    });
  }, [items, activeType, activeCondition]);

  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AppShell pathname={ROUTES.customer.recipes}>
      <div className="space-y-6">
        <CatalogHero totalCount={total} isAdmin={Boolean(user?.isAdmin)} />

        <CatalogFilters
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          activeType={activeType}
          onTypeChange={setActiveType}
          activeCondition={activeCondition}
          onConditionChange={setActiveCondition}
          loading={loading}
        />

        {error && <ErrorState message={error} onRetry={loadCatalog} />}

        {loading ? (
          <div className="flex justify-center p-12">
            <Spinner label="Loading authentic Nigerian recipes…" />
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title={search || activeType !== 'all' || activeCondition !== 'all' ? 'No matching recipes found' : 'No catalogue recipes yet'}
            message={search || activeType !== 'all' || activeCondition !== 'all' ? 'Try adjusting your search terms or clearing your filters.' : 'The admin team has not published shared recipes yet.'}
            action={
              user?.isAdmin ? (
                <Link to={ROUTES.admin.recipes}>
                  <Button variant="primary" className="text-xs min-h-9 px-4">+ Add Recipe</Button>
                </Link>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => { setSearchInput(''); setSearch(''); setActiveType('all'); setActiveCondition('all'); }}
                >
                  Clear all filters
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <CatalogRecipeCard
                key={item.id}
                item={item}
                isSaved={savedMealIds.has(item.id)}
                onToggleSave={handleToggleSave}
                isSaving={savingMealId === item.id}
              />
            ))}
          </div>
        )}

        {/* Tactile Pagination Toolbar */}
        {!loading && total > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-line bg-surface p-4 text-xs text-muted shadow-xs">
            <span className="font-medium text-fg">
              Showing {filteredItems.length} of {total} shared recipes
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={loading || offset === 0}
                className="min-h-9 px-3 text-xs shadow-2xs"
              >
                ← Previous
              </Button>
              <span className="rounded-lg border border-line bg-surface-muted px-2.5 py-1 font-semibold text-fg">
                Page {pageNumber} of {pageCount}
              </span>
              <Button
                variant="secondary"
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={loading || offset + PAGE_SIZE >= total}
                className="min-h-9 px-3 text-xs shadow-2xs"
              >
                Next →
              </Button>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Disclaimer />
        </div>
      </div>
    </AppShell>
  );
}
