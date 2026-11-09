import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import IntegrationCard from '@/features/admin/IntegrationCard';
import AdminPageHeader from './AdminPageHeader';
import { useAdminContext } from './useAdminContext';

export default function AdminGemini() {
  const { status, loading, fetchStatus, saveSection, runTest, testingTarget } = useAdminContext();

  const gemini = status?.integrations?.find((i) => i.id === 'gemini') || {
    id: 'gemini',
    name: 'Google Gemini',
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Google Gemini AI Integration"
        description="Configure your Gemini API key, model target, and run latency tests for Nigerian meal plan generation."
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
          integration={gemini}
          onSave={saveSection}
          onTest={runTest}
          isTesting={testingTarget === 'gemini'}
        />
      </div>
    </div>
  );
}
