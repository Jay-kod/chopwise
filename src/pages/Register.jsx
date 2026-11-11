import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import AuthCardLayout from '../features/auth/AuthCardLayout';
import { useAuth } from '../features/auth/useAuth';
import { getAuthErrorMessage } from '../features/auth/authErrors';
import VerificationNotice from '../features/auth/VerificationNotice';
import { PasswordToggle, ShieldCheckIcon, UserIcon } from '../features/auth/AuthIcons';
import { ROUTES } from '../lib/routes';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) return setError('Please enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters long.');
    if (password !== confirmPassword) return setError('Passwords do not match. Please re-enter.');
    if (!consent) return setError('You must agree to health information storage to personalise meals.');

    try {
      setLoading(true);
      const res = await register(email, password, consent);
      if (res?.needsEmailVerification) {
        setRegisteredEmail(email.trim());
        setNeedsVerification(true);
      } else {
        navigate(ROUTES.customer.onboarding);
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleResetVerification() {
    setNeedsVerification(false);
    setError('');
  }

  const footer = (
    <div className="pt-2 text-center text-xs sm:text-sm">
      <p className="text-muted">
        Already have an account?{' '}
        <Link
          to={ROUTES.customer.login}
          className="font-semibold text-fg underline underline-offset-4 decoration-auth-accent hover:text-auth-accent transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );

  return (
    <AuthCardLayout
      title="Create an account"
      brandTag="CHOPWISE"
      bannerHeadingPrimary="Healthy"
      bannerHeadingAccent="living."
      bannerSubtitle="Nigerian meals tailored to your health and wallet. Discover budget-friendly, nutritious recipes every day."
      error={error}
      footer={footer}
    >
      {needsVerification ? (
        <VerificationNotice
          email={registeredEmail}
          onReset={handleResetVerification}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="register-email"
            variant="underline"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            rightElement={<UserIcon className="h-4 w-4 text-muted/70" />}
          />

          <Input
            id="register-password"
            variant="underline"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 8 characters)"
            required
            rightElement={
              <PasswordToggle
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                label="password"
              />
            }
          />

          <Input
            id="register-confirm"
            variant="underline"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
            rightElement={
              <PasswordToggle
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                label="confirm password"
              />
            }
          />

          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-field-line accent-header-bg cursor-pointer"
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

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading || !consent}
              className="w-full min-h-12 rounded-full bg-header-bg text-on-primary font-semibold text-sm sm:text-base hover:opacity-95 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                  <span>Creating account…</span>
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      )}
    </AuthCardLayout>
  );
}
