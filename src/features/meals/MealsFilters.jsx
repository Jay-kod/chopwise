import { SearchIcon, XIcon } from 'lucide-react';
import Select from '@/components/Select';

const MEAL_TYPES = [
  { id: 'all', label: 'All Dishes' },
  { id: 'breakfast', label: '🌅 Breakfast' },
  { id: 'lunch', label: '☀️ Lunch' },
  { id: 'dinner', label: '🌙 Dinner' },
];

const CONDITIONS = [
  { id: 'all', label: 'All Profiles' },
  { id: 'hypertension', label: 'Low Sodium' },
  { id: 'diabetes', label: 'Low GI / Diabetes' },
  { id: 'obesity', label: 'Calorie Managed' },
  { id: 'ulcer', label: 'Gentle & Mild' },
];

export default function MealsFilters({
  search,
  onSearchChange,
  mealType,
  onMealTypeChange,
  condition,
  onConditionChange,
  prepTime,
  onPrepTimeChange,
  totalCount = 0,
  filteredCount = 0,
  onReset,
}) {
  const isFiltered = search || mealType !== 'all' || condition !== 'all' || prepTime !== 'all';

  return (
    <div className="space-y-3.5 rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="meals-search"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search meals by title, description, or ingredient…"
            className="w-full rounded-xl border border-field-line bg-surface pl-8 pr-8 py-2 text-xs text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-fg p-0.5"
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select
              id="filter-prep-time"
              value={prepTime}
              onChange={(e) => onPrepTimeChange(e.target.value)}
              aria-label="Filter by preparation time"
              className="text-xs"
            >
              <option value="all">Any prep time</option>
              <option value="quick">⚡ Quick (≤ 30m)</option>
              <option value="standard">Standard (&gt; 30m)</option>
            </Select>
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold text-primary hover:text-primary-hover underline underline-offset-2 shrink-0 px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {MEAL_TYPES.map((type) => {
            const active = mealType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onMealTypeChange(type.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border shadow-2xs ${
                  active
                    ? 'border-field-line bg-primary text-on-primary shadow-xs'
                    : 'border-line bg-surface text-fg hover:bg-surface-muted hover:border-field-line'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-muted mr-1">Condition:</span>
          {CONDITIONS.map((cond) => {
            const active = condition === cond.id;
            return (
              <button
                key={cond.id}
                type="button"
                onClick={() => onConditionChange(cond.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all border ${
                  active
                    ? 'border-field-line bg-primary-soft text-on-primary-soft shadow-2xs'
                    : 'border-line bg-surface-muted/60 text-muted hover:border-field-line hover:text-fg'
                }`}
              >
                {cond.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted pt-1">
        <span>
          Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> approved recipes
        </span>
      </div>
    </div>
  );
}
