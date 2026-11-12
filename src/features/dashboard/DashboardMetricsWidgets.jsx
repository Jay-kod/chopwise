import { formatNaira } from '../../lib/format';

export const PACING_DAYS = [
  { day: 'M', name: 'Mon', fullName: 'Monday', heightPct: 75 },
  { day: 'T', name: 'Tue', fullName: 'Tuesday', heightPct: 85 },
  { day: 'W', name: 'Wed', fullName: 'Wednesday', heightPct: 70 },
  { day: 'T', name: 'Thu', fullName: 'Thursday', heightPct: 90 },
  { day: 'F', name: 'Fri', fullName: 'Friday', heightPct: 100 },
  { day: 'S', name: 'Sat', fullName: 'Saturday', heightPct: 80 },
  { day: 'S', name: 'Sun', fullName: 'Sunday', heightPct: 75 },
];

/**
 * High-contrast Donut ring progress meter indicating budget cap efficiency.
 * @param {{ percentage?: number, avgCostFormatted?: string }} props
 */
export function CapDonutMeter({ percentage = 92, avgCostFormatted = '' }) {
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
          className="stroke-line"
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
        <span className="text-xs font-black text-fg tabular-nums leading-none">
          {clamped}%
        </span>
        <span className="text-[9px] font-bold text-muted leading-none mt-0.5">
          cap
        </span>
      </div>
    </div>
  );
}

/**
 * 7-day mini bar histogram dynamically tracking real-time daily allocation.
 * @param {{ todayIndex?: number }} props
 */
export function WeeklyPacingBars({ todayIndex = 0 }) {
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
            <div className="flex h-8 w-full items-end rounded-t-sm bg-surface-muted border border-line">
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${
                  isToday ? 'bg-cat-meals-dot' : 'bg-primary'
                }`}
                style={{ height: `${item.heightPct}%` }}
              />
            </div>
            <div className="flex flex-col items-center">
              <span
                className={`text-[10px] leading-none ${
                  isToday ? 'font-black text-cat-meals-fg' : 'font-bold text-fg'
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
 * Segmented distribution bar showing meal counts by type with thematic chips.
 * @param {{ breakfast?: number, lunch?: number, dinner?: number, total?: number }} props
 */
export function MealTypeDistribution({ breakfast = 0, lunch = 0, dinner = 0, total = 0 }) {
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
      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-bold">
        <span className="inline-flex items-center gap-1 rounded-md border border-cat-meals-line bg-cat-meals-bg px-1.5 py-0.5 text-cat-meals-fg shadow-2xs">
          <span className="size-1.5 rounded-full bg-cat-meals-dot" />
          {breakfast} Brkfst
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-cat-planning-line bg-cat-planning-bg px-1.5 py-0.5 text-cat-planning-fg shadow-2xs">
          <span className="size-1.5 rounded-full bg-cat-planning-dot" />
          {lunch} Lunch
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-cat-engine-line bg-cat-engine-bg px-1.5 py-0.5 text-cat-engine-fg shadow-2xs">
          <span className="size-1.5 rounded-full bg-cat-engine-dot" />
          {dinner} Dinner
        </span>
      </div>
    </div>
  );
}
