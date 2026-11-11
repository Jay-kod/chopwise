import { describe, it, expect } from 'vitest';
import {
  createNotification,
  formatRelativeTime,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotificationById,
  filterNotifications,
} from './notificationTypes';

describe('notificationTypes helpers', () => {
  it('creates normalized notification with defaults', () => {
    const notif = createNotification({
      title: 'New Meal Added',
      message: 'Egusi soup is now available.',
      type: 'meal',
    });

    expect(notif.id).toMatch(/^notif_/);
    expect(notif.title).toBe('New Meal Added');
    expect(notif.message).toBe('Egusi soup is now available.');
    expect(notif.icon).toBe('🍲');
    expect(notif.read).toBe(false);
    expect(typeof notif.timestamp).toBe('string');
  });

  it('formats relative timestamps accurately', () => {
    const now = new Date();
    expect(formatRelativeTime(now.toISOString())).toBe('Just now');

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoMinutesAgo)).toBe('2m ago');

    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago');

    expect(formatRelativeTime('')).toBe('');
    expect(formatRelativeTime('invalid-date')).toBe('');
  });

  it('marks a single notification as read', () => {
    const list = [
      { id: '1', read: false },
      { id: '2', read: false },
    ];
    const updated = markNotificationRead(list, '1');
    expect(updated[0].read).toBe(true);
    expect(updated[1].read).toBe(false);
  });

  it('marks all notifications as read', () => {
    const list = [
      { id: '1', read: false },
      { id: '2', read: false },
    ];
    const updated = markAllNotificationsRead(list);
    expect(updated.every((n) => n.read)).toBe(true);
  });

  it('removes notification by id', () => {
    const list = [
      { id: '1', title: 'First' },
      { id: '2', title: 'Second' },
    ];
    const filtered = removeNotificationById(list, '1');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('filters notifications by all or unread', () => {
    const list = [
      { id: '1', read: false },
      { id: '2', read: true },
    ];
    expect(filterNotifications(list, 'all')).toHaveLength(2);
    expect(filterNotifications(list, 'unread')).toHaveLength(1);
    expect(filterNotifications(list, 'unread')[0].id).toBe('1');
  });
});
