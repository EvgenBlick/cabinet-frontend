import { useState } from 'react';
import {
  Activity,
  Check,
  Crown,
  Eye,
  Globe,
  Image as ImageIcon,
  Laptop,
  Layers,
  Palette,
  RefreshCw,
  Save,
  Smartphone,
  Sparkles,
  SunMoon,
  Tag,
  Wand2,
  X,
} from 'lucide-react';
import { useFreshTheme } from '@/hooks/useFreshTheme';
import { useActiveTheme } from '@/hooks/useActiveTheme';
import { useBranding } from '@/hooks/useBranding';
import { FreshDesktopDashboard } from '../desktop/FreshDesktopDashboard';
import { FreshMobileDashboard } from '../mobile/FreshMobileDashboard';
import AdminUltimaTheme from '@/pages/AdminUltimaTheme';

const COLOR_PALETTES = [
  { name: 'Electric Lime', color: '#d7ff3b', glow: 'rgba(215, 255, 59, 0.45)' },
  { name: 'Emerald Forest', color: '#10b981', glow: 'rgba(16, 185, 129, 0.45)' },
  { name: 'Cyber Cyan', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.45)' },
  { name: 'Champagne Gold', color: '#d4b37f', glow: 'rgba(212, 179, 127, 0.45)' },
  { name: 'Neon Purple', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)' },
];

const PRESET_WALLPAPERS = [
  { name: 'Verdant Deep Forest', url: '/backgrounds/verdant_moss_bg.jpg' },
  {
    name: 'Cyber Grid Night',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop',
  },
  {
    name: 'Emerald Abstract Silk',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop',
  },
  {
    name: 'Gold Nebula Luxury',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1920&auto=format&fit=crop',
  },
];

export function FreshThemeAdminSettings() {
  const { config, updateConfig, setPreset, setCustomBackground, setCustomLogo, setAccentColor } =
    useFreshTheme();

  const { activeTheme, setActiveTheme } = useActiveTheme();
  const { appName, logoUrl } = useBranding();

  const [activeTab, setActiveTab] = useState<'fresh' | 'ultima' | 'classic'>('fresh');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Fresh Theme Form State
  const [customBgInput, setCustomBgInput] = useState(config.customBgUrl || '');
  const [customLogoInput, setCustomLogoInput] = useState(config.customLogoUrl || '');
  const [brandNameInput, setBrandNameInput] = useState(config.customBrandName || '');
  const [badgeInput, setBadgeInput] = useState(config.releaseBadgeText || '');
  const [italicWordInput, setItalicWordInput] = useState(config.heroItalicWord || '');
  const [overlayOpacity, setOverlayOpacity] = useState(config.bgOverlayOpacity ?? 0.75);
  const [bgBlur, setBgBlur] = useState(config.bgBlur ?? 'md');
  const [animIntensity, setAnimIntensity] = useState(config.animationIntensity ?? 'standard');
  const [enableGlow, setEnableGlow] = useState(config.enableFloatingGlow ?? true);
  const [enableMesh, setEnableMesh] = useState(config.enableMeshAnimation ?? true);
  const [customHexInput, setCustomHexInput] = useState(config.accentColor || '#d7ff3b');
  const [isSaved, setIsSaved] = useState(false);

  // Classic Theme Form State
  const [classicName, setClassicName] = useState(appName || '');
  const [classicLogo, setClassicLogo] = useState(logoUrl || '');
  const [classicPrimaryColor, setClassicPrimaryColor] = useState('#d4b37f');

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

  const handleApplyCustomHex = () => {
    if (/^#[0-9A-F]{6}$/i.test(customHexInput)) {
      setAccentColor(customHexInput, `${customHexInput}66`);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleSaveFreshAll = () => {
    updateConfig({
      ...config,
      customLogoUrl: customLogoInput.trim() || null,
      customBrandName: brandNameInput.trim(),
      customBgUrl: customBgInput.trim() || null,
      bgMode: customBgInput.trim() ? 'custom' : 'preset',
      bgBlur,
      bgOverlayOpacity: overlayOpacity,
      animationIntensity: animIntensity,
      enableFloatingGlow: enableGlow,
      enableMeshAnimation: enableMesh,
      releaseBadgeText: badgeInput,
      heroItalicWord: italicWordInput,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveClassic = () => {
    try {
      localStorage.setItem('cabinet_classic_name', classicName);
      localStorage.setItem('cabinet_classic_logo', classicLogo);
      localStorage.setItem('cabinet_classic_color', classicPrimaryColor);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      // ignore
    }
  };

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
      {/* 1. Global Active Theme Selector Bar */}
      <div className="rounded-3xl border border-white/10 bg-[#0e1410]/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#d7ff3b]" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                Центр управления темами оформления
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-[#8e929b]">
              Выберите активную тему для всех пользователей и настройте каждую тему индивидуально.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8e929b]">Активная тема для клиентов:</span>
            <span className="rounded-full border border-[#d7ff3b]/40 bg-[#d7ff3b]/10 px-3.5 py-1 text-xs font-extrabold text-[#d7ff3b]">
              {activeTheme === 'fresh'
                ? '🌿 FRESH (Verdant)'
                : activeTheme === 'ultima'
                  ? '🥇 Samurai Gold (Ultima)'
                  : '🏛 Classic'}
            </span>
          </div>
        </div>

        {/* 3 Theme Choice Cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Option 1: FRESH */}
          <div
            className={`flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
              activeTheme === 'fresh'
                ? 'border-[#d7ff3b] bg-[#d7ff3b]/10 shadow-[0_0_25px_rgba(215,255,59,0.2)]'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 rounded-full bg-[#d7ff3b] shadow-[0_0_8px_#d7ff3b]" />
                  <span className="text-sm font-bold text-white">FRESH (Verdant)</span>
                </div>
                {activeTheme === 'fresh' && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d7ff3b] font-bold text-black">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-[#8e929b]">
                Современный дизайн: темный лес/мох, Bento-виджеты,Happ/Incy в 1 клик, живая
                телеметрия и тонкая настройка фонов.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTheme('fresh')}
                className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  activeTheme === 'fresh'
                    ? 'bg-[#d7ff3b] text-black shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {activeTheme === 'fresh' ? 'Активна ✓' : 'Сделать активной'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('fresh')}
                className={`rounded-xl border border-white/10 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'fresh'
                    ? 'bg-white/20 text-white'
                    : 'text-[#8e929b] hover:text-white'
                }`}
              >
                Настроить →
              </button>
            </div>
          </div>

          {/* Option 2: SAMURAI GOLD */}
          <div
            className={`flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
              activeTheme === 'ultima'
                ? 'border-[#d4b37f] bg-[#d4b37f]/10 shadow-[0_0_25px_rgba(212,179,127,0.2)]'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-[#d4b37f]" />
                  <span className="text-sm font-bold text-white">Samurai Gold (Ultima)</span>
                </div>
                {activeTheme === 'ultima' && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4b37f] font-bold text-black">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-[#8e929b]">
                Премиальное золото: графитовые поверхности, вращающиеся кольца, аура шампанского и
                точный тюнинг динамики.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTheme('ultima')}
                className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  activeTheme === 'ultima'
                    ? 'bg-[#d4b37f] text-black shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {activeTheme === 'ultima' ? 'Активна ✓' : 'Сделать активной'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ultima')}
                className={`rounded-xl border border-white/10 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'ultima'
                    ? 'bg-white/20 text-white'
                    : 'text-[#8e929b] hover:text-white'
                }`}
              >
                Настроить →
              </button>
            </div>
          </div>

          {/* Option 3: CLASSIC */}
          <div
            className={`flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
              activeTheme === 'classic'
                ? 'border-sky-400 bg-sky-400/10 shadow-[0_0_25px_rgba(56,189,248,0.2)]'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-sky-400" />
                  <span className="text-sm font-bold text-white">Classic</span>
                </div>
                {activeTheme === 'classic' && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-400 font-bold text-black">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-[#8e929b]">
                Классический минималистичный интерфейс кабинета со светлой и тёмной версией,
                карточками и стандартной сеткой.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTheme('classic')}
                className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  activeTheme === 'classic'
                    ? 'bg-sky-400 text-black shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {activeTheme === 'classic' ? 'Активна ✓' : 'Сделать активной'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('classic')}
                className={`rounded-xl border border-white/10 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'classic'
                    ? 'bg-white/20 text-white'
                    : 'text-[#8e929b] hover:text-white'
                }`}
              >
                Настроить →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Customization Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('fresh')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'fresh'
              ? 'bg-[#d7ff3b] text-black shadow-lg shadow-[#d7ff3b]/20'
              : 'text-[#8e929b] hover:bg-white/5 hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Кастомизация FRESH (Verdant)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ultima')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'ultima'
              ? 'bg-[#d4b37f] text-black shadow-lg shadow-[#d4b37f]/20'
              : 'text-[#8e929b] hover:bg-white/5 hover:text-white'
          }`}
        >
          <Crown className="h-4 w-4" />
          <span>Кастомизация Samurai Gold (Ultima)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('classic')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'classic'
              ? 'bg-sky-400 text-black shadow-lg shadow-sky-400/20'
              : 'text-[#8e929b] hover:bg-white/5 hover:text-white'
          }`}
        >
          <SunMoon className="h-4 w-4" />
          <span>Кастомизация Classic</span>
        </button>
      </div>

      {/* 3. Tab 1: FRESH Customization Suite */}
      {activeTab === 'fresh' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Параметры темы FRESH</h3>
              <p className="text-xs text-[#8e929b]">
                Замена логотипа, фона, степени размытия, анимаций свечения и интерактивный
                симулятор.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPreset('fresh-organic')}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-[#8e929b] hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Сбросить к стандарту</span>
              </button>

              <button
                type="button"
                onClick={handleSaveFreshAll}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-black shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: config.accentColor || '#d7ff3b' }}
              >
                {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                <span>{isSaved ? 'Сохранено!' : 'Сохранить настройки'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Controls (5 cols) */}
            <div className="space-y-6 lg:col-span-5">
              {/* Logo & Brand Card */}
              <div className="rounded-2xl border border-white/10 bg-[#0e1410]/80 p-5 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d7ff3b]">
                  <Tag className="h-4 w-4" />
                  <span>Логотип и Название бренда</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#8e929b]">
                      URL логотипа (PNG / SVG / WebP):
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="https://example.com/logo.png"
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
                        ОК
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0d1610]">
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
                            ? 'Кастомный логотип'
                            : 'Стандартный логотип (Листок)'}
                        </div>
                        <div className="text-[10px] text-[#8e929b]">
                          В шапке, логине и прелоадере
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
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-[#8e929b]">
                      Отображаемое имя проекта в меню:
                    </label>
                    <input
                      type="text"
                      placeholder="Например: VERDANT или SAMURAI"
                      value={brandNameInput}
                      onChange={(e) => setBrandNameInput(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder:text-[#52575e] focus:border-[#d7ff3b] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Background Wallpapers & Glass Blur */}
              <div className="rounded-2xl border border-white/10 bg-[#0e1410]/80 p-5 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d7ff3b]">
                  <ImageIcon className="h-4 w-4" />
                  <span>Фоны, Обои и Размытие</span>
                </div>

                <div className="space-y-4">
                  {/* Preset Wallpaper Gallery */}
                  <div>
                    <label className="text-xs text-[#8e929b]">Готовые фоновые обои:</label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      {PRESET_WALLPAPERS.map((wp) => (
                        <button
                          key={wp.name}
                          type="button"
                          onClick={() => {
                            setCustomBgInput(wp.url);
                            setCustomBackground(wp.url);
                          }}
                          className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition-all ${
                            config.customBgUrl === wp.url
                              ? 'border-[#d7ff3b] bg-[#d7ff3b]/10 text-white'
                              : 'border-white/10 bg-white/[0.02] text-[#8e929b] hover:bg-white/[0.05]'
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-[#d7ff3b]" />
                          <span className="truncate">{wp.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Background URL input */}
                  <div>
                    <label className="text-xs text-[#8e929b]">Или свой URL изображения:</label>
                    <div className="mt-1 flex items-center gap-2">
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
                        ОК
                      </button>
                    </div>
                  </div>

                  {/* Overlay Opacity Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8e929b]">Затемнение фона (Оверлей):</span>
                      <span className="font-bold text-white">
                        {Math.round(overlayOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="0.95"
                      step="0.05"
                      value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                      className="mt-1.5 w-full accent-[#d7ff3b]"
                    />
                  </div>

                  {/* Glass Blur Level */}
                  <div>
                    <label className="text-xs text-[#8e929b]">
                      Размытие стекла (Backdrop Blur):
                    </label>
                    <div className="mt-1.5 grid grid-cols-4 gap-2">
                      {(['none', 'sm', 'md', 'lg'] as const).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBgBlur(b)}
                          className={`rounded-xl border py-1.5 text-xs font-medium transition-all ${
                            bgBlur === b
                              ? 'border-[#d7ff3b] bg-[#d7ff3b]/10 text-white'
                              : 'border-white/10 bg-white/[0.02] text-[#8e929b] hover:bg-white/[0.05]'
                          }`}
                        >
                          {b === 'none'
                            ? 'Без блюра'
                            : b === 'sm'
                              ? 'Лёгкий'
                              : b === 'md'
                                ? 'Средний'
                                : 'Сильный'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Accent Color & Custom Hex */}
              <div className="rounded-2xl border border-white/10 bg-[#0e1410]/80 p-5 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d7ff3b]">
                  <Palette className="h-4 w-4" />
                  <span>Цвета неонового свечения</span>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTES.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          setAccentColor(item.color, item.glow);
                          setCustomHexInput(item.color);
                        }}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition-all ${
                          config.accentColor === item.color
                            ? 'border-white bg-white/15 font-bold text-white'
                            : 'border-white/10 bg-white/[0.02] text-[#8e929b] hover:bg-white/[0.06]'
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 border-t border-white/10 pt-2">
                    <label className="text-xs text-[#8e929b]">Свой HEX:</label>
                    <input
                      type="text"
                      placeholder="#d7ff3b"
                      value={customHexInput}
                      onChange={(e) => setCustomHexInput(e.target.value)}
                      className="w-28 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs uppercase text-white focus:border-[#d7ff3b] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomHex}
                      className="rounded-xl px-3 py-1.5 text-xs font-bold text-black"
                      style={{ backgroundColor: config.accentColor || '#d7ff3b' }}
                    >
                      Применить
                    </button>
                  </div>
                </div>
              </div>

              {/* Animations & Dynamics */}
              <div className="rounded-2xl border border-white/10 bg-[#0e1410]/80 p-5 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d7ff3b]">
                  <Activity className="h-4 w-4" />
                  <span>Анимации и Эффекты</span>
                </div>

                <div className="space-y-4">
                  {/* Animation Intensity */}
                  <div>
                    <label className="text-xs text-[#8e929b]">Интенсивность анимаций:</label>
                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                      {(['subtle', 'standard', 'high'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setAnimIntensity(lvl)}
                          className={`rounded-xl border py-1.5 text-xs font-medium transition-all ${
                            animIntensity === lvl
                              ? 'border-[#d7ff3b] bg-[#d7ff3b]/10 text-white'
                              : 'border-white/10 bg-white/[0.02] text-[#8e929b] hover:bg-white/[0.05]'
                          }`}
                        >
                          {lvl === 'subtle' ? 'Мягкая' : lvl === 'standard' ? 'Стандарт' : 'Турбо'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle Glow */}
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                    <span className="text-xs text-white">Парящие неоновые блики и аура</span>
                    <input
                      type="checkbox"
                      checked={enableGlow}
                      onChange={(e) => setEnableGlow(e.target.checked)}
                      className="h-4 w-4 accent-[#d7ff3b]"
                    />
                  </label>

                  {/* Toggle Mesh */}
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                    <span className="text-xs text-white">Интерактивная mesh-сетка фона</span>
                    <input
                      type="checkbox"
                      checked={enableMesh}
                      onChange={(e) => setEnableMesh(e.target.checked)}
                      className="h-4 w-4 accent-[#d7ff3b]"
                    />
                  </label>
                </div>
              </div>

              {/* Hero Copy */}
              <div className="rounded-2xl border border-white/10 bg-[#0e1410]/80 p-5 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d7ff3b]">
                  <Wand2 className="h-4 w-4" />
                  <span>Тексты и Бейджи Hero-блока</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-[#8e929b]">Текст бейджа релиза:</label>
                    <input
                      type="text"
                      value={badgeInput}
                      onChange={(e) => setBadgeInput(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-[#d7ff3b] focus:outline-none"
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
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-[#d7ff3b] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Simulator (7 cols) */}
            <div className="space-y-4 lg:col-span-7">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0e1410]/80 p-3 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Eye className="h-4 w-4" style={{ color: config.accentColor || '#d7ff3b' }} />
                  <span>Интерактивный симулятор FRESH</span>
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

              <div className="overflow-hidden rounded-3xl border border-white/15 bg-black shadow-2xl">
                {previewDevice === 'desktop' ? (
                  <div className="h-[720px] w-full overflow-y-auto">
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
                    <div className="h-[720px] w-[375px] overflow-hidden rounded-[40px] border-4 border-[#222] bg-black shadow-2xl">
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
      )}

      {/* 4. Tab 2: SAMURAI GOLD (Ultima) Full Suite */}
      {activeTab === 'ultima' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#d4b37f]/20 bg-[#16120b]/60 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#d4b37f]">
              <Crown className="h-4 w-4" />
              <span>Кастомизация темы Samurai Gold (Ultima)</span>
            </div>
            <p className="mt-1 text-xs text-[#a0907e]">
              Настройка золотых палитр, времени анимаций колец, контрастности текста и живой
              симулятор всех сцен Ultima.
            </p>
          </div>

          <AdminUltimaTheme />
        </div>
      )}

      {/* 5. Tab 3: CLASSIC Theme Suite */}
      {activeTab === 'classic' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-sky-400/20 bg-sky-950/20 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-sky-400">
              <Globe className="h-4 w-4" />
              <span>Кастомизация темы Classic</span>
            </div>
            <p className="mt-1 text-xs text-[#8e929b]">
              Классический вид кабинета: название проекта, логотип и глобальный акцентный цвет.
            </p>
          </div>

          <div className="max-w-xl space-y-4 rounded-2xl border border-white/10 bg-[#0e1410]/80 p-5">
            <div>
              <label className="text-xs text-[#8e929b]">Название проекта (Бренд):</label>
              <input
                type="text"
                value={classicName}
                onChange={(e) => setClassicName(e.target.value)}
                placeholder="VPN Cabinet"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-[#8e929b]">URL логотипа:</label>
              <input
                type="text"
                value={classicLogo}
                onChange={(e) => setClassicLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-[#8e929b]">Основной цвет (HEX):</label>
              <input
                type="text"
                value={classicPrimaryColor}
                onChange={(e) => setClassicPrimaryColor(e.target.value)}
                placeholder="#d4b37f"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveClassic}
              className="flex items-center gap-1.5 rounded-xl bg-sky-400 px-4 py-2 text-xs font-bold text-black shadow-lg"
            >
              {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span>{isSaved ? 'Сохранено!' : 'Сохранить Classic'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
