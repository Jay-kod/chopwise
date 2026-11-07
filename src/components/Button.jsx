/**
 * Primary or secondary button.
 * @param {{ variant?: 'primary'|'secondary'|'danger', children, className?, ...rest }} props
 */
export default function Button({
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 font-medium transition-colors min-h-11 text-sm disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-hover',
    secondary:
      'bg-surface text-fg border border-field-line hover:bg-surface-muted',
    danger:
      'bg-danger-bg text-danger-fg border border-danger-line hover:opacity-90',
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

