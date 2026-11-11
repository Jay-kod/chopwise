import { useMemo, useState } from 'react';
import { SearchIcon, UtensilsIcon } from 'lucide-react';
import Select from '@/components/Select';
import { formatNaira } from '@/lib/format';

const TABS = [
  { id: 'all', label: 'All Dishes' },
  { id: 'Current meal plan', label: '⚡ Current Plan' },
  { id: 'Saved meals', label: '❤️ Favourites' },
  { id: 'Recipe catalogue', label: '📖 Catalogue' },
];

function getSourceBadge(source) {
  if (source === 'Current meal plan') {
    return 'border-cat-planning-line bg-cat-planning-bg text-cat-planning-fg';
  }
  if (source === 'Saved meals') {
    return 'border-cat-meals-line bg-cat-meals-bg text-cat-meals-fg';
  }
  return 'border-cat-engine-line bg-cat-engine-bg text-cat-engine-fg';
}

function getMealIcon(mealType) {
  if (mealType === 'breakfast') return '🌅';
  if (mealType === 'lunch') return '☀️';
  if (mealType === 'dinner') return '🌙';
  return '🍲';
}

/**
 * Visual Bento Meal Selector with source tabs and instant search.
 * @param {{ meals: Array, selectedKey: string, onSelectKey: Function }} props
 */
export default function MealSelectorTabs({
  meals = [],
  selectedKey = '',
  onSelectKey,
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      if (activeTab !== 'all' && meal.source !== activeTab) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = meal.name?.toLowerCase().includes(query);
        const matchesDesc = meal.description?.toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }
      return true;
    });
  }, [meals, activeTab, searchQuery]);

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs">
      {/* Top row: Source Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {TABS.map((tab) => {
            const count = tab.id === 'all'
              ? meals.length
              : meals.filter((m) => m.source === tab.id).length;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center gap-1.5 border shadow-2xs ${
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
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px] sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish name…"
            className="w-full rounded-xl border border-field-line bg-surface pl-8 pr-3 py-1.5 text-xs text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Visual Tactile Meal Card Grid */}
      {filteredMeals.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-h-[290px] overflow-y-auto pr-1">
          {filteredMeals.map((meal, index) => {
            const mealKey = `${meal.source}:${meal.id}`;
            const isSelected = mealKey === selectedKey;
            return (
              <button
                key={`${mealKey}-${index}`}
                type="button"
                onClick={() => onSelectKey(mealKey)}
                className={`group flex flex-col justify-between rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'border-primary bg-primary-soft text-fg ring-2 ring-primary/40 shadow-xs'
                    : 'border-line bg-surface hover:bg-surface-muted hover:border-field-line'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-sm shrink-0" aria-hidden="true">
                      {getMealIcon(meal.mealType)}
                    </span>
                    <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase truncate ${getSourceBadge(meal.source)}`}>
                      {meal.source.replace('meals', '').replace('Recipe', '').trim()}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-xs font-bold text-fg line-clamp-1 group-hover:text-primary transition-colors">
                    {meal.name || 'Untitled meal'}
                  </h3>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-line/50 pt-1.5 text-[10px] text-muted">
                  <span className="font-semibold text-fg">
                    {meal.costNGN ? formatNaira(meal.costNGN) : 'Estimated'}
                  </span>
                  <span className={isSelected ? 'font-bold text-primary' : 'text-muted'}>
                    {isSelected ? '✓ Selected' : 'Analyze →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-muted">
          No meals match your active search and filter criteria.
        </div>
      )}

      {/* Fallback accessible select dropdown */}
      <div className="pt-2 border-t border-line/60">
        <Select
          id="accessible-meal-select"
          label="Quick dropdown selector"
          value={selectedKey}
          onChange={(e) => onSelectKey(e.target.value)}
        >
          {meals.map((meal, index) => (
            <option key={`select-${meal.source}-${meal.id}-${index}`} value={`${meal.source}:${meal.id}`}>
              {meal.name || 'Untitled meal'} — {meal.source}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

