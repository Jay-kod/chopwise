import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import IntegrationCard from '@/features/admin/IntegrationCard';
import AdminPageHeader from './AdminPageHeader';
import { useAdminContext } from './useAdminContext';

export default function AdminUsda() {
  const { status, loading, fetchStatus, saveSection, runTest, testingTarget } = useAdminContext();

  const usda = status?.integrations?.find((i) => i.id === 'usda') || {
    id: 'usda',
    name: 'USDA FoodData Central',
  };
  const usdaFunction = status?.functions?.find((f) => f.id === 'usda');
  const enrichedUsda = {
    ...usda,
    lastTest: usda.lastTest || usdaFunction?.lastTest || null,
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="USDA FoodData Central"
        description="Configure a USDA API key to look up food composition data for gram-measured recipe ingredients."
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
          integration={enrichedUsda}
          onSave={saveSection}
          onTest={runTest}
          isTesting={testingTarget === 'usda'}
        />
      </div>
    </div>
  );
}
