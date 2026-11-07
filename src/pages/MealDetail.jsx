import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../features/auth/useAuth';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import Disclaimer from '../components/Disclaimer';
import SafetyBadge, { MealTypeChip, SuitableForChip } from '../features/meals/SafetyBadge';
import NutritionPanel from '../features/meals/NutritionPanel';
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

        let foundMeal = null;

        // 1. Check latestRecs/current
        const latestRecsRef = doc(db, 'users', user.uid, 'latestRecs', 'current');
        const latestSnap = await getDoc(latestRecsRef);
        if (latestSnap.exists()) {
          const meals = latestSnap.data()?.meals || [];
          foundMeal = meals.find((m) => m.id === mealId);
        }

        // 2. Check savedMeals/{mealId}
        const savedRef = doc(db, 'users', user.uid, 'savedMeals', mealId);
        const savedSnap = await getDoc(savedRef);

        if (savedSnap.exists()) {
          setIsSaved(true);
          if (!foundMeal) {
            foundMeal = savedSnap.data()?.meal;
          }
        } else {
          setIsSaved(false);
        }

        if (!active) return;

        if (foundMeal) {
          setMeal(foundMeal);
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
      const savedRef = doc(db, 'users', user.uid, 'savedMeals', meal.id);

      if (isSaved) {
        await deleteDoc(savedRef);
        setIsSaved(false);
        addToast(`Removed "${meal.name}" from saved recipes.`, 'ok');
      } else {
        await setDoc(savedRef, {
          meal,
          savedAt: new Date().toISOString(),
        });
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
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner label="Loading recipe details…" />
        </div>
      </Layout>
    );
  }

  if (error || !meal) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg py-12">
          <ErrorState message={error || 'Meal not found.'} />
          <div className="mt-4 text-center">
            <Link to="/dashboard">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 py-2 sm:py-4">
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
          {/* Left Column (2 spans): Ingredients breakdown & steps */}
          <div className="space-y-6 lg:col-span-2">
            {/* Ingredients & Cost Breakdown */}
            <Card className="p-5">
              <h3 className="text-base font-bold text-fg border-b border-line pb-2">
                Ingredients &amp; Cost Breakdown
              </h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs text-fg">
                  <thead>
                    <tr className="border-b border-line text-muted">
                      <th className="pb-2 font-medium">Ingredient</th>
                      <th className="pb-2 font-medium">Quantity</th>
                      <th className="pb-2 font-medium">Est. Cost</th>
                      <th className="pb-2 text-right font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {meal.ingredients?.map((ingr, idx) => (
                      <tr key={idx} className="hover:bg-surface-muted">
                        <td className="py-2.5 font-medium capitalize">{ingr.item}</td>
                        <td className="py-2.5 text-muted">
                          {ingr.quantity} {ingr.unit}
                        </td>
                        <td className="py-2.5 font-semibold text-fg">
                          {formatNaira(ingr.costNGN ?? ingr.estCostNGN)}
                        </td>
                        <td className="py-2.5 text-right text-[11px] text-muted">
                          {ingr.costSource === 'table' ? 'Market price' : 'AI estimate'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-line font-bold">
                      <td colSpan="2" className="pt-3 text-fg">
                        Total Estimated Cost
                      </td>
                      <td colSpan="2" className="pt-3 text-right text-base text-primary">
                        {formatNaira(meal.costNGN)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>

            {/* Cooking Steps */}
            <Card className="p-5">
              <h3 className="text-base font-bold text-fg border-b border-line pb-2">
                Cooking Instructions
              </h3>
              <ol className="mt-4 space-y-3 pl-4 text-xs text-fg list-decimal">
                {meal.steps?.map((step, idx) => (
                  <li key={idx} className="leading-relaxed pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </Card>
          </div>

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
    </Layout>
  );
}

