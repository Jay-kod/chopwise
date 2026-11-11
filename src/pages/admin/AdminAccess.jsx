import { useCallback, useEffect, useState } from 'react';
import AdminPageHeader from './AdminPageHeader';
import { useAdminActions } from '@/features/admin/useAdminActions';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Badge from '@/components/Badge';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import ConfirmModal from '@/components/ConfirmModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function BootstrapConfigCard({ bootstrapUids, bootstrapSource, onSave, pending }) {
  const [uids, setUids] = useState(bootstrapUids || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setUids(bootstrapUids || '');
  }, [bootstrapUids]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSavedSuccess(false);
    const ok = await onSave(uids);
    if (ok) setSavedSuccess(true);
  }

  const isConfigured = Boolean(bootstrapUids && bootstrapUids.trim());

  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-fg">Bootstrap Administrator IDs (ADMIN_UIDS)</h2>
          <p className="text-xs text-muted">
            Configure permanent bootstrap administrator accounts. Accounts listed here are protected and cannot be revoked.
          </p>
        </div>
        <Badge variant={isConfigured ? 'ok' : 'warning'}>
          {isConfigured ? `Configured (${bootstrapSource})` : 'Missing'}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          id="bootstrap-uids"
          label="Bootstrap Account IDs (comma-separated)"
          value={uids}
          onChange={(e) => setUids(e.target.value)}
          placeholder="e.g. test-admin-001, test-user-001"
          required
        />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-muted">Quick add:</span>
            <button
              type="button"
              onClick={() => {
                const parts = uids.split(',').map((s) => s.trim()).filter(Boolean);
                if (!parts.includes('test-admin-001')) parts.push('test-admin-001');
                setUids(parts.join(', '));
              }}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-fg hover:bg-surface transition-colors cursor-pointer"
            >
              <span>⚡ test-admin-001 (Test Admin)</span>
            </button>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? <Spinner label="Saving…" /> : 'Save Bootstrap IDs'}
          </Button>
        </div>

        {savedSuccess && (
          <p role="status" className="mt-2 text-xs font-semibold text-primary">
            ✓ Bootstrap administrator IDs saved to database successfully. The checklist has been updated.
          </p>
        )}
      </form>
    </Card>
  );
}

function AdminsTable({ items, onRevoke, pending }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account</TableHead>
          <TableHead>Access type</TableHead>
          <TableHead>Granted / created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((admin) => (
          <TableRow key={admin.id}>
            <TableCell>
              <p className="font-medium text-fg">{admin.email || 'Email unavailable'}</p>
              <p className="max-w-56 truncate text-xs text-muted">{admin.id}</p>
            </TableCell>
            <TableCell><Badge variant={admin.bootstrap ? 'ok' : 'neutral'}>{admin.bootstrap ? 'Protected bootstrap' : 'Managed role'}</Badge></TableCell>
            <TableCell>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}</TableCell>
            <TableCell className="text-right">
              {!admin.bootstrap && (
                <Button type="button" variant="danger" onClick={() => onRevoke(admin)} disabled={pending} className="min-h-9 px-3 text-xs">
                  Revoke access
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AdminAccess() {
  const { run, pendingAction, error, setError } = useAdminActions();
  const [admins, setAdmins] = useState([]);
  const [bootstrapUids, setBootstrapUids] = useState('');
  const [bootstrapSource, setBootstrapSource] = useState('none');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [success, setSuccess] = useState('');

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    const data = await run('listAdmins');
    if (data) {
      setAdmins(data.items || []);
      setBootstrapUids(data.bootstrapUids || '');
      setBootstrapSource(data.bootstrapSource || 'none');
    }
    setLoading(false);
  }, [run]);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  async function grantAccess(event) {
    event.preventDefault();
    setSuccess('');
    const result = await run('grantAdmin', { email });
    if (result) {
      setEmail('');
      setSuccess('Administrator access granted.');
      await loadAdmins();
    }
  }

  async function handleSaveBootstrap(uids) {
    setSuccess('');
    const result = await run('saveBootstrapAdminIds', { uids });
    if (result) {
      await loadAdmins();
      return true;
    }
    return false;
  }

  async function revokeAccess() {
    if (!revokeTarget) return;
    const result = await run('revokeAdmin', { userId: revokeTarget.id });
    if (result) {
      setRevokeTarget(null);
      setSuccess('Administrator access revoked.');
      await loadAdmins();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Administrator Access"
        description="Manage bootstrap administrator IDs and grant access to existing accounts. Bootstrap administrators are protected platform owners."
      />

      <BootstrapConfigCard
        bootstrapUids={bootstrapUids}
        bootstrapSource={bootstrapSource}
        onSave={handleSaveBootstrap}
        pending={pendingAction === 'saveBootstrapAdminIds'}
      />

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-fg">Grant administrator access</h2>
        <form onSubmit={grantAccess} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input id="admin-email" type="email" label="Registered account email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={255} />
          <Button type="submit" disabled={pendingAction === 'grantAdmin'}>{pendingAction === 'grantAdmin' ? <Spinner label="Granting…" /> : 'Grant access'}</Button>
        </form>
        <p className="mt-2 text-xs text-muted">The account must already be registered and active. Admin-created customer accounts are not supported.</p>
        {error && <ErrorState message={error} className="mt-4" />}
        {success && <p role="status" className="mt-4 text-sm text-primary">{success}</p>}
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-fg">Current administrators</h2>
        {loading ? <div className="flex justify-center p-8"><Spinner label="Loading administrators…" /></div>
          : admins.length ? <AdminsTable items={admins} onRevoke={(admin) => { setError(''); setSuccess(''); setRevokeTarget(admin); }} pending={pendingAction === 'revokeAdmin'} />
            : <EmptyState title="No administrators found" message="Bootstrap and managed administrators appear here." />}
      </Card>

      <ConfirmModal
        isOpen={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        onConfirm={revokeAccess}
        title="Revoke administrator access?"
        message={`This removes the managed admin role for ${revokeTarget?.email || 'this account'}. The account remains active as a customer.`}
        confirmText="Revoke access"
        variant="danger"
        loading={pendingAction === 'revokeAdmin'}
      />
    </div>
  );
}
