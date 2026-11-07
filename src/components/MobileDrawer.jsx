import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import { APP_NAME } from '../lib/constants';

/**
 * Off-canvas mobile navigation sidebar that flows in from the right.
 * Follows AGENTS.md and docs/UI_GUIDELINES.md.
 */
export default function MobileDrawer({
  isOpen,
  onClose,
  user,
  isAdmin,
  onLogout,
}) {
  return (
    <div
      className={`fixed inset-0 z-50 sm:hidden transition-all duration-300 ${
        isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
      }`}
    >
      {/* Semi-transparent backdrop overlay */}
      <div
        className={`fixed inset-0 bg-overlay/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel flowing in from the right */}
      <aside
        className={`fixed inset-y-0 right-0 flex w-[280px] max-w-[85vw] flex-col justify-between border-l border-line bg-surface p-5 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
      >
        <div className="space-y-4">
          {/* Header row with Title and Close button */}
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="text-sm font-bold tracking-tight text-fg">Menu</span>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-muted text-fg hover:bg-surface focus:outline-none"
              aria-label="Close menu"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {user ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-surface-muted p-2.5 text-xs">
                <div className="text-[11px] text-muted">Signed in as</div>
                <div className="font-semibold text-fg truncate" title={user.email}>
                  {user.email}
                </div>
              </div>

              <nav className="flex flex-col space-y-1">
                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-fg hover:bg-surface-muted hover:text-primary transition-colors"
                >
                  <span aria-hidden="true">📊</span>
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-fg hover:bg-surface-muted hover:text-primary transition-colors"
                >
                  <span aria-hidden="true">👤</span>
                  <span>Profile &amp; Saved Meals</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-surface-muted transition-colors"
                  >
                    <span aria-hidden="true">⚙️</span>
                    <span>Admin Portal</span>
                  </Link>
                )}
              </nav>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full text-xs min-h-9"
                >
                  Log out
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted leading-relaxed">
                Log in to access your customized meal recommendations and saved recipes.
              </p>
              <Link to="/login" onClick={onClose} className="block">
                <Button variant="secondary" className="w-full text-xs min-h-10 font-semibold">
                  Log in
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Theme Toggle row in Mobile Sidebar */}
        <div className="border-t border-line pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Theme appearance</span>
            <ThemeToggle />
          </div>
          <p className="text-[11px] text-muted text-center">
            © {new Date().getFullYear()} {APP_NAME}
          </p>
        </div>
      </aside>
    </div>
  );
}
