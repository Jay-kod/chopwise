import { useState } from 'react';
import AdminPageHeader from './AdminPageHeader';
import { useAdminActions } from '@/features/admin/useAdminActions';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ErrorState from '@/components/ErrorState';
import ConfirmModal from '@/components/ConfirmModal';

const ACTIONS = {
  clearNutritionCache: {
    title: 'Clear nutrition cache?',
    message: 'Cached nutrition results will be removed. They will be fetched or recalculated when requested again.',
    confirmText: 'Clear cache',
    successText: 'Nutrition cache cleared.',
  },
  resetRateLimits: {
    title: 'Reset rate limits?',
    message: 'Current recommendation rate-limit counters will be removed. Customer accounts and saved data are unchanged.',
    confirmText: 'Reset limits',
    successText: 'Rate limits reset.',
  },
};

function MaintenanceAction({ title, description, onClick, pending, buttonText }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-semibold text-fg">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
      <Button type="button" variant="secondary" onClick={onClick} disabled={pending} className="shrink-0">
        {pending ? 'Working…' : buttonText}
      </Button>
    </div>
  );
}

export default function AdminMaintenance() {
  const { run, pendingAction, error } = useAdminActions();
  const [confirmAction, setConfirmAction] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  async function runMaintenance() {
    if (!confirmAction) return;
    const action = confirmAction;
    const result = await run(action);
    if (result) {
      setResultMessage(`${ACTIONS[action].successText} ${result.deletedCount} records affected.`);
      setConfirmAction('');
    }
  }

  const selectedAction = ACTIONS[confirmAction];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Maintenance" description="Only bounded cache and rate-limit cleanup is available. Customer records and saved data are never deleted." />
      <Card className="flex flex-col gap-4">
        <MaintenanceAction
          title="Nutrition cache"
          description="Remove cached nutrition analysis results; they can be recalculated on demand."
          onClick={() => { setResultMessage(''); setConfirmAction('clearNutritionCache'); }}
          pending={pendingAction === 'clearNutritionCache'}
          buttonText="Clear cache"
        />
        <MaintenanceAction
          title="Recommendation rate limits"
          description="Clear current request counters without changing customer accounts or meal data."
          onClick={() => { setResultMessage(''); setConfirmAction('resetRateLimits'); }}
          pending={pendingAction === 'resetRateLimits'}
          buttonText="Reset limits"
        />
        {error && <ErrorState message={error} />}
        {resultMessage && <p role="status" className="text-sm text-primary">{resultMessage}</p>}
      </Card>
      <ConfirmModal
        isOpen={Boolean(selectedAction)}
        onClose={() => setConfirmAction('')}
        onConfirm={runMaintenance}
        title={selectedAction?.title}
        message={selectedAction?.message}
        confirmText={selectedAction?.confirmText}
        variant="danger"
        loading={Boolean(pendingAction)}
      />
    </div>
  );
}
