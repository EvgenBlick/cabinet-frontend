import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
  ChevronRight,
  Code2,
  Laptop,
  Shield,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Tv,
  Zap,
} from 'lucide-react';
import { subscriptionApi } from '@/api/subscription';
import { useAuthStore } from '@/store/auth';
import { useBranding } from '@/hooks/useBranding';
import { useFreshThemeContext } from '../FreshThemeContext';
import { FreshNavbar } from '../components/FreshNavbar';
import { FreshQrModal } from '../components/FreshQrModal';

export function FreshDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { appName } = useBranding();
  const { config, openModal } = useFreshThemeContext();
  const [showQr] = useState(false);

  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
  });

  const subscription = subData?.subscription;
  const subscriptionUrl =
    (subscription as any)?.subscription_url ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/api/sub/${(subscription as any)?.id || 'demo'}`
      : 'https://samuraiservice.org/sub/connect');

  const accentLime = config.accentColor || '#d7ff3b';
  const brandTitle = appName ? appName.toUpperCase() : 'VERDANT';
  const daysLeft = subscription?.days_left ?? (user as any)?.subscription_days_left ?? 30;

  return (
    <div className="fresh-backdrop-container min-h-screen font-sans text-[#f5f5f7] selection:bg-[#d7ff3b]/30 selection:text-white">
      <FreshNavbar />

      {/* Main Container */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 md:pt-16">
        {/* Top Release Pill Badge: [● New] Fresh 2.0 • Новое поколение защиты > */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/fresh/connection')}
            className="fresh-release-badge group mb-8 inline-flex items-center gap-2.5 rounded-full p-1 pr-4 text-xs transition-all hover:border-white/20"
          >
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-black"
              style={{ backgroundColor: accentLime }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              <span>New</span>
            </span>
            <span className="text-[13px] font-medium text-[#c8d0ca]">
              {config.releaseBadgeText || `${brandTitle} 2.0 • Новое поколение защиты`}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-[#8a948c] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Hero Headline (1:1 Verdant Replica in Russian) */}
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-[#f5f5f7] sm:text-7xl md:text-[80px] md:leading-[1.06]">
            Скоростной доступ, который <br />
            <span
              className="font-serif font-normal italic"
              style={{
                color: accentLime,
                textShadow: `0 0 45px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.45)'}`,
              }}
            >
              {config.heroItalicWord || 'надежно'}
            </span>{' '}
            с вами.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[#9ca59e] sm:text-base md:text-lg">
            Единая европейская сеть для всех ваших устройств. 10 Gbps каналы, низкий пинг и умная
            маршрутизация без ограничений.
          </p>

          {/* Radiant Glowing Pill Button: Подключить бесплатно -> */}
          <div className="mt-9 flex flex-col items-center justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-2xl transition-all"
                style={{
                  background: `radial-gradient(circle, ${config.accentGlowColor || 'rgba(215, 255, 59, 0.6)'} 0%, transparent 70%)`,
                }}
              />
              <button
                type="button"
                onClick={() => navigate('/fresh/connection')}
                className="fresh-glow-btn relative z-10 flex items-center justify-center gap-2 rounded-full px-9 py-4 text-[15px] font-bold text-black transition-all"
              >
                <span>Подключить устройство</span>
                <span className="text-base font-normal">→</span>
              </button>
            </div>

            {/* Micro Trust Checklist in Russian */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#8e9690]">
              <div className="flex items-center gap-1.5">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#d7ff3b]/40 text-[9px] text-[#d7ff3b]">
                  ✓
                </span>
                <span>Без рекламы и логов</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#d7ff3b]/40 text-[9px] text-[#d7ff3b]">
                  ✓
                </span>
                <span>10 Gbps порты в ЕС</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#d7ff3b]/40 text-[9px] text-[#d7ff3b]">
                  ✓
                </span>
                <span>Мгновенный импорт в Happ</span>
              </div>
            </div>
          </div>
        </div>

        {/* The 3 Verdant Bento Cards with Animated Widgets */}
        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Быстрое подключение (Unify your data) */}
          <div
            onClick={() => navigate('/fresh/connection')}
            className="fresh-bento-card group flex cursor-pointer flex-col justify-between p-7"
          >
            <div>
              <div
                className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border bg-[#0d1610] shadow-sm transition-transform group-hover:scale-105"
                style={{
                  borderColor: `${accentLime}60`,
                  boxShadow: `0 0 15px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.25)'}`,
                }}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={accentLime}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>

              <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7]">
                Быстрое подключение
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#8e9690]">
                Подключите iOS, Android, ПК и Smart TV в один клик через ключ или QR-код.
              </p>
            </div>

            {/* Graphic: 4 sources converging into glowing card */}
            <div className="relative mt-8 flex h-36 items-center justify-between px-2">
              <div className="z-10 flex flex-col gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#8e9690]">
                  <Smartphone className="h-3.5 w-3.5" />
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#8e9690]">
                  <Laptop className="h-3.5 w-3.5" />
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#8e9690]">
                  <Tv className="h-3.5 w-3.5" />
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#8e9690]">
                  <Code2 className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Dotted Bezier Streams */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 260 144"
                fill="none"
              >
                <path
                  d="M 40 18 C 110 18, 140 72, 195 72"
                  stroke={accentLime}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
                <path
                  d="M 40 54 C 110 54, 140 72, 195 72"
                  stroke={accentLime}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
                <path
                  d="M 40 90 C 110 90, 140 72, 195 72"
                  stroke={accentLime}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
                <path
                  d="M 40 126 C 110 126, 140 72, 195 72"
                  stroke={accentLime}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
              </svg>

              {/* Glowing Squircle Card */}
              <div
                className="relative z-10 mr-2 flex h-14 w-14 items-center justify-center rounded-2xl border bg-[#0d1610] shadow-2xl"
                style={{
                  borderColor: `${accentLime}70`,
                  boxShadow: `0 0 30px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.45)'}`,
                }}
              >
                <Zap className="h-6 w-6" style={{ color: accentLime }} />
              </div>
            </div>
          </div>

          {/* Card 2: Тариф и трафик (Surface what matters) */}
          <div
            onClick={() => navigate('/fresh/subscription')}
            className="fresh-bento-card group flex cursor-pointer flex-col justify-between p-7"
          >
            <div>
              <div
                className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border bg-[#0d1610] shadow-sm transition-transform group-hover:scale-105"
                style={{
                  borderColor: `${accentLime}60`,
                  boxShadow: `0 0 15px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.25)'}`,
                }}
              >
                <TrendingUp className="h-5 w-5" style={{ color: accentLime }} />
              </div>

              <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7]">
                Тариф и телеметрия
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#8e9690]">
                Мониторинг активной подписки: осталось {daysLeft} дней безлимитного трафика.
              </p>
            </div>

            {/* Graphic: Glowing wave with peak badge */}
            <div className="relative mt-8 flex h-36 flex-col justify-end">
              <div
                className="absolute right-12 top-2 z-10 flex items-center gap-1 rounded-full border border-white/10 bg-[#0d1610]/90 px-2.5 py-0.5 text-[11px] font-bold shadow-lg"
                style={{ color: accentLime }}
              >
                <span>↑ 10 Gbps</span>
              </div>

              <div className="relative h-28 w-full overflow-hidden">
                <svg viewBox="0 0 300 120" className="h-full w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="verdantMainWave2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accentLime} stopOpacity="0.45" />
                      <stop offset="100%" stopColor={accentLime} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="verdantSubWave2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,90 Q 60,65 120,80 T 220,50 T 300,75 L 300,120 L 0,120 Z"
                    fill="url(#verdantSubWave2)"
                  />
                  <path
                    d="M 0,90 Q 60,65 120,80 T 220,50 T 300,75"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                  <path
                    d="M 0,75 Q 70,105 130,50 T 235,28 T 300,60 L 300,120 L 0,120 Z"
                    fill="url(#verdantMainWave2)"
                  />
                  <path
                    d="M 0,75 Q 70,105 130,50 T 235,28 T 300,60"
                    fill="none"
                    stroke={accentLime}
                    strokeWidth="2.5"
                  />
                  <circle cx="235" cy="28" r="4.5" fill="#ffffff" />
                  <circle
                    cx="235"
                    cy="28"
                    r="9"
                    fill={accentLime}
                    opacity="0.5"
                    className="animate-pulse"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Серверы и защита (Act with confidence) */}
          <div
            onClick={() => openModal('support')}
            className="fresh-bento-card group flex cursor-pointer flex-col justify-between p-7"
          >
            <div>
              <div
                className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border bg-[#0d1610] shadow-sm transition-transform group-hover:scale-105"
                style={{
                  borderColor: `${accentLime}60`,
                  boxShadow: `0 0 15px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.25)'}`,
                }}
              >
                <Shield className="h-5 w-5" style={{ color: accentLime }} />
              </div>

              <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7]">Серверы и сеть</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#8e9690]">
                Швеция (14 ms), Нидерланды (18 ms), Польша (22 ms) • Zero-Logs.
              </p>
            </div>

            {/* Graphic: Orbital Radar */}
            <div className="relative mt-8 flex h-36 items-center justify-center">
              <div
                className="absolute h-32 w-32 rounded-full border"
                style={{ borderColor: 'rgba(215, 255, 59, 0.15)' }}
              />
              <div
                className="h-22 w-22 absolute rounded-full border"
                style={{ borderColor: 'rgba(215, 255, 59, 0.25)' }}
              />
              <div
                className="absolute h-12 w-12 rounded-full border bg-[#0d1610]"
                style={{
                  borderColor: `${accentLime}80`,
                  boxShadow: `0 0 20px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.35)'}`,
                }}
              />
              <ShieldCheck className="relative z-10 h-5 w-5" style={{ color: accentLime }} />
              <div
                className="absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full shadow-lg"
                style={{ backgroundColor: accentLime, boxShadow: `0 0 10px ${accentLime}` }}
              />
              <div
                className="absolute right-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full shadow-lg"
                style={{ backgroundColor: accentLime, boxShadow: `0 0 10px ${accentLime}` }}
              />
              <div
                className="absolute bottom-3 left-8 h-2 w-2 rounded-full bg-emerald-400"
                style={{ boxShadow: '0 0 8px #34d399' }}
              />
            </div>
          </div>
        </div>

        {/* Footer Supported Platforms Bar in Russian */}
        <div className="mt-24 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#636d65]">
            ПОДДЕРЖИВАЕМЫЕ УСТРОЙСТВА И ПЛАТФОРМЫ
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-10 text-sm font-black tracking-widest text-[#7a857c] sm:gap-16">
            <span className="transition-colors hover:text-white">APPLE IOS</span>
            <span>•</span>
            <span className="transition-colors hover:text-white">ANDROID</span>
            <span>•</span>
            <span className="transition-colors hover:text-white">WINDOWS</span>
            <span>•</span>
            <span className="transition-colors hover:text-white">MACOS</span>
            <span>•</span>
            <span className="transition-colors hover:text-white">ANDROID TV</span>
            <span>•</span>
            <span className="transition-colors hover:text-white">HAPP</span>
          </div>
        </div>
      </main>

      <FreshQrModal isOpen={showQr} onClose={() => {}} subscriptionUrl={subscriptionUrl} />
    </div>
  );
}
