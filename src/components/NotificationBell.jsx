import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../features/notifications/NotificationContext';
import NotificationPopover from './NotificationPopover';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-fg hover:bg-surface-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={open}
        title="View notifications"
      >
        <Bell className="size-4 text-fg" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary ring-2 ring-surface animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationPopover
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={markAsRead}
          onMarkAllRead={markAllAsRead}
          onRemove={removeNotification}
          onClearAll={clearAll}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
