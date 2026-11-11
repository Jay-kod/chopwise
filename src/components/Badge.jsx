/**
 * Status badge with icon and text (never colour alone).
 * @param {{ variant?: 'ok'|'warning'|'error'|'neutral', children, className? }} props
 */
export default function Badge({ variant = 'neutral', children, className = '' }) {
  const styles = {
    ok: 'bg-primary-soft text-on-primary-soft',
    warning: 'bg-warn-bg text-warn-fg border border-warn-line',
    error: 'bg-danger-bg text-danger-fg border border-danger-line',
    neutral: 'bg-surface-muted text-fg border border-line font-medium',
  };

  const icons = {
    ok: '✓',
    warning: '⚠',
    error: '✕',
    neutral: 'ℹ',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[variant] || styles.neutral
      } ${className}`}
    >
      <span aria-hidden="true">{icons[variant] || icons.neutral}</span>
      {children}
    </span>
  );
}

