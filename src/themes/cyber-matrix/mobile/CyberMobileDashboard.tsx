import React from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Radio, Settings, ShieldCheck } from 'lucide-react';
import { subscriptionApi } from '@/api/subscription';
import { useAuthStore } from '@/store/auth';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';
import { CyberParticleCanvas } from '../components/CyberParticleCanvas';
import { CyberServerNodesWidget } from '../components/CyberServerNodesWidget';
import { CyberSecurityHelixWidget } from '../components/CyberSecurityHelixWidget';
import { CyberFloatingDock } from '../components/CyberFloatingDock';
import { DynamicThemeBackground } from '@/themes/core/DynamicThemeBackground';

export const CyberMobileDashboard: React.FC = () => {
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
  const brandName = config.customBrandName || 'CYBER MATRIX';
  const isAdmin = useAuthStore((state) => state.isAdmin);

  return (
    <div
      className="relative min-h-[100dvh] text-[#f5f5f7] selection:bg-emerald-500/30 selection:text-white"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 84px)',
      }}
    >
      {/* Dynamic Custom Wallpaper & Overlay */}
      <DynamicThemeBackground />

      {/* 3D Particle Swarm Background */}
      <CyberParticleCanvas />

      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-[#040705]/85 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl border bg-black/60 shadow-md"
            style={{ borderColor: `${accent}60`, boxShadow: `0 0 10px ${config.accentGlowColor}` }}
          >
            {config.customLogoUrl ? (
              <img src={config.customLogoUrl} alt="" className="h-5 w-5 object-contain" />
            ) : (
              <ShieldCheck className="h-4 w-4" style={{ color: accent }} />
            )}
          </div>
          <span className="text-xs font-black tracking-widest text-white">{brandName}</span>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1 rounded-xl border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-[10px] font-bold text-amber-300"
                title="Панель администратора"
              >
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={toggleStudio}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
                title="Theme Studio"
              >
                <Settings className="h-4 w-4" style={{ color: accent }} />
              </button>
            </div>
          )}

          <span className="rounded-full border border-white/10 bg-black/50 px-2.5 py-1 font-mono text-[10px] text-emerald-400">
            {(user as any)?.balance_rubles ?? 1500} ₽
          </span>
        </div>
      </header>

      {/* Mobile Flow Container */}
      <main className="relative z-10 space-y-4 px-4 pt-4">
        {/* Top Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080d0a]/90 p-5 shadow-2xl backdrop-blur-xl">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-3xl"
            style={{ backgroundColor: accent }}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 animate-pulse rounded-full"
                style={{ backgroundColor: accent }}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Защита активна
              </span>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-emerald-400">
              {daysLeft} дней
            </span>
          </div>

          {/* Quick Stats in Mobile Row */}
          <div className="my-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/5 bg-black/40 p-3">
            <div>
              <div className="text-[10px] text-[#718076]">Трафик ({trafficPercent}%)</div>
              <div className="font-mono text-xs font-bold text-white">
                {trafficUsedGb.toFixed(1)} / {trafficLimitGb} ГБ
              </div>
            </div>
            <div className="border-l border-white/5 pl-3">
              <div className="text-[10px] text-[#718076]">Канал</div>
              <div className="text-xs font-bold text-emerald-400">10 Gbps (Швеция)</div>
            </div>
          </div>

          {/* Connect in 1-Click Button */}
          <button
            type="button"
            onClick={() => navigate('/connection')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black text-black shadow-xl transition-transform active:scale-95"
            style={{
              backgroundColor: accent,
              boxShadow: `0 0 20px ${config.accentGlowColor}`,
            }}
          >
            <Radio className="h-4 w-4" />
            <span>Подключить VPN (1 клик)</span>
          </button>
        </div>

        {/* Russian Yandex Direct Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080d0a]/90 p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-emerald-400">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black text-black"
              style={{ backgroundColor: accent }}
            >
              Я
            </div>
            <span className="text-xs font-bold text-white">Умная маршрутизация Яндекса</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#c4ceca]">
            Яндекс, Кинопоиск, Банки и Госуслуги работают напрямую без VPN на полной скорости!
          </p>
        </div>

        {/* 3D Security Helix Widget */}
        <CyberSecurityHelixWidget />

        {/* Server Nodes Widget */}
        <CyberServerNodesWidget />
      </main>

      {/* Floating Bottom Navigation */}
      <CyberFloatingDock />
    </div>
  );
};
