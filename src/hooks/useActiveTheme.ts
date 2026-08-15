import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandingApi } from '@/api/branding';

export type ActiveThemeId = 'fresh' | 'ultima' | 'classic';

const ACTIVE_THEME_STORAGE_KEY = 'cabinet_active_theme';

export const getStoredActiveTheme = (): ActiveThemeId => {
  try {
    const stored = localStorage.getItem(ACTIVE_THEME_STORAGE_KEY);
    if (stored === 'fresh' || stored === 'ultima' || stored === 'classic') {
      return stored;
    }
    // Check legacy ultima mode
    const ultimaEnabled = localStorage.getItem('cabinet_ultima_mode') === 'true';
    if (ultimaEnabled) return 'ultima';
    return 'fresh'; // Default to Fresh
  } catch {
    return 'fresh';
  }
};

export const setStoredActiveTheme = (theme: ActiveThemeId) => {
  try {
    localStorage.setItem(ACTIVE_THEME_STORAGE_KEY, theme);
    if (theme === 'ultima') {
      localStorage.setItem('cabinet_ultima_mode', 'true');
    } else {
      localStorage.setItem('cabinet_ultima_mode', 'false');
    }
  } catch {
    // localStorage not available
  }
};

export function useActiveTheme() {
  const queryClient = useQueryClient();
  const cachedTheme = getStoredActiveTheme();

  const { data: activeTheme = cachedTheme, isLoading } = useQuery<ActiveThemeId>({
    queryKey: ['active-theme-id'],
    queryFn: async () => {
      try {
        const remoteTheme = await (brandingApi as any).getActiveTheme?.();
        if (remoteTheme === 'fresh' || remoteTheme === 'ultima' || remoteTheme === 'classic') {
          setStoredActiveTheme(remoteTheme);
          return remoteTheme;
        }
      } catch {
        // fallback
      }
      return getStoredActiveTheme();
    },
    initialData: cachedTheme,
    staleTime: 1000 * 15,
  });

  const switchThemeMutation = useMutation({
    mutationFn: async (newTheme: ActiveThemeId) => {
      setStoredActiveTheme(newTheme);
      try {
        await (brandingApi as any).setActiveTheme?.(newTheme);
      } catch {
        // offline
      }
      return newTheme;
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(['active-theme-id'], saved);
      queryClient.invalidateQueries({ queryKey: ['branding'] });
      queryClient.invalidateQueries({ queryKey: ['ultima-mode-enabled'] });
    },
  });

  return {
    activeTheme,
    isFresh: activeTheme === 'fresh',
    isUltima: activeTheme === 'ultima',
    isClassic: activeTheme === 'classic',
    isLoading,
    setActiveTheme: switchThemeMutation.mutate,
    isSwitching: switchThemeMutation.isPending,
  };
}
