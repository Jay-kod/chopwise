/**
 * Format a number as Nigerian Naira.
 * @param {number} amount
 * @returns {string} e.g. "₦1,200"
 */
export function formatNaira(amount) {
  if (amount == null || Number.isNaN(amount)) return '₦0';
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

