import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_FRESH_CONFIG,
  DEFAULT_FRESH_PRESETS,
  type FreshThemeConfig,
} from '@/types/freshTheme';

interface FreshThemeContextType {
  config: FreshThemeConfig;
  updateConfig: (newConfig: Partial<FreshThemeConfig>) => void;
  setPreset: (presetId: keyof typeof DEFAULT_FRESH_PRESETS) => void;
  setCustomBackground: (url: string | null) => void;
  setAccentColor: (color: string, glow?: string) => void;
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

const FreshThemeContext = createContext<FreshThemeContextType | null>(null);

const STORAGE_KEY = 'cabinet_fresh_theme_config';

export function FreshThemeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<FreshThemeConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_FRESH_CONFIG, ...JSON.parse(stored) };
    } catch {
      // ignore
    }
    return DEFAULT_FRESH_CONFIG;
  });

  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  const updateConfig = (newConfig: Partial<FreshThemeConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const setPreset = (presetId: keyof typeof DEFAULT_FRESH_PRESETS) => {
    const preset = DEFAULT_FRESH_PRESETS[presetId];
    if (preset) {
      setConfig((prev) => ({ ...prev, ...preset }));
    }
  };

  const setCustomBackground = (url: string | null) => {
    setConfig((prev) => ({
      ...prev,
      bgMode: url ? 'custom' : 'preset',
      customBgUrl: url,
    }));
  };

  const setAccentColor = (color: string, glow?: string) => {
    setConfig((prev) => ({
      ...prev,
      accentColor: color,
      accentGlowColor: glow || `${color}66`,
    }));
  };

  return (
    <FreshThemeContext.Provider
      value={{
        config,
        updateConfig,
        setPreset,
        setCustomBackground,
        setAccentColor,
        activeModal,
        openModal: setActiveModal,
        closeModal: () => setActiveModal(null),
      }}
    >
      {children}
    </FreshThemeContext.Provider>
  );
}

export function useFreshThemeContext() {
  const ctx = useContext(FreshThemeContext);
  if (!ctx) {
    return {
      config: DEFAULT_FRESH_CONFIG,
      updateConfig: () => {},
      setPreset: () => {},
      setCustomBackground: () => {},
      setAccentColor: () => {},
      activeModal: null,
      openModal: () => {},
      closeModal: () => {},
    };
  }
  return ctx;
}
