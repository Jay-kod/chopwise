import { Link } from 'react-router-dom';
import { ClockIcon, Trash2Icon } from 'lucide-react';
import Button from '@/components/Button';
import { MealTypeChip, SuitableForChip } from './SafetyBadge';
import { formatNaira } from '@/lib/format';
import { ROUTES } from '@/lib/routes';

export default function SavedMealCard({ id, meal, onRemove, isRemoving = false }) {
  if (!meal) return null;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs transition-all hover:border-field-line hover:shadow-md">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2.5">
          <div className="flex items-center gap-2">
            <MealTypeChip type={meal.mealType} />
            {meal.prepTimeMinutes && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                <ClockIcon className="size-3" aria-hidden="true" />
                <span>{meal.prepTimeMinutes}m</span>
              </span>
            )}
          </div>
          <span className="text-right">
            <span className="block text-sm font-bold text-primary">{formatNaira(meal.costNGN)}</span>
            <span className="block text-[9px] text-muted">ingredient cost</span>
          </span>
        </div>

        <div>
          <h4 className="text-sm sm:text-base font-bold text-fg leading-snug">
            {meal.name}
          </h4>
          <p className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">
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

      <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
        <Link to={ROUTES.customer.meal(meal.id || id)}>
          <Button variant="secondary" className="text-xs min-h-8 px-3 shadow-2xs hover:border-field-line">
            View Recipe →
          </Button>
        </Link>

        <button
          type="button"
          onClick={() => onRemove(id)}
          disabled={isRemoving}
          className="inline-flex items-center gap-1 text-xs font-semibold text-danger-fg hover:underline cursor-pointer"
          aria-label={`Remove ${meal.name} from saved recipes`}
        >
          <Trash2Icon className="size-3.5" aria-hidden="true" />
          <span>{isRemoving ? 'Removing…' : 'Remove'}</span>
        </button>
      </div>
    </div>
  );
}
