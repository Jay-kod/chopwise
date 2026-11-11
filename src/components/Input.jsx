/**
 * Labelled input with optional error message and optional right-aligned element.
 * Supports 'default' (bordered box) and 'underline' (minimal bottom-border line).
 * @param {{ label?, error?, id, className?, rightElement?, variant?: 'default'|'underline', ...rest }} props
 */
export default function Input({
  label,
  error,
  id,
  className = '',
  rightElement,
  variant = 'default',
  ...rest
}) {
  const isUnderline = variant === 'underline';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={
            isUnderline
              ? 'text-xs font-medium text-muted tracking-wide'
              : 'text-sm font-medium text-fg'
          }
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={id}
          className={
            isUnderline
              ? `min-h-10 w-full border-0 border-b bg-transparent px-0 py-2 text-sm text-fg placeholder:text-muted/60 focus:outline-none focus:border-auth-accent transition-colors ${
                  rightElement ? 'pr-12' : ''
                } ${error ? 'border-danger-line' : 'border-field-line'}`
              : `min-h-11 w-full rounded-lg border bg-surface px-3 text-sm text-fg placeholder:text-muted transition-colors ${
                  rightElement ? 'pr-11' : ''
                } ${error ? 'border-danger-line' : 'border-field-line'}`
          }
          {...rest}
        />
        {rightElement && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 flex items-center ${
              isUnderline ? 'right-2' : 'right-1.5'
            }`}
          >
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
