export function LogoMark({ className = 'h-7 w-7', inverted = false }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className={inverted ? 'fill-primary-soft' : 'fill-primary'} />
      <path d="M9 23C9 14 14 9 23 9C23 18 18 23 9 23Z" className={inverted ? 'fill-header-bg' : 'fill-on-primary'} />
      <path d="M11 21L19 13" className={inverted ? 'stroke-header-muted' : 'stroke-primary'} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** ChopWise wordmark: "Chop" in text colour, "Wise" in brand green. */
export default function Logo({ className = '', inverted = false }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <LogoMark inverted={inverted} />
      <span className={`text-xl font-bold ${inverted ? 'text-header-fg' : 'text-fg'}`}>
        Chop<span className={inverted ? 'text-header-muted' : 'text-primary'}>Wise</span>
      </span>
    </span>
  );
}
