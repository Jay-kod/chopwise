import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { PlugZapIcon, SparklesIcon, ActivityIcon, CheckCircle2Icon, AlertCircleIcon } from 'lucide-react';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import Spinner from '@/components/Spinner';
import IntegrationCard from '@/features/admin/IntegrationCard';
import FunctionsTable from '@/features/admin/FunctionsTable';
import AdminPageHeader from './AdminPageHeader';
import { useAdminContext } from './useAdminContext';

export default function AdminIntegrations() {
  const { status, loading, fetchStatus, saveSection, runTest, testAll, testingTarget } = useAdminContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => {
    const hash = location.hash ? location.hash.replace('#', '') : '';
    return searchParams.get('tab') || hash || 'all';
  });

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const hash = location.hash ? location.hash.replace('#', '') : '';
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    } else if (hash && hash !== activeTab) {
      setActiveTab(hash);
    }
  }, [searchParams, location.hash]);

  function handleSelectTab(tabId) {
    setActiveTab(tabId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabId === 'all') next.delete('tab');
      else next.set('tab', tabId);
      return next;
    }, { replace: true });
  }

  const integrations = (status?.integrations || []).map((integ) => {
    const fn = status?.functions?.find((f) => f.id === integ.id);
    return {
      ...integ,
      lastTest: integ.lastTest || fn?.lastTest || null,
    };
  });

  const gemini = integrations.find((i) => i.id === 'gemini') || { id: 'gemini', title: 'Google Gemini' };
  const usda = integrations.find((i) => i.id === 'usda') || { id: 'usda', title: 'USDA FoodData Central' };
  const isTestingAll = testingTarget === '__all__';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="API Integrations"
        description="Centralized command center for Google Gemini AI, USDA FoodData Central, and external APIs."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={fetchStatus}
              disabled={loading || isTestingAll}
              className="text-xs min-h-9 px-3"
            >
              {loading ? <Spinner label="Refreshing…" /> : '↻ Refresh Status'}
            </Button>
            <Button
              variant="primary"
              onClick={() => testAll()}
              disabled={loading || isTestingAll || Boolean(testingTarget)}
              className="text-xs min-h-9 px-3"
            >
              {isTestingAll ? <Spinner label="Testing All Services…" /> : '⚡ Test All APIs'}
            </Button>
          </div>
        }
      />

      {/* Top Health & Status Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4 border-line bg-surface">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-primary" />
              <span className="text-sm font-semibold text-fg">Google Gemini AI</span>
            </div>
            <Badge variant={gemini.status === 'configured' ? 'success' : 'neutral'}>
              {gemini.status === 'configured' ? 'Configured' : 'Not configured'}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-muted line-clamp-2">
            Structured meal recommendations, nutrient extraction, and custom recipe drafting.
          </p>
          {gemini.lastTest && (
            <p className="mt-2 text-xs text-muted">
              Last test: <span className={gemini.lastTest.ok ? 'text-primary font-medium' : 'text-danger-fg font-medium'}>
                {gemini.lastTest.ok ? `✓ OK (${gemini.lastTest.latencyMs}ms)` : `✕ ${gemini.lastTest.message || 'Failed'}`}
              </span>
            </p>
          )}
        </Card>

        <Card className="p-4 border-line bg-surface">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ActivityIcon className="size-4 text-primary" />
              <span className="text-sm font-semibold text-fg">USDA FoodData</span>
            </div>
            <Badge variant={usda.status === 'configured' ? 'success' : usda.status === 'disabled' ? 'warning' : 'neutral'}>
              {usda.status === 'configured' ? 'Configured' : usda.status === 'disabled' ? 'Disabled' : 'Not configured'}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-muted line-clamp-2">
            Food composition database calculating nutrition for gram-measured ingredients.
          </p>
          {usda.lastTest && (
            <p className="mt-2 text-xs text-muted">
              Last test: <span className={usda.lastTest.ok ? 'text-primary font-medium' : 'text-danger-fg font-medium'}>
                {usda.lastTest.ok ? `✓ OK (${usda.lastTest.latencyMs}ms)` : `✕ ${usda.lastTest.message || 'Failed'}`}
              </span>
            </p>
          )}
        </Card>

        <Card className="p-4 border-line bg-surface sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PlugZapIcon className="size-4 text-primary" />
              <span className="text-sm font-semibold text-fg">Diagnostic Suite</span>
            </div>
            <Badge variant="neutral">{(status?.functions || []).length} Endpoints</Badge>
          </div>
          <p className="mt-2 text-xs text-muted">
            Live health verification for MySQL, Gemini, USDA, and recommendations.
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-primary font-medium">
              <CheckCircle2Icon className="size-3.5" />
              {(status?.functions || []).filter((f) => f.status === 'ok').length} passing
            </span>
            {(status?.functions || []).filter((f) => f.status === 'failing').length > 0 && (
              <span className="inline-flex items-center gap-1 text-danger-fg font-medium">
                <AlertCircleIcon className="size-3.5" />
                {(status?.functions || []).filter((f) => f.status === 'failing').length} failing
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Navigation View Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
        {[
          { id: 'all', label: 'All API Integrations' },
          { id: 'gemini', label: 'Google Gemini' },
          { id: 'usda', label: 'USDA FoodData' },
          { id: 'functions', label: 'Functions & Verification Table' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleSelectTab(tab.id)}
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-muted text-muted hover:bg-surface hover:text-fg'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: All Integrations View */}
      {activeTab === 'all' && (
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {integrations.map((integ) => (
              <div key={integ.id} id={integ.id} className="scroll-mt-16">
                <IntegrationCard
                  integration={integ}
                  onSave={saveSection}
                  onTest={runTest}
                  isTesting={testingTarget === integ.id}
                />
              </div>
            ))}
          </div>

          <div id="functions-section" className="pt-2">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-fg">Live Function Endpoints & Health Diagnostics</h3>
              <p className="text-xs text-muted">Test individual serverless endpoints or inspect response latencies.</p>
            </div>
            <FunctionsTable
              functions={status?.functions || []}
              onTest={runTest}
              onTestAll={() => testAll()}
              testingTarget={testingTarget}
            />
          </div>
        </div>
      )}

      {/* Tab: Gemini Only */}
      {activeTab === 'gemini' && (
        <div className="max-w-3xl">
          <IntegrationCard
            integration={gemini}
            onSave={saveSection}
            onTest={runTest}
            isTesting={testingTarget === 'gemini'}
          />
        </div>
      )}

      {/* Tab: USDA Only */}
      {activeTab === 'usda' && (
        <div className="max-w-3xl">
          <IntegrationCard
            integration={usda}
            onSave={saveSection}
            onTest={runTest}
            isTesting={testingTarget === 'usda'}
          />
        </div>
      )}

      {/* Tab: Functions & Diagnostics Only */}
      {activeTab === 'functions' && (
        <div className="space-y-4">
          <FunctionsTable
            functions={status?.functions || []}
            onTest={runTest}
            onTestAll={() => testAll()}
            testingTarget={testingTarget}
          />
        </div>
      )}
    </div>
  );
}

