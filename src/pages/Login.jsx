import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import AuthCardLayout from '../features/auth/AuthCardLayout';
import { useAuth } from '../features/auth/useAuth';
import { getAuthErrorMessage } from '../features/auth/authErrors';
import { apiClient } from '../lib/apiClient';
import { ROUTES } from '../lib/routes';
import { PasswordToggle, UserIcon } from '../features/auth/AuthIcons';

const TEST_CREDENTIALS = {
  user: { label: 'Customer test login', email: 'chop1@test.com', password: 'password1' },
  admin: { label: 'Administrator test login', email: 'adminchop@test.com', password: 'password1' },
};

function TestCredentialsButton({ account, onFill }) {
  return (
    <button
      type="button"
      onClick={onFill}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-field-line bg-surface/90 px-4 py-1.5 text-xs font-semibold text-fg shadow-xs transition-colors hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title={`Fill credentials for ${account.email}`}
    >
      <span className="font-bold text-primary">⚡</span>
      <span>Fill Test Credentials</span>
    </button>
  );
}

export default function Login({ adminOnly = false }) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const testAccount = adminOnly ? TEST_CREDENTIALS.admin : TEST_CREDENTIALS.user;

  useEffect(() => {
    if (user && !loading && !redirecting) {
      if (adminOnly) {
        if (user.isAdmin) {
          navigate(ROUTES.admin.dashboard, { replace: true });
        }
      } else {
        const dest =
          location.state?.from?.pathname ||
          (user.profileComplete ? ROUTES.customer.dashboard : ROUTES.customer.onboarding);
        navigate(dest, { replace: true });
      }
    }
  }, [user, loading, redirecting, adminOnly, location.state, navigate]);

  function handleFillTest() {
    setEmail(testAccount.email);
    setPassword(testAccount.password);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await login(email, password);
      if (adminOnly) {
        const status = await apiClient('/api/admin', { action: 'me' });
        if (!status?.isAdmin) {
          await logout();
          setError('This account does not have administrator access.');
          setLoading(false);
          return;
        }
        setRedirecting(true);
        navigate(ROUTES.admin.dashboard, { replace: true });
        return;
      }

      setRedirecting(true);
      const dest =
        location.state?.from?.pathname ||
        (loggedUser?.profileComplete ? ROUTES.customer.dashboard : ROUTES.customer.onboarding);
      navigate(dest, { replace: true });
    } catch (err) {
      if (adminOnly) await logout();
      setError(getAuthErrorMessage(err));
      setLoading(false);
    }
  }

  const footer = (
    <div className="flex flex-col items-center gap-2 pt-1 text-center text-xs sm:text-sm">
      {adminOnly ? (
        <>
          <p className="text-muted">
            Not an administrator?{' '}
            <Link to={ROUTES.customer.login} className="font-semibold text-fg underline underline-offset-4 decoration-auth-accent hover:text-auth-accent transition-colors">
              User sign in
            </Link>
          </p>
          <TestCredentialsButton account={testAccount} onFill={handleFillTest} />
        </>
      ) : (
        <>
          <p className="text-muted">
            New to ChopWise?{' '}
            <Link to={ROUTES.customer.register} className="font-semibold text-fg underline underline-offset-4 decoration-auth-accent hover:text-auth-accent transition-colors">
              Create an account
            </Link>
          </p>
          <p className="text-xs text-muted">
            Administrator?{' '}
            <Link to={ROUTES.admin.login} className="font-medium text-muted hover:text-fg underline transition-colors">
              Admin sign in
            </Link>
          </p>
          <TestCredentialsButton account={testAccount} onFill={handleFillTest} />
        </>
      )}
    </div>
  );

  return (
    <>
      <AuthCardLayout
        hideHeader={true}
        title={adminOnly ? 'Admin sign in' : 'Sign in'}
        brandTag={adminOnly ? 'CHOPWISE ADMIN' : 'CHOPWISE'}
        bannerHeadingPrimary={adminOnly ? 'System' : 'Welcome'}
        bannerHeadingAccent={adminOnly ? 'portal.' : 'back.'}
        bannerSubtitle={
          adminOnly
            ? 'Manage recipes, price indexes, safety constraints, and administrative access.'
            : 'Your meal plans, budget tracking, and health preferences are exactly where you left them.'
        }
        error={error}
        footer={footer}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-email"
            variant="underline"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Username or email"
            required
            rightElement={<UserIcon className="h-4 w-4 text-muted/70" />}
          />

          <Input
            id="login-password"
            variant="underline"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            rightElement={
              <PasswordToggle
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                label="password"
              />
            }
          />

          <div className="flex items-center justify-between pt-1 text-xs sm:text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="h-4 w-4 rounded border-field-line accent-header-bg cursor-pointer"
              />
              <span className="text-muted font-medium">Keep me signed in</span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="font-medium text-auth-accent hover:text-auth-accent-hover underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Forgot password?
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || redirecting}
              className="w-full min-h-11 sm:min-h-12 rounded-full bg-header-bg text-on-primary font-semibold text-sm sm:text-base hover:opacity-95 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {loading || redirecting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                  <span>Authenticating…</span>
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </AuthCardLayout>

      {/* Forgot Password Information Dialog */}
      {showForgotModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-fg">Password Recovery</h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              In accordance with academic testing guidelines, automated password reset flows are managed directly by the system administrator.
            </p>
            <p className="text-xs text-muted">
              For testing, please use the test credentials provided via the quick-fill button below the form or contact your administrator.
            </p>
            <div className="pt-2 flex justify-end">
              <button type="button" onClick={() => setShowForgotModal(false)} className="px-4 py-2 rounded-full bg-header-bg text-on-primary text-xs font-semibold hover:opacity-90">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
