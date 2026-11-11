import { Link } from 'react-router-dom';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/lib/routes';
import AdminPageHeader from './AdminPageHeader';
import { useAdminContext } from './useAdminContext';

const INTEGRATION_ROUTES = {
  gemini: `${ROUTES.admin.integrations}?tab=gemini`,
  usda: `${ROUTES.admin.integrations}?tab=usda`,
};

function formatTestTime(value) {
  if (!value) return 'Not tested yet';
  return new Date(value).toLocaleString();
}

function integrationStatus(integrations, id) {
  return integrations.find((integration) => integration.id === id)?.status || 'unknown';
}

function statusVariant(status) {
  if (status === 'ok' || status === 'configured') return 'ok';
  if (status === 'failing') return 'error';
  if (status === 'untested') return 'warning';
  return 'neutral';
}

function DiagnosticCard({ item, integrationStatusValue, lastTest, onTest, testingTarget }) {
  const isRunning = testingTarget === item.testTarget;
  const displayedStatus = integrationStatusValue || item.status || 'unknown';
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-fg">{item.title}</h2>
          <p className="mt-1 text-xs text-muted">{item.description}</p>
        </div>
        <Badge variant={statusVariant(displayedStatus)}>{displayedStatus}</Badge>
      </div>
      <div className="min-h-16 rounded-lg border border-line bg-surface-muted p-3 text-xs">
        <p className="font-medium text-fg">{lastTest?.message || 'No health test has been recorded.'}</p>
        <p className="mt-1 text-muted">
          {formatTestTime(lastTest?.testedAt)}
          {lastTest?.latencyMs != null ? ` · ${lastTest.latencyMs} ms` : ''}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="secondary"
          onClick={() => onTest(item.testTarget)}
          disabled={Boolean(testingTarget)}
          className="min-h-10"
        >
          {isRunning ? <Spinner label="Testing…" /> : 'Run test'}
        </Button>
        {INTEGRATION_ROUTES[item.testTarget] && (
          <Link className="text-sm font-medium text-primary underline" to={INTEGRATION_ROUTES[item.testTarget]}>
            Configure integration
          </Link>
        )}
      </div>
    </Card>
  );
}

export default function AdminAnalysis() {
  const { status, error, loading, fetchStatus, runTest, testAll, testingTarget } = useAdminContext();
  const functions = status?.functions || [];
  const integrations = status?.integrations || [];

  if (error && !status) {
    return <ErrorState message={error} onRetry={fetchStatus} />;
  }

  if (loading && !status) {
    return <div className="flex justify-center p-8"><Spinner label="Loading system analysis…" /></div>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="System Analysis"
        description="Inspect Gemini and USDA readiness, review the last live checks, and run integration or pipeline diagnostics."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={fetchStatus} disabled={loading || Boolean(testingTarget)}>
              {loading ? <Spinner label="Refreshing…" /> : 'Refresh'}
            </Button>
            <Button onClick={() => testAll()} disabled={loading || Boolean(testingTarget)}>
              {testingTarget ? <Spinner label="Testing…" /> : 'Run all diagnostics'}
            </Button>
          </div>
        }
      />

      {error && <ErrorState message={error} onRetry={fetchStatus} className="p-3 text-xs" />}

      {functions.length === 0 ? (
        <Card className="p-5 text-sm text-muted">No diagnostics are currently available.</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {functions.map((item) => {
            const lastTest = item.lastTest;
            const serviceStatus = ['gemini', 'usda'].includes(item.testTarget)
              ? integrationStatus(integrations, item.testTarget)
              : item.status;
            return (
              <DiagnosticCard
                key={item.id}
                item={item}
                integrationStatusValue={serviceStatus}
                lastTest={lastTest}
                onTest={runTest}
                testingTarget={testingTarget}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
