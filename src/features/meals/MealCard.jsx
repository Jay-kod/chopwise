import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { formatNaira } from '../../lib/format';
import SafetyBadge, { MealTypeChip, SuitableForChip } from './SafetyBadge';

export default function MealCard({ meal, perMealCapNGN, isClickable = true }) {
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
        {/* Header row: Meal type & Prep time */}
        <div className="flex items-center justify-between gap-2">
          <MealTypeChip type={meal.mealType} />
          {meal.prepTimeMinutes && (
            <span className="text-xs text-muted">
              ⏱ {meal.prepTimeMinutes} mins
            </span>
          )}
        </div>

        {/* Title and Cost */}
        <div className="mt-3 flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-fg leading-snug group-hover:text-primary transition-colors">
            {meal.name}
          </h3>
          <span className="shrink-0 text-base font-bold text-primary">
            {costFormatted}
          </span>
        </div>

        {/* Short description */}
        <p className="mt-1.5 text-xs text-muted line-clamp-3 leading-relaxed">
          {meal.description}
        </p>
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
        to={`/meal/${meal.id}`}
        className="block group rounded-xl transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label={`View recipe for ${meal.name}`}
      >
        <Card className="h-full flex flex-col justify-between hover:border-field-line shadow-sm hover:shadow-md transition-all">
          {cardInner}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="flex flex-col justify-between shadow-sm">
      {cardInner}
    </Card>
  );
}
