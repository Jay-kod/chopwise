import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import { APP_NAME, APP_TAGLINE } from '../lib/constants';
import { useAuth } from '../features/auth/useAuth';
import { apiClient } from '../lib/apiClient';

/**
 * Standard application layout with sticky header, responsive navigation, and comprehensive footer.
 * Follows AGENTS.md and docs/UI_GUIDELINES.md.
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
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        to="/dashboard"
        className="text-xs font-semibold text-fg hover:text-primary transition-colors"
      >
        Dashboard
      </Link>
      <Link
        to="/profile"
        className="text-xs font-semibold text-fg hover:text-primary transition-colors"
      >
        Profile
      </Link>
      {isAdmin && (
        <Link to="/admin">
          <Button
            variant="secondary"
            className="min-h-9 px-2.5 py-1 text-xs border-primary text-primary hover:bg-primary-soft"
          >
            Admin
          </Button>
        </Link>
      )}
      <span
        className="hidden max-w-[120px] truncate text-xs text-muted lg:inline"
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
        <Button variant="secondary" className="min-h-9 px-3.5 text-xs font-medium">
          Log in
        </Button>
      </Link>
      <Link to="/register">
        <Button className="min-h-9 px-3.5 text-xs font-medium">
          Sign up
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-page text-fg">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" aria-label={`${APP_NAME} home`} className="flex items-center gap-2">
            <Logo />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {navActions !== undefined ? navActions : defaultNavActions}
            <div className="border-l border-line pl-2">
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </header>

      {/* Main Page Body */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      {/* Standard Comprehensive Footer */}
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {/* Col 1: Brand & Tagline */}
            <div className="space-y-3 sm:col-span-2 md:col-span-1">
              <Link to="/" className="inline-block">
                <Logo />
              </Link>
              <p className="text-xs text-muted leading-relaxed">
                {APP_TAGLINE}
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-muted px-2.5 py-1 text-[11px] text-muted">
                <span>🇳🇬</span> Tailored for Nigerian households
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-2.5 text-xs">
              <h4 className="font-semibold text-fg">Explore ChopWise</h4>
              <ul className="space-y-1.5 text-muted">
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-primary transition-colors">
                    Meal Recommendations
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-primary transition-colors">
                    Health &amp; Budget Profile
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-primary transition-colors">
                    Create Free Account
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Clinical Health Focus */}
            <div className="space-y-2.5 text-xs">
              <h4 className="font-semibold text-fg">Clinical Focus</h4>
              <ul className="space-y-1.5 text-muted">
                <li>Hypertension &amp; Low Sodium</li>
                <li>Diabetes &amp; Glycemic Control</li>
                <li>Peptic Ulcer Soothing Diets</li>
                <li>Portion &amp; Calorie Management</li>
              </ul>
            </div>

            {/* Col 4: Medical & Privacy Disclaimer */}
            <div className="space-y-2.5 text-xs">
              <h4 className="font-semibold text-fg">Clinical Guidance</h4>
              <p className="text-[11px] text-muted leading-relaxed">
                General dietary guidance only, not clinical medical advice. Consult a doctor or registered dietitian for medical diagnosis.
              </p>
              <p className="text-[11px] text-muted leading-relaxed">
                Health information is encrypted and processed strictly in compliance with data privacy standards.
              </p>
            </div>
          </div>

          {/* Sub-footer Bar */}
          <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 text-center text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
            <p className="text-[11px]">
              AI nutrition powered by Gemini &amp; Edamam where supported by standard food taxonomies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
