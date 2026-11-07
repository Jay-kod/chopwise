import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import Spinner from '../components/Spinner';

/**
 * Route guard that requires the user to be signed in.
 * Redirects unauthenticated visitors to /login preserving the intended destination.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Verifying session…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

