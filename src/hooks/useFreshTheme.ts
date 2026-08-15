import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DEFAULT_FRESH_CONFIG,
  DEFAULT_FRESH_PRESETS,
  type FreshThemeConfig,
} from '@/types/freshTheme';
import { brandingApi } from '@/api/branding';

const FRESH_THEME_STORAGE_KEY = 'cabinet_fresh_theme_config';

export const getStoredFreshConfig = (): FreshThemeConfig => {
  try {
    const raw = localStorage.getItem(FRESH_THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_FRESH_CONFIG;
    return { ...DEFAULT_FRESH_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FRESH_CONFIG;
  }
};

export const setStoredFreshConfig = (config: FreshThemeConfig): void => {
  try {
    localStorage.setItem(FRESH_THEME_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
};

export function useFreshTheme() {
  const queryClient = useQueryClient();

  const { data: config = getStoredFreshConfig(), isLoading } = useQuery<FreshThemeConfig>({
    queryKey: ['fresh-theme-config'],
    queryFn: async () => {
      try {
        const remote = await (brandingApi as any).getFreshThemeConfig?.();
        if (remote && typeof remote === 'object') {
          const merged = { ...DEFAULT_FRESH_CONFIG, ...remote };
          setStoredFreshConfig(merged);
          return merged;
        }
      } catch {
        // fallback to local
      }
      return getStoredFreshConfig();
    },
    initialData: getStoredFreshConfig,
    staleTime: 1000 * 60 * 5,
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: FreshThemeConfig) => {
      setStoredFreshConfig(newConfig);
      try {
        await (brandingApi as any).updateFreshThemeConfig?.(newConfig);
      } catch {
        // offline or local dev
      }
      return newConfig;
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(['fresh-theme-config'], saved);
    },
  });

  const setPreset = (presetId: keyof typeof DEFAULT_FRESH_PRESETS) => {
    const preset = DEFAULT_FRESH_PRESETS[presetId];
    if (preset) {
      updateConfigMutation.mutate({ ...config, ...preset });
    }
  };

  const setCustomBackground = (url: string | null) => {
    updateConfigMutation.mutate({
      ...config,
      bgMode: url ? 'custom' : 'preset',
      customBgUrl: url,
    });
  };

  const setCustomLogo = (url: string | null) => {
    updateConfigMutation.mutate({
      ...config,
      customLogoUrl: url,
    });
  };

  const setCustomBrandName = (name: string) => {
    updateConfigMutation.mutate({
      ...config,
      customBrandName: name,
    });
  };

  const setAccentColor = (color: string, glowColor?: string) => {
    updateConfigMutation.mutate({
      ...config,
      accentColor: color,
      accentGlowColor: glowColor || `${color}66`,
    });
  };

  return {
    config,
    isLoading,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
    setPreset,
    setCustomBackground,
    setCustomLogo,
    setCustomBrandName,
    setAccentColor,
  };
}
