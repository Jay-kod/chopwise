import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  InfoIcon,
  RefreshCwIcon,
  BookOpenIcon,
  HeartIcon,
  SlidersHorizontalIcon,
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ErrorState from '../../components/ErrorState';
import { ROUTES } from '../../lib/routes';

function formatRemaining(totalSeconds) {
  if (totalSeconds <= 0) return 'ready';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function RateLimitAlternatives({ isAdmin }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line text-xs">
      <span className="font-medium text-muted">Quick alternatives:</span>
      <Link
        to={ROUTES.customer.recipes}
        className="inline-flex items-center gap-1 font-semibold text-fg hover:text-primary transition-colors underline underline-offset-2"
      >
        <BookOpenIcon className="size-3.5" />
        <span>Recipe Catalogue</span>
      </Link>
      <span className="text-muted">•</span>
      <Link
        to={ROUTES.customer.saved}
        className="inline-flex items-center gap-1 font-semibold text-fg hover:text-primary transition-colors underline underline-offset-2"
      >
        <HeartIcon className="size-3.5" />
        <span>Favourite meals</span>
      </Link>
      {isAdmin && (
        <>
          <span className="text-muted">•</span>
          <Link
            to={ROUTES.admin.settings}
            className="inline-flex items-center gap-1 font-semibold text-warn-fg hover:underline underline-offset-2"
          >
            <SlidersHorizontalIcon className="size-3.5" />
            <span>Adjust Quota (Admin)</span>
          </Link>
        </>
      )}
    </div>
  );
}

function RateLimitExplainer({ isAdmin }) {
  return (
    <div className="mt-4 rounded-xl border border-warn-line/60 bg-surface/95 p-4 text-left text-xs text-fg shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <InfoIcon className="size-4 shrink-0 text-warn-fg" aria-hidden="true" />
        <h4 className="font-bold text-fg">Why am I seeing this limit?</h4>
      </div>
      <div className="space-y-2 text-muted leading-relaxed">
        <p>
          <strong className="text-fg">AI Quota Management:</strong> ChopWise connects directly to the Google Gemini API to analyze clinical constraints, calculate naira budgets, and tailor 6 Nigerian meals in real time.
        </p>
        <p>
          <strong className="text-fg">Hourly Safety Window:</strong> To avoid service throttling and manage generative AI usage fairly across all users, each account is allocated up to 10 live meal recommendation requests per rolling 60-minute window.
        </p>
        <p>
          <strong className="text-fg">Full Recipe Access:</strong> This quota applies exclusively to fresh AI generation. You can freely browse approved recipes and view your saved meals without restriction.
        </p>
      </div>
      <RateLimitAlternatives isAdmin={isAdmin} />
    </div>
  );
}

function RateLimitActions({ handleRetry, retrying, showExplainer, setShowExplainer, isExpired, secondsLeft }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
      <button
        type="button"
        onClick={handleRetry}
        disabled={retrying}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-warn-line bg-surface px-4 py-2 text-xs font-bold text-warn-fg shadow-xs hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:opacity-60"
      >
        <RefreshCwIcon className={`size-3.5 ${retrying ? 'animate-spin' : ''}`} />
        <span>{retrying ? 'Checking quota…' : 'Refresh / Try Again'}</span>
      </button>

      <button
        type="button"
        onClick={() => setShowExplainer((prev) => !prev)}
        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-warn-line/70 bg-warn-bg px-3.5 py-2 text-xs font-semibold text-warn-fg hover:bg-surface/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      >
        <InfoIcon className="size-3.5" />
        <span>{showExplainer ? 'Hide Details' : 'Why am I seeing this?'}</span>
      </button>

      {!isExpired && (
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-warn-line/50 bg-surface/70 px-3 py-2 text-xs font-semibold text-warn-fg shadow-2xs">
          <ClockIcon className="size-3.5" />
          <span>Reset in {formatRemaining(secondsLeft)}</span>
        </div>
      )}
    </div>
  );
}

function RateLimitCard({ error, isAdmin, onRetry }) {
  const [showExplainer, setShowExplainer] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const initialSeconds = Number(error?.details?.retryAfterSeconds) || 3600;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  async function handleRetry() {
    if (!onRetry || retrying) return;
    try {
      setRetrying(true);
      await onRetry();
    } finally {
      setRetrying(false);
    }
  }

  const isExpired = secondsLeft <= 0;

  return (
    <div
      className="rounded-2xl border border-warn-line bg-warn-bg/95 p-5 sm:p-6 text-center text-warn-fg shadow-xs transition-all"
      role="alert"
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-warn-line/60 bg-surface shadow-2xs">
        <span className="text-2xl" aria-hidden="true">⏳</span>
      </div>

      <h3 className="mt-3 text-base sm:text-lg font-bold text-warn-fg tracking-tight">
        Hourly Request Limit Reached
      </h3>

      <p className="mx-auto mt-1 max-w-lg text-xs sm:text-sm font-medium text-warn-fg/90 leading-relaxed">
        {isExpired
          ? 'Your hourly recommendation window has reset. Click Refresh below to check quota status and load your meal plan.'
          : `Hourly recommendation quota reached. Live AI generation unlocks in approximately ${formatRemaining(secondsLeft)}.`}
      </p>

      <RateLimitActions
        handleRetry={handleRetry}
        retrying={retrying}
        showExplainer={showExplainer}
        setShowExplainer={setShowExplainer}
        isExpired={isExpired}
        secondsLeft={secondsLeft}
      />

      {showExplainer && <RateLimitExplainer isAdmin={isAdmin} />}
    </div>
  );
}

function NotConfiguredCard({ isAdmin }) {
  return (
    <Card className="p-6 text-center">
      <span className="text-3xl" aria-hidden="true">⚙️</span>
      <h3 className="mt-2 text-base font-bold text-fg">
        Recommendation Service Not Configured
      </h3>
      <p className="mx-auto mt-1 max-w-md text-xs text-muted">
        The AI meal recommendation engine is currently being set up with its Google Gemini credentials.
      </p>
      {isAdmin && (
        <div className="mt-4">
          <Link to={ROUTES.admin.gemini}>
            <Button className="text-xs min-h-9">
              Configure Gemini API Key in Admin Portal →
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function DashboardError({ error, isAdmin, onRetry }) {
  if (!error) return null;
  if (error.code === 'NOT_CONFIGURED') return <NotConfiguredCard isAdmin={isAdmin} />;
  if (error.code === 'RATE_LIMITED') return <RateLimitCard error={error} isAdmin={isAdmin} onRetry={onRetry} />;

  return (
    <ErrorState
      message={error.message || 'Failed to load recommendations.'}
      onRetry={onRetry}
    />
  );
}
