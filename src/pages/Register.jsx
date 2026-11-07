import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { useAuth } from '../features/auth/useAuth';
import { getAuthErrorMessage } from '../features/auth/authErrors';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    <Layout>
      <div className="mx-auto max-w-md py-6 sm:py-12">
        <Card className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-fg">Create your account</h1>
            <p className="mt-1 text-sm text-muted">
              Start getting Nigerian recipes tailored to your health and wallet.
            </p>
          </div>

          {error && (
            <div
              className="mb-4 rounded-lg border border-danger-line bg-danger-bg p-3 text-xs text-danger-fg"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              id="register-confirm"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="rounded-lg border border-line bg-surface-muted p-3">
              <label className="flex items-start gap-2.5 text-xs text-fg cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-field-line text-primary focus:ring-ring"
                  required
                />
                <span className="leading-relaxed">
                  I agree to my health information being stored to personalise my meals.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !consent}
            >
              {loading ? <Spinner label="Creating account…" /> : 'Sign up'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary underline hover:text-primary-hover"
            >
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
}

