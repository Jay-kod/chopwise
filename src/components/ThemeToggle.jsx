import { useTheme } from '../lib/useTheme';
import { cn } from '@/lib/utils';

export const LABELS = { system: 'System', light: 'Light', dark: 'Dark' };

export function ThemeIcon({ theme }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  if (theme === 'light') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  }
  if (theme === 'dark') {
    return (
      <svg {...common}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

/**
 * Cycles System -> Light -> Dark.
 * Stylized pill button with theme icon and label.
 * Follows AGENTS.md and docs/UI_GUIDELINES.md.
 */
export default function ThemeToggle({ className = '', showLabel = true }) {
  const { theme, cycle } = useTheme();

  return (
    <button
      type="button"
      onClick={cycle}
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-2.5 sm:px-3 text-xs font-semibold text-fg shadow-sm transition-all hover:border-field-line hover:bg-surface-muted active:scale-95 shrink-0",
        className
      )}
      aria-label={`Theme: ${LABELS[theme]}. Press to change.`}
      title={`Theme: ${LABELS[theme]} (Click to cycle)`}
    >
      <span className="text-primary flex items-center shrink-0">
        <ThemeIcon theme={theme} />
      </span>
      {showLabel && (
        <span className="hidden sm:inline text-[11px] font-medium text-fg capitalize">
          {LABELS[theme]}
        </span>
      )}
    </button>
  );
}
