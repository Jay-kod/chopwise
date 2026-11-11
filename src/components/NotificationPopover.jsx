import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Trash2, X, ExternalLink, Bell } from 'lucide-react';
import { formatRelativeTime, filterNotifications } from '../features/notifications/notificationTypes';
import Button from './Button';

export default function NotificationPopover({
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  onRemove,
  onClearAll,
  onClose,
}) {
  const [tab, setTab] = useState('all');
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const displayedList = filterNotifications(notifications, tab);

  function handleItemClick(notif) {
    onMarkRead(notif.id);
    if (notif.href) {
      onClose();
      navigate(notif.href);
    }
  }

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-line bg-surface shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-fg">Notifications</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-on-primary">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary-hover px-1.5 py-0.5 rounded transition-colors focus:outline-none"
              title="Mark all as read"
            >
              <CheckCheck className="size-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted hover:text-fg hover:bg-surface-muted transition-colors focus:outline-none"
            aria-label="Close notification panel"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line bg-surface-muted/50 px-3 pt-1.5 text-xs font-medium">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`border-b-2 px-3 py-1.5 transition-colors ${
            tab === 'all'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted hover:text-fg'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('unread')}
          className={`border-b-2 px-3 py-1.5 transition-colors ${
            tab === 'unread'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted hover:text-fg'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-line">
        {displayedList.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-surface-muted text-muted">
              <Bell className="size-5" />
            </div>
            <p className="text-xs font-semibold text-fg">
              {tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-[11px] text-muted">
              {tab === 'unread'
                ? "You've read all your updates and alerts."
                : 'Updates about your meal plans, recipe catalogue, and profile will appear here.'}
            </p>
          </div>
        ) : (
          displayedList.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`group flex items-start gap-3 p-3 transition-colors cursor-pointer ${
                notif.read ? 'bg-surface hover:bg-surface-muted/50' : 'bg-surface-muted/40 hover:bg-surface-muted'
              }`}
            >
              {/* Category Icon */}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-sm">
                {notif.icon || '🔔'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs font-semibold truncate ${notif.read ? 'text-fg' : 'text-fg font-bold'}`}>
                    {notif.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted">
                    {formatRelativeTime(notif.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
                {notif.href && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline pt-0.5">
                    <span>View details</span>
                    <ExternalLink className="size-2.5" />
                  </span>
                )}
              </div>

              {/* Action buttons & Unread Dot */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                {!notif.read && (
                  <span
                    className="size-2 rounded-full bg-primary"
                    title="Unread"
                  />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(notif.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-danger rounded transition-opacity"
                  title="Dismiss notification"
                  aria-label="Dismiss notification"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between border-t border-line bg-surface-muted/50 px-4 py-2 text-xs">
          <span className="text-[11px] text-muted">
            {notifications.length} total updates
          </span>
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-muted hover:text-danger underline transition-colors focus:outline-none"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
