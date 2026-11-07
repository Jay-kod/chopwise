import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';
import FunctionsTable from '../features/admin/FunctionsTable';
import IntegrationCard from '../features/admin/IntegrationCard';
import SettingsForm from '../features/admin/SettingsForm';
import SafetyForm from '../features/admin/SafetyForm';
import PriceTableEditor from '../features/admin/PriceTableEditor';
import BootstrapChecklist from '../features/admin/BootstrapChecklist';
import EvaluationRunner from '../features/admin/EvaluationRunner';
import { useAdminApi } from '../features/admin/useAdminApi';

function ArrowLeftIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export default function Admin() {
  const {
    status,
    loading,
    error,
    testingTarget,
    fetchStatus,
    saveSection,
    resetConfigSection,
    runTest,
    testAll,
  } = useAdminApi();

  if (loading && !status) {
    return (
      <Layout hideHeader={true} hideFooter={true}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner label="Loading admin configurations…" />
        </div>
      </Layout>
    );
  }

  if (error && !status) {
    return (
      <Layout hideHeader={true} hideFooter={true}>
        <div className="mx-auto max-w-lg py-12">
          <ErrorState message={error} onRetry={fetchStatus} />
        </div>
      </Layout>
    );
  }

  const integrations = status?.integrations || [];

  return (
    <Layout hideHeader={true} hideFooter={true}>
      <div className="space-y-8 py-4 sm:py-6">
        {/* Admin Navigation Bar (Replaces global site header) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1 font-medium text-muted hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1 py-0.5"
              >
                <ArrowLeftIcon />
                <span>Dashboard</span>
              </Link>
              <span className="text-muted">/</span>
              <span className="font-semibold text-primary uppercase tracking-wider text-[11px]">
                Admin Portal
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-fg">
              ChopWise Administration
            </h1>
            <p className="text-xs text-muted">
              Centralized management for API credentials, runtime settings, safety parameters, and price tables.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={fetchStatus}
              disabled={loading}
              className="text-xs min-h-9 px-3"
            >
              {loading ? <Spinner label="Refreshing…" /> : '↻ Refresh Status'}
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Section A: Functions Table */}
        <section>
          <FunctionsTable
            functions={status?.functions || []}
            onTest={runTest}
            onTestAll={() => testAll()}
            testingTarget={testingTarget}
          />
        </section>

        {/* Section B: Integration Cards */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-fg">API Integrations</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {integrations.map((integ) => (
              <IntegrationCard
                key={integ.id}
                integration={integ}
                onSave={saveSection}
                onTest={runTest}
                isTesting={testingTarget === integ.id}
              />
            ))}
          </div>
        </section>

        {/* Sections C & D: Recommendation Settings & Safety Thresholds */}
        <section className="grid gap-6 lg:grid-cols-2">
          <SettingsForm
            settings={status?.settings}
            onSave={saveSection}
            onReset={resetConfigSection}
          />

          <SafetyForm
            safety={status?.safety}
            onSave={saveSection}
            onReset={resetConfigSection}
          />
        </section>

        {/* Section E: Ingredient Price Table */}
        <section>
          <PriceTableEditor
            prices={status?.prices}
            onSave={saveSection}
            onReset={resetConfigSection}
          />
        </section>

        {/* Section F: Bootstrap Checklist */}
        <section>
          <BootstrapChecklist bootstrap={status?.bootstrap} />
        </section>

        {/* Section G: Evaluation Runner (Chapter 4 Evidence) */}
        <section>
          <EvaluationRunner />
        </section>
      </div>
    </Layout>
  );
}
