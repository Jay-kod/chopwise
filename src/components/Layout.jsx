import { Link } from 'react-router-dom';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { APP_NAME } from '../lib/constants';

/**
 * Shared layout: navbar (Logo + ThemeToggle) + content + footer.
 * Used on every page (landing, auth, app, admin).
 * @param {{ children, navActions? }} props
 */
export default function Layout({ children, navActions }) {
  return (
    <div className="flex min-h-screen flex-col bg-page text-fg">
      <header className="border-b border-line bg-surface">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" aria-label={`${APP_NAME} home`}>
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            {navActions}
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

