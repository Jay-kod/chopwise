export function LogoMark({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path d="M9 23C9 14 14 9 23 9C23 18 18 23 9 23Z" className="fill-on-primary" />
      <path d="M11 21L19 13" className="stroke-primary" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** ChopWise wordmark: "Chop" in text colour, "Wise" in brand green. */
export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <LogoMark />
      <span className="text-xl text-fg">
        Chop<span className="text-primary">Wise</span>
      </span>
    </span>
  );
}
