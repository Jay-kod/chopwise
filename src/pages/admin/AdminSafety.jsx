import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import SafetyForm from '@/features/admin/SafetyForm';
import AdminPageHeader from './AdminPageHeader';
import { useAdminContext } from './useAdminContext';

export default function AdminSafety() {
  const { status, loading, fetchStatus, saveSection, resetConfigSection } = useAdminContext();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Medical Safety Thresholds"
        description="Clinical maximum limits for sodium, carbohydrates, potassium, and phosphorus tailored for chronic condition contraindication checks."
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

      <div className="max-w-4xl">
        <SafetyForm
          safety={status?.safety}
          onSave={saveSection}
          onReset={resetConfigSection}
        />
      </div>
    </div>
  );
}
