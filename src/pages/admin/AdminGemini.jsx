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
  const geminiFunction = status?.functions?.find((f) => f.id === 'gemini');
  const enrichedGemini = {
    ...gemini,
    lastTest: gemini.lastTest || geminiFunction?.lastTest || null,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Google Gemini AI Integration"
        description="Configure and test Gemini for Nigerian meal generation, nutrition estimates, and general food feedback on customer meal details."
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
          integration={enrichedGemini}
          onSave={saveSection}
          onTest={runTest}
          isTesting={testingTarget === 'gemini'}
        />
      </div>
    </div>
  );
}
