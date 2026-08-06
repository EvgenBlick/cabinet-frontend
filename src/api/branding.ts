import apiClient from './client';
import type { AnimationConfig } from '@/components/ui/backgrounds/types';
import { DEFAULT_ANIMATION_CONFIG } from '@/components/ui/backgrounds/types';

export type { AnimationConfig };

export interface BrandingInfo {
  name: string;
  logo_url: string | null;
  logo_letter: string;
  has_custom_logo: boolean;
}

export interface AnimationEnabled {
  enabled: boolean;
}

export interface FullscreenEnabled {
  enabled: boolean;
}

export interface EmailAuthEnabled {
  enabled: boolean;
}

export interface LiteModeEnabled {
  enabled: boolean;
}

export interface UltimaModeEnabled {
  enabled: boolean;
}

export interface UltimaAccountLinkingMode {
  mode: 'code' | 'provider_auth';
}

export interface GiftEnabled {
  enabled: boolean;
}

export interface AnalyticsCounters {
  yandex_metrika_id: string;
  google_ads_id: string;
  google_ads_label: string;
}

export interface UltimaThemeConfig {
  themePresetId: string;
  animationPresetId: string;
  primaryColor: string;
  primaryTextColor: string;
  secondaryColor: string;
  secondaryTextColor: string;
  navBackgroundColor: string;
  navActiveColor: string;
  navTextColor: string;
  backgroundTopColor: string;
  backgroundBottomColor: string;
  auraColor: string;
  ringColor: string;
  surfaceColor: string;
  surfaceBorderColor: string;
  scrollbarThumbColor: string;
  scrollbarTrackColor: string;
  contentEnterMs: number;
  tapRingMs: number;
  ringWaveSec: number;
  sliderGlowSec: number;
  stepRingSec: number;
  successWaveMs: number;
  itemEnterMs: number;
  framesEnabled: boolean;
  homeUseBrandLogo: boolean;
}

export const DEFAULT_ULTIMA_THEME_CONFIG: UltimaThemeConfig = {
  themePresetId: 'emerald-classic',
  animationPresetId: 'orbital-aura',
  primaryColor: '#1bd29f',
  primaryTextColor: '#ffffff',
  secondaryColor: '#0c2d2a',
  secondaryTextColor: '#f7fffc',
  navBackgroundColor: '#0f3a38',
  navActiveColor: '#1bd29f',
  navTextColor: '#d6f6ee',
  backgroundTopColor: '#031824',
  backgroundBottomColor: '#06232b',
  auraColor: '#21d09a',
  ringColor: '#b8ffec',
  surfaceColor: '#0c2d2a',
  surfaceBorderColor: '#92f4d8',
  scrollbarThumbColor: '#49e9b3',
  scrollbarTrackColor: '#0c262a',
  contentEnterMs: 320,
  tapRingMs: 780,
  ringWaveSec: 18,
  sliderGlowSec: 2.6,
  stepRingSec: 5.8,
  successWaveMs: 1050,
  itemEnterMs: 280,
  framesEnabled: false,
  homeUseBrandLogo: false,
};

const BRANDING_CACHE_KEY = 'cabinet_branding';
const LOGO_PRELOADED_KEY = 'cabinet_logo_preloaded';
const STARTUP_LOGO_CACHE_KEY = 'cabinet_startup_logo_url';
export const ULTIMA_THEME_CONFIG_CACHE_KEY = 'cabinet_ultima_theme_config';

const parseCachedBranding = (raw: string | null): BrandingInfo | null => {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as BrandingInfo;
  } catch {
    return null;
  }
};

// Keep the public logo URL stable for the whole session. Switching an image
// from the HTTP URL to a blob URL after the first render caused visible logo
// flashes when React re-rendered a header or a dashboard scene.
let _preloadedLogoUrl: string | null = null;
let _logoPreloadPromise: Promise<void> | null = null;

const resolveLogoUrl = (branding: BrandingInfo): string | null => {
  if (!branding.has_custom_logo || !branding.logo_url) {
    return null;
  }

  const rawLogoUrl = branding.logo_url.trim();
  if (/^(?:https?:|data:|blob:)/i.test(rawLogoUrl)) {
    return rawLogoUrl;
  }

  const apiBaseUrl = String(apiClient.defaults.baseURL || '/api').replace(/\/+$/, '');
  const logoPath = rawLogoUrl.startsWith('/') ? rawLogoUrl : `/${rawLogoUrl}`;

  if (/^https?:\/\//i.test(apiBaseUrl)) {
    const parsedApiBase = new URL(apiBaseUrl);
    if (logoPath === parsedApiBase.pathname || logoPath.startsWith(`${parsedApiBase.pathname}/`)) {
      return new URL(logoPath, parsedApiBase.origin).toString();
    }
    return new URL(
      `${parsedApiBase.pathname.replace(/\/+$/, '')}/${logoPath.replace(/^\/+/, '')}`,
      parsedApiBase.origin,
    ).toString();
  }

  if (logoPath === apiBaseUrl || logoPath.startsWith(`${apiBaseUrl}/`)) {
    return logoPath;
  }

  return `${apiBaseUrl}${logoPath}`;
};

// Check if logo was already preloaded in this session
export const isLogoPreloaded = (): boolean => {
  try {
    const cached = getCachedBranding();
    if (!cached?.has_custom_logo || !cached?.logo_url) {
      return false;
    }
    if (_preloadedLogoUrl === resolveLogoUrl(cached)) return true;
    const preloaded = sessionStorage.getItem(LOGO_PRELOADED_KEY);
    return preloaded === resolveLogoUrl(cached);
  } catch {
    return false;
  }
};

// Get cached public branding, preferring the warm session copy and falling back to localStorage.
export const getCachedBranding = (): BrandingInfo | null => {
  try {
    const cached = parseCachedBranding(sessionStorage.getItem(BRANDING_CACHE_KEY));
    if (cached) {
      return cached;
    }
  } catch {
    // storage not available or invalid JSON
  }

  try {
    const cachedRaw = localStorage.getItem(BRANDING_CACHE_KEY);
    const cached = parseCachedBranding(cachedRaw);
    if (cached && cachedRaw) {
      try {
        sessionStorage.setItem(BRANDING_CACHE_KEY, cachedRaw);
      } catch {
        // sessionStorage not available
      }
      return cached;
    }
  } catch {
    // storage not available or invalid JSON
  }
  return null;
};

// Update branding cache in both storages so the public logo survives cold starts.
export const setCachedBranding = (branding: BrandingInfo) => {
  const serialized = JSON.stringify(branding);

  try {
    sessionStorage.setItem(BRANDING_CACHE_KEY, serialized);
  } catch {
    // sessionStorage not available
  }

  try {
    localStorage.setItem(BRANDING_CACHE_KEY, serialized);
    const logoUrl = resolveLogoUrl(branding);
    if (logoUrl) {
      localStorage.setItem(STARTUP_LOGO_CACHE_KEY, logoUrl);
    } else {
      localStorage.removeItem(STARTUP_LOGO_CACHE_KEY);
    }
  } catch {
    // localStorage not available
  }
};

// Warm the browser image cache before branded surfaces are revealed.
export const preloadLogo = async (branding: BrandingInfo): Promise<void> => {
  const logoUrl = resolveLogoUrl(branding);
  if (!logoUrl || !branding.logo_url) {
    return;
  }

  if (_preloadedLogoUrl === logoUrl) {
    return;
  }

  if (_logoPreloadPromise) {
    await _logoPreloadPromise;
    if (_preloadedLogoUrl === logoUrl) return;
  }

  _logoPreloadPromise = new Promise<void>((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      _preloadedLogoUrl = logoUrl;
      try {
        sessionStorage.setItem(LOGO_PRELOADED_KEY, logoUrl);
      } catch {
        // Storage is optional; the browser cache still keeps the image warm.
      }
      resolve();
    };
    image.onerror = () => resolve();
    image.src = logoUrl;
  }).finally(() => {
    _logoPreloadPromise = null;
  });

  await _logoPreloadPromise;
};

// Initialize logo preload from cache on page load
export const initLogoPreload = async () => {
  const cached = getCachedBranding();
  if (cached) {
    await preloadLogo(cached);
  }
};

export const getCachedUltimaThemeConfig = (): UltimaThemeConfig | null => {
  try {
    const cached = localStorage.getItem(ULTIMA_THEME_CONFIG_CACHE_KEY);
    if (!cached) return null;
    return { ...DEFAULT_ULTIMA_THEME_CONFIG, ...JSON.parse(cached) };
  } catch {
    return null;
  }
};

export const brandingApi = {
  // Get current branding (public, no auth required)
  getBranding: async (): Promise<BrandingInfo> => {
    try {
      const response = await apiClient.get<BrandingInfo>('/cabinet/branding');
      // Cache the branding data for offline access
      setCachedBranding(response.data);
      return response.data;
    } catch (error) {
      // If network fails, use cached branding
      const cached = getCachedBranding();
      if (cached) {
        return cached;
      }
      // Keep transient network failures out of persistent branding storage.
      // Components already provide their own neutral text/letter fallback.
      throw error;
    }
  },

  // Update project name (admin only)
  updateName: async (name: string): Promise<BrandingInfo> => {
    const response = await apiClient.put<BrandingInfo>('/cabinet/branding/name', { name });
    return response.data;
  },

  // Upload custom logo (admin only)
  uploadLogo: async (file: File): Promise<BrandingInfo> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<BrandingInfo>('/cabinet/branding/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    _preloadedLogoUrl = null;
    sessionStorage.removeItem(LOGO_PRELOADED_KEY);
    return response.data;
  },

  // Delete custom logo (admin only)
  deleteLogo: async (): Promise<BrandingInfo> => {
    const response = await apiClient.delete<BrandingInfo>('/cabinet/branding/logo');
    _preloadedLogoUrl = null;
    sessionStorage.removeItem(LOGO_PRELOADED_KEY);
    return response.data;
  },

  // Use one stable URL so an already visible logo never remounts mid-render.
  getLogoUrl: (branding: BrandingInfo): string | null => {
    return resolveLogoUrl(branding);
  },

  // Get animation enabled (public, no auth required)
  getAnimationEnabled: async (): Promise<AnimationEnabled> => {
    const response = await apiClient.get<AnimationEnabled>('/cabinet/branding/animation');
    return response.data;
  },

  // Update animation enabled (admin only)
  updateAnimationEnabled: async (enabled: boolean): Promise<AnimationEnabled> => {
    const response = await apiClient.patch<AnimationEnabled>('/cabinet/branding/animation', {
      enabled,
    });
    return response.data;
  },

  // Get animation config (public, no auth required)
  getAnimationConfig: async (): Promise<AnimationConfig> => {
    try {
      const response = await apiClient.get<AnimationConfig>('/cabinet/branding/animation-config');
      return response.data;
    } catch {
      return DEFAULT_ANIMATION_CONFIG;
    }
  },

  // Update animation config (admin only, partial update)
  updateAnimationConfig: async (config: Partial<AnimationConfig>): Promise<AnimationConfig> => {
    const response = await apiClient.patch<AnimationConfig>(
      '/cabinet/branding/animation-config',
      config,
    );
    return response.data;
  },

  // Get fullscreen enabled (public, no auth required)
  getFullscreenEnabled: async (): Promise<FullscreenEnabled> => {
    try {
      const response = await apiClient.get<FullscreenEnabled>('/cabinet/branding/fullscreen');
      return response.data;
    } catch {
      // If endpoint doesn't exist, default to disabled
      return { enabled: false };
    }
  },

  // Update fullscreen enabled (admin only)
  updateFullscreenEnabled: async (enabled: boolean): Promise<FullscreenEnabled> => {
    const response = await apiClient.patch<FullscreenEnabled>('/cabinet/branding/fullscreen', {
      enabled,
    });
    return response.data;
  },

  // Get email auth enabled (public, no auth required)
  getEmailAuthEnabled: async (): Promise<EmailAuthEnabled> => {
    try {
      const response = await apiClient.get<EmailAuthEnabled>('/cabinet/branding/email-auth');
      return response.data;
    } catch {
      // If endpoint doesn't exist, default to enabled
      return { enabled: true };
    }
  },

  // Update email auth enabled (admin only)
  updateEmailAuthEnabled: async (enabled: boolean): Promise<EmailAuthEnabled> => {
    const response = await apiClient.patch<EmailAuthEnabled>('/cabinet/branding/email-auth', {
      enabled,
    });
    return response.data;
  },

  // Get lite mode enabled (public, no auth required)
  getLiteModeEnabled: async (): Promise<LiteModeEnabled> => {
    try {
      const response = await apiClient.get<LiteModeEnabled>('/cabinet/branding/lite-mode');
      // Cache the value in localStorage for offline access
      try {
        localStorage.setItem('cabinet_lite_mode', String(response.data.enabled));
      } catch {
        // localStorage not available
      }
      return response.data;
    } catch {
      // If network fails, use cached value from localStorage
      try {
        const cached = localStorage.getItem('cabinet_lite_mode');
        if (cached !== null) {
          return { enabled: cached === 'true' };
        }
      } catch {
        // localStorage not available
      }
      // If no cache, default to disabled
      return { enabled: false };
    }
  },

  // Update lite mode enabled (admin only)
  updateLiteModeEnabled: async (enabled: boolean): Promise<LiteModeEnabled> => {
    const response = await apiClient.patch<LiteModeEnabled>('/cabinet/branding/lite-mode', {
      enabled,
    });
    return response.data;
  },

  // Get ultima mode enabled (public, no auth required)
  getUltimaModeEnabled: async (): Promise<UltimaModeEnabled> => {
    try {
      const response = await apiClient.get<UltimaModeEnabled>('/cabinet/branding/ultima-mode');
      try {
        localStorage.setItem('cabinet_ultima_mode', String(response.data.enabled));
      } catch {
        // localStorage not available
      }
      return response.data;
    } catch {
      try {
        const cached = localStorage.getItem('cabinet_ultima_mode');
        if (cached !== null) {
          return { enabled: cached === 'true' };
        }
      } catch {
        // localStorage not available
      }
      return { enabled: false };
    }
  },

  // Update ultima mode enabled (admin only)
  updateUltimaModeEnabled: async (enabled: boolean): Promise<UltimaModeEnabled> => {
    const response = await apiClient.patch<UltimaModeEnabled>('/cabinet/branding/ultima-mode', {
      enabled,
    });
    return response.data;
  },

  getUltimaAccountLinkingMode: async (): Promise<UltimaAccountLinkingMode> => {
    try {
      const response = await apiClient.get<UltimaAccountLinkingMode>(
        '/cabinet/branding/ultima-account-linking-mode',
      );
      try {
        localStorage.setItem('cabinet_ultima_account_linking_mode', response.data.mode);
      } catch {
        // localStorage not available
      }
      return response.data;
    } catch {
      try {
        const cached = localStorage.getItem('cabinet_ultima_account_linking_mode');
        if (cached === 'provider_auth' || cached === 'code') {
          return { mode: cached };
        }
      } catch {
        // localStorage not available
      }
      return { mode: 'code' };
    }
  },

  // Get gift enabled (public, no auth required)
  getGiftEnabled: async (): Promise<GiftEnabled> => {
    try {
      const response = await apiClient.get<GiftEnabled>('/cabinet/branding/gift-enabled');
      return response.data;
    } catch {
      return { enabled: false };
    }
  },

  // Update gift enabled (admin only)
  updateGiftEnabled: async (enabled: boolean): Promise<GiftEnabled> => {
    const response = await apiClient.patch<GiftEnabled>('/cabinet/branding/gift-enabled', {
      enabled,
    });
    return response.data;
  },

  // Get analytics counters (public, no auth required)
  getAnalyticsCounters: async (): Promise<AnalyticsCounters> => {
    try {
      const response = await apiClient.get<AnalyticsCounters>('/cabinet/branding/analytics');
      return response.data;
    } catch {
      return { yandex_metrika_id: '', google_ads_id: '', google_ads_label: '' };
    }
  },

  // Update analytics counters (admin only)
  updateAnalyticsCounters: async (data: Partial<AnalyticsCounters>): Promise<AnalyticsCounters> => {
    const response = await apiClient.patch<AnalyticsCounters>('/cabinet/branding/analytics', data);
    return response.data;
  },

  // Get ultima visual config (public)
  getUltimaThemeConfig: async (): Promise<UltimaThemeConfig> => {
    try {
      const response = await apiClient.get<UltimaThemeConfig>(
        '/cabinet/branding/ultima-theme-config',
      );
      try {
        localStorage.setItem(ULTIMA_THEME_CONFIG_CACHE_KEY, JSON.stringify(response.data));
      } catch {
        // localStorage not available
      }
      return response.data;
    } catch {
      return getCachedUltimaThemeConfig() ?? DEFAULT_ULTIMA_THEME_CONFIG;
    }
  },

  // Update ultima visual config (admin only)
  updateUltimaThemeConfig: async (
    config: Partial<UltimaThemeConfig>,
  ): Promise<UltimaThemeConfig> => {
    const response = await apiClient.patch<UltimaThemeConfig>(
      '/cabinet/branding/ultima-theme-config',
      config,
    );
    try {
      localStorage.setItem(ULTIMA_THEME_CONFIG_CACHE_KEY, JSON.stringify(response.data));
    } catch {
      // localStorage not available
    }
    return response.data;
  },

  // Reset ultima visual config (admin only)
  resetUltimaThemeConfig: async (): Promise<UltimaThemeConfig> => {
    const response = await apiClient.post<UltimaThemeConfig>(
      '/cabinet/branding/ultima-theme-config/reset',
    );
    try {
      localStorage.setItem(ULTIMA_THEME_CONFIG_CACHE_KEY, JSON.stringify(response.data));
    } catch {
      // localStorage not available
    }
    return response.data;
  },
};
