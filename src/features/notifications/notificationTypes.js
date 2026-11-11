/**
 * Notification types, default icons, and pure data manipulation helpers.
 * Adheres to docs/DEVELOPMENT_GUIDELINES.md.
 */

export const NOTIFICATION_TYPES = {
  MEAL: 'meal',
  PLAN: 'plan',
  PROFILE: 'profile',
  FAVOURITE: 'favourite',
  SYSTEM: 'system',
  HEALTH: 'health',
};

export const NOTIFICATION_ICONS = {
  meal: '🍲',
  plan: '⚡',
  profile: '👤',
  favourite: '❤️',
  system: '⚙️',
  health: '💡',
};

/**
 * Creates a normalized notification object.
 * @param {object} params
 * @returns {object}
 */
export function createNotification({
  id,
  type = 'system',
  title,
  message,
  href,
  icon,
  timestamp,
  read = false,
}) {
  return {
    id: id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    title: title || 'Notification',
    message: message || '',
    href: href || null,
    icon: icon || NOTIFICATION_ICONS[type] || '🔔',
    timestamp: timestamp || new Date().toISOString(),
    read: Boolean(read),
  };
}

/**
 * Formats an ISO date into relative readable time.
 * @param {string} isoString
 * @returns {string}
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const now = Date.now();
  const past = new Date(isoString).getTime();
  if (isNaN(past)) return '';
  const diffSec = Math.max(0, Math.floor((now - past) / 1000));

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Marks a specific notification as read.
 * @param {Array} notifications
 * @param {string} id
 * @returns {Array}
 */
export function markNotificationRead(notifications, id) {
  return notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
}

/**
 * Marks all notifications as read.
 * @param {Array} notifications
 * @returns {Array}
 */
export function markAllNotificationsRead(notifications) {
  return notifications.map((n) => (n.read ? n : { ...n, read: true }));
}

/**
 * Removes a notification by id.
 * @param {Array} notifications
 * @param {string} id
 * @returns {Array}
 */
export function removeNotificationById(notifications, id) {
  return notifications.filter((n) => n.id !== id);
}

/**
 * Filters notification list by 'all' or 'unread'.
 * @param {Array} notifications
 * @param {string} filter
 * @returns {Array}
 */
export function filterNotifications(notifications, filter = 'all') {
  if (filter === 'unread') {
    return notifications.filter((n) => !n.read);
  }
  return notifications;
}
