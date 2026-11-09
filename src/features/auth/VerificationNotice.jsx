import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { MailIcon } from './AuthIcons';
import { ROUTES } from '../../lib/routes';

/**
 * Notice displayed after registration when email confirmation is required.
 * @param {{ email: string, onReset: () => void }} props
 */
export default function VerificationNotice({ email, onReset }) {
  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-on-primary-soft">
        <MailIcon className="h-7 w-7 text-primary" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
          Check your email
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto leading-relaxed">
          We sent a verification link to{' '}
          <strong className="text-fg font-semibold">{email}</strong>. Please
          click the link to confirm your account and log in.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface-muted p-3.5 text-left text-xs space-y-1.5">
        <p className="font-semibold text-fg">
          Want instant login without email links?
        </p>
        <p className="text-muted leading-relaxed text-[11px]">
          In your <strong className="text-fg">Supabase Dashboard</strong> ➔{' '}
          <strong className="text-fg">Authentication</strong> ➔{' '}
          <strong className="text-fg">Providers</strong> ➔{' '}
          <strong className="text-fg">Email</strong>, switch off{' '}
          <strong className="text-fg">Confirm email</strong>.
        </p>
      </div>

      <div className="space-y-2 pt-1">
        <Link to={ROUTES.customer.login} className="block w-full">
          <Button type="button" className="w-full min-h-11 font-semibold text-sm">
            Go to Log in
          </Button>
        </Link>

        <button
          type="button"
          onClick={onReset}
          className="w-full text-xs text-muted hover:text-fg underline py-1 transition-colors"
        >
          Use a different email or try again
        </button>
      </div>
    </div>
  );
}
