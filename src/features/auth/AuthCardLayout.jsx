import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';
import ThemeToggle from '../../components/ThemeToggle';
import { ExclamationIcon } from './AuthIcons';

/**
 * Split auth card container matching the bespoke curved editorial layout.
 * Fills the viewport height with a compact header and footer.
 */
export default function AuthCardLayout({
  title,
  brandTag = 'CHOPWISE',
  bannerHeadingPrimary = 'Welcome',
  bannerHeadingAccent = 'back.',
  bannerSubtitle = 'Nigerian meals that fit your health and your wallet.',
  error,
  children,
  footer,
  hideHeader = false,
}) {
  const [showForgotModal, setShowForgotModal] = useState(false);

  return (
    <div className="relative h-screen min-h-screen max-h-screen flex flex-col justify-between py-2 sm:py-3 px-4 sm:px-6 bg-page text-fg overflow-y-auto md:overflow-hidden">
      {/* Top bar with logo and theme toggle */}
      {!hideHeader && (
        <header className="w-full max-w-4xl mx-auto flex items-center justify-between mb-2 shrink-0">
          <Link
            to="/"
            aria-label="ChopWise home"
            className="inline-flex items-center gap-2 rounded-lg p-1 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo className="text-2xl" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
      )}

      {/* Main Center Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full my-auto">
        <div className="w-full max-w-4xl relative rounded-3xl overflow-hidden border border-line/60 shadow-xl bg-auth-card shrink-0">
          {/* Desktop SVG Split Curve Background */}
          <div className="hidden md:block absolute inset-0 pointer-events-none select-none overflow-hidden">
            <svg
              className="w-full h-full"
              viewBox="0 0 1000 600"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="authBannerGrad" x1="450" y1="0" x2="1000" y2="600" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="var(--color-auth-banner)" />
                  <stop offset="100%" stopColor="var(--color-auth-banner-to)" />
                </linearGradient>

                <linearGradient id="authCurveGold" x1="510" y1="0" x2="630" y2="600" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="var(--color-auth-accent)" stopOpacity="0.4" />
                  <stop offset="35%" stopColor="var(--color-auth-accent)" stopOpacity="0.95" />
                  <stop offset="70%" stopColor="var(--color-auth-accent)" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="var(--color-auth-accent)" stopOpacity="0.35" />
                </linearGradient>

                <filter id="authCurveGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Dark forest green background for the right panel */}
              <rect width="1000" height="600" fill="url(#authBannerGrad)" />

              {/* Cream/dark-surface shape for the left panel */}
              <path
                d="M 0 0 L 510 0 C 470 180, 510 380, 630 600 L 0 600 Z"
                fill="var(--color-auth-card)"
              />

              {/* Ambient soft glow along curve boundary */}
              <path
                d="M 510 0 C 470 180, 510 380, 630 600"
                stroke="var(--color-header-muted)"
                strokeWidth="6"
                strokeOpacity="0.12"
                filter="url(#authCurveGlow)"
              />

              {/* Golden accent line tracing the curved boundary */}
              <path
                d="M 510 0 C 470 180, 510 380, 630 600"
                stroke="url(#authCurveGold)"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          {/* Mobile Top Banner (< md) */}
          <div className="md:hidden relative bg-auth-banner text-header-fg p-5 sm:p-6 overflow-hidden">
            <span className="text-[11px] font-semibold tracking-[0.28em] uppercase text-auth-accent block mb-1">
              {brandTag}
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-normal leading-tight text-header-fg">
              {bannerHeadingPrimary}{' '}
              <span className="font-serif italic text-auth-accent">{bannerHeadingAccent}</span>
            </h2>
            <p className="text-xs text-header-muted mt-1 leading-relaxed max-w-sm">
              {bannerSubtitle}
            </p>
          </div>

          {/* Main Card Content Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 min-h-[460px] md:min-h-[500px]">
            {/* Form Column (Left Side) */}
            <div className="md:col-span-6 lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <div className="max-w-md w-full mx-auto md:mx-0">
                {/* Title & Accent Underline */}
                <div className="mb-5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-fg">
                    {title}
                  </h1>
                  <div className="h-1 w-10 bg-auth-accent rounded-full mt-2" />
                </div>

                {/* Error Banner */}
                {error && (
                  <div
                    className="mb-4 flex items-start gap-2.5 rounded-xl border border-danger-line bg-danger-bg p-3 text-xs text-danger-fg"
                    role="alert"
                  >
                    <ExclamationIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger-fg" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {/* Form Elements */}
                {children}

                {/* Card Footer Links */}
                {footer && <div className="mt-4">{footer}</div>}
              </div>
            </div>

            {/* Desktop Editorial Banner Column (Right Side) */}
            <div className="hidden md:flex md:col-span-6 lg:col-span-6 p-6 sm:p-8 lg:p-10 pl-12 lg:pl-14 flex-col justify-center text-header-fg">
              <div className="max-w-sm">
                <span className="text-xs font-semibold tracking-[0.3em] uppercase text-auth-accent block mb-3">
                  {brandTag}
                </span>
                <h2 className="font-serif text-3xl lg:text-4xl xl:text-5xl font-normal leading-tight text-header-fg mb-3">
                  {bannerHeadingPrimary}
                  <span className="block font-serif italic text-auth-accent">
                    {bannerHeadingAccent}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-header-muted leading-relaxed">
                  {bannerSubtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Forgot Password Information Dialog */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-fg">Password Recovery</h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              In accordance with academic testing guidelines, automated password reset flows are managed directly by the system administrator.
            </p>
            <p className="text-xs text-muted">
              For testing, please use the test credentials provided below the sign-in form or contact your administrator.
            </p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-full bg-header-bg text-on-primary text-xs font-semibold hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer Note */}
      <footer className="w-full max-w-4xl mx-auto text-center mt-2 shrink-0 text-[11px] text-muted">
        <span>Encrypted session • Nigerian dietary & budget guidance</span>
      </footer>
    </div>
  );
}
