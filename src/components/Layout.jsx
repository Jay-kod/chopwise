import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import Footer from './Footer';
import MobileDrawer from './MobileDrawer';
import ConfirmModal from './ConfirmModal';
import { useAppConfig } from '../context/ConfigContext';
import { useAuth } from '../features/auth/useAuth';
import { apiClient } from '../lib/apiClient';
import { ROUTES } from '../lib/routes';
import { customerNavGroups } from './app-shared';

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
  const { appName } = useAppConfig();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const name = appName || 'ChopWise';

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

  async function confirmLogout() {
    try {
      setLoggingOut(true);
      await logout();
      setShowLogoutConfirm(false);
      navigate(ROUTES.customer.login);
    } catch {
      setShowLogoutConfirm(false);
    } finally {
      setLoggingOut(false);
    }
  }

  const desktopNavActions = user ? (
    <div className="hidden sm:flex items-center gap-3">
      {customerNavGroups[0].items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="text-xs font-semibold text-header-fg hover:text-header-muted transition-colors"
        >
          {item.title}
        </Link>
      ))}
      {isAdmin && (
        <Link to={ROUTES.admin.dashboard}>
          <Button
            variant="secondary"
            className="min-h-9 px-2.5 py-1 text-xs border-header-line bg-surface/10 text-header-fg hover:bg-surface/20"
          >
            Admin
          </Button>
        </Link>
      )}
      <span
        className="hidden max-w-[120px] truncate text-xs text-header-muted lg:inline"
        title={user.email}
      >
        {user.email}
      </span>
      <Button
        variant="secondary"
        onClick={() => setShowLogoutConfirm(true)}
        className="min-h-9 px-3 text-xs border-header-line bg-surface/10 text-header-fg hover:bg-surface/20"
        aria-label="Log out of ChopWise"
      >
        Log out
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link to={ROUTES.customer.login}>
        <Button
          variant="secondary"
          className="min-h-8 sm:min-h-9 px-3 sm:px-4 text-xs font-semibold border-header-line bg-surface/10 text-header-fg hover:bg-surface/20"
        >
          Log in
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-page text-fg">
      {/* Sticky Top Header: Solid Darker Green (Non-transparent) */}
      {!hideHeader && (
        <header className="sticky top-0 z-40 border-b border-header-line bg-header-bg shadow-sm">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link to="/" aria-label={`${name} home`} className="flex items-center gap-2">
              <Logo inverted={true} />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              {navActions !== undefined ? navActions : desktopNavActions}

              {/* Desktop Theme Toggle: hidden on mobile */}
              <div className="hidden sm:block border-l border-header-line pl-2 sm:pl-3">
                <ThemeToggle />
              </div>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-header-line bg-surface/10 text-header-fg hover:bg-surface/20 focus:outline-none sm:hidden"
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

          {/* Mobile Right Drawer Sidebar & Backdrop */}
          <MobileDrawer
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            user={user}
            isAdmin={isAdmin}
            onLogout={() => setShowLogoutConfirm(true)}
          />

          {/* Logout Confirmation Dialog */}
          <ConfirmModal
            isOpen={showLogoutConfirm}
            onClose={() => !loggingOut && setShowLogoutConfirm(false)}
            onConfirm={confirmLogout}
            title="Log out of ChopWise?"
            message="Are you sure you want to log out? You will need to sign in again to view your meal recommendations and saved recipes."
            confirmText="Log out"
            cancelText="Cancel"
            variant="danger"
            loading={loggingOut}
            icon="🚪"
          />
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
