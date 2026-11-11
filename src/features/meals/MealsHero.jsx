import { Link } from 'react-router-dom';
import { HeartIcon, LayoutGridIcon, PlusIcon, UtensilsIcon } from 'lucide-react';
import Button from '@/components/Button';
import LiveClock from '@/components/LiveClock';
import { ROUTES } from '@/lib/routes';

export default function MealsHero({
  totalCount = 0,
  quickCount = 0,
  savedCount = 0,
  isAdmin = false,
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cat-meals-line bg-cat-meals-bg px-2.5 py-0.5 text-xs font-semibold text-cat-meals-fg shadow-2xs">
              <UtensilsIcon className="size-3.5" aria-hidden="true" />
              <span>Meals & Recipes · Approved Nigerian Meals</span>
            </span>
            <LiveClock className="text-[11px] py-0.5 px-2.5" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
              Approved Nigerian Meals
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
              Explore authentic, health-conscious Nigerian recipes approved and verified for balanced nutrition.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="rounded-xl border border-line bg-surface-muted px-2.5 py-1 text-fg font-medium shadow-2xs">
              🍲 {totalCount} Approved Dishes
            </span>
            <span className="rounded-xl border border-line bg-surface-muted px-2.5 py-1 text-fg font-medium shadow-2xs">
              ⚡ {quickCount} Quick Prep (≤ 30m)
            </span>
            <span className="rounded-xl border border-cat-meals-line bg-cat-meals-bg px-2.5 py-1 text-cat-meals-fg font-medium shadow-2xs">
              ❤️ {savedCount} In Favourites
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          <Link to={ROUTES.customer.dashboard}>
            <Button
              variant="secondary"
              className="text-xs min-h-10 px-3.5 shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] inline-flex items-center gap-1.5"
            >
              <LayoutGridIcon className="size-3.5" aria-hidden="true" />
              <span>My Meal Plan</span>
            </Button>
          </Link>

          <Link to={ROUTES.customer.saved}>
            <Button
              variant="secondary"
              className="text-xs min-h-10 px-3.5 shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] inline-flex items-center gap-1.5"
            >
              <HeartIcon className="size-3.5" aria-hidden="true" />
              <span>Saved Favourites</span>
            </Button>
          </Link>

          {isAdmin && (
            <Link to={ROUTES.admin.recipes}>
              <Button
                variant="primary"
                className="text-xs min-h-10 px-3.5 font-semibold shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] inline-flex items-center gap-1.5"
              >
                <PlusIcon className="size-3.5" aria-hidden="true" />
                <span>+ Manage Recipes</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
