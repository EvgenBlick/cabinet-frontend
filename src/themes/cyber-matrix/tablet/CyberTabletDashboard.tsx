import React from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Radio, Settings, ShieldCheck, Zap } from 'lucide-react';
import { subscriptionApi } from '@/api/subscription';
import { useAuthStore } from '@/store/auth';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';
import { CyberParticleCanvas } from '../components/CyberParticleCanvas';
import { CyberServerNodesWidget } from '../components/CyberServerNodesWidget';
import { CyberSecurityHelixWidget } from '../components/CyberSecurityHelixWidget';
import { CyberFloatingDock } from '../components/CyberFloatingDock';
import { DynamicThemeBackground } from '@/themes/core/DynamicThemeBackground';

export const CyberTabletDashboard: React.FC = () => {
  const navigate = useNavigate();
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
  const brandName = config.customBrandName || 'CYBER MATRIX';
  const isAdmin = useAuthStore((state) => state.isAdmin);

  return (
    <div className="relative min-h-[100dvh] pb-28 text-[#f5f5f7] selection:bg-emerald-500/30 selection:text-white">
      {/* Dynamic Custom Wallpaper & Overlay */}
      <DynamicThemeBackground />

      <CyberParticleCanvas />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#040705]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-2xl border bg-black/60 shadow-lg"
              style={{
                borderColor: `${accent}60`,
                boxShadow: `0 0 12px ${config.accentGlowColor}`,
              }}
            >
              <ShieldCheck className="h-4 w-4" style={{ color: accent }} />
            </div>
            <span className="text-sm font-black tracking-widest text-white">{brandName}</span>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 transition-all hover:scale-105 hover:bg-amber-500/20"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                  <span>Панель Admin</span>
                </button>

                <button
                  type="button"
                  onClick={toggleStudio}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white"
                >
                  <Settings className="h-3.5 w-3.5" style={{ color: accent }} />
                  <span>Theme Studio</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => navigate('/connection')}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black text-black shadow-lg"
              style={{ backgroundColor: accent }}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Подключить</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2-Column Tablet Grid */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 pt-6">
        <div className="grid grid-cols-2 gap-5">
          {/* Top Left: Subscription Card */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#080d0a]/90 p-6 shadow-2xl backdrop-blur-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Статус подписки
                </span>
                <span className="font-mono text-xs text-emerald-400">{daysLeft} дней</span>
              </div>

              <div className="my-5 flex flex-col items-center">
                <div className="font-mono text-3xl font-black text-white">{trafficPercent}%</div>
                <div className="text-xs text-[#8e9690]">
                  {trafficUsedGb.toFixed(1)} / {trafficLimitGb} ГБ трафика
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/connection')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-black text-black shadow-xl"
              style={{ backgroundColor: accent, boxShadow: `0 0 20px ${config.accentGlowColor}` }}
            >
              <Zap className="h-4 w-4" />
              <span>Подключить в 1 клик</span>
            </button>
          </div>

          {/* Top Right: Russian Yandex Feature */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#080d0a]/90 p-6 shadow-2xl backdrop-blur-2xl">
            <div>
              <div className="flex items-center gap-2 text-emerald-400">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-black"
                  style={{ backgroundColor: accent }}
                >
                  Я
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Умный обход Яндекса
                </span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-[#c4ceca]">
                Все сервисы Яндекса (Музыка, Кинопоиск, Поиск, Карты), Госуслуги и Банки работают
                напрямую на максимальной скорости вашего провайдера без VPN.
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-center font-mono text-xs text-emerald-400">
              Direct Split-Tunnel Active
            </div>
          </div>

          {/* Bottom Left: Server Nodes */}
          <CyberServerNodesWidget />

          {/* Bottom Right: Security Helix */}
          <CyberSecurityHelixWidget />
        </div>
      </main>

      <CyberFloatingDock />
    </div>
  );
};
