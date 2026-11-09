import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import IntegrationCard from '@/features/admin/IntegrationCard';
import AdminPageHeader from './AdminPageHeader';
import { useAdminContext } from './useAdminContext';

export default function AdminEdamam() {
  const { status, loading, fetchStatus, saveSection, runTest, testingTarget } = useAdminContext();

  const edamam = status?.integrations?.find((i) => i.id === 'edamam') || {
    id: 'edamam',
    name: 'Edamam Food Database',
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edamam Nutrition Integration"
        description="Configure your Edamam Application ID and API key to enable nutrition analysis and ingredient parsing."
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

      <div className="max-w-3xl">
        <IntegrationCard
          integration={edamam}
          onSave={saveSection}
          onTest={runTest}
          isTesting={testingTarget === 'edamam'}
        />
      </div>
    </div>
  );
}
