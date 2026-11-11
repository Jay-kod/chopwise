/**
 * Format a number as Nigerian Naira.
 * @param {number} amount
 * @returns {string} e.g. "₦1,200"
 */
export function formatNaira(amount) {
  if (amount == null || Number.isNaN(amount)) return '₦0';
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

/**
 * Format a Date object as a standard date string.
 * @param {Date|number|string} [date]
 * @returns {string} e.g. "Mon, 9 Nov 2026"
 */
export function formatCurrentDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get current day index where Monday is 0 and Sunday is 6.
 * @param {Date} [date]
 * @returns {number} 0-6
 */
export function getDayOfWeekIndex(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return (d.getDay() + 6) % 7;
}
