import { type CSSProperties, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { brandingApi, getCachedUltimaThemeConfig, type UltimaThemeConfig } from '@/api/branding';
import { getDefaultUltimaThemeWithPresets } from './presets';

const GREEN_COLOR_REGEX =
  /#(?:1bd29f|00d285|1ed6bf|21d09a|10b981|0c2d2a|0c2528|0f3a38|92f4d8|49e9b3|b8ffec|7ef0e4|0a2a35|0b2f36|20d0c0|42dec9)/i;

export function normalizeUltimaThemeConfig(config: UltimaThemeConfig): UltimaThemeConfig {
  const merged = {
    ...getDefaultUltimaThemeWithPresets(),
    ...config,
  };

  if (!merged.primaryColor || GREEN_COLOR_REGEX.test(merged.primaryColor)) {
    merged.primaryColor = '#d4b37f';
  }
  if (!merged.secondaryColor || GREEN_COLOR_REGEX.test(merged.secondaryColor)) {
    merged.secondaryColor = '#16181d';
  }
  if (!merged.surfaceColor || GREEN_COLOR_REGEX.test(merged.surfaceColor)) {
    merged.surfaceColor = '#121418';
  }
  if (!merged.surfaceBorderColor || GREEN_COLOR_REGEX.test(merged.surfaceBorderColor)) {
    merged.surfaceBorderColor = '#5a5040';
  }
  if (!merged.auraColor || GREEN_COLOR_REGEX.test(merged.auraColor)) {
    merged.auraColor = '#b89358';
  }
  if (!merged.ringColor || GREEN_COLOR_REGEX.test(merged.ringColor)) {
    merged.ringColor = '#d4b37f';
  }
  if (!merged.navBackgroundColor || GREEN_COLOR_REGEX.test(merged.navBackgroundColor)) {
    merged.navBackgroundColor = '#101216';
  }
  if (!merged.navActiveColor || GREEN_COLOR_REGEX.test(merged.navActiveColor)) {
    merged.navActiveColor = '#d4b37f';
  }

  return merged;
}

export function getUltimaThemeDerivedCssVarStyle(): CSSProperties {
  return {
    ['--ultima-bg-page-desktop' as string]:
      'radial-gradient(circle at 78% 12%, color-mix(in srgb, var(--ultima-color-aura) 12%, transparent), transparent 44%), radial-gradient(circle at 16% 86%, color-mix(in srgb, var(--ultima-color-ring) 8%, transparent), transparent 50%), linear-gradient(145deg, #090b0e 0%, #050608 50%, #020304 100%)',
    ['--ultima-bg-page-mobile' as string]:
      'radial-gradient(70% 42% at 50% 18%, color-mix(in srgb, var(--ultima-color-ring) 10%, transparent), transparent 66%), radial-gradient(92% 68% at 76% 62%, color-mix(in srgb, var(--ultima-color-aura) 18%, transparent), transparent 62%), linear-gradient(180deg, #0a0c0f 0%, #060709 40%, #030405 100%)',
    ['--ultima-bg-page-overlay-desktop' as string]:
      'radial-gradient(circle at 34% 82%, color-mix(in srgb, var(--ultima-color-aura) 8%, transparent), transparent 54%), radial-gradient(circle at 86% 18%, color-mix(in srgb, var(--ultima-color-ring) 6%, transparent), transparent 50%)',
    ['--ultima-bg-page-overlay-mobile' as string]:
      'radial-gradient(82% 48% at 28% 80%, color-mix(in srgb, var(--ultima-color-aura) 12%, transparent), transparent 58%), radial-gradient(66% 38% at 84% 22%, color-mix(in srgb, var(--ultima-color-ring) 10%, transparent), transparent 56%)',
    ['--ultima-bg-page-scrim-desktop' as string]:
      'linear-gradient(160deg, rgba(8,10,12,0.72) 0%, rgba(5,6,8,0.50) 44%, rgba(2,3,4,0.86) 100%)',
    ['--ultima-bg-page-scrim-mobile' as string]:
      'linear-gradient(180deg, rgba(8,10,12,0.22) 0%, rgba(5,6,8,0.12) 42%, rgba(2,3,4,0.46) 100%)',
    ['--ultima-bg-shell' as string]: 'linear-gradient(160deg, #0e1014 0%, #07080a 100%)',
    ['--ultima-bg-surface' as string]: 'linear-gradient(180deg, #181b22 0%, #0e1014 100%)',
    ['--ultima-bg-surface-soft' as string]:
      'linear-gradient(180deg, color-mix(in srgb, var(--ultima-color-surface) 42%, transparent) 0%, color-mix(in srgb, var(--ultima-color-secondary) 36%, transparent) 100%)',
    ['--ultima-bg-surface-strong' as string]: 'linear-gradient(180deg, #1c1f28 0%, #12141a 100%)',
    ['--ultima-bg-accent-surface' as string]:
      'radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--ultima-color-ring) 15%, transparent), transparent 36%), linear-gradient(135deg, color-mix(in srgb, var(--ultima-color-aura) 28%, #16181d) 0%, color-mix(in srgb, var(--ultima-color-secondary) 42%, #0e1014) 100%)',
    ['--ultima-bg-pane' as string]: 'linear-gradient(180deg, #161820 0%, #0d0f13 100%)',
    ['--ultima-border-soft' as string]:
      'color-mix(in srgb, var(--ultima-color-surface-border) 25%, transparent)',
    ['--ultima-border-medium' as string]:
      'color-mix(in srgb, var(--ultima-color-surface-border) 38%, transparent)',
    ['--ultima-text-strong' as string]: '#f5f5f7',
    ['--ultima-text-muted' as string]: '#8e929b',
    ['--ultima-shadow-surface' as string]:
      'inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 54px rgba(0,0,0,0.45)',
    ['--ultima-shadow-accent' as string]:
      'inset 0 1px 0 rgba(255,255,255,0.12), 0 30px 70px color-mix(in srgb, var(--ultima-color-aura) 14%, rgba(0,0,0,0.5))',
  };
}

export function getUltimaThemeCssVarStyle(config: UltimaThemeConfig): CSSProperties {
  const resolved = normalizeUltimaThemeConfig(config);

  return {
    ['--ultima-color-primary' as string]: resolved.primaryColor,
    ['--ultima-color-primary-text' as string]: resolved.primaryTextColor,
    ['--ultima-color-secondary' as string]: resolved.secondaryColor,
    ['--ultima-color-secondary-text' as string]: resolved.secondaryTextColor,
    ['--ultima-color-nav-bg' as string]: resolved.navBackgroundColor,
    ['--ultima-color-nav-active' as string]: resolved.navActiveColor,
    ['--ultima-color-nav-text' as string]: resolved.navTextColor,
    ['--ultima-color-bg-top' as string]: resolved.backgroundTopColor,
    ['--ultima-color-bg-bottom' as string]: resolved.backgroundBottomColor,
    ['--ultima-color-aura' as string]: resolved.auraColor,
    ['--ultima-color-ring' as string]: resolved.ringColor,
    ['--ultima-color-surface' as string]: resolved.surfaceColor,
    ['--ultima-color-surface-border' as string]: resolved.surfaceBorderColor,
    ['--ultima-color-scrollbar-thumb' as string]: resolved.scrollbarThumbColor,
    ['--ultima-color-scrollbar-track' as string]: resolved.scrollbarTrackColor,
    ['--ultima-animation-content-enter-ms' as string]: String(resolved.contentEnterMs),
    ['--ultima-animation-tap-ring-ms' as string]: String(resolved.tapRingMs),
    ['--ultima-animation-ring-wave-sec' as string]: String(resolved.ringWaveSec),
    ['--ultima-animation-slider-glow-sec' as string]: String(resolved.sliderGlowSec),
    ['--ultima-animation-step-ring-sec' as string]: String(resolved.stepRingSec),
    ['--ultima-animation-success-wave-ms' as string]: String(resolved.successWaveMs),
    ['--ultima-animation-item-enter-ms' as string]: String(resolved.itemEnterMs),
    ...getUltimaThemeDerivedCssVarStyle(),
  };
}

export function applyUltimaThemeConfig(config: UltimaThemeConfig) {
  const root = document.documentElement;
  const resolved = normalizeUltimaThemeConfig(config);
  const themeVars = getUltimaThemeCssVarStyle(resolved);

  for (const [key, value] of Object.entries(themeVars)) {
    root.style.setProperty(key, String(value));
  }
  root.dataset.ultimaAnimation = resolved.animationPresetId;
  root.classList.toggle('ultima-frames-enabled', resolved.framesEnabled === true);
}

export function useUltimaThemeConfig() {
  const cachedThemeConfig = getCachedUltimaThemeConfig() ?? getDefaultUltimaThemeWithPresets();
  const { data } = useQuery({
    queryKey: ['ultima-theme-config'],
    queryFn: brandingApi.getUltimaThemeConfig,
    initialData: cachedThemeConfig,
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!data) return;
    applyUltimaThemeConfig(data);
  }, [data]);
}
