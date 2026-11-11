import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import LiveClock from '../../components/LiveClock';
import { AvatarDisplay } from '../auth/preworkedAvatars';
import { formatNaira } from '../../lib/format';
import { ROUTES } from '../../lib/routes';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardHero({
  userName,
  userAvatar,
  weeklyBudget = 21000,
  perMealCapNGN = 1000,
  onRegenerate,
  regenerating = false,
  loading = false,
}) {
  const greeting = getGreeting();
  const displayName = userName ? userName.split('@')[0] : 'there';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:border-field-line">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Column: Greeting, Description & Status Badges */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3.5">
            <div className="size-12 sm:size-14 shrink-0 rounded-2xl border-2 border-primary/40 overflow-hidden bg-primary-soft shadow-xs flex items-center justify-center transition-transform hover:scale-105">
              <AvatarDisplay avatarId={userAvatar} fallback={initial} className="size-full" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-fg">
                  {greeting}, {displayName}!
                </h1>
                <LiveClock className="text-[11px] py-0.5 px-2.5" />
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-muted leading-relaxed">
                Your personalized Nigerian meal plan is calibrated to your health and
                budget cap of <strong className="font-semibold text-fg">{formatNaira(perMealCapNGN)}</strong>/meal.
              </p>
            </div>
          </div>

          {/* Quick status pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="rounded-xl border border-line bg-surface-muted px-2.5 py-1 text-fg font-medium shadow-2xs">
              🇳🇬 Authentic Nigerian staples
            </span>
            <span className="rounded-xl border border-line bg-surface-muted px-2.5 py-1 text-fg font-medium shadow-2xs">
              🥗 USDA composition verified
            </span>
            <span className="rounded-xl border border-line bg-surface-muted px-2.5 py-1 text-fg font-medium shadow-2xs">
              ⏱ Quick preparation options
            </span>
          </div>
        </div>

        {/* Right Column: Key Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          <Button
            variant="primary"
            onClick={onRegenerate}
            disabled={loading || regenerating}
            className="text-xs min-h-10 px-4 font-semibold shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] inline-flex items-center gap-2"
          >
            {regenerating ? <Spinner label="Crafting meals…" /> : '⚡ Regenerate Plan'}
          </Button>

          <Link to={ROUTES.customer.meals}>
            <Button variant="secondary" className="text-xs min-h-10 px-3.5 shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
              🍲 All Meals
            </Button>
          </Link>

          <Link to={ROUTES.customer.analysis}>
            <Button variant="secondary" className="text-xs min-h-10 px-3.5 shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
              📊 Analysis
            </Button>
          </Link>

          <Link to={ROUTES.customer.profile}>
            <Button variant="secondary" className="text-xs min-h-10 px-3.5 shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]" title="Adjust health conditions or budget">
              ⚙️ Preferences
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
