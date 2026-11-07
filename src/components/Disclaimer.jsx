import { useAppConfig } from '../context/ConfigContext';

/**
 * Persistent medical disclaimer. Shown on dashboard and meal detail pages.
 * @param {{ className? }} props
 */
export default function Disclaimer({ className = '' }) {
  const { appName } = useAppConfig();
  const name = appName || 'ChopWise';

  return (
    <div
      className={`rounded-lg border border-line bg-surface-muted px-4 py-3 text-xs text-muted ${className}`}
      role="note"
    >
      <strong>{name} disclaimer:</strong> General guidance only, not medical
      advice. Consult a doctor or dietitian for medical conditions.
    </div>
  );
}

