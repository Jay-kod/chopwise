import { Outlet, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';
import ErrorState from '@/components/ErrorState';
import AdminSkeleton from '@/features/admin/AdminSkeleton';
import { useAdminApi } from '@/features/admin/useAdminApi';

export default function AdminLayout() {
  const location = useLocation();
  const adminApi = useAdminApi();
  const { status, loading, error, fetchStatus } = adminApi;

  if (loading && !status) {
    return (
      <AppShell pathname={location.pathname}>
        <AdminSkeleton />
      </AppShell>
    );
  }

  if (error && !status) {
    return (
      <AppShell pathname={location.pathname}>
        <div className="mx-auto max-w-lg py-12">
          <ErrorState message={error} onRetry={fetchStatus} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pathname={location.pathname}>
      <Outlet context={adminApi} />
    </AppShell>
  );
}
