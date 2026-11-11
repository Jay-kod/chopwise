import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';
import MealCard from '../features/meals/MealCard';
import MealCardSkeleton from '../features/meals/MealCardSkeleton';
import MealsHero from '../features/meals/MealsHero';
import MealsFilters from '../features/meals/MealsFilters';
import Button from '../components/Button';
import Card from '../components/Card';
import Disclaimer from '../components/Disclaimer';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/Toast';
import { useNotifications } from '../features/notifications/NotificationContext';
import { ROUTES } from '../lib/routes';

function EmptyCatalogCard({ isAdmin }) {
  return (
    <Card className="p-8 text-center space-y-3">
      <span className="text-3xl" aria-hidden="true">🍲</span>
      <h3 className="text-base font-bold text-fg">Catalogue is currently empty</h3>
      <p className="text-xs text-muted max-w-md mx-auto">No recipes in the catalogue yet.</p>
      {isAdmin && (
        <div className="pt-2">
          <Link to={ROUTES.admin.recipes}>
            <Button variant="primary" className="text-xs min-h-9 px-4">Add First Recipe in Admin</Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

function MealsResultsSection({
  loading, meals, filteredMeals, savedMealIds, savingMealId,
  onToggleSave, onResetFilters, isAdmin, error,
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((idx) => <MealCardSkeleton key={idx} />)}
      </div>
    );
  }
  if (filteredMeals.length > 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMeals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            perMealCapNGN={0}
            isClickable={true}
            isSaved={savedMealIds.has(meal.id)}
            onToggleSave={onToggleSave}
            isSaving={savingMealId === meal.id}
          />
        ))}
      </div>
    );
  }
  if (meals.length === 0 && !error) {
    return <EmptyCatalogCard isAdmin={isAdmin} />;
  }
  return (
    <Card className="p-8 text-center space-y-3">
      <span className="text-3xl" aria-hidden="true">🔍</span>
      <h3 className="text-base font-bold text-fg">No meals match active filters</h3>
      <div className="flex justify-center gap-2 pt-2">
        <Button variant="secondary" onClick={onResetFilters} className="text-xs min-h-9 px-3">
          Clear filters
        </Button>
      </div>
    </Card>
  );
}

function useSavedMealsSync(user) {
  const [savedMealIds, setSavedMealIds] = useState(new Set());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    if (user) {
      apiClient('/api/admin', { action: 'me' })
        .then((res) => { if (active) setIsAdmin(Boolean(res?.isAdmin)); })
        .catch(() => { if (active) setIsAdmin(false); });
      apiClient('/api/auth', { action: 'get-saved-meals' })
        .then((res) => {
          if (!active) return;
          setSavedMealIds(new Set((res?.savedMeals || []).map((s) => s.meal?.id || s.id)));
        })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [user]);

  return { savedMealIds, setSavedMealIds, isAdmin };
}

function useMealsListLoader() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMeals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient('/api/catalog', { action: 'list', limit: 100 });
      setMeals((res?.items || []).map((i) => ({ ...i.recipe, id: i.id })));
    } catch (err) {
      setError(err?.message || 'Failed to load meals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMeals(); }, [loadMeals]);
  return { meals, loading, error };
}

function useMealSaveAction(user, savedMealIds, setSavedMealIds, addToast, addNotification) {
  const [savingMealId, setSavingMealId] = useState(null);

  async function handleToggleSave(meal) {
    if (!user || !meal?.id) return;
    const isSaved = savedMealIds.has(meal.id);
    try {
      setSavingMealId(meal.id);
      if (isSaved) {
        await apiClient('/api/auth', { action: 'delete-saved-meal', mealId: meal.id });
        setSavedMealIds((prev) => { const n = new Set(prev); n.delete(meal.id); return n; });
        addToast(`Removed "${meal.name}" from favourite meals.`, 'ok');
      } else {
        await apiClient('/api/auth', { action: 'save-meal', meal });
        setSavedMealIds((prev) => new Set(prev).add(meal.id));
        addToast(`Added "${meal.name}" to favourite meals!`, 'ok');
        addNotification({ type: 'favourite', title: 'Saved to Favourites', message: `"${meal.name}" saved.`, href: '/customer/saved', icon: '❤️' });
      }
    } catch (err) {
      addToast(err?.message || 'Failed to update favourite meals.', 'error');
    } finally {
      setSavingMealId(null);
    }
  }

  return { savingMealId, handleToggleSave };
}

function filterMealsList(meals, { mealType, condition, prepTime, search }) {
  return meals.filter((m) => {
    if (mealType !== 'all' && m.mealType !== mealType) return false;
    if (condition !== 'all' && !m.suitableFor?.includes(condition)) return false;
    if (prepTime === 'quick' && (m.prepTimeMinutes || 45) > 30) return false;
    if (prepTime === 'standard' && (m.prepTimeMinutes || 45) <= 30) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = m.name?.toLowerCase().includes(q);
      const matchDesc = m.description?.toLowerCase().includes(q);
      const matchIngr = m.ingredients?.some((i) => i.item?.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchIngr) return false;
    }
    return true;
  });
}

function MealsFiltersAndResults({ filters, setFilters, meals, filteredMeals, savedMealIds, savingMealId, onToggleSave, isAdmin, error, loading }) {
  const resetFilters = () => setFilters({ search: '', mealType: 'all', condition: 'all', prepTime: 'all' });
  return (
    <>
      <MealsFilters
        search={filters.search}
        onSearchChange={(v) => setFilters((f) => ({ ...f, search: v }))}
        mealType={filters.mealType}
        onMealTypeChange={(v) => setFilters((f) => ({ ...f, mealType: v }))}
        condition={filters.condition}
        onConditionChange={(v) => setFilters((f) => ({ ...f, condition: v }))}
        prepTime={filters.prepTime}
        onPrepTimeChange={(v) => setFilters((f) => ({ ...f, prepTime: v }))}
        totalCount={meals.length}
        filteredCount={filteredMeals.length}
        onReset={resetFilters}
      />
      <section className="space-y-4 pt-1">
        <MealsResultsSection
          loading={loading}
          meals={meals}
          filteredMeals={filteredMeals}
          savedMealIds={savedMealIds}
          savingMealId={savingMealId}
          onToggleSave={onToggleSave}
          onResetFilters={resetFilters}
          isAdmin={isAdmin}
          error={error}
        />
      </section>
    </>
  );
}

export default function CustomerMeals() {
  const { user } = useAuth();
  const addToast = useToast();
  const { addNotification } = useNotifications();
  const [filters, setFilters] = useState({ search: '', mealType: 'all', condition: 'all', prepTime: 'all' });

  const { savedMealIds, setSavedMealIds, isAdmin } = useSavedMealsSync(user);
  const { meals, loading, error } = useMealsListLoader();
  const { savingMealId, handleToggleSave } = useMealSaveAction(user, savedMealIds, setSavedMealIds, addToast, addNotification);

  const filteredMeals = filterMealsList(meals, filters);
  const quickCount = meals.filter((m) => (m.prepTimeMinutes || 45) <= 30).length;

  return (
    <AppShell pathname={ROUTES.customer.meals}>
      <div className="space-y-6">
        <MealsHero totalCount={meals.length} quickCount={quickCount} savedCount={savedMealIds.size} isAdmin={isAdmin} />
        <MealsFiltersAndResults
          filters={filters}
          setFilters={setFilters}
          meals={meals}
          filteredMeals={filteredMeals}
          savedMealIds={savedMealIds}
          savingMealId={savingMealId}
          onToggleSave={handleToggleSave}
          isAdmin={isAdmin}
          error={error}
          loading={loading}
        />
        <div className="pt-2"><Disclaimer /></div>
      </div>
    </AppShell>
  );
}
