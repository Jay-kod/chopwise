/**
 * Labelled input with optional error message.
 * @param {{ label, error?, id, className?, ...rest }} props
 */
export default function Input({
  label,
  error,
  id,
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
      <input
        id={id}
        className={`min-h-11 rounded-lg border bg-surface px-3 text-sm text-fg placeholder:text-muted ${
          error ? 'border-danger-line' : 'border-field-line'
        }`}
        {...rest}
      />
      {error && (
        <p className="text-xs text-danger-fg">{error}</p>
      )}
    </div>
  );
}

