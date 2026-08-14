import type { UltimaThemeConfig } from '@/api/branding';
import { DEFAULT_ULTIMA_THEME_CONFIG } from '@/api/branding';

export type UltimaThemePresetId =
  | 'samurai-gold'
  | 'midnight-gold'
  | 'imperial-bronze'
  | 'obsidian-titanium'
  | 'champagne-amber'
  | 'crimson-luxe'
  | 'polar-night';

export type UltimaAnimationPresetId =
  | 'classic-waves'
  | 'orbital-aura'
  | 'radar-sweep'
  | 'nebula-drift'
  | 'pulse-grid'
  | 'meteor-stream';

type ThemePresetConfig = Pick<
  UltimaThemeConfig,
  | 'primaryColor'
  | 'primaryTextColor'
  | 'secondaryColor'
  | 'secondaryTextColor'
  | 'navBackgroundColor'
  | 'navActiveColor'
  | 'navTextColor'
  | 'backgroundTopColor'
  | 'backgroundBottomColor'
  | 'auraColor'
  | 'ringColor'
  | 'surfaceColor'
  | 'surfaceBorderColor'
  | 'scrollbarThumbColor'
  | 'scrollbarTrackColor'
  | 'framesEnabled'
>;

type AnimationPresetConfig = Pick<
  UltimaThemeConfig,
  | 'contentEnterMs'
  | 'tapRingMs'
  | 'ringWaveSec'
  | 'sliderGlowSec'
  | 'stepRingSec'
  | 'successWaveMs'
  | 'itemEnterMs'
>;

export type UltimaThemePreset = {
  id: UltimaThemePresetId;
  name: string;
  description: string;
  accent: string;
  config: ThemePresetConfig;
};

export type UltimaAnimationPreset = {
  id: UltimaAnimationPresetId;
  name: string;
  description: string;
  config: AnimationPresetConfig;
};

export const ULTIMA_THEME_PRESETS: UltimaThemePreset[] = [
  {
    id: 'samurai-gold',
    name: 'Samurai Obsidian Gold',
    description:
      'Фирменный стиль Samurai Service: темный титан, шампанское золото и динамический ореол.',
    accent: '#d4b37f',
    config: {
      primaryColor: '#d4b37f',
      primaryTextColor: '#0a0c0f',
      secondaryColor: '#16181d',
      secondaryTextColor: '#f5f5f7',
      navBackgroundColor: '#101216',
      navActiveColor: '#d4b37f',
      navTextColor: '#d4b37f',
      backgroundTopColor: '#0a0c0f',
      backgroundBottomColor: '#040506',
      auraColor: '#b89358',
      ringColor: '#d4b37f',
      surfaceColor: '#121418',
      surfaceBorderColor: '#5a5040',
      scrollbarThumbColor: '#b89358',
      scrollbarTrackColor: '#101216',
      framesEnabled: false,
    },
  },
  {
    id: 'midnight-gold',
    name: 'Полночное золото',
    description: 'Матовый темный титан с шампань-золотыми акцентами и мягким ореолом.',
    accent: '#d4b37f',
    config: {
      primaryColor: '#d4b37f',
      primaryTextColor: '#0a0c0f',
      secondaryColor: '#16181d',
      secondaryTextColor: '#f5f5f7',
      navBackgroundColor: '#101216',
      navActiveColor: '#d4b37f',
      navTextColor: '#d4b37f',
      backgroundTopColor: '#0a0c0f',
      backgroundBottomColor: '#040506',
      auraColor: '#b89358',
      ringColor: '#d4b37f',
      surfaceColor: '#121418',
      surfaceBorderColor: '#5a5040',
      scrollbarThumbColor: '#b89358',
      scrollbarTrackColor: '#101216',
      framesEnabled: false,
    },
  },
  {
    id: 'imperial-bronze',
    name: 'Имперская бронза',
    description: 'Глубокий обсидиан и античная бронза с шелковистым свечением.',
    accent: '#c8aa76',
    config: {
      primaryColor: '#c8aa76',
      primaryTextColor: '#07080a',
      secondaryColor: '#14161a',
      secondaryTextColor: '#f7f6f2',
      navBackgroundColor: '#0f1114',
      navActiveColor: '#c8aa76',
      navTextColor: '#c8aa76',
      backgroundTopColor: '#07080a',
      backgroundBottomColor: '#020304',
      auraColor: '#a88247',
      ringColor: '#c8aa76',
      surfaceColor: '#121316',
      surfaceBorderColor: '#4a4235',
      scrollbarThumbColor: '#a88247',
      scrollbarTrackColor: '#0f1114',
      framesEnabled: false,
    },
  },
  {
    id: 'obsidian-titanium',
    name: 'Обсидиановый титан',
    description: 'Монохромный графит с полированными титановыми гранями.',
    accent: '#e2e4e9',
    config: {
      primaryColor: '#e2e4e9',
      primaryTextColor: '#0a0c0f',
      secondaryColor: '#181a1f',
      secondaryTextColor: '#ffffff',
      navBackgroundColor: '#121418',
      navActiveColor: '#e2e4e9',
      navTextColor: '#e2e4e9',
      backgroundTopColor: '#090a0d',
      backgroundBottomColor: '#030405',
      auraColor: '#8a909a',
      ringColor: '#e2e4e9',
      surfaceColor: '#14161a',
      surfaceBorderColor: '#42464e',
      scrollbarThumbColor: '#8a909a',
      scrollbarTrackColor: '#121418',
      framesEnabled: false,
    },
  },
  {
    id: 'champagne-amber',
    name: 'Шампань и янтарь',
    description: 'Теплый золотистый янтарь на бархатном темном фоне.',
    accent: '#f3b63c',
    config: {
      primaryColor: '#f3b63c',
      primaryTextColor: '#1f1a0a',
      secondaryColor: '#1a1816',
      secondaryTextColor: '#fff9f0',
      navBackgroundColor: '#141311',
      navActiveColor: '#f3b63c',
      navTextColor: '#f3b63c',
      backgroundTopColor: '#0a0907',
      backgroundBottomColor: '#030302',
      auraColor: '#f0b04f',
      ringColor: '#ffe0a3',
      surfaceColor: '#161411',
      surfaceBorderColor: '#5c4e36',
      scrollbarThumbColor: '#f0bd67',
      scrollbarTrackColor: '#141311',
      framesEnabled: true,
    },
  },
  {
    id: 'crimson-luxe',
    name: 'Бордовый люкс',
    description: 'Глубокий рубиновый акцент, темный металл и плотное свечение.',
    accent: '#ff5a5f',
    config: {
      primaryColor: '#ff5a5f',
      primaryTextColor: '#210708',
      secondaryColor: '#2a1115',
      secondaryTextColor: '#fff1f1',
      navBackgroundColor: '#311318',
      navActiveColor: '#ff5a5f',
      navTextColor: '#ffd7d8',
      backgroundTopColor: '#0f0709',
      backgroundBottomColor: '#220d12',
      auraColor: '#ff4a57',
      ringColor: '#ffc0c4',
      surfaceColor: '#2b1217',
      surfaceBorderColor: '#ff8e95',
      scrollbarThumbColor: '#ff6a70',
      scrollbarTrackColor: '#1d0c10',
      framesEnabled: false,
    },
  },
  {
    id: 'polar-night',
    name: 'Полярная ночь',
    description: 'Сине-ледяной градиент, сапфировое свечение и спокойная глубина.',
    accent: '#72b8ff',
    config: {
      primaryColor: '#72b8ff',
      primaryTextColor: '#071521',
      secondaryColor: '#10263d',
      secondaryTextColor: '#f0f7ff',
      navBackgroundColor: '#122b43',
      navActiveColor: '#72b8ff',
      navTextColor: '#d6ecff',
      backgroundTopColor: '#04101e',
      backgroundBottomColor: '#0a1d33',
      auraColor: '#5faaff',
      ringColor: '#c5e2ff',
      surfaceColor: '#122b44',
      surfaceBorderColor: '#96cbff',
      scrollbarThumbColor: '#6daffe',
      scrollbarTrackColor: '#10253b',
      framesEnabled: false,
    },
  },
];

export const ULTIMA_ANIMATION_PRESETS: UltimaAnimationPreset[] = [
  {
    id: 'classic-waves',
    name: 'Классические волны',
    description: 'Каноничные волны Ultima: синхронные пульсации с мягким шлейфом.',
    config: {
      contentEnterMs: 620,
      tapRingMs: 1400,
      ringWaveSec: 18,
      sliderGlowSec: 3.2,
      stepRingSec: 5.8,
      successWaveMs: 1800,
      itemEnterMs: 240,
    },
  },
  {
    id: 'orbital-aura',
    name: 'Орбитальная аура',
    description: 'Широкое вращающееся свечение с мягкими фазовыми переходами.',
    config: {
      contentEnterMs: 700,
      tapRingMs: 1600,
      ringWaveSec: 22,
      sliderGlowSec: 3.6,
      stepRingSec: 6.4,
      successWaveMs: 1900,
      itemEnterMs: 260,
    },
  },
  {
    id: 'radar-sweep',
    name: 'Радарное сканирование',
    description: 'Направленный световой импульс с кинематографичной динамикой.',
    config: {
      contentEnterMs: 540,
      tapRingMs: 1200,
      ringWaveSec: 14,
      sliderGlowSec: 2.8,
      stepRingSec: 4.8,
      successWaveMs: 1600,
      itemEnterMs: 210,
    },
  },
  {
    id: 'nebula-drift',
    name: 'Дрейф туманности',
    description: 'Плавные диффузные пятна света без жестких контуров.',
    config: {
      contentEnterMs: 780,
      tapRingMs: 1750,
      ringWaveSec: 26,
      sliderGlowSec: 4.2,
      stepRingSec: 7.2,
      successWaveMs: 2100,
      itemEnterMs: 280,
    },
  },
  {
    id: 'pulse-grid',
    name: 'Импульсная сеть',
    description: 'Быстрые отклики интерфейса и акцентные вспышки на действиях.',
    config: {
      contentEnterMs: 460,
      tapRingMs: 1050,
      ringWaveSec: 12,
      sliderGlowSec: 2.4,
      stepRingSec: 4.2,
      successWaveMs: 1400,
      itemEnterMs: 180,
    },
  },
  {
    id: 'meteor-stream',
    name: 'Метеорный поток',
    description: 'Динамичный световой поток с короткими выразительными траекториями.',
    config: {
      contentEnterMs: 500,
      tapRingMs: 1150,
      ringWaveSec: 13,
      sliderGlowSec: 2.6,
      stepRingSec: 4.4,
      successWaveMs: 1500,
      itemEnterMs: 190,
    },
  },
];

export function getDefaultUltimaThemeWithPresets(): UltimaThemeConfig {
  const defaultTheme = ULTIMA_THEME_PRESETS[0];
  const defaultAnimation = ULTIMA_ANIMATION_PRESETS[0];
  return {
    ...DEFAULT_ULTIMA_THEME_CONFIG,
    ...defaultTheme.config,
    ...defaultAnimation.config,
    themePresetId: defaultTheme.id,
    animationPresetId: defaultAnimation.id,
  };
}

export function getUltimaThemePresetById(id: string): UltimaThemePreset {
  return ULTIMA_THEME_PRESETS.find((preset) => preset.id === id) ?? ULTIMA_THEME_PRESETS[0];
}

export function getUltimaAnimationPresetById(id: string): UltimaAnimationPreset {
  return ULTIMA_ANIMATION_PRESETS.find((preset) => preset.id === id) ?? ULTIMA_ANIMATION_PRESETS[0];
}

export function applyUltimaThemePreset(
  current: UltimaThemeConfig,
  presetId: string,
): UltimaThemeConfig {
  const preset = getUltimaThemePresetById(presetId);
  return {
    ...current,
    ...preset.config,
    themePresetId: preset.id,
  };
}

export function applyUltimaAnimationPreset(
  current: UltimaThemeConfig,
  presetId: string,
): UltimaThemeConfig {
  const preset = getUltimaAnimationPresetById(presetId);
  return {
    ...current,
    ...preset.config,
    animationPresetId: preset.id,
  };
}

export const applyThemePreset = applyUltimaThemePreset;
export const applyAnimationPreset = applyUltimaAnimationPreset;
