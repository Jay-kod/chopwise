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
  const rawName = (userName || '').trim();
  const displayName = rawName ? (rawName.includes('@') ? rawName.split('@')[0] : rawName) : 'there';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:border-field-line">
      <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Column: Greeting, Description & Status Badges */}
        <div className="space-y-3 max-w-2xl min-w-0">
          <div className="flex items-start gap-3 sm:gap-3.5">
            <div className="size-11 sm:size-14 shrink-0 rounded-2xl border-2 border-primary/40 overflow-hidden bg-primary-soft shadow-xs flex items-center justify-center transition-transform hover:scale-105 mt-0.5 sm:mt-0">
              <AvatarDisplay avatarId={userAvatar} fallback={initial} className="size-full" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-fg leading-tight break-words">
                  {greeting}, {displayName}!
                </h1>
                <LiveClock className="text-[10px] sm:text-[11px] py-0.5 px-2 sm:px-2.5" />
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
                Your personalized Nigerian meal plan is calibrated to your health and
                budget cap of <strong className="font-semibold text-fg">{formatNaira(perMealCapNGN)}</strong>/meal.
              </p>
            </div>
          </div>

          {/* Quick status pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5 text-xs">
            <span className="rounded-xl border border-line bg-surface-muted px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] text-fg font-semibold shadow-2xs">
              🇳🇬 Authentic Nigerian staples
            </span>
            <span className="rounded-xl border border-line bg-surface-muted px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] text-fg font-semibold shadow-2xs">
              🥗 USDA composition verified
            </span>
            <span className="rounded-xl border border-line bg-surface-muted px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] text-fg font-semibold shadow-2xs">
              ⏱ Quick preparation options
            </span>
          </div>
        </div>

        {/* Right Column: Key Action Buttons */}
        <div className="flex flex-col gap-2 w-full lg:w-auto lg:flex-row lg:items-center lg:shrink-0 pt-2 lg:pt-0">
          <Button
            variant="primary"
            onClick={onRegenerate}
            disabled={loading || regenerating}
            className="w-full lg:w-auto text-xs min-h-10 px-4 font-semibold shadow-xs justify-center inline-flex items-center gap-2"
          >
            {regenerating ? <Spinner label="Crafting meals…" /> : '⚡ Regenerate Plan'}
          </Button>

          <div className="grid grid-cols-3 gap-1.5 w-full sm:flex sm:w-auto sm:gap-2">
            <Link to={ROUTES.customer.meals} className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto text-[11px] sm:text-xs min-h-9 sm:min-h-10 px-2 sm:px-3.5 shadow-xs font-semibold text-fg justify-center">
                🍲 Meals
              </Button>
            </Link>

            <Link to={ROUTES.customer.analysis} className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto text-[11px] sm:text-xs min-h-9 sm:min-h-10 px-2 sm:px-3.5 shadow-xs font-semibold text-fg justify-center">
                📊 Analysis
              </Button>
            </Link>

            <Link to={ROUTES.customer.profile} className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto text-[11px] sm:text-xs min-h-9 sm:min-h-10 px-2 sm:px-3.5 shadow-xs font-semibold text-fg justify-center" title="Adjust health conditions or budget">
                ⚙️ Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
