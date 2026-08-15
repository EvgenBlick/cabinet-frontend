import React, { useState } from 'react';
import {
  Check,
  Crown,
  Globe,
  Image as ImageIcon,
  Layers,
  Palette,
  RefreshCw,
  Save,
  Sparkles,
  Tag,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import { useThemeEngine, ThemeId } from '@/themes/core/ThemeEngineContext';

const THEME_OPTIONS: { id: ThemeId; name: string; tag: string; icon: any; color: string }[] = [
  {
    id: 'cyber_matrix',
    name: 'CYBER MATRIX (DOTDNA)',
    tag: 'Кибер-неон, 3D частицы и виджеты',
    icon: Zap,
    color: '#00ff66',
  },
  {
    id: 'fresh',
    name: 'VERDANT FRESH',
    tag: 'Темный мох, неоновый лайм, Bento',
    icon: Sparkles,
    color: '#d7ff3b',
  },
  {
    id: 'samurai_gold',
    name: 'SAMURAI GOLD (Ultima)',
    tag: 'Премиальный черный титан и золото',
    icon: Crown,
    color: '#d4b37f',
  },
  {
    id: 'classic',
    name: 'CLASSIC MINIMAL',
    tag: 'Классический интерфейс PEDZEO',
    icon: Globe,
    color: '#3b82f6',
  },
];

const COLOR_PRESETS = [
  { name: 'Cyber Matrix Green', color: '#00ff66', glow: 'rgba(0, 255, 102, 0.45)' },
  { name: 'Electric Lime', color: '#d7ff3b', glow: 'rgba(215, 255, 59, 0.45)' },
  { name: 'Emerald Forest', color: '#10b981', glow: 'rgba(16, 185, 129, 0.45)' },
  { name: 'Champagne Gold', color: '#d4b37f', glow: 'rgba(212, 179, 127, 0.45)' },
  { name: 'Cyber Cyan', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.45)' },
  { name: 'Neon Purple', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)' },
];

const WALLPAPER_PRESETS = [
  { name: 'Verdant Deep Forest', url: '/backgrounds/verdant_moss_bg.jpg' },
  {
    name: 'Cyber Matrix Digital Canyon',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop',
  },
  {
    name: 'Obsidian Gold Luxury',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1920&auto=format&fit=crop',
  },
  {
    name: 'Dark Abstract Silk',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop',
  },
];

export const ThemeStudioDrawer: React.FC = () => {
  const {
    activeTheme,
    setActiveTheme,
    config,
    updateConfig,
    resetThemeToDefault,
    isStudioOpen,
    setIsStudioOpen,
    applyForEveryone,
    isSaving,
  } = useThemeEngine();

  const [activeTab, setActiveTab] = useState<
    'themes' | 'background' | 'particles' | 'colors' | 'brand'
  >('themes');
  const [customHex, setCustomHex] = useState(config.accentColor);
  const [logoInput, setLogoInput] = useState(config.customLogoUrl || '');
  const [brandInput, setBrandInput] = useState(config.customBrandName || '');
  const [isSavedBanner, setIsSavedBanner] = useState(false);

  if (!isStudioOpen) return null;

  const handleApplyLogo = () => {
    updateConfig({ customLogoUrl: logoInput.trim() || null, customBrandName: brandInput.trim() });
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 2000);
  };

  const handleSaveAll = async () => {
    await applyForEveryone();
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 2000);
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm duration-200">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={() => setIsStudioOpen(false)} />

      {/* Drawer Container */}
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#080d0a]/95 text-white shadow-2xl backdrop-blur-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl border bg-black shadow-md"
              style={{ borderColor: config.accentColor }}
            >
              <Wand2 className="h-4 w-4" style={{ color: config.accentColor }} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Live Theme Studio
              </h2>
              <span className="text-[10px] text-[#718076]">Визуальный конструктор тем</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsStudioOpen(false)}
            className="rounded-full p-1.5 text-[#8e9690] transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-white/5 bg-black/40 px-4 py-2">
          {[
            { id: 'themes', label: 'Темы', icon: Layers },
            { id: 'background', label: 'Фоны', icon: ImageIcon },
            { id: 'particles', label: 'Частицы', icon: Sparkles },
            { id: 'colors', label: 'Цвета', icon: Palette },
            { id: 'brand', label: 'Бренд', icon: Tag },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isTabActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-[#8e9690] hover:text-white'
                }`}
                style={{ color: isTabActive ? config.accentColor : undefined }}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* TAB 1: THEMES SELECTION */}
          {activeTab === 'themes' && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                Выберите активную тему:
              </span>
              <div className="space-y-2.5">
                {THEME_OPTIONS.map((t) => {
                  const Icon = t.icon;
                  const isCurrent = activeTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTheme(t.id)}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                        isCurrent
                          ? 'border-white/30 bg-white/10 shadow-lg'
                          : 'border-white/5 bg-black/40 hover:border-white/15'
                      }`}
                      style={{ borderColor: isCurrent ? t.color : undefined }}
                    >
                      <div
                        className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border bg-black/60"
                        style={{ borderColor: `${t.color}60` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: t.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{t.name}</span>
                          {isCurrent && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[9px] font-bold text-black"
                              style={{ backgroundColor: t.color }}
                            >
                              Активна
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-[#8e9690]">{t.tag}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BACKGROUND & GLASS */}
          {activeTab === 'background' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  Готовые 4K обои:
                </label>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {WALLPAPER_PRESETS.map((wp) => (
                    <button
                      key={wp.name}
                      type="button"
                      onClick={() => updateConfig({ customBgUrl: wp.url, bgMode: 'custom' })}
                      className="group relative overflow-hidden rounded-xl border border-white/10 p-2 text-left transition-transform hover:scale-105"
                    >
                      <div className="truncate text-[11px] font-semibold text-white">{wp.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  Свой URL изображения:
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/wallpaper.jpg"
                  value={config.customBgUrl || ''}
                  onChange={(e) =>
                    updateConfig({ customBgUrl: e.target.value || null, bgMode: 'custom' })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder:text-[#555] focus:outline-none"
                />
              </div>

              {/* Overlay Darkness Slider */}
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8e9690]">Затемнение фона:</span>
                  <span className="font-mono font-bold text-white">
                    {Math.round(config.bgOverlayOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.95"
                  step="0.05"
                  value={config.bgOverlayOpacity}
                  onChange={(e) => updateConfig({ bgOverlayOpacity: parseFloat(e.target.value) })}
                  className="mt-2 w-full accent-emerald-400"
                />
              </div>

              {/* Glass Blur Buttons */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  Степень размытия стекла (Blur):
                </span>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {(['none', 'sm', 'md', 'lg'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => updateConfig({ bgBlur: b })}
                      className={`rounded-xl border py-2 text-xs font-semibold capitalize transition-all ${
                        config.bgBlur === b
                          ? 'border-emerald-400 bg-emerald-500/20 text-white'
                          : 'border-white/10 bg-black/40 text-[#8e9690] hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PARTICLES & ANIMATIONS */}
          {activeTab === 'particles' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-3.5">
                <div>
                  <div className="text-xs font-bold text-white">3D Облако частиц</div>
                  <div className="text-[10px] text-[#8e9690]">Кинетический поток на Canvas</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableParticles}
                  onChange={(e) => updateConfig({ enableParticles: e.target.checked })}
                  className="h-4 w-4 accent-emerald-400"
                />
              </div>

              {config.enableParticles && (
                <>
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8e9690]">Количество частиц:</span>
                      <span className="font-mono font-bold text-white">{config.particleCount}</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="140"
                      step="10"
                      value={config.particleCount}
                      onChange={(e) => updateConfig({ particleCount: parseInt(e.target.value) })}
                      className="mt-2 w-full accent-emerald-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8e9690]">Скорость движения:</span>
                      <span className="font-mono font-bold text-white">
                        {config.particleSpeed}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.1"
                      value={config.particleSpeed}
                      onChange={(e) => updateConfig({ particleSpeed: parseFloat(e.target.value) })}
                      className="mt-2 w-full accent-emerald-400"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: COLORS */}
          {activeTab === 'colors' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  Готовые цветовые ауры:
                </label>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setCustomHex(p.color);
                        updateConfig({ accentColor: p.color, accentGlowColor: p.glow });
                      }}
                      className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/40 p-2.5 text-left transition-transform hover:scale-105"
                    >
                      <span
                        className="h-4 w-4 rounded-full shadow-md"
                        style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }}
                      />
                      <span className="truncate text-xs font-semibold text-white">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  Собственный HEX код:
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (/^#[0-9A-F]{6}$/i.test(customHex)) {
                        updateConfig({
                          accentColor: customHex,
                          accentGlowColor: `${customHex}66`,
                        });
                      }
                    }}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-black"
                    style={{ backgroundColor: config.accentColor }}
                  >
                    Применить
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BRANDING */}
          {activeTab === 'brand' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  URL Логотипа (PNG/SVG/WebP):
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={logoInput}
                  onChange={(e) => setLogoInput(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  Название бренда в меню:
                </label>
                <input
                  type="text"
                  placeholder="DOTDNA или SAMURAI"
                  value={brandInput}
                  onChange={(e) => setBrandInput(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleApplyLogo}
                className="w-full rounded-xl py-2.5 text-xs font-bold text-black shadow-lg"
                style={{ backgroundColor: config.accentColor }}
              >
                Сохранить логотип и бренд
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="space-y-2.5 border-t border-white/10 bg-black/60 p-4">
          {isSavedBanner && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 py-2 text-xs font-bold text-emerald-400">
              <Check className="h-4 w-4" />
              <span>Настройки успешно применены!</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => resetThemeToDefault()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-[#8e9690] transition-colors hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Сбросить</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-black shadow-xl transition-transform hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: config.accentColor }}
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Сохранение...' : 'Применить для всех'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
