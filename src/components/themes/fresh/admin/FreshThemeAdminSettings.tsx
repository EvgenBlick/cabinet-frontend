import { useState } from 'react';
import {
  Check,
  Eye,
  Image as ImageIcon,
  Laptop,
  Palette,
  RefreshCw,
  Save,
  Sliders,
  Smartphone,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { useFreshTheme } from '@/hooks/useFreshTheme';
import { DEFAULT_FRESH_PRESETS } from '@/types/freshTheme';
import { FreshDesktopDashboard } from '../desktop/FreshDesktopDashboard';
import { FreshMobileDashboard } from '../mobile/FreshMobileDashboard';

const COLOR_PALETTES = [
  { name: 'Electric Lime', color: '#d7ff3b', glow: 'rgba(215, 255, 59, 0.45)' },
  { name: 'Emerald Forest', color: '#10b981', glow: 'rgba(16, 185, 129, 0.45)' },
  { name: 'Cyber Cyan', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.45)' },
  { name: 'Champagne Gold', color: '#d4b37f', glow: 'rgba(212, 179, 127, 0.45)' },
  { name: 'Neon Purple', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)' },
];

export function FreshThemeAdminSettings() {
  const { config, updateConfig, setPreset, setCustomBackground, setCustomLogo, setAccentColor } =
    useFreshTheme();

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [customBgInput, setCustomBgInput] = useState(config.customBgUrl || '');
  const [customLogoInput, setCustomLogoInput] = useState(config.customLogoUrl || '');
  const [brandNameInput, setBrandNameInput] = useState(config.customBrandName || '');
  const [badgeInput, setBadgeInput] = useState(config.releaseBadgeText || '');
  const [italicWordInput, setItalicWordInput] = useState(config.heroItalicWord || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleApplyLogo = () => {
    setCustomLogo(customLogoInput.trim() || null);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleApplyBg = () => {
    setCustomBackground(customBgInput.trim() || null);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveAll = () => {
    updateConfig({
      ...config,
      customLogoUrl: customLogoInput.trim() || null,
      customBrandName: brandNameInput.trim(),
      customBgUrl: customBgInput.trim() || null,
      bgMode: customBgInput.trim() ? 'custom' : 'preset',
      releaseBadgeText: badgeInput,
      heroItalicWord: italicWordInput,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Mock subscription and metrics for simulator
  const mockSub = {
    id: 1,
    url: 'https://samuraiservice.org/sub/demo',
    subscription_url: 'https://samuraiservice.org/sub/demo',
    device_limit: 5,
    days_left: 30,
    status: 'active',
  };

  return (
    <div className="space-y-8 p-6 text-[#f5f5f7]">
      {/* 1. Header */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#d7ff3b] shadow-[0_0_8px_#d7ff3b]" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Кастомизация темы FRESH (Verdant)
            </h2>
          </div>
          <p className="text-xs text-[#8e929b]">
            Установка собственного логотипа, названия бренда, фонового арта и цветовой палитры.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreset('fresh-organic')}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-[#8e929b] transition-colors hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Сбросить к стандарту</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-black shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: config.accentColor || '#d7ff3b' }}
          >
            {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            <span>{isSaved ? 'Сохранено!' : 'Сохранить настройки'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Settings Controls (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Card 1: Logo & Brand Name Customization */}
          <div className="rounded-2xl border border-white/10 bg-[#0e1410]/80 p-5 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d7ff3b]">
              <Tag className="h-4 w-4" />
              <span>Логотип и Название бренда</span>
            </div>

            <div className="space-y-4">
              {/* Custom Logo URL / Image */}
              <div>
                <label className="text-xs font-medium text-[#8e929b]">
                  URL пользовательского логотипа (PNG/SVG):
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/my-logo.png"
                    value={customLogoInput}
                    onChange={(e) => setCustomLogoInput(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder:text-[#52575e] focus:border-[#d7ff3b] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyLogo}
                    className="rounded-xl px-3.5 py-2 text-xs font-bold text-black"
                    style={{ backgroundColor: config.accentColor || '#d7ff3b' }}
                  >
                    Применить
                  </button>
                </div>
              </div>

              {/* Logo Preview box */}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0d1610] shadow-md">
                    {config.customLogoUrl ? (
                      <img
                        src={config.customLogoUrl}
                        alt="Logo"
                        className="h-6 w-6 object-contain"
                      />
                    ) : (
                      <svg
                        className="h-6 w-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={config.accentColor || '#d7ff3b'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {config.customLogoUrl
                        ? 'Кастомный логотип активен'
                        : 'Стандартный логотип темы (Листок)'}
                    </div>
                    <div className="text-[10px] text-[#8e929b]">
                      Отображается в шапке, авторизации, лоадере и футере
                    </div>
                  </div>
                </div>

                {config.customLogoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomLogoInput('');
                      setCustomLogo(null);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    title="Сбросить логотип"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Brand Name Input */}
              <div>
                <label className="text-xs font-medium text-[#8e929b]">
                  Отображаемое имя проекта:
                </label>
                <input
                  type="text"
                  placeholder="Например: VERDANT или MY SERVICE"
                  value={brandNameInput}
                  onChange={(e) => setBrandNameInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder:text-[#52575e] focus:border-[#d7ff3b] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Presets & Themes */}
          <div className="rounded-2xl border border-white/10 bg-[#0e1410]/80 p-5 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d7ff3b]">
              <Sliders className="h-4 w-4" />
              <span>Готовые пресеты</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {Object.entries(DEFAULT_FRESH_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPreset(key as any)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all ${
                    config.themePresetId === key
                      ? 'border-[#d7ff3b] bg-[#d7ff3b]/10 text-white shadow-[0_0_15px_rgba(215,255,59,0.2)]'
                      : 'border-white/10 bg-white/[0.02] text-[#8e929b] hover:bg-white/[0.06]'
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                  <span>
                    {key === 'fresh-organic'
                      ? 'Organic'
                      : key === 'fresh-emerald'
                        ? 'Emerald'
                        : 'Cyber'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Custom Background Uploader */}
          <div className="rounded-2xl border border-white/10 bg-[#0e1410]/80 p-5 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d7ff3b]">
              <ImageIcon className="h-4 w-4" />
              <span>Фоновое изображение</span>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-[#8e929b]">URL фонового изображения:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/wallpaper.jpg"
                  value={customBgInput}
                  onChange={(e) => setCustomBgInput(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder:text-[#52575e] focus:border-[#d7ff3b] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyBg}
                  className="rounded-xl px-3.5 py-2 text-xs font-bold text-black"
                  style={{ backgroundColor: config.accentColor || '#d7ff3b' }}
                >
                  Применить
                </button>
              </div>

              {config.customBgUrl && (
                <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-xs">
                  <span className="truncate text-emerald-400">Кастомный фон активен</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBgInput('');
                      setCustomBackground(null);
                    }}
                    className="text-[11px] text-red-400 hover:underline"
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Accent Colors */}
          <div className="rounded-2xl border border-white/10 bg-[#0e1410]/80 p-5 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d7ff3b]">
              <Palette className="h-4 w-4" />
              <span>Цвета неонового свечения</span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {COLOR_PALETTES.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setAccentColor(item.color, item.glow)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all ${
                    config.accentColor === item.color
                      ? 'border-white bg-white/10 font-bold text-white'
                      : 'border-white/10 bg-white/[0.02] text-[#8e929b] hover:bg-white/[0.06]'
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card 5: Hero Copy Customizer */}
          <div className="rounded-2xl border border-white/10 bg-[#0e1410]/80 p-5 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d7ff3b]">
              <Sparkles className="h-4 w-4" />
              <span>Тексты Hero-блока</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-[#8e929b]">Текст бейджа релиза:</label>
                <input
                  type="text"
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder:text-[#52575e] focus:border-[#d7ff3b] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8e929b]">
                  Курсивное акцентное слово в заголовке:
                </label>
                <input
                  type="text"
                  value={italicWordInput}
                  onChange={(e) => setItalicWordInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder:text-[#52575e] focus:border-[#d7ff3b] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Dual Simulator (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          {/* Simulator Bar */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0e1410]/80 p-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Eye className="h-4 w-4" style={{ color: config.accentColor || '#d7ff3b' }} />
              <span>Интерактивный симулятор</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  previewDevice === 'desktop'
                    ? 'bg-white/15 text-white'
                    : 'text-[#8e929b] hover:text-white'
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Десктоп (ПК)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  previewDevice === 'mobile'
                    ? 'bg-white/15 text-white'
                    : 'text-[#8e929b] hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Смартфон (Touch)</span>
              </button>
            </div>
          </div>

          {/* Simulator Screen Frame */}
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-black shadow-2xl">
            {previewDevice === 'desktop' ? (
              <div className="h-[680px] w-full overflow-y-auto">
                <FreshDesktopDashboard
                  subscription={mockSub as any}
                  connectedDevicesCount={1}
                  daysLeft={30}
                  onBuySubscription={() => {}}
                  onOpenConnection={() => {}}
                  onOpenSupport={() => {}}
                />
              </div>
            ) : (
              <div className="flex justify-center bg-[#040605] p-6">
                <div className="h-[680px] w-[375px] overflow-hidden rounded-[40px] border-4 border-[#222] bg-black shadow-2xl">
                  <div className="h-full w-full overflow-y-auto">
                    <FreshMobileDashboard
                      subscription={mockSub as any}
                      connectedDevicesCount={1}
                      daysLeft={30}
                      onBuySubscription={() => {}}
                      onOpenConnection={() => {}}
                      onOpenSupport={() => {}}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
