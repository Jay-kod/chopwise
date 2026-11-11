import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  ArrowUpRightIcon,
  CpuIcon,
  DatabaseIcon,
  LeafIcon,
  PlayIcon,
  ScaleIcon,
  SparklesIcon,
} from 'lucide-react';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/lib/routes';

function getServiceIcon(id) {
  if (id === 'mysql') return DatabaseIcon;
  if (id === 'gemini') return SparklesIcon;
  if (id === 'usda') return LeafIcon;
  if (id === 'recommend') return CpuIcon;
  if (id === 'nutrition') return ScaleIcon;
  return ActivityIcon;
}

function statusVariant(status) {
  if (status === 'ok') return 'ok';
  if (status === 'failing') return 'error';
  if (status === 'untested') return 'warning';
  return 'neutral';
}

function formatTestTime(value) {
  if (!value) return 'Never tested';
  try {
    const d = new Date(value);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return 'Recorded';
  }
}

function getDiagnosticLink(id) {
  if (id === 'gemini') return ROUTES.admin.gemini;
  if (id === 'usda') return ROUTES.admin.usda;
  if (id === 'mysql') return ROUTES.admin.checklist;
  return ROUTES.admin.integrations;
}

function DiagnosticCard({ item, testingTarget, onRunSingleTest }) {
  const Icon = getServiceIcon(item.id);
  const targetRoute = getDiagnosticLink(item.id);
  const isTesting = testingTarget === item.testTarget;
  const isOk = item.status === 'ok';

  return (
    <div className="group flex min-w-0 flex-col justify-between rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-field-line hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-muted text-primary shadow-xs group-hover:border-field-line transition-colors">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-sm sm:text-base text-fg">{item.title}</h3>
              <p className="text-xs text-muted capitalize">{item.kind}</p>
            </div>
          </div>
          <Link to={targetRoute} title={`Configure ${item.title}`}>
            <Badge variant={statusVariant(item.status)} className="cursor-pointer hover:border-field-line">
              {item.status.replaceAll('_', ' ')}
            </Badge>
          </Link>
        </div>

        <div className="mt-3.5 rounded-xl border border-line bg-surface-muted/60 p-3 text-xs leading-relaxed text-fg">
          <p className="line-clamp-2">{item.lastTest?.message || 'No health test recorded yet.'}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-3 text-xs text-muted">
        <div className="flex items-center gap-2">
          <span>{formatTestTime(item.lastTest?.testedAt)}</span>
          {item.lastTest?.latencyMs != null && (
            <span className="rounded-md border border-line bg-surface-muted px-1.5 py-0.5 font-semibold text-primary">
              {item.lastTest.latencyMs} ms
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRunSingleTest && item.testTarget && (
            <button
              type="button"
              onClick={() => onRunSingleTest(item.testTarget)}
              disabled={Boolean(testingTarget)}
              className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-fg shadow-2xs hover:border-field-line hover:bg-surface-muted active:scale-95 transition-all disabled:opacity-50"
              title={`Test ${item.title}`}
            >
              {isTesting ? (
                <Spinner label="Testing…" className="size-3" />
              ) : (
                <>
                  <PlayIcon className="size-3 fill-current text-primary" aria-hidden="true" />
                  <span>Test</span>
                </>
              )}
            </button>
          )}
          <Link
            to={targetRoute}
            className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:text-primary-hover hover:underline underline-offset-2"
          >
            <span>{!isOk ? 'Resolve' : 'Configure'}</span>
            <ArrowUpRightIcon aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DiagnosticFilters({ activeFilter, onFilterChange, functions }) {
  const categories = [
    { id: 'all', label: `All (${functions.length})` },
    { id: 'integrations', label: 'APIs & Data' },
    { id: 'pipelines', label: 'Pipelines' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onFilterChange(cat.id)}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            activeFilter === cat.id
              ? 'bg-primary text-on-primary shadow-2xs'
              : 'border border-line bg-surface text-muted hover:border-field-line hover:text-fg'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminDashboardDiagnostics({ functions = [], testingTarget, onRunSingleTest }) {
  const [filter, setFilter] = useState('all');

  const filtered = functions.filter((item) => {
    if (filter === 'integrations') return item.kind === 'integration' || item.id === 'mysql';
    if (filter === 'pipelines') return item.kind === 'function' && item.id !== 'mysql';
    return true;
  });

  return (
    <section aria-labelledby="system-diagnostics-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="system-diagnostics-heading" className="text-lg font-bold tracking-tight text-fg sm:text-xl">
            Service Diagnostics
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-muted">
            Live health verification across external APIs, databases, and generation pipelines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DiagnosticFilters activeFilter={filter} onFilterChange={setFilter} functions={functions} />
          <Link
            to={ROUTES.admin.analysis}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-4"
          >
            <span>Telemetry hub</span>
            <ArrowUpRightIcon aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>

      {testingTarget && (
        <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-line bg-surface-muted p-3.5 text-xs sm:text-sm text-fg shadow-2xs">
          <Spinner label="Checking systems…" className="size-4 text-primary" />
          <div>
            <p className="font-semibold text-fg">Health checks in progress</p>
            <p className="text-xs text-muted">Verifying operational integrity for {testingTarget}…</p>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="p-6 text-sm text-muted">No diagnostic services match the current filter.</Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((item) => (
            <DiagnosticCard
              key={item.id}
              item={item}
              testingTarget={testingTarget}
              onRunSingleTest={onRunSingleTest}
            />
          ))}
        </div>
      )}
    </section>
  );
}
