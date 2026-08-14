import { useState, useEffect, useCallback, useRef } from 'react';
import { EnabledThemes } from '../types/theme';
import { themeColorsApi } from '../api/themeColors';
import { STORAGE_KEYS } from '../config/constants';

type Theme = 'dark' | 'light';

const THEME_KEY = STORAGE_KEYS.THEME;
const ENABLED_THEMES_KEY = STORAGE_KEYS.ENABLED_THEMES;

// Fetch enabled themes from API
async function fetchEnabledThemes(): Promise<EnabledThemes> {
  try {
    const data = await themeColorsApi.getEnabledThemes();
    if (data && (typeof data.dark === 'boolean' || typeof data.light === 'boolean')) {
      localStorage.setItem(ENABLED_THEMES_KEY, JSON.stringify(data));
      return {
        dark: data.dark ?? true,
        light: data.light ?? false,
      };
    }
  } catch {
    // Ignore errors, use cached or default
  }
  return getCachedEnabledThemes();
}

// Get cached enabled themes synchronously
function getCachedEnabledThemes(): EnabledThemes {
  const cached = localStorage.getItem(ENABLED_THEMES_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && (typeof parsed.dark === 'boolean' || typeof parsed.light === 'boolean')) {
        return {
          dark: parsed.dark ?? true,
          light: parsed.light ?? false,
        };
      }
    } catch {
      // Ignore parse errors
    }
  }
  return { dark: true, light: false };
}

// Custom events for same-tab updates
const ENABLED_THEMES_CHANGED_EVENT = 'enabledThemesChanged';
const THEME_CHANGED_EVENT = 'themeChanged';

// Update cache (called from admin settings)
export function updateEnabledThemesCache(themes: EnabledThemes) {
  localStorage.setItem(ENABLED_THEMES_KEY, JSON.stringify(themes));
  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent(ENABLED_THEMES_CHANGED_EVENT, { detail: themes }));
}

export function useTheme() {
  const [enabledThemes, setEnabledThemes] = useState<EnabledThemes>(getCachedEnabledThemes);
  const [isLoading, setIsLoading] = useState(true);

  const [theme, setThemeState] = useState<Theme>(() => {
    const enabled = getCachedEnabledThemes();

    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_KEY) as Theme | null;
      if (stored === 'dark') {
        return 'dark';
      }
      if (stored === 'light' && enabled.light) {
        return 'light';
      }
    }
    // Default to dark
    return 'dark';
  });

  const themeRef = useRef(theme);
  themeRef.current = theme;

  // Fetch enabled themes on mount
  useEffect(() => {
    fetchEnabledThemes().then((data) => {
      if (!data) return;
      setEnabledThemes(data);
      setIsLoading(false);
      // If current theme is disabled, switch to enabled one
      if (!data[themeRef.current]) {
        const newTheme = data.dark ? 'dark' : 'light';
        setThemeState(newTheme);
      }
    });
  }, []);

  // Listen for localStorage changes (when admin updates enabled themes from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ENABLED_THEMES_KEY && e.newValue) {
        try {
          const data = JSON.parse(e.newValue) as EnabledThemes;
          setEnabledThemes(data);
          // If current theme is now disabled, switch to enabled one
          if (!data[theme]) {
            const newTheme = data.dark ? 'dark' : 'light';
            setThemeState(newTheme);
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [theme]);

  // Listen for same-tab enabled themes changes (from admin settings)
  useEffect(() => {
    const handleEnabledThemesChange = (e: CustomEvent<EnabledThemes>) => {
      const data = e.detail;
      setEnabledThemes(data);
      // If current theme is now disabled, switch to enabled one
      if (!data[theme]) {
        const newTheme = data.dark ? 'dark' : 'light';
        setThemeState(newTheme);
      }
    };

    window.addEventListener(
      ENABLED_THEMES_CHANGED_EVENT,
      handleEnabledThemesChange as EventListener,
    );
    return () =>
      window.removeEventListener(
        ENABLED_THEMES_CHANGED_EVENT,
        handleEnabledThemesChange as EventListener,
      );
  }, [theme]);

  // Apply theme to document - also check if theme is disabled and switch
  useEffect(() => {
    const root = document.documentElement;

    // If current theme is disabled, switch to the enabled one
    if (!enabledThemes[theme]) {
      const newTheme = enabledThemes.dark ? 'dark' : 'light';
      if (newTheme !== theme) {
        setThemeState(newTheme);
        return; // Will re-run with correct theme
      }
    }

    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    localStorage.setItem(THEME_KEY, theme);
    root.style.colorScheme = theme;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#fef9f0' : '#0a0f1a');
    }

    // Notify other useTheme() instances in the same tab
    window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT, { detail: theme }));
  }, [theme, enabledThemes]);

  // Listen for same-tab theme changes (from other useTheme() instances)
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<Theme>) => {
      setThemeState(e.detail);
    };

    window.addEventListener(THEME_CHANGED_EVENT, handleThemeChange as EventListener);
    return () =>
      window.removeEventListener(THEME_CHANGED_EVENT, handleThemeChange as EventListener);
  }, []);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      // Only allow setting if theme is enabled
      if (enabledThemes[newTheme]) {
        setThemeState(newTheme);
      }
    },
    [enabledThemes],
  );

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      // Only toggle if the new theme is enabled
      if (enabledThemes[newTheme]) {
        return newTheme;
      }
      return prev;
    });
  }, [enabledThemes]);

  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  // Check if theme switching is available (both themes enabled and loaded)
  const canToggle = !isLoading && enabledThemes.dark && enabledThemes.light;

  // Refresh enabled themes from API
  const refreshEnabledThemes = useCallback(() => {
    fetchEnabledThemes().then((data) => {
      setEnabledThemes(data);
      if (!data[theme]) {
        const newTheme = data.dark ? 'dark' : 'light';
        setThemeState(newTheme);
      }
    });
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    isLight,
    enabledThemes,
    canToggle,
    isLoading,
    refreshEnabledThemes,
  };
}
