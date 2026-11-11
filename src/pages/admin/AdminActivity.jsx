import { useCallback, useEffect, useState } from 'react';
import AdminPageHeader from './AdminPageHeader';
import { useAdminActions } from '@/features/admin/useAdminActions';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PAGE_SIZE = 25;

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

function formatEntityId(item) {
  if (item.entityId?.includes('@')) return '—';
  return item.entityId || '—';
}

function formatDetails(details) {
  return Object.entries(details || {}).map(([key, value]) => `${key}: ${String(value)}`).join(', ') || '—';
}

function ActivityTable({ items }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Action</TableHead>
          <TableHead>Record type</TableHead>
          <TableHead>Record ID</TableHead>
          <TableHead>Change details</TableHead>
          <TableHead>Administrator ID</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium text-fg">{item.action}</TableCell>
            <TableCell>{item.entityType}</TableCell>
            <TableCell className="max-w-40 truncate">{formatEntityId(item)}</TableCell>
            <TableCell className="max-w-56 truncate">{formatDetails(item.details)}</TableCell>
            <TableCell className="max-w-40 truncate">{item.actorId}</TableCell>
            <TableCell>{formatDate(item.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ActivityPagination({ offset, total, loading, onPageChange }) {
  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm text-muted">
      <span>{total} events</span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => onPageChange(Math.max(0, offset - PAGE_SIZE))} disabled={loading || offset === 0} className="min-h-9 px-3 text-xs">Previous</Button>
        <span>Page {pageNumber} of {pageCount}</span>
        <Button variant="secondary" onClick={() => onPageChange(offset + PAGE_SIZE)} disabled={loading || offset + PAGE_SIZE >= total} className="min-h-9 px-3 text-xs">Next</Button>
      </div>
    </div>
  );
}

export default function AdminActivity() {
  const { run, error } = useAdminActions();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadActivity = useCallback(async () => {
    setLoading(true);
    const data = await run('listActivity', { offset, limit: PAGE_SIZE });
    if (data) {
      setItems(data.items);
      setTotal(data.total);
    }
    setLoading(false);
  }, [offset, run]);

  useEffect(() => { loadActivity(); }, [loadActivity]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Activity History" description="Read-only audit history of administrator changes and maintenance actions. Sensitive values are not displayed." />
      <Card>
        {error && <ErrorState message={error} onRetry={loadActivity} className="mb-4" />}
        {loading ? <div className="flex justify-center p-8"><Spinner label="Loading activity…" /></div>
          : items.length ? <ActivityTable items={items} />
            : <EmptyState title="No activity recorded" message="Successful administrator changes will appear here." />}
        <ActivityPagination offset={offset} total={total} loading={loading} onPageChange={setOffset} />
      </Card>
    </div>
  );
}
