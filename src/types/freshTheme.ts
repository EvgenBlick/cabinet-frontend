export interface FreshThemeConfig {
  themePresetId: 'fresh-organic' | 'fresh-emerald' | 'fresh-cyber' | 'fresh-gold' | 'custom';
  accentColor: string; // e.g. '#d7ff3b' (Electric Lime) or '#10b981' (Emerald)
  accentGlowColor: string; // e.g. 'rgba(215, 255, 59, 0.4)'
  surfaceBgColor: string; // e.g. 'rgba(14, 20, 16, 0.75)'
  textColor: string; // e.g. '#f5f5f7'
  bgMode: 'preset' | 'custom';
  bgPresetUrl: string;
  customBgUrl: string | null;
  bgBlur: 'none' | 'sm' | 'md' | 'lg';
  bgOverlayOpacity: number; // 0.3 - 0.95
  customLogoUrl: string | null;
  customBrandName: string;
  animationIntensity: 'subtle' | 'standard' | 'high';
  enableFloatingGlow: boolean;
  enableMeshAnimation: boolean;
  showReleaseBadge: boolean;
  releaseBadgeText: string;
  heroItalicWord: string;
}

export const DEFAULT_FRESH_PRESETS: Record<string, FreshThemeConfig> = {
  'fresh-organic': {
    themePresetId: 'fresh-organic',
    accentColor: '#d7ff3b',
    accentGlowColor: 'rgba(215, 255, 59, 0.4)',
    surfaceBgColor: 'rgba(14, 20, 16, 0.75)',
    textColor: '#f5f5f7',
    bgMode: 'preset',
    bgPresetUrl: '/backgrounds/verdant_moss_bg.jpg',
    customBgUrl: null,
    bgBlur: 'md',
    bgOverlayOpacity: 0.75,
    customLogoUrl: null,
    customBrandName: '',
    animationIntensity: 'standard',
    enableFloatingGlow: true,
    enableMeshAnimation: true,
    showReleaseBadge: true,
    releaseBadgeText: 'Fresh 2.0 • Новое поколение защиты',
    heroItalicWord: 'надежно',
  },
  'fresh-emerald': {
    themePresetId: 'fresh-emerald',
    accentColor: '#10b981',
    accentGlowColor: 'rgba(16, 185, 129, 0.4)',
    surfaceBgColor: 'rgba(10, 18, 14, 0.8)',
    textColor: '#f5f5f7',
    bgMode: 'preset',
    bgPresetUrl: '/backgrounds/verdant_moss_bg.jpg',
    customBgUrl: null,
    bgBlur: 'md',
    bgOverlayOpacity: 0.8,
    customLogoUrl: null,
    customBrandName: '',
    animationIntensity: 'standard',
    enableFloatingGlow: true,
    enableMeshAnimation: true,
    showReleaseBadge: true,
    releaseBadgeText: 'Emerald Shield • Высокая скорость',
    heroItalicWord: 'быстро',
  },
  'fresh-cyber': {
    themePresetId: 'fresh-cyber',
    accentColor: '#06b6d4',
    accentGlowColor: 'rgba(6, 182, 212, 0.4)',
    surfaceBgColor: 'rgba(12, 16, 22, 0.8)',
    textColor: '#f5f5f7',
    bgMode: 'preset',
    bgPresetUrl: '/backgrounds/verdant_moss_bg.jpg',
    customBgUrl: null,
    bgBlur: 'md',
    bgOverlayOpacity: 0.8,
    customLogoUrl: null,
    customBrandName: '',
    animationIntensity: 'high',
    enableFloatingGlow: true,
    enableMeshAnimation: true,
    showReleaseBadge: true,
    releaseBadgeText: 'Cyber Neon • Защищенный туннель',
    heroItalicWord: 'анонимно',
  },
  'fresh-gold': {
    themePresetId: 'fresh-gold',
    accentColor: '#d4b37f',
    accentGlowColor: 'rgba(212, 179, 127, 0.4)',
    surfaceBgColor: 'rgba(18, 16, 12, 0.8)',
    textColor: '#f5f5f7',
    bgMode: 'preset',
    bgPresetUrl: '/backgrounds/verdant_moss_bg.jpg',
    customBgUrl: null,
    bgBlur: 'md',
    bgOverlayOpacity: 0.85,
    customLogoUrl: null,
    customBrandName: '',
    animationIntensity: 'standard',
    enableFloatingGlow: true,
    enableMeshAnimation: true,
    showReleaseBadge: true,
    releaseBadgeText: 'Gold Imperial • Премиум защита',
    heroItalicWord: 'роскошно',
  },
};

export const DEFAULT_FRESH_CONFIG: FreshThemeConfig = DEFAULT_FRESH_PRESETS['fresh-organic'];
