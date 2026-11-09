import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import PriceTableEditor from '@/features/admin/PriceTableEditor';
import AdminPageHeader from './AdminPageHeader';
import { useAdminContext } from './useAdminContext';

export default function AdminPrices() {
  const { status, loading, fetchStatus, saveSection, resetConfigSection } = useAdminContext();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Ingredient Market Prices"
        description="Nigerian ingredient benchmark prices (in ₦ per 100g) referenced during budget adherence calculation."
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

      <PriceTableEditor
        prices={status?.prices}
        onSave={saveSection}
        onReset={resetConfigSection}
      />
    </div>
  );
}
