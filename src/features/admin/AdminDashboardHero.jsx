import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  ArrowUpRightIcon,
  PlayIcon,
  RefreshCwIcon,
} from 'lucide-react';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import LiveClock from '@/components/LiveClock';
import { ROUTES } from '@/lib/routes';

function getOverallStatus(functions, bootstrap) {
  if (functions.some((item) => item.status === 'failing')) {
    return { label: 'Action required', variant: 'error', dotColor: 'bg-danger-fg', href: ROUTES.admin.integrations, cta: 'Review failing integrations' };
  }
  if (!functions.length) {
    return { label: 'Awaiting diagnostics', variant: 'neutral', dotColor: 'bg-muted', href: ROUTES.admin.integrations, cta: 'Run diagnostics' };
  }
  const bootstrapValues = Object.values(bootstrap || {});
  const allChecksPass = functions.every((item) => item.status === 'ok');
  const bootstrapReady = bootstrapValues.length > 0 && bootstrapValues.every(Boolean);
  if (allChecksPass && bootstrapReady) {
    return { label: 'All systems operational', variant: 'ok', dotColor: 'bg-primary', href: ROUTES.admin.checklist, cta: 'View readiness checklist' };
  }
  const anyNotConfigured = functions.some((item) => item.status === 'not_configured');
  return {
    label: 'Setup in progress',
    variant: 'warning',
    dotColor: 'bg-warn-fg',
    href: anyNotConfigured ? ROUTES.admin.integrations : ROUTES.admin.checklist,
    cta: anyNotConfigured ? 'Configure API keys' : 'Complete setup checklist',
  };
}

function HeroActions({ loading, testingTarget, onRefresh, onRunTest }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">
      <Button
        variant="secondary"
        onClick={onRefresh}
        disabled={loading || Boolean(testingTarget)}
        className="min-h-11 shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center gap-2"
        aria-label="Refresh telemetry status"
      >
        <RefreshCwIcon className={`size-4 text-muted ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
        <span>{loading ? 'Refreshing…' : 'Refresh telemetry'}</span>
      </Button>
      <Button
        variant="primary"
        onClick={onRunTest}
        disabled={loading || Boolean(testingTarget)}
        className="min-h-11 shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center gap-2"
        aria-label="Run full diagnostic health check"
      >
        {testingTarget ? (
          <Spinner label="Testing…" />
        ) : (
          <>
            <PlayIcon className="size-4 fill-current" aria-hidden="true" />
            <span>Run health checks</span>
          </>
        )}
      </Button>
    </div>
  );
}

function StatusIndicator({ overallStatus }) {
  return (
    <Link
      to={overallStatus.href}
      className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-semibold text-fg transition-all hover:border-field-line hover:shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title={overallStatus.cta}
    >
      <span className="relative flex size-2 shrink-0">
        <span className={`absolute inline-flex size-full animate-ping rounded-full ${overallStatus.dotColor} opacity-75`} />
        <span className={`relative inline-flex size-2 rounded-full ${overallStatus.dotColor}`} />
      </span>
      <span>{overallStatus.label}</span>
      <span className="text-muted font-normal">· {overallStatus.cta} →</span>
    </Link>
  );
}

export default function AdminDashboardHero({
  functions, bootstrap, loading, testingTarget, onRefresh, onRunTest,
}) {
  const overallStatus = getOverallStatus(functions, bootstrap);

  return (
    <header className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-xs transition-all sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-primary">
              <ActivityIcon aria-hidden="true" className="size-3.5" />
              <span>Executive Operations</span>
            </span>
            <span aria-hidden="true">·</span>
            <LiveClock showSeconds={true} className="rounded-md border border-line bg-surface-muted px-2.5 py-1 text-[11px]" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
              System Operations Hub
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Live telemetry, service health monitoring, and administrative governance for ChopWise.
            </p>
          </div>

          <div className="pt-1">
            <StatusIndicator overallStatus={overallStatus} />
          </div>
        </div>

        <HeroActions
          loading={loading}
          testingTarget={testingTarget}
          onRefresh={onRefresh}
          onRunTest={onRunTest}
        />
      </div>
    </header>
  );
}

export function FailingServicesAlert({ failingCount, passingCount }) {
  if (!failingCount) return null;
  return (
    <div
      role="region"
      aria-label="System health check alerts"
      className="flex flex-col gap-3 rounded-2xl border border-danger-line bg-danger-bg p-4 text-sm text-danger-fg shadow-xs sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-danger-fg text-on-primary text-xs font-bold">
          !
        </span>
        <p>
          <strong>{failingCount} service{failingCount === 1 ? '' : 's'} failing</strong>
          <span className="ml-1">health checks ({passingCount} operational). Recommendation or nutrition pipelines may be degraded.</span>
        </p>
      </div>
      <Link
        to={ROUTES.admin.integrations}
        className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-danger-fg underline underline-offset-4 hover:opacity-80 shrink-0"
      >
        <span>Review integrations</span>
        <ArrowUpRightIcon aria-hidden="true" className="size-4" />
      </Link>
    </div>
  );
}
