import { formatNaira, getDayOfWeekIndex } from '../../lib/format';
import {
  CapDonutMeter,
  WeeklyPacingBars,
  MealTypeDistribution,
  PACING_DAYS,
} from './DashboardMetricsWidgets';

function TargetCapTile({ perMealCapNGN, avgCost, capPercentage }) {
  return (
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
          <span className="rounded-full border border-line bg-primary-soft px-2.5 py-0.5 text-[10px] font-bold text-on-primary-soft shadow-2xs">
            Hard cap
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-fg tabular-nums">
              {perMealCapNGN > 0 ? formatNaira(perMealCapNGN) : '—'}
            </div>
            <div className="mt-0.5 text-xs font-semibold text-muted">
              ~{formatNaira(avgCost)} avg meal cost
            </div>
          </div>
          <CapDonutMeter percentage={capPercentage} avgCostFormatted={formatNaira(avgCost)} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
        <span>weekly budget / 21</span>
        <span className="rounded-md border border-line bg-surface-muted px-2 py-0.5 font-bold text-primary shadow-2xs">
          Strict cap
        </span>
      </div>
    </div>
  );
}

function WeeklyBudgetTile({ weeklyBudget, dailyBudget, todayIndex, currentDayName, todayFormattedDate }) {
  return (
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
          <span className="rounded-full border border-cat-meals-line bg-cat-meals-bg px-2.5 py-0.5 text-[10px] font-bold text-cat-meals-fg shadow-2xs">
            {currentDayName} · Active
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-fg tabular-nums">
              {formatNaira(weeklyBudget)}
            </span>
            <span className="text-xs font-bold text-cat-meals-fg">
              {formatNaira(dailyBudget)}/day
            </span>
          </div>
          <WeeklyPacingBars todayIndex={todayIndex} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
        <span>{todayFormattedDate} · Enforced in cost</span>
        <span className="rounded-md border border-line bg-surface-muted px-2 py-0.5 font-bold text-fg shadow-2xs">
          7-day pacing
        </span>
      </div>
    </div>
  );
}

function CuratedDishesTile({ effectiveCount, avgPrepTime, fromCache, breakfastCount, lunchCount, dinnerCount }) {
  return (
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
          <span className="rounded-full border border-cat-planning-line bg-cat-planning-bg px-2.5 py-0.5 text-[10px] font-bold text-cat-planning-fg shadow-2xs">
            {fromCache ? 'Saved plan' : 'Active plan'}
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-fg tabular-nums">
              {effectiveCount} Dishes
            </span>
            <span className="text-xs font-semibold text-muted">
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

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
        <span className="truncate">{fromCache ? 'Loaded from cache' : 'Generated by Gemini'}</span>
        <span className="rounded-md border border-cat-planning-line bg-cat-planning-bg px-2 py-0.5 font-bold text-cat-planning-fg shrink-0 shadow-2xs">
          3 periods
        </span>
      </div>
    </div>
  );
}

function HealthGuardrailsTile({ conditions }) {
  return (
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
          <span className="rounded-full border border-line bg-primary-soft px-2.5 py-0.5 text-[10px] font-bold text-on-primary-soft shadow-2xs">
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
                  className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-muted px-2.5 py-1 text-xs font-bold text-fg shadow-2xs"
                >
                  <span className="size-1.5 rounded-full bg-primary" />
                  {c}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-primary-soft px-2.5 py-1 text-xs font-bold text-on-primary-soft shadow-2xs">
                ✓ Standard Nigerian dietary balance
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
        <span>Safety verified</span>
        <span className="rounded-md border border-line bg-surface-muted px-2 py-0.5 font-bold text-primary shadow-2xs">
          Protected
        </span>
      </div>
    </div>
  );
}

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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <TargetCapTile perMealCapNGN={perMealCapNGN} avgCost={avgCost} capPercentage={capPercentage} />
      <WeeklyBudgetTile
        weeklyBudget={weeklyBudget}
        dailyBudget={dailyBudget}
        todayIndex={todayIndex}
        currentDayName={currentDayName}
        todayFormattedDate={todayFormattedDate}
      />
      <CuratedDishesTile
        effectiveCount={effectiveCount}
        avgPrepTime={avgPrepTime}
        fromCache={fromCache}
        breakfastCount={breakfastCount}
        lunchCount={lunchCount}
        dinnerCount={dinnerCount}
      />
      <HealthGuardrailsTile conditions={conditions} />
    </div>
  );
}
