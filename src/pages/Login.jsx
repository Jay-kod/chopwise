import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../features/auth/useAuth';
import { getAuthErrorMessage } from '../features/auth/authErrors';
import { APP_NAME, APP_TAGLINE } from '../lib/constants';
import {
  EyeIcon,
  EyeOffIcon,
  ExclamationIcon,
  LockIcon,
} from '../features/auth/AuthIcons';

const TEST_ACCOUNTS = [
  { label: 'Test User', email: 'chop1@test.com' },
  { label: 'Test Admin', email: 'adminchop@test.com' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/onboarding';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function selectTestAccount(email) {
    setEmail(email);
    setPassword('');
    setError('');
  }

  return (
    <Layout hideHeader={true} hideFooter={true}>
      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-4 px-4 sm:px-6">
        {/* Floating Theme Toggle (top-right corner, no header needed) */}
        <div className="absolute top-0 right-0 sm:top-2 sm:right-2">
          <ThemeToggle />
        </div>

        {/* Auth Container */}
        <div className="w-full max-w-md mx-auto space-y-5">
          {/* Brand Header */}
          <div className="text-center space-y-1">
            <Link
              to="/"
              aria-label={`${APP_NAME} home`}
              className="inline-flex items-center gap-2 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1"
            >
              <Logo className="text-2xl" />
            </Link>
            <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
              {APP_TAGLINE}
            </p>
          </div>

          <Card className="rounded-2xl border-line p-6 sm:p-7 shadow-sm">
            {/* Log in / Sign up Segmented Toggle */}
            <div className="grid grid-cols-2 p-1 bg-surface-muted rounded-xl mb-5 border border-line">
              <div className="py-2 text-center text-xs font-semibold rounded-lg bg-surface text-fg shadow-xs border border-field-line">
                Log in
              </div>
              <Link
                to="/register"
                className="py-2 text-center text-xs font-semibold rounded-lg text-muted hover:text-fg hover:bg-surface/50 transition-colors"
              >
                Sign up
              </Link>
            </div>

            <div className="mb-5 space-y-0.5">
              <h1 className="text-xl font-bold tracking-tight text-fg">
                Welcome back
              </h1>
              <p className="text-xs text-muted">
                Log in to view and generate your personalized Nigerian meals.
              </p>
            </div>

            {error && (
              <div
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-danger-line bg-danger-bg p-3 text-xs text-danger-fg"
                role="alert"
              >
                <ExclamationIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger-fg" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="login-email"
                label="Email address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <Input
                id="login-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:text-fg hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
              />

              <Button
                type="submit"
                className="w-full min-h-11 font-semibold text-sm"
                disabled={loading}
              >
                {loading ? <Spinner label="Logging in…" /> : 'Log in'}
              </Button>
            </form>

            <section
              className="mt-5 border-t border-line pt-4"
              aria-labelledby="test-login-heading"
            >
              <h2
                id="test-login-heading"
                className="text-sm font-semibold text-fg"
              >
                Testing accounts
              </h2>
              <p className="mt-1 text-xs text-muted">
                Choose an account to fill its email. Enter its password to log in.
              </p>
              <div className="mt-3 grid gap-2">
                {TEST_ACCOUNTS.map((account) => (
                  <Button
                    key={account.email}
                    type="button"
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() => selectTestAccount(account.email)}
                  >
                    {account.label} · {account.email}
                  </Button>
                ))}
              </div>
            </section>

            <div className="mt-5 pt-4 border-t border-line text-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-muted">
                <LockIcon />
                <span>Encrypted session • Nigerian dietary guidance</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
