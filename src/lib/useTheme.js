import { useCallback, useEffect, useState } from 'react';
import { THEMES, applyTheme, getStoredTheme, resolveTheme, saveTheme } from './theme';

/** React hook: current preference, resolved theme, setter and a cycle helper (system -> light -> dark). */
export function useTheme() {
  const [theme, setThemeState] = useState(getStoredTheme);
  const [resolved, setResolved] = useState(() => resolveTheme(getStoredTheme()));

  const setTheme = useCallback((pref) => {
    setThemeState(pref);
    setResolved(saveTheme(pref));
  }, []);

  const cycle = useCallback(() => {
    setTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]);
  }, [theme, setTheme]);

  // While on "system", follow OS changes live.
  useEffect(() => {
    if (theme !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolved(applyTheme('system'));
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  return { theme, resolved, setTheme, cycle };
}
