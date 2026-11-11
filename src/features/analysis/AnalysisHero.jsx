import { Link } from 'react-router-dom';
import { ActivityIcon, ArrowLeftIcon, BookOpenIcon } from 'lucide-react';
import Button from '@/components/Button';
import LiveClock from '@/components/LiveClock';
import { ROUTES } from '@/lib/routes';

/**
 * Hero header for the Meal Analysis page.
 * @param {{ totalCount: number, planCount: number, savedCount: number, catalogueCount: number }} props
 */
export default function AnalysisHero({
  totalCount = 0,
  planCount = 0,
  savedCount = 0,
  catalogueCount = 0,
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left column: Title & Description */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-primary shadow-2xs">
              <ActivityIcon className="size-3.5" aria-hidden="true" />
              <span>Planning & Insights · Nutritional Telemetry</span>
            </span>
            <LiveClock className="text-[11px] py-0.5 px-2.5" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
              Meal Analysis & Nutrition Verification
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed max-w-2xl">
              Inspect macro and micronutrient composition, verify USDA FoodData Central records, audit medical suitability, and generate generative AI dietary evaluations.
            </p>
          </div>

          {/* Quick telemetry badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="rounded-xl border border-line bg-surface-muted px-2.5 py-1 text-fg font-medium shadow-2xs">
              🍲 {totalCount} Dishes Indexed
            </span>
            <span className="rounded-xl border border-cat-planning-line bg-cat-planning-bg px-2.5 py-1 text-cat-planning-fg font-medium shadow-2xs">
              ⚡ {planCount} Current Plan
            </span>
            <span className="rounded-xl border border-cat-meals-line bg-cat-meals-bg px-2.5 py-1 text-cat-meals-fg font-medium shadow-2xs">
              ❤️ {savedCount} Saved
            </span>
            <span className="rounded-xl border border-cat-engine-line bg-cat-engine-bg px-2.5 py-1 text-cat-engine-fg font-medium shadow-2xs">
              📖 {catalogueCount} Catalogue
            </span>
          </div>
        </div>

        {/* Right column: Navigation actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          <Link to={ROUTES.customer.dashboard}>
            <Button
              variant="secondary"
              className="text-xs min-h-10 px-3.5 shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] inline-flex items-center gap-1.5"
            >
              <ArrowLeftIcon className="size-3.5" aria-hidden="true" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>

          <Link to={ROUTES.customer.recipes}>
            <Button
              variant="secondary"
              className="text-xs min-h-10 px-3.5 shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] inline-flex items-center gap-1.5"
            >
              <BookOpenIcon className="size-3.5" aria-hidden="true" />
              <span>Browse Recipes</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

