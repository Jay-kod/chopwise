import { useAppConfig } from '../context/ConfigContext';

export function LogoMark({ className = 'h-7 w-7', inverted = false }) {
  const { appIcon } = useAppConfig();

  if (appIcon && appIcon !== 'default' && appIcon !== 'leaf') {
    if (appIcon.startsWith('http://') || appIcon.startsWith('https://') || appIcon.startsWith('/')) {
      return (
        <img
          src={appIcon}
          alt=""
          className={`rounded-lg object-contain ${className}`}
        />
      );
    }
    return (
      <span
        className={`inline-flex items-center justify-center text-xl select-none ${className}`}
        aria-hidden="true"
      >
        {appIcon}
      </span>
    );
  }

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className={inverted ? 'fill-primary-soft' : 'fill-primary'} />
      <path d="M9 23C9 14 14 9 23 9C23 18 18 23 9 23Z" className={inverted ? 'fill-header-bg' : 'fill-on-primary'} />
      <path d="M11 21L19 13" className={inverted ? 'stroke-header-muted' : 'stroke-primary'} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export const LogoIcon = LogoMark;

/** Dynamic project logo & wordmark: Adapts to appName and appIcon from ConfigContext */
export default function Logo({ className = '', inverted = false }) {
  const { appName } = useAppConfig();
  const name = appName || 'ChopWise';

  // Format "ChopWise" with highlighted suffix, or display custom name directly
  const isChopWise = name.toLowerCase() === 'chopwise';

  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <LogoMark inverted={inverted} />
      <span className={`text-xl font-bold ${inverted ? 'text-header-fg' : 'text-fg'}`}>
        {isChopWise ? (
          <>
            Chop<span className={inverted ? 'text-header-muted' : 'text-primary'}>Wise</span>
          </>
        ) : (
          name
        )}
      </span>
    </span>
  );
}
