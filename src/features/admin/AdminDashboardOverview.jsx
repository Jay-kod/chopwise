import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  CheckCircle2Icon,
  CoinsIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export { AdminBootstrapReadiness } from './AdminDashboardSidebar';

function HealthDonutMeter({ rate = 100 }) {
  const clamped = Math.max(0, Math.min(100, rate));
  const strokeDashoffset = Math.round(88 - (88 * clamped) / 100);

  return (
    <div className="relative flex size-12 shrink-0 items-center justify-center">
      <svg className="size-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="14" fill="none" className="stroke-line" strokeWidth="3.5" />
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
      <span className="absolute text-[11px] font-extrabold text-fg tabular-nums leading-none">
        {clamped}%
      </span>
    </div>
  );
}

function BootstrapSegmentPills({ bootstrap = {} }) {
  const items = [
    { key: 'mysql', label: 'DB' },
    { key: 'adminUidsSet', label: 'UID' },
    { key: 'jwtSecretSet', label: 'JWT' },
    { key: 'encryptionKeySet', label: 'ENC' },
  ];

  return (
    <div className="flex items-center gap-1 pt-1">
      {items.map(({ key, label }) => {
        const isSet = Boolean(bootstrap[key]);
        return (
          <span
            key={key}
            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border transition-colors ${
              isSet
                ? 'bg-primary-soft text-on-primary-soft border-line'
                : 'bg-warn-bg text-warn-fg border-warn-line'
            }`}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

function OverviewCard({ metric }) {
  const { Icon } = metric;
  return (
    <Link
      to={metric.href}
      className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-field-line hover:shadow-md active:translate-y-0 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title={`Open ${metric.label}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-xl border border-line bg-surface-muted text-primary shrink-0 shadow-xs group-hover:border-field-line">
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <span className="text-xs font-bold tracking-wide text-fg group-hover:text-primary transition-colors">{metric.label}</span>
          </div>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${metric.tagClass}`}>
            {metric.tag}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-fg tabular-nums">
              {metric.value}
            </div>
            <div className="mt-0.5 text-xs text-muted">{metric.detail}</div>
          </div>
          {metric.widget}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-[11px] text-muted">
        <span>{metric.footnote}</span>
        <span className="rounded-md border border-line bg-surface-muted px-1.5 py-0.5 font-semibold text-primary group-hover:text-primary-hover flex items-center gap-0.5">
          <span>{metric.badge}</span>
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

function calculateAverageLatency(functions) {
  const timed = functions.filter((f) => f.lastTest?.latencyMs != null);
  if (!timed.length) return null;
  const total = timed.reduce((acc, f) => acc + Number(f.lastTest.latencyMs), 0);
  return Math.round(total / timed.length);
}

function getSystemKpis(functions, avgLatency) {
  const passing = functions.filter((item) => item.status === 'ok').length;
  const totalFunctions = functions.length || 1;
  const passingRate = Math.round((passing / totalFunctions) * 100);

  return [
    {
      label: 'System Health Index',
      value: `${passing} / ${functions.length}`,
      detail: `${passingRate}% diagnostics operational`,
      Icon: CheckCircle2Icon,
      tag: passing === functions.length ? 'Healthy' : 'Attention',
      tagClass: passing === functions.length
        ? 'bg-primary-soft text-on-primary-soft border-line'
        : 'bg-warn-bg text-warn-fg border-warn-line',
      footnote: 'Telemetry suite',
      badge: 'Diagnostics',
      widget: <HealthDonutMeter rate={passingRate} />,
      href: ROUTES.admin.integrations,
    },
    {
      label: 'Pipeline Latency',
      value: avgLatency != null ? `${avgLatency} ms` : 'Untested',
      detail: avgLatency != null ? 'Average service round-trip' : 'Run health checks to measure',
      Icon: ActivityIcon,
      tag: avgLatency == null ? 'Pending' : avgLatency < 200 ? 'Fast' : 'Normal',
      tagClass: avgLatency != null && avgLatency < 200
        ? 'bg-primary-soft text-on-primary-soft border-line'
        : 'bg-surface-muted text-fg border-line',
      footnote: 'Response time',
      badge: 'Analysis',
      widget: null,
      href: ROUTES.admin.analysis,
    },
  ];
}

function getPrerequisiteKpis(status, bootstrap) {
  const bootstrapValues = Object.values(bootstrap);
  const configured = bootstrapValues.filter(Boolean).length;
  const pricedCount = status?.prices?.pricedCount ?? 0;
  const totalPrices = status?.prices?.total ?? 0;

  return [
    {
      label: 'Bootstrap Security',
      value: `${configured} / ${bootstrapValues.length || 4}`,
      detail: 'Core environment keys verified',
      Icon: ShieldCheckIcon,
      tag: configured === (bootstrapValues.length || 4) ? 'Verified' : 'Action',
      tagClass: configured === (bootstrapValues.length || 4)
        ? 'bg-primary-soft text-on-primary-soft border-line'
        : 'bg-warn-bg text-warn-fg border-warn-line',
      footnote: 'Server prerequisites',
      badge: 'Checklist',
      widget: <BootstrapSegmentPills bootstrap={bootstrap} />,
      href: ROUTES.admin.checklist,
    },
    {
      label: 'Market Pricing',
      value: totalPrices > 0 ? `${pricedCount} / ${totalPrices}` : 'Catalog',
      detail: totalPrices > 0 ? 'Nigerian staples priced' : 'Market ingredient table',
      Icon: CoinsIcon,
      tag: pricedCount === totalPrices && totalPrices > 0 ? 'Complete' : 'Priced',
      tagClass: 'bg-primary-soft text-on-primary-soft border-line',
      footnote: 'Nigerian market rates',
      badge: 'Price Table',
      widget: null,
      href: ROUTES.admin.prices,
    },
  ];
}

export default function AdminDashboardOverview({ status }) {
  const functions = status?.functions || [];
  const bootstrap = status?.bootstrap || {};
  const avgLatency = calculateAverageLatency(functions);
  const metrics = [
    ...getSystemKpis(functions, avgLatency),
    ...getPrerequisiteKpis(status, bootstrap),
  ];

  return (
    <section aria-labelledby="system-overview-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 id="system-overview-heading" className="text-lg font-bold tracking-tight text-fg sm:text-xl">
            Executive Summary
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-muted">
            Live telemetry, response latency, server security, and market catalog pricing.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <OverviewCard key={metric.label} metric={metric} />)}
      </div>
    </section>
  );
}
