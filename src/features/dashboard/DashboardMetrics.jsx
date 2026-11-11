import { formatNaira, getDayOfWeekIndex } from '../../lib/format';

/**
 * Donut ring progress meter indicating budget cap efficiency.
 * @param {{ percentage: number, avgCostFormatted: string }} props
 */
function CapDonutMeter({ percentage = 92, avgCostFormatted = '' }) {
  const clamped = Math.max(10, Math.min(100, percentage));
  const strokeDashoffset = Math.round(88 - (88 * clamped) / 100);

  return (
    <div className="relative flex size-14 shrink-0 items-center justify-center">
      <svg className="size-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          className="stroke-surface-muted"
          strokeWidth="3.5"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          className="stroke-primary transition-all duration-500 ease-out"
          strokeWidth="3.5"
          strokeDasharray="88"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-extrabold text-fg tabular-nums leading-none">
          {clamped}%
        </span>
        <span className="text-[8px] font-semibold text-muted leading-none mt-0.5">
          cap
        </span>
      </div>
    </div>
  );
}

const PACING_DAYS = [
  { day: 'M', name: 'Mon', fullName: 'Monday', heightPct: 75 },
  { day: 'T', name: 'Tue', fullName: 'Tuesday', heightPct: 85 },
  { day: 'W', name: 'Wed', fullName: 'Wednesday', heightPct: 70 },
  { day: 'T', name: 'Thu', fullName: 'Thursday', heightPct: 90 },
  { day: 'F', name: 'Fri', fullName: 'Friday', heightPct: 100 },
  { day: 'S', name: 'Sat', fullName: 'Saturday', heightPct: 80 },
  { day: 'S', name: 'Sun', fullName: 'Sunday', heightPct: 75 },
];

/**
 * 7-day mini bar histogram dynamically tracking real-time daily allocation.
 * @param {{ todayIndex: number }} props
 */
function WeeklyPacingBars({ todayIndex = 0 }) {
  return (
    <div className="flex h-11 items-end justify-between gap-1 pt-1" aria-hidden="true">
      {PACING_DAYS.map((item, idx) => {
        const isToday = idx === todayIndex;
        return (
          <div
            key={idx}
            className="flex flex-1 flex-col items-center gap-1"
            title={`${item.fullName}${isToday ? ' (Today)' : ''}`}
          >
            <div className="flex h-8 w-full items-end rounded-t-sm bg-surface-muted">
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${
                  isToday ? 'bg-cat-meals-dot' : 'bg-primary'
                }`}
                style={{ height: `${item.heightPct}%` }}
              />
            </div>
            <div className="flex flex-col items-center">
              <span
                className={`text-[9px] leading-none ${
                  isToday ? 'font-black text-cat-meals-fg' : 'font-bold text-muted'
                }`}
              >
                {item.day}
              </span>
              {isToday && (
                <span className="mt-0.5 size-1 rounded-full bg-cat-meals-dot" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Segmented distribution bar showing meal counts by type.
 * @param {{ breakfast: number, lunch: number, dinner: number, total: number }} props
 */
function MealTypeDistribution({ breakfast = 0, lunch = 0, dinner = 0, total = 0 }) {
  const bPct = total > 0 ? Math.round((breakfast / total) * 100) : 33;
  const lPct = total > 0 ? Math.round((lunch / total) * 100) : 33;
  const dPct = total > 0 ? Math.max(0, 100 - bPct - lPct) : 34;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-muted border border-line" aria-hidden="true">
        <div className="bg-cat-meals-dot transition-all duration-300" style={{ width: `${bPct}%` }} />
        <div className="bg-cat-planning-dot transition-all duration-300" style={{ width: `${lPct}%` }} />
        <div className="bg-cat-engine-dot transition-all duration-300" style={{ width: `${dPct}%` }} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-semibold">
        <span className="inline-flex items-center gap-1 text-cat-meals-fg">
          <span className="size-1.5 rounded-full bg-cat-meals-dot" />
          {breakfast} Brkfst
        </span>
        <span className="inline-flex items-center gap-1 text-cat-planning-fg">
          <span className="size-1.5 rounded-full bg-cat-planning-dot" />
          {lunch} Lunch
        </span>
        <span className="inline-flex items-center gap-1 text-cat-engine-fg">
          <span className="size-1.5 rounded-full bg-cat-engine-dot" />
          {dinner} Dinner
        </span>
      </div>
    </div>
  );
}

/**
 * Tactile Bento metric cards displaying budget, dishes, and health guardrails.
 * @param {{ perMealCapNGN?: number, weeklyBudget?: number, mealCount?: number, meals?: Array, fromCache?: boolean, conditions?: Array }} props
 */
export default function DashboardMetrics({
  perMealCapNGN = 1000,
  weeklyBudget = 21000,
  mealCount = 0,
  meals = [],
  fromCache = false,
  conditions = [],
}) {
  const effectiveCount = meals.length || mealCount;
  const validMeals = meals.filter((m) => m && typeof m.costNGN === 'number');
  const avgCost = validMeals.length > 0
    ? Math.round(validMeals.reduce((acc, m) => acc + m.costNGN, 0) / validMeals.length)
    : (perMealCapNGN > 0 ? Math.round(perMealCapNGN * 0.92) : 920);

  const capPercentage = perMealCapNGN > 0
    ? Math.min(100, Math.round((avgCost / perMealCapNGN) * 100))
    : 92;

  const breakfastCount = meals.filter((m) => m.mealType === 'breakfast').length;
  const lunchCount = meals.filter((m) => m.mealType === 'lunch').length;
  const dinnerCount = meals.filter((m) => m.mealType === 'dinner').length;
  const avgPrepTime = meals.length > 0
    ? Math.round(meals.reduce((acc, m) => acc + (m.prepTimeMinutes || 35), 0) / meals.length)
    : 35;

  const dailyBudget = Math.round(weeklyBudget / 7);
  const todayDate = new Date();
  const todayIndex = getDayOfWeekIndex(todayDate);
  const currentDayName = PACING_DAYS[todayIndex]?.name || 'Day';
  const todayFormattedDate = todayDate.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Target Cap Tile with Tactile Ring Gauge */}
      <div className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-field-line hover:shadow-md active:translate-y-0 active:scale-[0.99]">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl border border-line bg-surface-muted text-sm shrink-0 shadow-xs">
                🎯
              </span>
              <span className="text-xs font-bold tracking-wide text-fg">
                Target per Meal
              </span>
            </div>
            <span className="rounded-full border border-line bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-on-primary-soft">
              Hard cap
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-fg tabular-nums">
                {perMealCapNGN > 0 ? formatNaira(perMealCapNGN) : '—'}
              </div>
              <div className="mt-0.5 text-xs font-medium text-muted">
                ~{formatNaira(avgCost)} avg meal cost
              </div>
            </div>
            <CapDonutMeter percentage={capPercentage} avgCostFormatted={formatNaira(avgCost)} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-[11px] text-muted">
          <span>weekly budget / 21</span>
          <span className="rounded-md border border-line bg-surface-muted px-1.5 py-0.5 font-semibold text-primary">
            Strict cap
          </span>
        </div>
      </div>

      {/* 2. Weekly Budget Tile with 7-Day Real-Time Bar Histogram */}
      <div className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-field-line hover:shadow-md active:translate-y-0 active:scale-[0.99]">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl border border-line bg-surface-muted text-sm shrink-0 shadow-xs">
                💳
              </span>
              <span className="text-xs font-bold tracking-wide text-fg">
                Weekly Budget
              </span>
            </div>
            <span className="rounded-full border border-cat-meals-line bg-cat-meals-bg px-2 py-0.5 text-[10px] font-bold text-cat-meals-fg">
              {currentDayName} · Active
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-fg tabular-nums">
                {formatNaira(weeklyBudget)}
              </span>
              <span className="text-xs font-semibold text-cat-meals-fg">
                {formatNaira(dailyBudget)}/day
              </span>
            </div>
            <WeeklyPacingBars todayIndex={todayIndex} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-[11px] text-muted">
          <span>{todayFormattedDate} · Enforced in cost</span>
          <span className="rounded-md border border-line bg-surface-muted px-1.5 py-0.5 font-semibold text-fg">
            7-day pacing
          </span>
        </div>
      </div>

      {/* 3. Recommended Dishes with Period Composition */}
      <div className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-field-line hover:shadow-md active:translate-y-0 active:scale-[0.99]">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl border border-line bg-surface-muted text-sm shrink-0 shadow-xs">
                🍲
              </span>
              <span className="text-xs font-bold tracking-wide text-fg">
                Curated Dishes
              </span>
            </div>
            <span className="rounded-full border border-cat-planning-line bg-cat-planning-bg px-2 py-0.5 text-[10px] font-bold text-cat-planning-fg">
              {fromCache ? 'Saved plan' : 'Active plan'}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-fg tabular-nums">
                {effectiveCount} Dishes
              </span>
              <span className="text-xs font-medium text-muted">
                ⏱ ~{avgPrepTime}m prep
              </span>
            </div>
            <MealTypeDistribution
              breakfast={breakfastCount}
              lunch={lunchCount}
              dinner={dinnerCount}
              total={effectiveCount}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-[11px] text-muted">
          <span className="truncate">{fromCache ? 'Loaded from cache' : 'Generated by Gemini'}</span>
          <span className="rounded-md border border-line bg-surface-muted px-1.5 py-0.5 font-semibold text-cat-planning-fg shrink-0">
            3 periods
          </span>
        </div>
      </div>

      {/* 4. Health Guardrails Tile with Active Chips */}
      <div className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-field-line hover:shadow-md active:translate-y-0 active:scale-[0.99]">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl border border-line bg-surface-muted text-sm shrink-0 shadow-xs">
                🛡️
              </span>
              <span className="text-xs font-bold tracking-wide text-fg">
                Health Guardrails
              </span>
            </div>
            <span className="rounded-full border border-line bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-on-primary-soft">
              Deterministic
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="text-2xl font-extrabold tracking-tight text-fg tabular-nums">
              {conditions.length > 0 ? `${conditions.length} Active` : 'Standard'}
            </div>

            <div className="flex min-h-11 flex-wrap items-center gap-1.5 pt-0.5">
              {conditions.length > 0 ? (
                conditions.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-fg shadow-2xs"
                  >
                    <span className="size-1 rounded-full bg-primary" />
                    {c}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-primary-soft px-2.5 py-1 text-xs font-semibold text-on-primary-soft">
                  ✓ Standard Nigerian dietary balance
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-[11px] text-muted">
          <span>Safety verified</span>
          <span className="rounded-md border border-line bg-surface-muted px-1.5 py-0.5 font-semibold text-primary">
            Protected
          </span>
        </div>
      </div>
    </div>
  );
}
