import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';
import { apiClient } from '../../lib/apiClient';
import {
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotificationById,
} from './notificationTypes';

const NotificationContext = createContext(null);
const MAX_NOTIFICATIONS = 50;

function getStorageKey(uid) {
  return `chopwise_notifs_${uid || 'guest'}`;
}

function getSeenCatalogKey(uid) {
  return `chopwise_seen_catalog_${uid || 'guest'}`;
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.id || user?.uid || null;

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(uid));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Re-load notifications whenever user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(uid));
      setNotifications(saved ? JSON.parse(saved) : []);
    } catch {
      setNotifications([]);
    }
  }, [uid]);

  // Persist notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(uid), JSON.stringify(notifications));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [uid, notifications]);

  const addNotification = useCallback((payload) => {
    const item = createNotification(payload);
    setNotifications((prev) => [item, ...prev].slice(0, MAX_NOTIFICATIONS));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => markNotificationRead(prev, id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => markAllNotificationsRead(prev));
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => removeNotificationById(prev, id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Listen to custom notification events dispatched from anywhere in the app
  useEffect(() => {
    function handleCustomEvent(e) {
      if (e.detail && typeof e.detail === 'object') {
        addNotification(e.detail);
      }
    }
    window.addEventListener('chopwise:notify', handleCustomEvent);
    return () => window.removeEventListener('chopwise:notify', handleCustomEvent);
  }, [addNotification]);

  // Sync new catalogue recipes from the database
  useEffect(() => {
    if (!uid) return;
    let active = true;

    async function checkNewCatalogMeals() {
      try {
        const res = await apiClient('/api/catalog', { action: 'list', limit: 10 });
        if (!active || !res?.items?.length) return;

        const seenKey = getSeenCatalogKey(uid);
        const seenIds = new Set(JSON.parse(localStorage.getItem(seenKey) || '[]'));
        let addedCount = 0;

        for (const item of res.items) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            addedCount++;
            // Notify user of newly approved catalogue dish
            addNotification({
              type: 'meal',
              title: 'New Nigerian Meal Added',
              message: `"${item.recipe.name}" is now available in the recipe catalogue!`,
              href: '/customer/meals',
              icon: '🍲',
            });
          }
        }

        if (addedCount > 0) {
          localStorage.setItem(seenKey, JSON.stringify([...seenIds]));
        }
      } catch {
        // Catalogue sync is non-blocking
      }
    }

    checkNewCatalogMeals();
    return () => {
      active = false;
    };
  }, [uid, addNotification]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
    }),
    [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification, clearAll]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
