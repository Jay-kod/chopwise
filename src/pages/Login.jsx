import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { useAuth } from '../features/auth/useAuth';
import { getAuthErrorMessage } from '../features/auth/authErrors';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <Layout>
      <div className="mx-auto max-w-md py-6 sm:py-12">
        <Card className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-fg">Welcome back</h1>
            <p className="mt-1 text-sm text-muted">
              Log in to your ChopWise account to view your meal plans.
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
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? <Spinner label="Logging in…" /> : 'Log in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-medium text-primary underline hover:text-primary-hover"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
}

