import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import Spinner from '../components/Spinner';

/**
 * Route guard managing onboarding completion state.
 * - Incomplete profiles visiting protected areas get directed to /onboarding.
 * - Completed profiles visiting /onboarding are forwarded to /dashboard.
 * @param {{ allowIncomplete?: boolean }} props
 */
export default function ProfileGate({ allowIncomplete = false }) {
  const { user, profileComplete, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Loading profile…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Profile is complete, but attempting to access onboarding flow
  if (profileComplete && allowIncomplete) {
    return <Navigate to="/dashboard" replace />;
  }

  // Profile is incomplete, but attempting to access regular dashboard/app routes
  if (!profileComplete && !allowIncomplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

