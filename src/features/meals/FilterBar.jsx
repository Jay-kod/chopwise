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

const PREP_TIMES = [
  { id: 'all', label: 'Any prep time' },
  { id: 'quick', label: '⚡ Quick (≤ 30 mins)' },
  { id: 'standard', label: 'Standard (> 30 mins)' },
];

/**
 * Client-side multi-dimensional filter bar for meal recommendations.
 * Combines meal type, condition tags, budget cap, and prep time (schedule-aware).
 * Follows docs/REQUIREMENTS.md (FR8), docs/UI_GUIDELINES.md, and Thesis Claims B4/B5.
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
    filters.budget !== 'all' ||
    (filters.prepTime && filters.prepTime !== 'all');

  function handleReset() {
    onChange({
      mealType: 'all',
      condition: 'all',
      budget: 'all',
      prepTime: 'all',
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-line bg-surface p-4 shadow-xs">
      {/* Top summary row: filter title & reset button */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-fg">Filter Meals</span>
          <span className="text-xs text-muted">
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Meal Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-fg">Meal Type</label>
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
          <label className="text-xs font-bold text-fg">Health Suitability</label>
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
          <label className="text-xs font-bold text-fg">
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

        {/* 4. Prep Time / Schedule-aware for workers (Thesis Claim B5) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-fg">Schedule / Prep Time</label>
          <select
            value={filters.prepTime || 'all'}
            onChange={(e) => onChange({ ...filters, prepTime: e.target.value })}
            className="w-full rounded-lg border border-field-line bg-surface px-2.5 py-1.5 text-xs text-fg focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by preparation time"
          >
            {PREP_TIMES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

