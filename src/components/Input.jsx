/**
 * Labelled input with optional error message and optional right-aligned element.
 * @param {{ label, error?, id, className?, rightElement?, ...rest }} props
 */
export default function Input({
  label,
  error,
  id,
  className = '',
  rightElement,
  ...rest
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={id}
          className={`min-h-11 w-full rounded-lg border bg-surface px-3 text-sm text-fg placeholder:text-muted transition-colors ${
            rightElement ? 'pr-11' : ''
          } ${error ? 'border-danger-line' : 'border-field-line'}`}
          {...rest}
        />
        {rightElement && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-danger-fg">{error}</p>
      )}
    </div>
  );
}

