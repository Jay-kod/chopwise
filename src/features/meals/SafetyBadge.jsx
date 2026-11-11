import Badge from '../../components/Badge';

/**
 * Renders medical safety warning badges or condition tags.
 * Follows docs/UI_GUIDELINES.md: status mapping table and semantic tokens only.
 * @param {{ flag: string, className?: string }} props
 */
export default function SafetyBadge({ flag, className = '' }) {
  if (!flag) return null;

  return (
    <Badge variant="warning" className={className}>
      {flag}
    </Badge>
  );
}

/**
 * Chip showing meal type (breakfast, lunch, dinner).
 * @param {{ type: 'breakfast'|'lunch'|'dinner', className?: string }} props
 */
export function MealTypeChip({ type, className = '' }) {
  const icons = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-fg capitalize ${className}`}
    >
      <span aria-hidden="true">{icons[type] || '🍲'}</span>
      {type}
    </span>
  );
}

/**
 * Chip indicating condition suitability.
 * @param {{ condition: string, className?: string }} props
 */
export function SuitableForChip({ condition, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-line bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-fg capitalize ${className}`}
    >
      {condition}
    </span>
  );
}

