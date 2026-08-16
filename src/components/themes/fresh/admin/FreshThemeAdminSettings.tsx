import { useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowLeft,
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
  Sliders,
  Zap,
} from 'lucide-react';
import { useThemeEngine, ThemeId } from '@/themes/core/ThemeEngineContext';
import { useFreshTheme } from '@/hooks/useFreshTheme';
import { useBranding } from '@/hooks/useBranding';
import { FreshDesktopDashboard } from '../desktop/FreshDesktopDashboard';
import { FreshMobileDashboard } from '../mobile/FreshMobileDashboard';

const COLOR_PALETTES = [
  { name: 'Электрический лайм', color: '#d7ff3b', glow: 'rgba(215, 255, 59, 0.45)' },
  { name: 'Кибернетический зелёный', color: '#00ff66', glow: 'rgba(0, 255, 102, 0.45)' },
  { name: 'Изумрудный лес', color: '#10b981', glow: 'rgba(16, 185, 129, 0.45)' },
  { name: 'Шампань и золото', color: '#d4b37f', glow: 'rgba(212, 179, 127, 0.45)' },
  { name: 'Кибер-циан (Лазурь)', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.45)' },
  { name: 'Неоновый пурпур', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)' },
];

const PRESET_WALLPAPERS = [
  { name: 'Хвойный лес (Verdant)', url: '/backgrounds/verdant_moss_bg.jpg' },
  {
    name: 'Цифровой каньон (Cyber Matrix)',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop',
  },
  {
    name: 'Золотой обсидиан (Luxury)',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1920&auto=format&fit=crop',
  },
  {
    name: 'Тёмный шёлк (Minimal)',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop',
  },
];

const THEMES: { id: ThemeId; title: string; desc: string; icon: any; color: string }[] = [
  {
    id: 'fresh',
    title: 'FRESH (Verdant)',
    desc: 'Темный мох, неоновый лайм, Bento-виджеты,Happ/Incy в 1 клик, живая телеметрия.',
    icon: Sparkles,
    color: '#d7ff3b',
  },
  {
    id: 'cyber_matrix',
    title: 'CYBER MATRIX (DOTDNA)',
    desc: 'Кибер-неон, 3D частицы, интерактивная карта узлов и сверхвысокая четкость.',
    icon: Zap,
    color: '#00ff66',
  },
  {
    id: 'samurai_gold',
    title: 'Samurai Gold (Ultima)',
    desc: 'Премиальное золото, графитовые поверхности, вращающиеся кольца и аура.',
    icon: Crown,
    color: '#d4b37f',
  },
  {
    id: 'classic',
    title: 'Classic Minimal',
    desc: 'Классический лаконичный интерфейс кабинета со светлой и тёмной темой.',
    icon: Globe,
    color: '#38bdf8',
  },
];

export function FreshThemeAdminSettings() {
  const {
    activeTheme,
    setActiveTheme,
    config: studioConfig,
    updateConfig: updateStudioConfig,
    applyForEveryone,
    resetThemeToDefault,
  } = useThemeEngine();

  const { config: freshConfig, updateConfig: updateFreshConfig } = useFreshTheme();
  const { appName } = useBranding();

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isSaved, setIsSaved] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Form State initialized from studioConfig
  const [customBgInput, setCustomBgInput] = useState(studioConfig.customBgUrl || '');
  const [customLogoInput, setCustomLogoInput] = useState(studioConfig.customLogoUrl || '');
  const [brandNameInput, setBrandNameInput] = useState(studioConfig.customBrandName || '');
  const [badgeInput, setBadgeInput] = useState(studioConfig.heroBadgeText || '');
  const [headlineMainInput, setHeadlineMainInput] = useState(studioConfig.heroHeadlineMain || '');
  const [headlineAccentInput, setHeadlineAccentInput] = useState(
    studioConfig.heroHeadlineAccent || '',
  );
  const [overlayOpacity, setOverlayOpacity] = useState(studioConfig.bgOverlayOpacity ?? 0.75);
  const [bgBlur, setBgBlur] = useState(studioConfig.bgBlur ?? 'md');
  const [particleCount, setParticleCount] = useState(studioConfig.particleCount ?? 90);
  const [enableParticles, setEnableParticles] = useState(studioConfig.enableParticles ?? true);
  const [enableMesh, setEnableMesh] = useState(studioConfig.enableMeshGrid ?? true);
  const [customHexInput, setCustomHexInput] = useState(studioConfig.accentColor || '#d7ff3b');

  const handleSelectTheme = (themeId: ThemeId) => {
    setActiveTheme(themeId);
    setSaveSuccessMsg(`Тема "${themeId.toUpperCase()}" активирована!`);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleApplyColor = (color: string, glow: string) => {
    setCustomHexInput(color);
    updateStudioConfig({
      accentColor: color,
      accentGlowColor: glow,
      particleColor: color,
    });
    updateFreshConfig({
      ...freshConfig,
      accentColor: color,
      accentGlowColor: glow,
    });
  };

  const handleApplyWallpaper = (url: string) => {
    setCustomBgInput(url);
    updateStudioConfig({
      customBgUrl: url,
      bgMode: 'custom',
    });
    updateFreshConfig({
      ...freshConfig,
      customBgUrl: url,
      bgMode: 'custom',
    });
  };

  const handleSaveAll = () => {
    const updated = {
      ...studioConfig,
      customLogoUrl: customLogoInput.trim() || null,
      customBrandName: brandNameInput.trim() || appName || 'VPN CABINET',
      customBgUrl: customBgInput.trim() || null,
      bgMode: (customBgInput.trim() ? 'custom' : 'preset') as 'custom' | 'preset',
      bgBlur: bgBlur as 'none' | 'sm' | 'md' | 'lg' | 'xl',
      bgOverlayOpacity: overlayOpacity,
      enableParticles,
      particleCount,
      enableMeshGrid: enableMesh,
      heroBadgeText: badgeInput.trim() || '⚡ НОВОЕ ПОКОЛЕНИЕ VPN',
      heroHeadlineMain: headlineMainInput.trim() || 'Defending the Digital',
      heroHeadlineAccent: headlineAccentInput.trim() || 'on the Dot.',
      accentColor: customHexInput,
    };

    updateStudioConfig(updated);
    updateFreshConfig({
      ...freshConfig,
      customLogoUrl: updated.customLogoUrl,
      customBrandName: updated.customBrandName,
      customBgUrl: updated.customBgUrl,
      bgMode: updated.bgMode,
      bgBlur: (bgBlur === 'xl' ? 'lg' : bgBlur) as 'none' | 'sm' | 'md' | 'lg',
      bgOverlayOpacity: updated.bgOverlayOpacity,
      releaseBadgeText: updated.heroBadgeText,
      accentColor: updated.accentColor,
    });

    applyForEveryone();
    setSaveSuccessMsg('Настройки сохранены и применены для всех пользователей!');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const mockSub = {
    id: 1,
    url: 'https://happ.me/sub/cyber-matrix-vip-user',
    subscription_url: 'https://happ.me/sub/cyber-matrix-vip-user',
    device_limit: 5,
    days_left: 365,
    status: 'active',
    traffic_used_gb: 14.8,
    traffic_limit_gb: 100,
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#070b08] p-4 text-[#f5f5f7] sm:p-8">
      {/* 1. Header with Breadcrumbs & Back Button */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8e929b]">
            <Link
              to="/admin"
              className="flex items-center gap-1 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Панель администратора
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#d7ff3b]">Оформление и темы</span>
          </div>
          <h1 className="mt-2 flex items-center gap-3 text-2xl font-black tracking-tight text-white">
            <Palette className="h-7 w-7 text-[#d7ff3b]" />
            Центр управления темами оформления
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад в админку
          </Link>
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-2 rounded-xl bg-[#d7ff3b] px-5 py-2.5 text-xs font-black text-black shadow-[0_0_20px_rgba(215,255,59,0.4)] transition-all hover:brightness-110"
          >
            <Save className="h-4 w-4" />
            Применить для всех
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {isSaved && (
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-2xl border border-[#d7ff3b]/40 bg-[#d7ff3b]/10 p-4 text-xs font-bold text-[#d7ff3b]">
          <Check className="h-5 w-5 stroke-[3]" />
          <span>{saveSuccessMsg || 'Настройки успешно применены!'}</span>
        </div>
      )}

      {/* 2. Global Active Theme Selector Bar */}
      <div className="rounded-3xl border border-white/10 bg-[#0e1410]/90 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#d7ff3b]" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                Активная глобальная тема
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-[#8e929b]">
              Выберите, какая тема отображается по умолчанию у всех пользователей при входе.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8e929b]">Текущий выбор:</span>
            <span className="rounded-full border border-[#d7ff3b]/40 bg-[#d7ff3b]/10 px-3.5 py-1 text-xs font-extrabold text-[#d7ff3b]">
              {THEMES.find((t) => t.id === activeTheme)?.title || activeTheme.toUpperCase()}
            </span>
          </div>
        </div>

        {/* 4 Theme Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {THEMES.map((th) => {
            const Icon = th.icon;
            const isSelected = activeTheme === th.id;
            return (
              <div
                key={th.id}
                className={`flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? 'border-[#d7ff3b] bg-[#d7ff3b]/10 shadow-[0_0_25px_rgba(215,255,59,0.2)]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color: th.color }} />
                      <span className="text-sm font-bold text-white">{th.title}</span>
                    </div>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d7ff3b] font-bold text-black">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#8e929b]">{th.desc}</p>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleSelectTheme(th.id)}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#d7ff3b] text-black shadow-md'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {isSelected ? 'Активна ✓' : 'Сделать активной'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Deep Customization & Live Preview Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Detailed Configuration Form */}
        <div className="space-y-6 lg:col-span-6 xl:col-span-5">
          {/* Colors & Accents */}
          <div className="rounded-3xl border border-white/10 bg-[#0e1410]/90 p-6 shadow-xl backdrop-blur-2xl">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#d7ff3b]">
              <Palette className="h-4 w-4" />
              Палитра и акцентный цвет
            </h3>
            <p className="mt-1 text-xs text-[#8e929b]">
              Задает оттенок кнопок, неона, свечения и интерактивных элементов.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {COLOR_PALETTES.map((palette) => (
                <button
                  key={palette.name}
                  type="button"
                  onClick={() => handleApplyColor(palette.color, palette.glow)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 text-left text-xs text-white transition-all hover:border-white/30"
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full shadow-sm"
                    style={{ backgroundColor: palette.color }}
                  />
                  <span className="truncate">{palette.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="color"
                value={customHexInput}
                onChange={(e) => setCustomHexInput(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
              />
              <input
                type="text"
                value={customHexInput}
                onChange={(e) => setCustomHexInput(e.target.value)}
                placeholder="#d7ff3b"
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-white focus:border-[#d7ff3b] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleApplyColor(customHexInput, `${customHexInput}66`)}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
              >
                Применить
              </button>
            </div>
          </div>

          {/* Wallpapers & Glass */}
          <div className="rounded-3xl border border-white/10 bg-[#0e1410]/90 p-6 shadow-xl backdrop-blur-2xl">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#d7ff3b]">
              <ImageIcon className="h-4 w-4" />
              Фоновые обои и стекло
            </h3>
            <p className="mt-1 text-xs text-[#8e929b]">
              Выберите из каталога или укажите прямую ссылку на изображение.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {PRESET_WALLPAPERS.map((wp) => (
                <button
                  key={wp.name}
                  type="button"
                  onClick={() => handleApplyWallpaper(wp.url)}
                  className="group relative overflow-hidden rounded-xl border border-white/10 text-left transition-all hover:border-[#d7ff3b]"
                >
                  <div
                    className="h-16 w-full bg-cover bg-center transition-transform group-hover:scale-105"
                    style={{ backgroundImage: `url(${wp.url})` }}
                  />
                  <div className="truncate bg-black/80 p-2 text-[11px] font-semibold text-white">
                    {wp.name}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] text-[#8e929b]">Своя ссылка на фон (URL):</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={customBgInput}
                    onChange={(e) => setCustomBgInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#d7ff3b] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyWallpaper(customBgInput)}
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
                  >
                    Задать
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] text-[#8e929b]">Размытие стекла (Blur):</label>
                  <select
                    value={bgBlur}
                    onChange={(e) => setBgBlur(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#d7ff3b] focus:outline-none"
                  >
                    <option value="none">Без размытия</option>
                    <option value="sm">Легкое (sm)</option>
                    <option value="md">Стандартное (md)</option>
                    <option value="lg">Глубокое (lg)</option>
                    <option value="xl">Максимальное (xl)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#8e929b]">
                    Затемнение подложки: {Math.round(overlayOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="0.95"
                    step="0.05"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className="mt-2 w-full accent-[#d7ff3b]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Brand, Typography & Effects */}
          <div className="rounded-3xl border border-white/10 bg-[#0e1410]/90 p-6 shadow-xl backdrop-blur-2xl">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#d7ff3b]">
              <Sliders className="h-4 w-4" />
              Брендинг, эффекты и анимации
            </h3>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] text-[#8e929b]">Логотип (URL):</label>
                <input
                  type="text"
                  value={customLogoInput}
                  onChange={(e) => setCustomLogoInput(e.target.value)}
                  placeholder="https://.../logo.png"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#d7ff3b] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8e929b]">Название бренда в шапке:</label>
                <input
                  type="text"
                  value={brandNameInput}
                  onChange={(e) => setBrandNameInput(e.target.value)}
                  placeholder="VERDANT / DOTDNA / SAMURAI"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#d7ff3b] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8e929b]">Текст бейджа в заголовке:</label>
                <input
                  type="text"
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  placeholder="⚡ НОВОЕ ПОКОЛЕНИЕ VPN"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#d7ff3b] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#8e929b]">Главный заголовок:</label>
                  <input
                    type="text"
                    value={headlineMainInput}
                    onChange={(e) => setHeadlineMainInput(e.target.value)}
                    placeholder="Defending the Digital"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#d7ff3b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#8e929b]">Акцентный текст (курсив):</label>
                  <input
                    type="text"
                    value={headlineAccentInput}
                    onChange={(e) => setHeadlineAccentInput(e.target.value)}
                    placeholder="on the Dot."
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#d7ff3b] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-white">
                  <input
                    type="checkbox"
                    checked={enableParticles}
                    onChange={(e) => setEnableParticles(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-black accent-[#d7ff3b]"
                  />
                  <span>3D Частицы в фоне</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-xs text-white">
                  <input
                    type="checkbox"
                    checked={enableMesh}
                    onChange={(e) => setEnableMesh(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-black accent-[#d7ff3b]"
                  />
                  <span>Сетка Grid / Matrix</span>
                </label>
              </div>

              {enableParticles && (
                <div className="pt-1">
                  <div className="flex justify-between text-[11px] text-[#8e929b]">
                    <span>Количество частиц:</span>
                    <span className="font-mono text-white">{particleCount}</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="180"
                    step="10"
                    value={particleCount}
                    onChange={(e) => setParticleCount(parseInt(e.target.value, 10))}
                    className="mt-1 w-full accent-[#d7ff3b]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Real-time Visual Preview */}
        <div className="space-y-4 lg:col-span-6 xl:col-span-7">
          <div className="rounded-3xl border border-white/10 bg-[#0e1410]/90 p-6 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#d7ff3b]" />
                <h3 className="text-sm font-bold text-white">
                  Интерактивное превью в реальном времени
                </h3>
              </div>

              {/* Viewport switch: Desktop / Mobile */}
              <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    previewDevice === 'desktop'
                      ? 'bg-[#d7ff3b] text-black shadow'
                      : 'text-[#8e929b] hover:text-white'
                  }`}
                >
                  <Laptop className="h-3.5 w-3.5" />
                  Десктоп
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    previewDevice === 'mobile'
                      ? 'bg-[#d7ff3b] text-black shadow'
                      : 'text-[#8e929b] hover:text-white'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Телефон
                </button>
              </div>
            </div>

            {/* Preview Viewport Container */}
            <div className="mt-4 flex justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-4">
              {previewDevice === 'desktop' ? (
                <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                  <FreshDesktopDashboard
                    subscription={mockSub as any}
                    connectedDevicesCount={1}
                    daysLeft={365}
                    onBuySubscription={() => {}}
                    onOpenConnection={() => {}}
                    onOpenSupport={() => {}}
                  />
                </div>
              ) : (
                <div className="w-[360px] overflow-hidden rounded-[32px] border-4 border-white/20 shadow-2xl">
                  <FreshMobileDashboard
                    subscription={mockSub as any}
                    connectedDevicesCount={1}
                    daysLeft={365}
                    onBuySubscription={() => {}}
                    onOpenConnection={() => {}}
                    onOpenSupport={() => {}}
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-[#8e929b]">
              <span>💡 Все изменения отображаются в превью мгновенно.</span>
              <button
                type="button"
                onClick={() => resetThemeToDefault()}
                className="flex items-center gap-1 text-red-400 hover:text-red-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Сбросить к заводским настройкам
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
