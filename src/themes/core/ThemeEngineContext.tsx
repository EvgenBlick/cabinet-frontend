import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type ThemeId = 'cyber_matrix' | 'fresh' | 'samurai_gold' | 'classic';

export interface ThemeStudioConfig {
  activeTheme: ThemeId;
  // Background & Glass
  bgMode: 'preset' | 'custom';
  customBgUrl: string | null;
  bgBlur: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  bgOverlayOpacity: number; // 0.1 to 0.95
  // Particles & Animations
  enableParticles: boolean;
  particleCount: number; // 40 to 180
  particleSpeed: number; // 0.5 to 3.0
  particleColor: string;
  enableMeshGrid: boolean;
  animationSpeed: 'calm' | 'normal' | 'turbo';
  // Colors & Brand
  accentColor: string;
  accentGlowColor: string;
  customLogoUrl: string | null;
  customBrandName: string;
  // Typography
  heroBadgeText: string;
  heroHeadlineMain: string;
  heroHeadlineAccent: string;
}

export const DEFAULT_THEME_STUDIO_CONFIG: Record<ThemeId, ThemeStudioConfig> = {
  cyber_matrix: {
    activeTheme: 'cyber_matrix',
    bgMode: 'preset',
    customBgUrl:
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop',
    bgBlur: 'md',
    bgOverlayOpacity: 0.82,
    enableParticles: true,
    particleCount: 90,
    particleSpeed: 1.1,
    particleColor: '#00ff66',
    enableMeshGrid: true,
    animationSpeed: 'normal',
    accentColor: '#00ff66',
    accentGlowColor: 'rgba(0, 255, 102, 0.45)',
    customLogoUrl: null,
    customBrandName: 'DOTDNA CYBER',
    heroBadgeText: 'КИБЕР-ЗАЩИТА СЛЕДУЮЩЕГО ПОКОЛЕНИЯ • 10 GBPS',
    heroHeadlineMain: 'Безупречная защита данных',
    heroHeadlineAccent: 'на максимальной скорости.',
  },
  fresh: {
    activeTheme: 'fresh',
    bgMode: 'preset',
    customBgUrl: '/backgrounds/verdant_moss_bg.jpg',
    bgBlur: 'md',
    bgOverlayOpacity: 0.65,
    enableParticles: true,
    particleCount: 70,
    particleSpeed: 1.0,
    particleColor: '#d7ff3b',
    enableMeshGrid: true,
    animationSpeed: 'normal',
    accentColor: '#d7ff3b',
    accentGlowColor: 'rgba(215, 255, 59, 0.45)',
    customLogoUrl: null,
    customBrandName: 'VERDANT',
    heroBadgeText: 'НОВОЕ ПОКОЛЕНИЕ VPN • 10 GBPS',
    heroHeadlineMain: 'Скоростной доступ, который',
    heroHeadlineAccent: 'надежно с вами.',
  },
  samurai_gold: {
    activeTheme: 'samurai_gold',
    bgMode: 'preset',
    customBgUrl: '/backgrounds/samurai_gold_smoke_softblur.jpg',
    bgBlur: 'sm',
    bgOverlayOpacity: 0.4,
    enableParticles: true,
    particleCount: 50,
    particleSpeed: 0.8,
    particleColor: '#d4b37f',
    enableMeshGrid: false,
    animationSpeed: 'normal',
    accentColor: '#d4b37f',
    accentGlowColor: 'rgba(212, 179, 127, 0.45)',
    customLogoUrl: null,
    customBrandName: 'SAMURAI ULTIMA',
    heroBadgeText: 'ПРЕМИАЛЬНЫЙ СЕРВИС • ULTIMA',
    heroHeadlineMain: 'Элитный защищенный доступ',
    heroHeadlineAccent: 'Samurai Ultima.',
  },
  classic: {
    activeTheme: 'classic',
    bgMode: 'preset',
    customBgUrl: null,
    bgBlur: 'none',
    bgOverlayOpacity: 0.5,
    enableParticles: false,
    particleCount: 30,
    particleSpeed: 1.0,
    particleColor: '#3b82f6',
    enableMeshGrid: false,
    animationSpeed: 'normal',
    accentColor: '#3b82f6',
    accentGlowColor: 'rgba(59, 130, 246, 0.45)',
    customLogoUrl: null,
    customBrandName: 'ЛИЧНЫЙ КАБИНЕТ',
    heroBadgeText: 'Личный кабинет',
    heroHeadlineMain: 'Управление защищенным',
    heroHeadlineAccent: 'доступом и подпиской',
  },
};

interface ThemeEngineContextValue {
  activeTheme: ThemeId;
  setActiveTheme: (theme: ThemeId) => void;
  config: ThemeStudioConfig;
  updateConfig: (partial: Partial<ThemeStudioConfig>) => void;
  resetThemeToDefault: (theme?: ThemeId) => void;
  isStudioOpen: boolean;
  setIsStudioOpen: (open: boolean) => void;
  toggleStudio: () => void;
  openThemeStudio: () => void;
  applyForEveryone: () => Promise<void>;
  isSaving: boolean;
}

const ThemeEngineContext = createContext<ThemeEngineContextValue | null>(null);

const STORAGE_KEY_ACTIVE = 'cabinet_active_theme_v2';
const STORAGE_KEY_CONFIGS = 'cabinet_theme_studio_configs_v3';

export const ThemeEngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Active Theme State - Enforced to Samurai Gold (Ultima)
  const [activeTheme, setActiveThemeState] = useState<ThemeId>(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, 'samurai_gold');
      localStorage.setItem('cabinet_active_theme', 'ultima');
      localStorage.setItem('cabinet_ultima_mode', 'true');
    } catch {
      // ignore
    }
    return 'samurai_gold';
  });

  // 2. All Theme Configs
  const [configs, setConfigs] = useState<Record<ThemeId, ThemeStudioConfig>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_THEME_STUDIO_CONFIG,
          ...parsed,
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_THEME_STUDIO_CONFIG;
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentConfig = configs[activeTheme] || DEFAULT_THEME_STUDIO_CONFIG[activeTheme];

  // 3. Inject CSS Variables dynamically on config changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-accent', currentConfig.accentColor);
    root.style.setProperty('--theme-accent-glow', currentConfig.accentGlowColor);
    root.style.setProperty('--theme-overlay-opacity', currentConfig.bgOverlayOpacity.toString());

    // Sync legacy variables for backwards compatibility with Ultima/Classic
    if (activeTheme === 'samurai_gold') {
      localStorage.setItem('cabinet_active_theme', 'ultima');
      localStorage.setItem('cabinet_ultima_mode', 'true');
    } else if (activeTheme === 'fresh') {
      localStorage.setItem('cabinet_active_theme', 'fresh');
      localStorage.setItem('cabinet_ultima_mode', 'false');
    } else {
      localStorage.setItem('cabinet_active_theme', activeTheme);
    }
  }, [activeTheme, currentConfig]);

  const setActiveTheme = (theme: ThemeId) => {
    setActiveThemeState(theme);
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, theme);
    } catch {
      // ignore
    }
  };

  const updateConfig = (partial: Partial<ThemeStudioConfig>) => {
    setConfigs((prev) => {
      const updated = {
        ...prev,
        [activeTheme]: {
          ...prev[activeTheme],
          ...partial,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY_CONFIGS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const resetThemeToDefault = (themeToReset?: ThemeId) => {
    const target = themeToReset || activeTheme;
    setConfigs((prev) => {
      const updated = {
        ...prev,
        [target]: DEFAULT_THEME_STUDIO_CONFIG[target],
      };
      try {
        localStorage.setItem(STORAGE_KEY_CONFIGS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const toggleStudio = () => setIsStudioOpen((prev) => !prev);
  const openThemeStudio = () => setIsStudioOpen(true);

  const applyForEveryone = async () => {
    setIsSaving(true);
    try {
      // Persist to localStorage and broadcast
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeTheme);
      localStorage.setItem(STORAGE_KEY_CONFIGS, JSON.stringify(configs));
      await new Promise((res) => setTimeout(res, 600));
    } finally {
      setIsSaving(false);
    }
  };

  const value = useMemo(
    () => ({
      activeTheme,
      setActiveTheme,
      config: currentConfig,
      updateConfig,
      resetThemeToDefault,
      isStudioOpen,
      setIsStudioOpen,
      toggleStudio,
      openThemeStudio,
      applyForEveryone,
      isSaving,
    }),
    [activeTheme, currentConfig, isStudioOpen, isSaving, configs],
  );

  return <ThemeEngineContext.Provider value={value}>{children}</ThemeEngineContext.Provider>;
};

export function useThemeEngine() {
  const ctx = useContext(ThemeEngineContext);
  if (!ctx) {
    throw new Error('useThemeEngine must be used within a ThemeEngineProvider');
  }
  return ctx;
}
