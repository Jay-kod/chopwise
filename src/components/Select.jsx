/**
 * Labelled select dropdown with optional error message.
 * @param {{ label, error?, id, children, className?, ...rest }} props
 */
export default function Select({
  label,
  error,
  id,
  children,
  className = '',
  ...rest
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`min-h-11 rounded-lg border bg-surface px-3 text-sm text-fg ${
          error ? 'border-danger-line' : 'border-field-line'
        }`}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-danger-fg">{error}</p>
      )}
    </div>
  );
}

