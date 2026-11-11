import ErrorState from '@/components/ErrorState';
import AdminDashboardDiagnostics from '@/features/admin/AdminDashboardDiagnostics';
import AdminDashboardHero, { FailingServicesAlert } from '@/features/admin/AdminDashboardHero';
import AdminDashboardOverview from '@/features/admin/AdminDashboardOverview';
import AdminDashboardSidebar from '@/features/admin/AdminDashboardSidebar';
import AdminModulesGrid from '@/features/admin/AdminModulesGrid';
import { useAdminContext } from './useAdminContext';

function ModulesSection() {
  return (
    <section aria-labelledby="admin-modules-heading" className="space-y-4 border-t border-line pt-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="admin-modules-heading" className="text-lg font-bold tracking-tight text-fg sm:text-xl">
            Administration Modules & Governance
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-muted">
            Configure AI parameters, clinical safety rules, price tables, catalogue, customer accounts, and access control.
          </p>
        </div>
      </div>
      <AdminModulesGrid />
    </section>
  );
}

export default function AdminDashboard() {
  const { status, error, loading, fetchStatus, testAll, testingTarget, runTest } = useAdminContext();
  const functions = status?.functions || [];
  const bootstrap = status?.bootstrap || {};
  const failingCount = functions.filter((item) => item.status === 'failing').length;
  const passingCount = functions.filter((item) => item.status === 'ok').length;

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">
      <AdminDashboardHero
        functions={functions}
        bootstrap={bootstrap}
        loading={loading}
        testingTarget={testingTarget}
        onRefresh={fetchStatus}
        onRunTest={testAll}
      />
      {error && <ErrorState message={error} onRetry={fetchStatus} className="p-3 text-xs" />}
      {!testingTarget && failingCount > 0 && (
        <FailingServicesAlert failingCount={failingCount} passingCount={passingCount} />
      )}
      <AdminDashboardOverview status={status} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.9fr)]">
        <AdminDashboardDiagnostics functions={functions} testingTarget={testingTarget} onRunSingleTest={runTest} />
        <AdminDashboardSidebar bootstrap={bootstrap} />
      </div>
      <ModulesSection />
    </div>
  );
}
