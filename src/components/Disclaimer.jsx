import { APP_NAME } from '../lib/constants';

/**
 * Persistent medical disclaimer. Shown on dashboard and meal detail pages.
 * @param {{ className? }} props
 */
export default function Disclaimer({ className = '' }) {
  return (
    <div
      className={`rounded-lg border border-line bg-surface-muted px-4 py-3 text-xs text-muted ${className}`}
      role="note"
    >
      <strong>{APP_NAME} disclaimer:</strong> General guidance only, not medical
      advice. Consult a doctor or dietitian for medical conditions.
    </div>
  );
}

