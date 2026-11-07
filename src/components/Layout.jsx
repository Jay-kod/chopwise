import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import { APP_NAME } from '../lib/constants';
import { useAuth } from '../features/auth/useAuth';
import { apiClient } from '../lib/apiClient';

/**
 * Shared layout: navbar (Logo + ThemeToggle + Auth state + Admin link) + content + footer.
 * Used on every page (landing, auth, app, admin).
 * @param {{ children, navActions? }} props
 */
export default function Layout({ children, navActions }) {
  const { user, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    apiClient('/api/admin', { action: 'me' })
      .then((res) => {
        if (active) setIsAdmin(Boolean(res?.isAdmin));
      })
      .catch(() => {
        if (active) setIsAdmin(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch {
      // Sign-out fallback
    }
  }

  const defaultNavActions = user ? (
    <div className="flex items-center gap-2">
      <Link
        to="/dashboard"
        className="text-xs font-medium text-fg hover:text-primary transition-colors mr-1"
      >
        Dashboard
      </Link>
      <Link
        to="/profile"
        className="text-xs font-medium text-fg hover:text-primary transition-colors mr-1"
      >
        Profile
      </Link>
      {isAdmin && (
        <Link to="/admin">
          <Button
            variant="secondary"
            className="min-h-9 px-3 text-xs border-primary text-primary hover:bg-primary-soft"
          >
            Admin
          </Button>
        </Link>
      )}
      <span
        className="hidden max-w-[140px] truncate text-xs text-muted sm:inline sm:max-w-[200px]"
        title={user.email}
      >
        {user.email}
      </span>
      <Button
        variant="secondary"
        onClick={handleLogout}
        className="min-h-9 px-3 text-xs"
        aria-label="Log out of ChopWise"
      >
        Log out
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link to="/login">
        <Button variant="secondary" className="min-h-9 px-3 text-xs">
          Log in
        </Button>
      </Link>
      <Link to="/register">
        <Button className="min-h-9 px-3 text-xs">Sign up</Button>
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-page text-fg">
      <header className="border-b border-line bg-surface">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" aria-label={`${APP_NAME} home`}>
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            {navActions !== undefined ? navActions : defaultNavActions}
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-line bg-surface px-4 py-4 text-center text-xs text-muted">
        <p>
          {APP_NAME} stores your health information to personalise your meals.
        </p>
        <p className="mt-1">
          General guidance only, not medical advice.
        </p>
      </footer>
    </div>
  );
}
