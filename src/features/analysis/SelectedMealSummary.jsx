import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, ClockIcon, CoinsIcon } from 'lucide-react';
import { MealTypeChip, SuitableForChip } from '@/features/meals/SafetyBadge';
import { formatNaira } from '@/lib/format';
import { ROUTES } from '@/lib/routes';

function getSourceStyle(source) {
  if (source === 'Current meal plan') {
    return 'border-cat-planning-line bg-cat-planning-bg text-cat-planning-fg';
  }
  if (source === 'Saved meals') {
    return 'border-cat-meals-line bg-cat-meals-bg text-cat-meals-fg';
  }
  return 'border-cat-engine-line bg-cat-engine-bg text-cat-engine-fg';
}

/**
 * Bento summary card for the currently selected meal under analysis.
 * @param {{ meal: object }} props
 */
export default function SelectedMealSummary({ meal }) {
  if (!meal) return null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-sm space-y-4">
      {/* Top Header metadata row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold ${getSourceStyle(meal.source)}`}>
            {meal.source}
          </span>
          <MealTypeChip type={meal.mealType || 'lunch'} />
          {meal.prepTimeMinutes && (
            <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-muted px-2 py-0.5 text-xs text-muted">
              <ClockIcon className="size-3" aria-hidden="true" />
              <span>{meal.prepTimeMinutes} mins</span>
            </span>
          )}
        </div>

        {meal.costNGN != null && (
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-muted px-2.5 py-1 text-xs">
            <CoinsIcon className="size-3.5 text-primary" aria-hidden="true" />
            <span className="font-bold text-fg">{formatNaira(meal.costNGN)}</span>
            <span className="text-[10px] text-muted">ingredient cost</span>
          </div>
        )}
      </div>

      {/* Main Title & Description */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
          {meal.name}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-muted leading-relaxed">
          {meal.description || 'Authentic Nigerian preparation with verified nutritional composition.'}
        </p>
      </div>

      {/* Caution Notes & Health Tips */}
      {meal.cautionNotes && (
        <div className="flex items-start gap-2 rounded-xl border border-line bg-surface-muted p-3 text-xs text-muted shadow-2xs">
          <span className="text-sm shrink-0" aria-hidden="true">💡</span>
          <div>
            <strong className="font-semibold text-fg">Health Insight: </strong>
            <span>{meal.cautionNotes}</span>
          </div>
        </div>
      )}

      {/* Condition Suitability and Action link */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {meal.suitableFor?.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-muted">Good for:</span>
            {meal.suitableFor.map((cond, idx) => (
              <SuitableForChip key={idx} condition={cond} />
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted">Standard Nigerian dietary profile</span>
        )}

        {meal.id && (
          <Link
            to={ROUTES.customer.meal(meal.id)}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover hover:underline underline-offset-4"
          >
            <span>View Full Recipe & Ingredients</span>
            <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}

