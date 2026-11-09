import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import SettingsForm from '@/features/admin/SettingsForm';
import BrandingSettingsCard from '@/features/admin/BrandingSettingsCard';
import AdminPageHeader from './AdminPageHeader';
import { useAdminContext } from './useAdminContext';

export default function AdminSettings() {
  const { status, loading, fetchStatus, saveSection, resetConfigSection } = useAdminContext();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Recommendation & Branding Settings"
        description="Configure default meal plan parameters, AI temperature, budget tolerance thresholds, and platform branding."
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

      <div className="space-y-6 max-w-4xl">
        <BrandingSettingsCard
          settings={status?.settings}
          onSave={saveSection}
        />

        <SettingsForm
          settings={status?.settings}
          onSave={saveSection}
          onReset={resetConfigSection}
        />
      </div>
    </div>
  );
}
