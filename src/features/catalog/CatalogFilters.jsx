import { SearchIcon, XIcon } from 'lucide-react';

const MEAL_TYPES = [
  { id: 'all', label: 'All Dishes' },
  { id: 'breakfast', label: '🌅 Breakfast' },
  { id: 'lunch', label: '☀️ Lunch' },
  { id: 'dinner', label: '🌙 Dinner' },
];

const CONDITION_FILTERS = [
  { id: 'all', label: 'All Profiles' },
  { id: 'hypertension', label: '🫀 Low Sodium' },
  { id: 'diabetes', label: '🩸 Low GI / Diabetes' },
  { id: 'obesity', label: '⚖️ Calorie Managed' },
  { id: 'ulcer', label: '🌿 Gentle & Mild' },
];

/**
 * Filter toolbar for shared recipe catalogue.
 * @param {{ searchInput: string, onSearchChange: Function, onSearchSubmit: Function, activeType: string, onTypeChange: Function, activeCondition: string, onConditionChange: Function, loading?: boolean }} props
 */
export default function CatalogFilters({
  searchInput = '',
  onSearchChange,
  onSearchSubmit,
  activeType = 'all',
  onTypeChange,
  activeCondition = 'all',
  onConditionChange,
  loading = false,
}) {
  return (
    <div className="space-y-3.5 rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs">
      {/* Search Input Row */}
      <form onSubmit={onSearchSubmit} className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="text"
            id="catalog-search"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by dish name, local staple, or ingredient (e.g. Egusi, Yam, Catfish)…"
            maxLength={100}
            className="w-full rounded-xl border border-field-line bg-surface pl-9 pr-8 py-2 text-xs sm:text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-fg p-1 rounded-full focus:outline-none"
              title="Clear search"
            >
              <XIcon className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl border border-field-line bg-primary px-5 py-2 text-xs sm:text-sm font-semibold text-on-primary shadow-xs transition-all hover:bg-primary-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Searching…' : 'Search Catalogue'}
        </button>
      </form>

      {/* Filter Options: Meal Type & Clinical Condition */}
      <div className="flex flex-col gap-3 pt-2 border-t border-line/60 lg:flex-row lg:items-center lg:justify-between">
        {/* Meal Type Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted mr-1">Period:</span>
          {MEAL_TYPES.map((type) => {
            const active = activeType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onTypeChange(type.id)}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border shadow-2xs cursor-pointer ${
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

        {/* Condition Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted mr-1">Condition:</span>
          {CONDITION_FILTERS.map((cond) => {
            const active = activeCondition === cond.id;
            return (
              <button
                key={cond.id}
                type="button"
                onClick={() => onConditionChange(cond.id)}
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border shadow-2xs cursor-pointer ${
                  active
                    ? 'border-primary bg-primary-soft text-on-primary-soft shadow-xs'
                    : 'border-line bg-surface text-fg hover:bg-surface-muted hover:border-field-line'
                }`}
              >
                {cond.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

