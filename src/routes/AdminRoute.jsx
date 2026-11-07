import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { apiClient } from '../lib/apiClient';
import Spinner from '../components/Spinner';
import NotFound from '../pages/NotFound';

/**
 * Route guard for /admin.
 * Authenticates user and checks server-side admin authority.
 * Non-admins are shown NotFound per docs/ADMIN_PAGE_SPEC.md.
 */
export default function AdminRoute() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAdmin() {
      if (!user) {
        if (isMounted) {
          setIsAdmin(false);
          setChecking(false);
        }
        return;
      }

      try {
        const res = await apiClient('/api/admin', { action: 'me' });
        if (isMounted) {
          setIsAdmin(Boolean(res?.isAdmin));
          setChecking(false);
        }
      } catch {
        if (isMounted) {
          setIsAdmin(false);
          setChecking(false);
        }
      }
    }

    if (!authLoading) {
      checkAdmin();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Verifying admin credentials…" />
      </div>
    );
  }

  if (!isAdmin) {
    return <NotFound />;
  }

  return <Outlet />;
}
