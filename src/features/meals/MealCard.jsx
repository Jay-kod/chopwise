import { Link } from 'react-router-dom';
import { HeartIcon } from 'lucide-react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { formatNaira } from '../../lib/format';
import SafetyBadge, { MealTypeChip, SuitableForChip } from './SafetyBadge';
import { ROUTES } from '../../lib/routes';

export default function MealCard({
  meal,
  perMealCapNGN,
  isClickable = true,
  isSaved = false,
  onToggleSave,
  isSaving = false,
}) {
  if (!meal) return null;

  const costFormatted = formatNaira(meal.costNGN);
  const costSourceLabels = {
    table: 'Market price',
    mixed: 'Mixed pricing',
    ai: 'AI cost estimate',
  };

  const cardInner = (
    <div className="flex h-full flex-col justify-between space-y-4">
      <div>
        {/* Header row: Meal type, Prep time & Favourite button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MealTypeChip type={meal.mealType} />
            {meal.prepTimeMinutes && (
              <span className="text-xs text-muted">
                ⏱ {meal.prepTimeMinutes} mins
              </span>
            )}
          </div>
          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(meal, e);
              }}
              disabled={isSaving}
              aria-label={isSaved ? `Remove ${meal.name} from favourites` : `Save ${meal.name} to favourites`}
              title={isSaved ? 'In favourite meals' : 'Add to favourite meals'}
              className="inline-flex size-7 items-center justify-center rounded-full border border-line bg-surface hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
            >
              <HeartIcon
                className={`size-3.5 transition-colors ${
                  isSaved
                    ? 'fill-primary text-primary'
                    : 'text-muted hover:text-primary'
                }`}
              />
            </button>
          )}
        </div>

        {/* Title and Cost */}
        <div className="mt-3 flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-fg leading-snug group-hover:text-primary transition-colors">
            {meal.name}
          </h3>
          <span className="shrink-0 text-right">
            <span className="block text-base font-bold text-primary">{costFormatted}</span>
            <span className="block text-[10px] font-normal text-muted">Estimated ingredient cost</span>
          </span>
        </div>

        {/* Short description */}
        <p className="mt-1.5 text-xs text-muted line-clamp-3 leading-relaxed">
          {meal.description}
        </p>

        {/* Health Recommendation Tip (Thesis Claim B4) */}
        {meal.cautionNotes && (
          <div className="mt-2.5 flex items-start gap-1.5 rounded-lg border border-line bg-surface-muted px-2.5 py-1.5 text-[11px] text-muted">
            <span className="shrink-0 text-xs" aria-hidden="true">💡</span>
            <span className="line-clamp-2">
              <span className="font-semibold text-fg">Health Tip: </span>
              {meal.cautionNotes}
            </span>
          </div>
        )}
      </div>

      {/* Badges & Tags */}
      <div className="space-y-2 border-t border-line pt-3">
        {/* Over budget & Cost source */}
        <div className="flex flex-wrap items-center gap-1.5">
          {meal.overBudget && (
            <Badge variant="warning">
              Over budget (&gt; {formatNaira(perMealCapNGN)})
            </Badge>
          )}

          <span className="inline-flex items-center rounded-md border border-line bg-surface-muted px-2 py-0.5 text-[11px] text-muted">
            {costSourceLabels[meal.costSource] || 'Estimated'}
          </span>
        </div>

        {/* Health safety warning flags */}
        {meal.safetyFlags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {meal.safetyFlags.map((flag, idx) => (
              <SafetyBadge key={idx} flag={flag} />
            ))}
          </div>
        )}

        {/* Suitable for condition tags */}
        {meal.suitableFor?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="text-[10px] text-muted">Good for:</span>
            {meal.suitableFor.map((cond, idx) => (
              <SuitableForChip key={idx} condition={cond} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isClickable && meal.id) {
    return (
      <Link
        to={ROUTES.customer.meal(meal.id)}
        className="block group rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label={`View recipe for ${meal.name}`}
      >
        <Card className="h-full flex flex-col justify-between rounded-2xl hover:border-field-line shadow-xs hover:shadow-md transition-all duration-200">
          {cardInner}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="flex flex-col justify-between rounded-2xl shadow-xs">
      {cardInner}
    </Card>
  );
}
