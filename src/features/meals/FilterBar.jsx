import Button from '../../components/Button';
import { formatNaira } from '../../lib/format';

const MEAL_TYPES = [
  { id: 'all', label: 'All types' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
];

const CONDITIONS = [
  { id: 'all', label: 'All health profiles' },
  { id: 'hypertension', label: 'Hypertension safe' },
  { id: 'diabetes', label: 'Diabetes friendly' },
  { id: 'obesity', label: 'Weight management' },
  { id: 'ulcer', label: 'Ulcer soothing' },
];

/**
 * Client-side multi-dimensional filter bar for meal recommendations.
 * Combines meal type, condition tags (suitableFor), and budget range (perMealCapNGN).
 * Follows docs/REQUIREMENTS.md (FR8) and docs/UI_GUIDELINES.md.
 */
export default function FilterBar({
  filters,
  onChange,
  perMealCapNGN,
  availableConditions = [],
  totalCount,
  filteredCount,
}) {
  const isFiltered =
    filters.mealType !== 'all' ||
    filters.condition !== 'all' ||
    filters.budget !== 'all';

  function handleReset() {
    onChange({
      mealType: 'all',
      condition: 'all',
      budget: 'all',
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
      {/* Top summary row: filter title & reset button */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-fg">Filter Meals</span>
          <span className="text-[11px] text-muted">
            Showing {filteredCount} of {totalCount}
          </span>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-medium text-primary underline hover:text-primary-hover focus:outline-none"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Filter sections */}
      <div className="grid gap-3 sm:grid-cols-3">
        {/* 1. Meal Type */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted">Meal Type</label>
          <div className="flex flex-wrap gap-1">
            {MEAL_TYPES.map((type) => {
              const active = filters.mealType === type.id;
              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => onChange({ ...filters, mealType: type.id })}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors border ${
                    active
                      ? 'border-field-line bg-primary text-on-primary'
                      : 'border-line bg-surface text-fg hover:bg-surface-muted'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Suitable For Condition */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted">Health Suitability</label>
          <select
            value={filters.condition}
            onChange={(e) => onChange({ ...filters, condition: e.target.value })}
            className="w-full rounded-lg border border-field-line bg-surface px-2.5 py-1.5 text-xs text-fg focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by health condition"
          >
            {CONDITIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Budget Range */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted">
            Budget Cap ({perMealCapNGN > 0 ? `Target ${formatNaira(perMealCapNGN)}` : 'Target'})
          </label>
          <select
            value={filters.budget}
            onChange={(e) => onChange({ ...filters, budget: e.target.value })}
            className="w-full rounded-lg border border-field-line bg-surface px-2.5 py-1.5 text-xs text-fg focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by budget range"
          >
            <option value="all">All meal costs</option>
            <option value="under-cap">
              Within budget (≤ {formatNaira(perMealCapNGN)})
            </option>
            <option value="over-cap">Over target only</option>
          </select>
        </div>
      </div>
    </div>
  );
}
