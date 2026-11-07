// Pure theme helpers. Preference: 'system' | 'light' | 'dark'. Stored in localStorage.
export const THEME_KEY = 'chopwise-theme';
export const THEMES = ['system', 'light', 'dark'];

export function getStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return THEMES.includes(v) ? v : 'system';
  } catch {
    return 'system';
  }
}

export function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** @returns {'light'|'dark'} the theme actually shown for a preference */
export function resolveTheme(pref) {
  if (pref === 'dark') return 'dark';
  if (pref === 'light') return 'light';
  return systemPrefersDark() ? 'dark' : 'light';
}

export function applyTheme(pref) {
  const resolved = resolveTheme(pref);
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
  return resolved;
}

export function saveTheme(pref) {
  try {
    localStorage.setItem(THEME_KEY, pref);
  } catch {
    /* storage unavailable: theme still applies for this session */
  }
  return applyTheme(pref);
}
