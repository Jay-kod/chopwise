import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  FlameIcon,
  HeartIcon,
} from 'lucide-react';
import { MealTypeChip, SuitableForChip } from '@/features/meals/SafetyBadge';
import { formatNaira } from '@/lib/format';
import { ROUTES } from '@/lib/routes';

/**
 * Enhanced Tactile Bento Recipe Card for Catalogue browsing.
 * @param {{ item: object, isSaved?: boolean, onToggleSave?: Function, isSaving?: boolean }} props
 */
export default function CatalogRecipeCard({
  item,
  isSaved = false,
  onToggleSave,
  isSaving = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const { recipe } = item;
  if (!recipe) return null;

  const nutrition = recipe.aiNutritionEstimate || {};

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-field-line hover:shadow-md">
      <div className="space-y-3.5">
        {/* Header row: Meal type, prep time, favourite toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MealTypeChip type={recipe.mealType || 'lunch'} />
            {recipe.prepTimeMinutes && (
              <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-muted px-2 py-0.5 text-xs text-muted">
                <ClockIcon className="size-3" aria-hidden="true" />
                <span>{recipe.prepTimeMinutes} mins</span>
              </span>
            )}
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(recipe, item.id);
              }}
              disabled={isSaving}
              aria-label={isSaved ? `Remove ${recipe.name} from favourites` : `Save ${recipe.name} to favourites`}
              title={isSaved ? 'In favourite meals' : 'Add to favourites'}
              className="inline-flex size-7 items-center justify-center rounded-full border border-line bg-surface hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 cursor-pointer"
            >
              <HeartIcon
                className={`size-3.5 transition-colors ${
                  isSaved ? 'fill-primary text-primary' : 'text-muted hover:text-primary'
                }`}
              />
            </button>
          )}
        </div>

        {/* Title and Cost */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-fg group-hover:text-primary transition-colors leading-snug">
            {recipe.name}
          </h2>
          <span className="shrink-0 text-right">
            <span className="block text-base font-extrabold text-primary">
              {formatNaira(recipe.costNGN)}
            </span>
            <span className="block text-[10px] text-muted">Estimated ingredient cost</span>
          </span>
        </div>

        {/* Short description */}
        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>

        {/* Health caution if declared */}
        {recipe.cautionNotes && (
          <div className="rounded-xl border border-warn-line bg-warn-bg p-2.5 text-xs text-warn-fg shadow-2xs">
            <strong className="font-semibold">Health Tip: </strong>
            <span>{recipe.cautionNotes}</span>
          </div>
        )}

        {/* Nutrition Estimates Mini Pill Bar */}
        {nutrition.calories != null && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-medium text-fg">
            <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-muted px-2 py-0.5">
              <FlameIcon className="size-3 text-cat-meals-dot" aria-hidden="true" />
              <span>{nutrition.calories} kcal</span>
            </span>
            {nutrition.proteinG != null && (
              <span className="rounded-md border border-line bg-surface-muted px-2 py-0.5 text-muted">
                {nutrition.proteinG}g protein
              </span>
            )}
            {nutrition.carbsG != null && (
              <span className="rounded-md border border-line bg-surface-muted px-2 py-0.5 text-muted">
                {nutrition.carbsG}g carbs
              </span>
            )}
          </div>
        )}

        {/* Suitable-for condition tags */}
        {recipe.suitableFor?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="text-[10px] font-semibold text-muted">Good for:</span>
            {recipe.suitableFor.map((cond, idx) => (
              <SuitableForChip key={idx} condition={cond} />
            ))}
          </div>
        )}

        {/* Collapsible Quick Ingredients & Preparation View */}
        {expanded && (
          <div className="space-y-3.5 border-t border-line/70 pt-3.5 text-xs animate-in fade-in-50 duration-200">
            <div>
              <h3 className="font-bold text-fg mb-1.5">Ingredients</h3>
              <ul className="list-disc pl-4 space-y-1 text-muted">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx}>
                    <span className="font-semibold text-fg">{ing.quantity} {ing.unit}</span> {ing.item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-fg mb-1.5">Preparation Steps</h3>
              <ol className="list-decimal pl-4 space-y-1.5 text-muted">
                {recipe.steps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 font-semibold text-muted hover:text-fg transition-colors cursor-pointer"
        >
          <span>{expanded ? 'Hide Recipe Steps' : 'Quick Ingredients & Steps'}</span>
          {expanded ? <ChevronUpIcon className="size-3.5" /> : <ChevronDownIcon className="size-3.5" />}
        </button>

        <Link
          to={ROUTES.customer.meal(item.id)}
          className="inline-flex items-center gap-1 font-bold text-primary hover:text-primary-hover hover:underline underline-offset-2"
        >
          <span>Full Recipe & Analysis</span>
          <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

