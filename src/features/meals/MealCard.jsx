import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { formatNaira } from '../../lib/format';
import SafetyBadge, { MealTypeChip, SuitableForChip } from './SafetyBadge';

export default function MealCard({ meal, perMealCapNGN, isClickable = false }) {
  if (!meal) return null;

  const costFormatted = formatNaira(meal.costNGN);
  const costSourceLabels = {
    table: 'Market price',
    mixed: 'Mixed pricing',
    ai: 'AI cost estimate',
  };

  const content = (
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
          <h3 className="text-base font-bold text-fg leading-snug">
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

  return (
    <Card className="flex flex-col justify-between transition-shadow hover:shadow-md">
      {content}
    </Card>
  );
}
