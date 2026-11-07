/**
 * Empty state with illustration and message.
 * @param {{ title?, message?, action?, className? }} props
 */
export default function EmptyState({
  title = 'Nothing here yet',
  message,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center gap-3 p-8 text-center ${className}`}>
      <span className="text-4xl" aria-hidden="true">🍽️</span>
      <h3 className="text-lg font-semibold text-fg">{title}</h3>
      {message && <p className="text-sm text-muted">{message}</p>}
      {action}
    </div>
  );
}

