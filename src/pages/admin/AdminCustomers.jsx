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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const PAGE_SIZE = 25;

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : '—';
}

export default function AdminCustomers() {
  const { run, pendingAction, error, setError } = useAdminActions();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [statusTarget, setStatusTarget] = useState(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    const data = await run('listCustomers', { search, offset, limit: PAGE_SIZE });
    if (data) {
      setCustomers(data.items);
      setTotal(data.total);
    }
    setLoading(false);
  }, [offset, run, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  async function saveEmail(event) {
    event.preventDefault();
    const result = await run('updateCustomer', { userId: editingId, email: emailDraft });
    if (result) {
      setEditingId('');
      await loadCustomers();
    }
  }

  async function updateActiveStatus() {
    if (!statusTarget) return;
    const result = await run('setCustomerActive', {
      userId: statusTarget.id,
      active: !statusTarget.active,
    });
    if (result) {
      setStatusTarget(null);
      await loadCustomers();
    }
  }

  function searchCustomers(event) {
    event.preventDefault();
    setOffset(0);
    setSearch(searchInput.trim());
  }

  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Customer Accounts"
        description="Manage account email and access status. Health profiles, passwords, and password hashes are not available here."
      />
      <Card>
        <form onSubmit={searchCustomers} className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            id="customer-search"
            label="Search customers"
            placeholder="Email or account ID"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            maxLength={100}
          />
          <Button type="submit" disabled={loading} className="sm:min-w-28">Search</Button>
        </form>

        {error && <ErrorState message={error} onRetry={loadCustomers} className="mb-4" />}
        {loading ? (
          <div className="flex justify-center p-8"><Spinner label="Loading customer accounts…" /></div>
        ) : customers.length === 0 ? (
          <EmptyState title="No customer accounts found" message="Try a different search or check back after customers register." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Account created</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    {editingId === customer.id ? (
                      <form onSubmit={saveEmail} className="flex min-w-64 items-end gap-2">
                        <Input
                          id={`email-${customer.id}`}
                          aria-label="Customer email"
                          type="email"
                          value={emailDraft}
                          onChange={(event) => setEmailDraft(event.target.value)}
                          required
                          maxLength={255}
                        />
                        <Button type="submit" disabled={pendingAction === 'updateCustomer'} className="min-h-10 px-3">
                          {pendingAction === 'updateCustomer' ? <Spinner label="Saving…" /> : 'Save'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setEditingId('')} className="min-h-10 px-3">
                          Cancel
                        </Button>
                      </form>
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-semibold text-fg">{customer.name || customer.email.split('@')[0]}</span>
                        <span className="text-xs text-muted">{customer.email}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell>{customer.profileComplete ? 'Complete' : 'Incomplete'}</TableCell>
                  <TableCell>
                    <Badge variant={customer.active ? 'ok' : 'warning'}>
                      {customer.active ? 'Active' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingId !== customer.id && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setError('');
                            setEditingId(customer.id);
                            setEmailDraft(customer.email);
                          }}
                          className="min-h-9 px-3 text-xs"
                        >
                          Edit email
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant={customer.active ? 'danger' : 'secondary'}
                        onClick={() => setStatusTarget(customer)}
                        disabled={pendingAction === 'setCustomerActive'}
                        className="min-h-9 px-3 text-xs"
                      >
                        {customer.active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm text-muted">
          <span>{total} customer accounts</span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={loading || offset === 0}
              className="min-h-9 px-3 text-xs"
            >
              Previous
            </Button>
            <span>Page {pageNumber} of {pageCount}</span>
            <Button
              variant="secondary"
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={loading || offset + PAGE_SIZE >= total}
              className="min-h-9 px-3 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmModal
        isOpen={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        onConfirm={updateActiveStatus}
        title={statusTarget?.active ? 'Disable this account?' : 'Enable this account?'}
        message={statusTarget?.active
          ? 'The customer will be signed out on their next request. You can enable the account again later.'
          : 'The customer will be able to sign in and use their account again.'}
        confirmText={statusTarget?.active ? 'Disable account' : 'Enable account'}
        variant={statusTarget?.active ? 'danger' : 'primary'}
        loading={pendingAction === 'setCustomerActive'}
      />
    </div>
  );
}
