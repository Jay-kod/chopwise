import Button from './Button';

/**
 * Friendly error message with optional retry.
 * @param {{ message?, onRetry?, className? }} props
 */
export default function ErrorState({
  message = 'Something went wrong.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-xl border border-danger-line bg-danger-bg p-6 text-center ${className}`}
      role="alert"
    >
      <span className="text-2xl" aria-hidden="true">⚠</span>
      <p className="text-sm text-danger-fg">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

