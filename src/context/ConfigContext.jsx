import { createContext, useContext, useState, useEffect } from 'react';
import { APP_NAME, APP_TAGLINE } from '../lib/constants';
import { apiClient } from '../lib/apiClient';

const STORAGE_KEY = 'chopwise_public_config';

const ConfigContext = createContext({
  appName: APP_NAME,
  appTagline: APP_TAGLINE,
  appIcon: '🍲',
  heroImageUrl: '',
  updateLocalConfig: () => {},
});

/**
 * Updates browser favicon dynamically with an image URL or SVG emoji.
 * @param {string} icon
 */
function updateFavicon(icon) {
  if (!icon || typeof document === 'undefined') return;
  try {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.head.appendChild(link);
    }
    if (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/')) {
      link.href = icon;
    } else {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${icon}</text></svg>`;
      link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }
  } catch {
    // Ignore icon update errors in unsupported environments
  }
}

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      appName: APP_NAME,
      appTagline: APP_TAGLINE,
      appIcon: '🍲',
      heroImageUrl: '',
    };
  });

  useEffect(() => {
    let active = true;
    apiClient('/api/admin', { action: 'publicConfig' })
      .then((res) => {
        if (!active || !res) return;
        const next = {
          appName: res.appName || APP_NAME,
          appTagline: res.appTagline || APP_TAGLINE,
          appIcon: res.appIcon || '🍲',
          heroImageUrl: res.heroImageUrl || '',
        };
        setConfig(next);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
      })
      .catch(() => {
        // Fallback to local configuration
      });

    return () => {
      active = false;
    };
  }, []);

  // Synchronize document title and browser tab favicon
  useEffect(() => {
    if (config.appName && typeof document !== 'undefined') {
      document.title = `${config.appName} — ${config.appTagline || APP_TAGLINE}`;
    }
    if (config.appIcon) {
      updateFavicon(config.appIcon);
    }
  }, [config.appName, config.appTagline, config.appIcon]);

  function updateLocalConfig(newValues) {
    setConfig((prev) => {
      const updated = { ...prev, ...newValues };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }

  return (
    <ConfigContext.Provider value={{ ...config, updateLocalConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useAppConfig() {
  return useContext(ConfigContext);
}

