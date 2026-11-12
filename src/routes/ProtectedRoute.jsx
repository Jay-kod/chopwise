import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { ROUTES } from '../lib/routes';

/**
 * Route guard that requires the user to be signed in.
 * Redirects unauthenticated visitors to customer sign-in preserving their destination.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to={ROUTES.customer.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
