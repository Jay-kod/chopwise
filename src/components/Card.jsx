/**
 * Card container with surface background and border.
 * @param {{ children, className? }} props
 */
export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface border border-line rounded-xl p-4 shadow-xs ${className}`}>
      {children}
    </div>
  );
}

