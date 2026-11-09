import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import FunctionsTable from '@/features/admin/FunctionsTable';
import AdminPageHeader from './AdminPageHeader';
import { useAdminContext } from './useAdminContext';

export default function AdminFunctions() {
  const { status, loading, fetchStatus, runTest, testAll, testingTarget } = useAdminContext();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Functions & APIs"
        description="Monitor serverless function status, execution latency, and run live verification tests across all endpoints."
        actions={
          <Button
            variant="secondary"
            onClick={fetchStatus}
            disabled={loading}
            className="text-xs min-h-9 px-3"
          >
            {loading ? <Spinner label="Refreshing…" /> : '↻ Refresh Status'}
          </Button>
        }
      />

      <FunctionsTable
        functions={status?.functions || []}
        onTest={runTest}
        onTestAll={() => testAll()}
        testingTarget={testingTarget}
      />
    </div>
  );
}
