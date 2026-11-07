import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import Footer from './Footer';
import { APP_NAME } from '../lib/constants';
import { useAuth } from '../features/auth/useAuth';
import { apiClient } from '../lib/apiClient';

/**
 * Standard application layout with sticky header, responsive navigation, mobile drawer, and footer.
 * Follows AGENTS.md and docs/UI_GUIDELINES.md.
 */
export default function Layout({
  children,
  navActions,
  hideHeader = false,
  hideFooter = false,
  fullWidth = false,
}) {
  const { user, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  const desktopNavActions = user ? (
    <div className="hidden sm:flex items-center gap-3">
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
    <div className="hidden sm:flex items-center gap-2">
      <Link to="/login">
        <Button variant="secondary" className="min-h-9 px-4 text-xs font-semibold">
          Log in
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-page text-fg">
      {/* Sticky Top Header */}
      {!hideHeader && (
        <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link to="/" aria-label={`${APP_NAME} home`} className="flex items-center gap-2">
              <Logo />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              {navActions !== undefined ? navActions : desktopNavActions}

              {/* Desktop Theme Toggle: hidden on mobile */}
              <div className="hidden sm:block border-l border-line pl-2 sm:pl-3">
                <ThemeToggle />
              </div>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-fg hover:bg-surface-muted focus:outline-none sm:hidden"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </nav>

          {/* Mobile Dropdown Drawer */}
          {mobileMenuOpen && (
            <div className="border-t border-line bg-surface px-4 py-4 sm:hidden space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
              {user ? (
                <div className="space-y-3">
                  <div className="text-xs text-muted border-b border-line pb-2">
                    Signed in as <span className="font-semibold text-fg">{user.email}</span>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-semibold text-fg hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-semibold text-fg hover:text-primary transition-colors"
                  >
                    Profile &amp; Saved Meals
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-sm font-semibold text-primary transition-colors"
                    >
                      Admin Portal
                    </Link>
                  )}
                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-xs min-h-9"
                    >
                      Log out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button variant="secondary" className="w-full text-xs min-h-10 font-semibold">
                      Log in
                    </Button>
                  </Link>
                </div>
              )}

              {/* Theme Toggle row in Mobile Drawer */}
              <div className="flex items-center justify-between border-t border-line pt-3">
                <span className="text-xs font-medium text-muted">Theme appearance</span>
                <ThemeToggle />
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Page Body */}
      <main className={fullWidth ? 'w-full flex-1' : 'mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8'}>
        {children}
      </main>

      {/* Standard Footer */}
      {!hideFooter && <Footer />}
    </div>
  );
}
