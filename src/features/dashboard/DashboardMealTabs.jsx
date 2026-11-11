import Button from '../../components/Button';

export default function DashboardMealTabs({
  meals = [],
  activeMealType = 'all',
  onSelectMealType,
  showFilters = false,
  onToggleShowFilters,
  filteredCount = 0,
}) {
  const tabs = [
    { id: 'all', label: 'All Dishes', count: meals.length },
    { id: 'breakfast', label: '🌅 Breakfast', count: meals.filter((m) => m.mealType === 'breakfast').length },
    { id: 'lunch', label: '☀️ Lunch', count: meals.filter((m) => m.mealType === 'lunch').length },
    { id: 'dinner', label: '🌙 Dinner', count: meals.filter((m) => m.mealType === 'dinner').length },
  ];

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-fg">
              Curated Nigerian Meals
            </h2>
            <span className="rounded-full bg-surface-muted border border-line px-2 py-0.5 text-[11px] font-semibold text-muted">
              {filteredCount} shown
            </span>
          </div>
          <p className="text-xs text-muted">
            Nutrient-balanced recipes made with authentic ingredients from Nigerian markets.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={onToggleShowFilters}
          className="text-xs min-h-8 px-3 shrink-0"
        >
          {showFilters ? 'Hide Filters ▲' : 'Filter Dishes ▼'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const active = activeMealType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectMealType(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center gap-1.5 border shadow-2xs ${
                active
                  ? 'border-field-line bg-primary text-on-primary shadow-xs'
                  : 'border-line bg-surface text-fg hover:bg-surface-muted hover:border-field-line'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  active ? 'bg-primary-hover text-on-primary' : 'bg-surface-muted text-muted'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
