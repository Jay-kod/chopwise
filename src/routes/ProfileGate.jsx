import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { ROUTES } from '../lib/routes';

/**
 * Route guard managing onboarding completion state.
 * - Incomplete profiles visiting protected areas get directed to customer onboarding.
 * - Completed profiles visiting onboarding are forwarded to the customer dashboard.
 * @param {{ allowIncomplete?: boolean }} props
 */
export default function ProfileGate({ allowIncomplete = false }) {
  const { user, profileComplete, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to={ROUTES.customer.login} replace />;
  }

  // Profile is complete, but attempting to access onboarding flow
  if (profileComplete && allowIncomplete) {
    return <Navigate to={ROUTES.customer.dashboard} replace />;
  }

  // Profile is incomplete, but attempting to access regular dashboard/app routes
  if (!profileComplete && !allowIncomplete) {
    return <Navigate to={ROUTES.customer.onboarding} replace />;
  }

  return <Outlet />;
}
