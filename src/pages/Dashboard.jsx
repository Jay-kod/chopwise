import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import Button from '../components/Button';
import Card from '../components/Card';
import Disclaimer from '../components/Disclaimer';
import ConfirmModal from '../components/ConfirmModal';
import MealCard from '../features/meals/MealCard';
import FilterBar from '../features/meals/FilterBar';
import DashboardError from '../features/meals/DashboardError';
import MealCardSkeleton from '../features/meals/MealCardSkeleton';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import DashboardHero from '../features/dashboard/DashboardHero';
import DashboardMetrics from '../features/dashboard/DashboardMetrics';
import HealthAdvisoryBanner from '../features/dashboard/HealthAdvisoryBanner';
import DashboardMealTabs from '../features/dashboard/DashboardMealTabs';
import { useRecommendations } from '../features/meals/useRecommendations';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/Toast';
import { useNotifications } from '../features/notifications/NotificationContext';
import { apiClient } from '../lib/apiClient';
import { ROUTES } from '../lib/routes';

export default function Dashboard() {
  const { user } = useAuth();
  const addToast = useToast();
  const { addNotification } = useNotifications();
  const { meals, perMealCapNGN, fromCache, loading, error, refresh, regenerate } = useRecommendations();

  const [filters, setFilters] = useState({ mealType: 'all', condition: 'all', budget: 'all', prepTime: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [savedMealIds, setSavedMealIds] = useState(new Set());
  const [savingMealId, setSavingMealId] = useState(null);

  useEffect(() => {
    let active = true;
    if (user) {
      apiClient('/api/admin', { action: 'me' })
        .then((res) => { if (active) setIsAdmin(Boolean(res?.isAdmin)); })
        .catch(() => { if (active) setIsAdmin(false); });

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

  async function handleToggleSave(meal, e) {
    if (!user || !meal?.id) return;
    const isSaved = savedMealIds.has(meal.id);
    try {
      setSavingMealId(meal.id);
      if (isSaved) {
        await apiClient('/api/auth', { action: 'delete-saved-meal', mealId: meal.id });
        setSavedMealIds((prev) => { const n = new Set(prev); n.delete(meal.id); return n; });
        addToast(`Removed "${meal.name}" from favourite meals.`, 'ok');
        addNotification({ type: 'favourite', title: 'Removed from Favourites', message: `"${meal.name}" was removed.`, href: '/customer/saved', icon: '💔' });
      } else {
        await apiClient('/api/auth', { action: 'save-meal', meal });
        setSavedMealIds((prev) => new Set(prev).add(meal.id));
        addToast(`Added "${meal.name}" to favourite meals!`, 'ok');
        addNotification({ type: 'favourite', title: 'Saved to Favourites', message: `"${meal.name}" added to saved meals.`, href: '/customer/saved', icon: '❤️' });
      }
    } catch (err) {
      addToast(err?.message || 'Failed to update favourite meals.', 'error');
    } finally {
      setSavingMealId(null);
    }
  }

  async function handleConfirmRegenerate() {
    setShowRegenerateConfirm(false);
    setRegenerating(true);
    await regenerate();
    setRegenerating(false);
    addNotification({ type: 'plan', title: 'Meal Plan Generated', message: 'New Nigerian recipes generated matching your profile.', href: '/customer/dashboard', icon: '⚡' });
  }

  const filteredMeals = meals.filter((m) => {
    if (filters.mealType !== 'all' && m.mealType !== filters.mealType) return false;
    if (filters.condition !== 'all' && !m.suitableFor?.includes(filters.condition)) return false;
    if (filters.budget === 'under-cap' && m.costNGN > perMealCapNGN) return false;
    if (filters.budget === 'over-cap' && m.costNGN <= perMealCapNGN) return false;
    if (filters.prepTime === 'quick' && (m.prepTimeMinutes || 45) > 30) return false;
    if (filters.prepTime === 'standard' && (m.prepTimeMinutes || 45) <= 30) return false;
    return true;
  });

  const weeklyBudget = user?.profile?.weeklyBudgetNGN || 21000;
  const conditions = user?.profile?.conditions || [];

  if (loading && meals.length === 0 && !error) {
    return (
      <AppShell pathname={ROUTES.customer.dashboard}>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell pathname={ROUTES.customer.dashboard}>
      <div className="space-y-6">
        <DashboardHero
          userName={user?.email}
          userAvatar={user?.avatar || user?.profile?.avatar}
          weeklyBudget={weeklyBudget}
          perMealCapNGN={perMealCapNGN}
          onRegenerate={() => setShowRegenerateConfirm(true)}
          regenerating={regenerating}
          loading={loading}
        />

        <ConfirmModal
          isOpen={showRegenerateConfirm}
          onClose={() => setShowRegenerateConfirm(false)}
          onConfirm={handleConfirmRegenerate}
          title="Regenerate Personalised Meal Plan?"
          message="Regenerating calls Gemini for 6 fresh Nigerian recipes tailored to your profile and counts toward your hourly request quota."
          confirmText="Yes, Regenerate"
          cancelText="Keep Current Plan"
          variant="primary"
          loading={regenerating}
          icon="⚡"
        />

        <DashboardError error={error} isAdmin={isAdmin} onRetry={refresh} />

        <DashboardMetrics
          perMealCapNGN={perMealCapNGN}
          weeklyBudget={weeklyBudget}
          mealCount={meals.length}
          meals={meals}
          fromCache={fromCache}
          conditions={conditions}
        />

        <HealthAdvisoryBanner conditions={conditions} />

        <section className="space-y-4 pt-2">
          <DashboardMealTabs
            meals={meals}
            activeMealType={filters.mealType}
            onSelectMealType={(id) => setFilters((f) => ({ ...f, mealType: id }))}
            showFilters={showFilters}
            onToggleShowFilters={() => setShowFilters((s) => !s)}
            filteredCount={filteredMeals.length}
          />

          {showFilters && (
            <FilterBar
              filters={filters}
              onChange={setFilters}
              perMealCapNGN={perMealCapNGN}
              totalCount={meals.length}
              filteredCount={filteredMeals.length}
            />
          )}

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <MealCardSkeleton key={idx} />
              ))}
            </div>
          )}

          {!loading && filteredMeals.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  perMealCapNGN={perMealCapNGN}
                  isClickable={true}
                  isSaved={savedMealIds.has(meal.id)}
                  onToggleSave={handleToggleSave}
                  isSaving={savingMealId === meal.id}
                />
              ))}
            </div>
          )}

          {!loading && filteredMeals.length === 0 && meals.length > 0 && (
            <Card className="p-8 text-center space-y-3">
              <span className="text-3xl" aria-hidden="true">🔍</span>
              <h3 className="text-base font-bold text-fg">No meals match active filters</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Try resetting your filters or switching meal periods to view available dishes.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setFilters({ mealType: 'all', condition: 'all', budget: 'all', prepTime: 'all' })}
                  className="text-xs min-h-9 px-3"
                >
                  Clear all filters
                </Button>
              </div>
            </Card>
          )}
        </section>

        <div className="pt-2">
          <Disclaimer />
        </div>
      </div>
    </AppShell>
  );
}
