import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { apiClient } from '../lib/apiClient';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Card from '../components/Card';
import { ROUTES } from '../lib/routes';

/**
 * Route guard for admin pages.
 * Authenticates user and checks server-side admin authority.
 */
export default function AdminRoute() {
  const { user, loading: authLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(() => (user?.isAdmin ? true : null));
  const [checking, setChecking] = useState(() => (user?.isAdmin ? false : true));

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

      if (user.isAdmin) {
        if (isMounted) {
          setIsAdmin(true);
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

  if (authLoading || (checking && !user?.isAdmin)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Verifying admin credentials…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.admin.login} replace state={{ from: location }} />;
  }

  if (!isAdmin && !user?.isAdmin) {
    return (
      <div className="mx-auto max-w-lg py-16 px-4">
        <Card className="p-6 text-center space-y-4 shadow-md">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-warn-bg text-warn-fg text-2xl font-bold">
            🛡️
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-fg">Administrator Access Required</h2>
            <p className="text-xs text-muted leading-relaxed">
              You are signed in as <span className="font-semibold text-fg">{user.name || user.email}</span>, which does not have administrator privileges. Only administrators can create recipes, configure API keys, and manage system settings.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={async () => {
                await logout();
                navigate(ROUTES.admin.login, { replace: true });
              }}
              className="text-xs min-h-9 px-4 w-full sm:w-auto"
            >
              Sign In as Administrator
            </Button>
            <Link to={ROUTES.customer.dashboard} className="w-full sm:w-auto">
              <Button variant="secondary" className="text-xs min-h-9 px-4 w-full sm:w-auto">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <Outlet />;
}
