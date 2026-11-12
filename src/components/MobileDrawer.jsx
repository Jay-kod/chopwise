import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import { useAppConfig } from '../context/ConfigContext';
import { ROUTES } from '../lib/routes';
import { customerNavGroups } from './app-shared';
import { isItemActive, navItemClassName, CATEGORY_STYLES, DEFAULT_CATEGORY_STYLE } from './nav-group';

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
  const { appName } = useAppConfig();
  const { pathname } = useLocation();
  const name = appName || 'ChopWise';
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
                <div className="font-semibold text-fg truncate" title={user.name || user.profile?.displayName || user.email}>
                  {user.name || user.profile?.displayName || (user.email ? user.email.split('@')[0] : '')}
                </div>
              </div>

              <nav className="flex flex-col space-y-3">
                {customerNavGroups.map((group) => {
                  const theme = CATEGORY_STYLES[group.category] || DEFAULT_CATEGORY_STYLE;
                  return (
                    <div key={group.label} className="space-y-1">
                      <div className="px-2 py-0.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${theme.badge}`}
                        >
                          <span className={`size-1.5 rounded-full shrink-0 ${theme.dot}`} />
                          <span>{group.label}</span>
                        </span>
                      </div>
                      {group.items.map((item) => {
                        const active = isItemActive(item.path, pathname);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            aria-current={active ? 'page' : undefined}
                            className={`${navItemClassName(active)} flex items-center gap-2.5 text-sm ${!active ? theme.icon : ''}`}
                          >
                            {item.icon}
                            <span>{item.title}</span>
                            {active && <ChevronRightIcon aria-hidden="true" className="ml-auto size-4" />}
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
                {isAdmin && (
                  <div className="space-y-1 pt-1 border-t border-line">
                    <Link
                      to={ROUTES.admin.dashboard}
                      onClick={onClose}
                      aria-current={isItemActive(ROUTES.admin.dashboard, pathname) ? 'page' : undefined}
                      className={`${navItemClassName(isItemActive(ROUTES.admin.dashboard, pathname))} flex items-center gap-2.5 text-sm`}
                    >
                      <span aria-hidden="true">⚙️</span>
                      <span>Admin Portal</span>
                      {isItemActive(ROUTES.admin.dashboard, pathname) && (
                        <ChevronRightIcon aria-hidden="true" className="ml-auto size-4" />
                      )}
                    </Link>
                  </div>
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
              <Link to={ROUTES.customer.login} onClick={onClose} className="block">
                <Button variant="secondary" className="w-full text-xs min-h-10 font-semibold">
                  Customer Log in
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
            © {new Date().getFullYear()} {name}
          </p>
        </div>
      </aside>
    </div>
  );
}
