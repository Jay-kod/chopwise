import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../features/auth/useAuth';
import { AppShell } from '@/components/app-shell';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import Disclaimer from '../components/Disclaimer';
import SafetyBadge, { MealTypeChip, SuitableForChip } from '../features/meals/SafetyBadge';
import NutritionPanel from '../features/meals/NutritionPanel';
import MealIngredientsAndSteps from '../features/meals/MealIngredientsAndSteps';
import { formatNaira } from '../lib/format';
import { useToast } from '../components/Toast';

export default function MealDetail() {
  const { id: mealId } = useParams();
  const { user } = useAuth();
  const addToast = useToast();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingAction, setSavingAction] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadMeal() {
      if (!user || !mealId) return;

      try {
        setLoading(true);
        setError(null);
        const res = await apiClient('/api/auth', { action: 'get-meal', mealId });

        if (!active) return;

        if (res?.meal) {
          setMeal(res.meal);
          setIsSaved(Boolean(res.isSaved));
        } else {
          setError('Meal not found. It may have been regenerated or removed.');
        }
      } catch (err) {
        if (active) {
          setError(err?.message || 'Failed to load meal details.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMeal();

    return () => {
      active = false;
    };
  }, [user, mealId]);

  async function handleToggleSave() {
    if (!user || !meal) return;

    try {
      setSavingAction(true);
      if (isSaved) {
        await apiClient('/api/auth', { action: 'delete-saved-meal', mealId: meal.id });
        setIsSaved(false);
        addToast(`Removed "${meal.name}" from saved recipes.`, 'ok');
      } else {
        await apiClient('/api/auth', { action: 'save-meal', meal });
        setIsSaved(true);
        addToast(`Saved "${meal.name}" to your profile!`, 'ok');
      }
    } catch (err) {
      addToast(err?.message || 'Failed to update saved recipe.', 'error');
    } finally {
      setSavingAction(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner label="Loading recipe details…" />
        </div>
      </AppShell>
    );
  }

  if (error || !meal) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg py-12">
          <ErrorState message={error || 'Meal not found.'} />
          <div className="mt-4 text-center">
            <Link to="/dashboard">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation back bar */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline hover:text-primary-hover"
          >
            ← Back to Meal Plan
          </Link>

          <Button
            variant={isSaved ? 'secondary' : 'primary'}
            onClick={handleToggleSave}
            disabled={savingAction}
            className="text-xs min-h-9 px-3.5"
          >
            {savingAction ? (
              <Spinner label="Updating…" />
            ) : isSaved ? (
              '★ Saved Recipe'
            ) : (
              '☆ Save Recipe'
            )}
          </Button>
        </div>

        {/* Title, Cost and Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <MealTypeChip type={meal.mealType} />
            {meal.prepTimeMinutes && (
              <span className="text-xs text-muted">
                ⏱ {meal.prepTimeMinutes} mins
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
              {meal.name}
            </h1>
            <div className="shrink-0">
              <span className="text-2xl font-extrabold text-primary">
                {formatNaira(meal.costNGN)}
              </span>
              <span className="ml-1 text-xs text-muted">total estimate</span>
            </div>
          </div>

          <p className="text-sm text-muted leading-relaxed">
            {meal.description}
          </p>

          {/* Condition and Caution Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {meal.safetyFlags?.map((flag, idx) => (
              <SafetyBadge key={idx} flag={flag} />
            ))}
            {meal.suitableFor?.map((cond, idx) => (
              <SuitableForChip key={idx} condition={cond} />
            ))}
          </div>
        </div>

        {/* Caution Notes (if present) */}
        {meal.cautionNotes && (
          <div className="rounded-xl border border-line bg-surface-muted p-4 text-xs text-fg">
            <span className="font-semibold text-fg">Preparation note: </span>
            <span className="text-muted">{meal.cautionNotes}</span>
          </div>
        )}

        {/* Main Content Grid: Ingredients & Steps vs Nutrition Panel */}
        <div className="grid gap-6 lg:grid-cols-3">
          <MealIngredientsAndSteps meal={meal} />

          {/* Right Column: Nutrition Panel */}
          <div className="space-y-6">
            <NutritionPanel mealId={meal.id} />
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <div className="pt-2">
          <Disclaimer />
        </div>
      </div>
    </AppShell>
  );
}

