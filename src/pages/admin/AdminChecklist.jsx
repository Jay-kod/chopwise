import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import BootstrapChecklist from '@/features/admin/BootstrapChecklist';
import AdminPageHeader from './AdminPageHeader';
import { useAdminContext } from './useAdminContext';

export default function AdminChecklist() {
  const { status, loading, fetchStatus } = useAdminContext();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Setup & Readiness Checklist"
        description="Verify backend deployment health, Firestore collections, index coverage, and third-party API credentials."
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
        <BootstrapChecklist bootstrap={status?.bootstrap} />
      </div>
    </div>
  );
}
