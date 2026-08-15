import React from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CreditCard, Radio, Settings, ShieldCheck, Zap } from 'lucide-react';
import { subscriptionApi } from '@/api/subscription';
import { useAuthStore } from '@/store/auth';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';
import { CyberParticleCanvas } from '../components/CyberParticleCanvas';
import { CyberServerNodesWidget } from '../components/CyberServerNodesWidget';
import { CyberSecurityHelixWidget } from '../components/CyberSecurityHelixWidget';
import { CyberDataTubeWidget } from '../components/CyberDataTubeWidget';
import { CyberFloatingDock } from '../components/CyberFloatingDock';

export const CyberDesktopDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { config, toggleStudio } = useThemeEngine();

  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
  });

  const subscription = subData?.subscription;
  const daysLeft = subscription?.days_left ?? 30;
  const trafficUsedGb = subscription?.traffic_used_gb ?? 14.8;
  const trafficLimitGb = subscription?.traffic_limit_gb || 100;
  const trafficPercent = Math.min(100, Math.round((trafficUsedGb / trafficLimitGb) * 100));

  const accent = config.accentColor || '#00ff66';
  const brandName = config.customBrandName || 'DOTDNA CYBER';
  const isAdmin = useAuthStore((state) => state.isAdmin);

  return (
    <div className="relative min-h-[100dvh] bg-[#040705] pb-28 text-[#f5f5f7] selection:bg-emerald-500/30 selection:text-white">
      {/* 3D Kinetic Canvas Swarm Background */}
      <CyberParticleCanvas />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#040705]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-black/60 shadow-lg"
              style={{
                borderColor: `${accent}60`,
                boxShadow: `0 0 15px ${config.accentGlowColor}`,
              }}
            >
              {config.customLogoUrl ? (
                <img src={config.customLogoUrl} alt="" className="h-6 w-6 object-contain" />
              ) : (
                <ShieldCheck className="h-5 w-5" style={{ color: accent }} />
              )}
            </div>
            <div>
              <span className="text-sm font-black tracking-widest text-white">{brandName}</span>
              <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-emerald-400">
                PRO V3
              </span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {/* Live Studio Button for Admin */}
            {isAdmin && (
              <button
                type="button"
                onClick={toggleStudio}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105 hover:bg-white/10"
                style={{ borderColor: `${accent}40` }}
              >
                <Settings className="h-3.5 w-3.5 animate-spin" style={{ color: accent }} />
                <span>Theme Studio</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/connection')}
              className="flex items-center gap-2 rounded-full px-5 py-2 text-xs font-black text-black shadow-lg transition-transform hover:scale-105"
              style={{
                backgroundColor: accent,
                boxShadow: `0 0 20px ${config.accentGlowColor}`,
              }}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Подключить VPN</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content 3-Column Bento Grid */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-8">
        {/* Top Hero Section */}
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3.5 py-1 text-xs text-[#8e9690]">
              <span
                className="h-2 w-2 animate-ping rounded-full"
                style={{ backgroundColor: accent }}
              />
              <span className="font-semibold text-white">{config.heroBadgeText}</span>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              {config.heroHeadlineMain} <br />
              <span
                className="font-serif font-normal italic"
                style={{ color: accent, textShadow: `0 0 35px ${config.accentGlowColor}` }}
              >
                {config.heroHeadlineAccent}
              </span>
            </h1>
          </div>

          {/* Quick Balance & Sub Status summary */}
          <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#080d0a]/90 p-4 shadow-2xl backdrop-blur-xl">
            <div className="text-right">
              <div className="text-xs text-[#8e9690]">Баланс счета</div>
              <div className="font-mono text-xl font-extrabold text-white">
                {(user as any)?.balance_rubles ?? 1500} ₽
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/subscription')}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-black/60 transition-transform hover:scale-110"
              style={{ borderColor: `${accent}60` }}
            >
              <CreditCard className="h-5 w-5" style={{ color: accent }} />
            </button>
          </div>
        </div>

        {/* 12-Column Main Bento Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Hero Card: Active Subscription & Dial (7 cols) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#080d0a]/90 p-7 shadow-2xl backdrop-blur-2xl lg:col-span-7">
            {/* Background Accent Glow */}
            <div
              className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: accent }}
            />

            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-3 w-3 rounded-full shadow-lg"
                    style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Статус защиты: Активна
                  </span>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-emerald-400">
                  {daysLeft} дней осталось
                </span>
              </div>

              {/* Center Traffic Speedometer */}
              <div className="my-8 grid grid-cols-1 items-center gap-8 sm:grid-cols-12">
                <div className="flex flex-col items-center justify-center sm:col-span-5">
                  <div className="relative flex h-36 w-36 items-center justify-center">
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-white/10"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={accent}
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * trafficPercent) / 100}
                        strokeLinecap="round"
                        fill="none"
                        style={{ filter: `drop-shadow(0 0 6px ${accent})` }}
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="font-mono text-2xl font-black text-white">
                        {trafficPercent}%
                      </span>
                      <span className="block text-[10px] text-[#8e9690]">трафика</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:col-span-7">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8e9690]">Использовано трафика:</span>
                    <span className="font-mono font-bold text-white">
                      {trafficUsedGb.toFixed(1)} / {trafficLimitGb} ГБ
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8e9690]">Скорость канала:</span>
                    <span className="font-mono font-bold text-emerald-400">До 10 Гбит/с</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8e9690]">Протокол:</span>
                    <span className="font-mono font-bold text-white">
                      VLESS TLS 1.3 / Hysteria 2
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 1-Click Connect Button */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/connection')}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black text-black shadow-xl transition-all hover:scale-105"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 0 25px ${config.accentGlowColor}`,
                }}
              >
                <Zap className="h-4 w-4" />
                <span>Открыть меню подключения (1 клик)</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/subscription')}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
              >
                <span>Продлить тариф</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Server Nodes Matrix (5 cols) */}
          <div className="lg:col-span-5">
            <CyberServerNodesWidget />
          </div>

          {/* Bottom Bento Row: 3 Modular 3D Widgets (4 cols each) */}
          <div className="lg:col-span-4">
            <CyberSecurityHelixWidget />
          </div>

          <div className="lg:col-span-4">
            <CyberDataTubeWidget />
          </div>

          {/* Russian Direct Yandex Feature Banner (4 cols) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#080d0a]/90 p-5 shadow-2xl backdrop-blur-xl lg:col-span-4">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-black"
                style={{ backgroundColor: accent }}
              >
                Я
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Умный обход Яндекса и РФ
              </span>
            </div>

            <p className="my-3 text-xs leading-relaxed text-[#c4ceca]">
              Все сервисы <strong className="text-white">Яндекса</strong> (Музыка, Кинопоиск, Поиск,
              Карты), а также <strong>Госуслуги и Банки</strong> работают напрямую на максимальной
              скорости вашего провайдера без VPN. Трафик подписки не расходуется!
            </p>

            <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 font-mono text-[11px] text-emerald-400">
              ✓ Direct Split-Tunneling Active
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Dock */}
      <CyberFloatingDock />
    </div>
  );
};
