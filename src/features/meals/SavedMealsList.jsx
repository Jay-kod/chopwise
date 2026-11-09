import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import { MealTypeChip, SuitableForChip } from './SafetyBadge';
import { formatNaira } from '../../lib/format';
import { ROUTES } from '../../lib/routes';

/**
 * Displays a user's saved recipes with quick navigation and deletion.
 * Follows docs/REQUIREMENTS.md (FR10) and docs/UI_GUIDELINES.md.
 */
export default function SavedMealsList({
  savedMeals = [],
  loading = false,
  onRemove,
  removingId = null,
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner label="Loading saved recipes…" />
      </div>
    );
  }

  if (savedMeals.length === 0) {
    return (
      <EmptyState
        title="No saved recipes yet"
        description="Explore your meal recommendations and click Save Recipe on any meal to keep it here for quick access."
        action={
          <Link to={ROUTES.customer.dashboard}>
            <Button className="text-xs min-h-9 px-4">Browse Meals</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted">
        {savedMeals.length} saved {savedMeals.length === 1 ? 'recipe' : 'recipes'}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {savedMeals.map(({ id, meal, savedAt }) => (
          <Card
            key={id}
            className="flex flex-col justify-between p-4 shadow-sm hover:border-field-line transition-all"
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
                onClick={() => onRemove(id)}
                disabled={removingId === id}
                className="text-xs text-muted hover:text-fg underline focus:outline-none"
                aria-label={`Remove ${meal.name} from saved recipes`}
              >
                {removingId === id ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
