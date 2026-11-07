import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../features/auth/useAuth';
import { getAuthErrorMessage } from '../features/auth/authErrors';
import { useAppConfig } from '../context/ConfigContext';
import {
  EyeIcon,
  EyeOffIcon,
  ExclamationIcon,
  ShieldCheckIcon,
  LockIcon,
} from '../features/auth/AuthIcons';

export default function Register() {
  const { register } = useAuth();
  const { appName, appTagline } = useAppConfig();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!consent) {
      setError('You must agree to health information storage to personalise meals.');
      return;
    }

    try {
      setLoading(true);
      await register(email, password, consent);
      navigate('/onboarding');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout hideHeader={true} hideFooter={true}>
      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-4 px-4 sm:px-6">
        {/* Floating Theme Toggle (top-right corner) */}
        <div className="absolute top-0 right-0 sm:top-2 sm:right-2">
          <ThemeToggle />
        </div>

        {/* Auth Container */}
        <div className="w-full max-w-md mx-auto space-y-5">
          {/* Brand Header */}
          <div className="text-center space-y-1">
            <Link
              to="/"
              aria-label={`${appName || 'ChopWise'} home`}
              className="inline-flex items-center gap-2 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1"
            >
              <Logo className="text-2xl" />
            </Link>
            <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
              {appTagline}
            </p>
          </div>

          <Card className="rounded-2xl border-line p-6 sm:p-8 shadow-sm">
            <div className="mb-6 space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
                Create your account
              </h1>
              <p className="text-xs sm:text-sm text-muted">
                Start getting Nigerian recipes tailored to your health and wallet.
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Input
                id="register-email"
                label="Email address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <Input
                id="register-password"
                label="Password (min. 8 characters)"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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

              <Input
                id="register-confirm"
                label="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:text-fg hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
              />

              <div className="rounded-xl border border-line bg-surface-muted p-3">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-field-line text-primary focus:ring-ring"
                    required
                  />
                  <div className="space-y-0.5 text-xs text-fg">
                    <span className="font-semibold flex items-center gap-1.5">
                      <ShieldCheckIcon className="h-3.5 w-3.5 text-primary" />
                      Health Data Consent
                    </span>
                    <p className="text-muted leading-relaxed text-[11px]">
                      I agree to my health information being stored securely to personalize my Nigerian meal recommendations.
                    </p>
                  </div>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full min-h-11 font-semibold text-sm"
                disabled={loading || !consent}
              >
                {loading ? <Spinner label="Creating account…" /> : 'Sign up'}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-line text-center space-y-3">
              <p className="text-xs sm:text-sm text-muted">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary underline hover:text-primary-hover focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  Log in
                </Link>
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-muted">
                <LockIcon />
                <span>Encrypted health profile • General guidance only</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
