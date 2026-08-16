import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Check,
  ChevronRight,
  Code2,
  Copy,
  Database,
  FileSpreadsheet,
  Globe,
  Shield,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import type { Subscription } from '@/types';
import { useBranding } from '@/hooks/useBranding';
import { useFreshTheme } from '@/hooks/useFreshTheme';
import { FreshDesktopNavbar } from './FreshDesktopNavbar';
import { DynamicThemeBackground } from '@/themes/core/DynamicThemeBackground';

export interface FreshDesktopDashboardProps {
  subscription: Subscription | null;
  connectedDevicesCount: number;
  daysLeft: number | null;
  onBuySubscription: () => void;
  onOpenConnection: () => void;
  onOpenSupport: () => void;
}

export function FreshDesktopDashboard({
  subscription,
  connectedDevicesCount: _connectedDevicesCount,
  daysLeft: _daysLeft,
  onBuySubscription,
  onOpenConnection,
  onOpenSupport,
}: FreshDesktopDashboardProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { appName } = useBranding();
  const { config } = useFreshTheme();

  const subAny = subscription as any;
  const subscriptionUrl =
    subAny?.subscription_url ||
    subAny?.url ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/api/sub/${subAny?.id || 'demo'}`
      : 'https://samuraiservice.org/sub/connect');

  const handleCopyLink = () => {
    if (subscriptionUrl) {
      navigator.clipboard.writeText(subscriptionUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handle1ClickHapp = () => {
    if (subscriptionUrl) {
      const cryptedUrl = `happ://add/crypt3#${btoa(subscriptionUrl)}`;
      window.location.href = cryptedUrl;
    }
  };

  const accentLime = config.accentColor || '#d7ff3b';
  const brandDisplay = appName || 'VERDANT';

  return (
    <div className="relative min-h-screen font-sans text-[#f5f5f7] selection:bg-[#d7ff3b]/30 selection:text-white">
      <DynamicThemeBackground />

      {/* 1. Floating Island Navbar */}
      <FreshDesktopNavbar onBuySubscription={onBuySubscription} onOpenSupport={onOpenSupport} />

      {/* 2. Main Hero Section */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 md:pt-16">
        {/* Top Release Pill Badge: [● New] Verdant 2.0 • Новое поколение защиты > */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onOpenConnection}
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
              {config.releaseBadgeText || `${brandDisplay} 2.0 • Новое поколение защиты`}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-[#8a948c] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Hero Headline in Russian */}
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
            Единая скоростная сеть для всех ваших устройств. 10 Gbps европейские порты, низкий пинг
            и умная маршрутизация.
          </p>

          {/* Glowing Pill CTA Button */}
          <div className="mt-9 flex flex-col items-center justify-center">
            <div className="relative">
              {/* Radial glow background under button */}
              <div
                className="absolute inset-0 rounded-full blur-2xl transition-all"
                style={{
                  background: `radial-gradient(circle, ${config.accentGlowColor || 'rgba(215, 255, 59, 0.6)'} 0%, transparent 70%)`,
                }}
              />
              <button
                type="button"
                onClick={onOpenConnection}
                className="fresh-glow-btn relative z-10 flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-bold text-black transition-all"
              >
                <span>Подключить устройство</span>
                <span className="text-base font-normal">→</span>
              </button>
            </div>

            {/* Micro Trust Checklist */}
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
                <span>10 Gbps порты в Европе</span>
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

        {/* 3. The 3 Verdant Bento Cards */}
        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Быстрое подключение */}
          <div
            onClick={onOpenConnection}
            className="fresh-bento-card group flex cursor-pointer flex-col justify-between p-7"
          >
            <div>
              {/* Top Icon Box */}
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

            {/* Bottom Graphic: 4 Left Sources -> Curved Dotted Bezier Lines -> Central Glowing Card */}
            <div className="relative mt-8 flex h-36 items-center justify-between px-2">
              {/* Left Column of 4 Source Icons */}
              <div className="z-10 flex flex-col gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#8e9690] shadow-inner">
                  <Database className="h-3.5 w-3.5" />
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#8e9690] shadow-inner">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#8e9690] shadow-inner">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#8e9690] shadow-inner">
                  <Code2 className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Dotted Flowing Bezier Connecting Lines */}
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

              {/* Right Glowing Squircle Card with Leaf Emblem */}
              <div
                className="relative z-10 mr-2 flex h-14 w-14 items-center justify-center rounded-2xl border bg-[#0d1610] shadow-2xl"
                style={{
                  borderColor: `${accentLime}70`,
                  boxShadow: `0 0 30px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.45)'}`,
                }}
              >
                <svg
                  className="h-6 w-6"
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
            </div>
          </div>

          {/* Card 2: Тариф и трафик */}
          <div
            onClick={onBuySubscription}
            className="fresh-bento-card group flex cursor-pointer flex-col justify-between p-7"
          >
            <div>
              {/* Top Icon Box */}
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
                Высокая скорость и безлимит
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#8e9690]">
                Умная балансировка потоков, моментальный отклик и неограниченная пропускная
                способность.
              </p>
            </div>

            {/* Bottom Graphic: Multi-layer Glowing Wave Chart with Peak Badge */}
            <div className="relative mt-8 flex h-36 flex-col justify-end">
              {/* Peak Floating Pill Badge: ↑ 10 Gbps */}
              <div
                className="absolute right-12 top-2 z-10 flex items-center gap-1 rounded-full border border-white/10 bg-[#0d1610]/90 px-2.5 py-0.5 text-[11px] font-bold shadow-lg"
                style={{ color: accentLime }}
              >
                <span>↑</span>
                <span>10 Gbps</span>
              </div>

              {/* Multi-layer glowing wave canvas */}
              <div className="relative h-28 w-full overflow-hidden">
                <svg viewBox="0 0 300 120" className="h-full w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="verdantMainWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accentLime} stopOpacity="0.45" />
                      <stop offset="100%" stopColor={accentLime} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="verdantSubWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Secondary Back Wave */}
                  <path
                    d="M 0,90 Q 60,65 120,80 T 220,50 T 300,75 L 300,120 L 0,120 Z"
                    fill="url(#verdantSubWave)"
                  />
                  <path
                    d="M 0,90 Q 60,65 120,80 T 220,50 T 300,75"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    opacity="0.5"
                  />

                  {/* Primary Front Wave */}
                  <path
                    d="M 0,75 Q 70,105 130,50 T 235,28 T 300,60 L 300,120 L 0,120 Z"
                    fill="url(#verdantMainWave)"
                  />
                  <path
                    d="M 0,75 Q 70,105 130,50 T 235,28 T 300,60"
                    fill="none"
                    stroke={accentLime}
                    strokeWidth="2.5"
                  />

                  {/* Glowing Node at Peak */}
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

          {/* Card 3: Безопасность и приватность */}
          <div
            onClick={onOpenSupport}
            className="fresh-bento-card group flex cursor-pointer flex-col justify-between p-7"
          >
            <div>
              {/* Top Icon Box */}
              <div
                className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border bg-[#0d1610] shadow-sm transition-transform group-hover:scale-105"
                style={{
                  borderColor: `${accentLime}60`,
                  boxShadow: `0 0 15px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.25)'}`,
                }}
              >
                <Shield className="h-5 w-5" style={{ color: accentLime }} />
              </div>

              <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7]">
                Полная приватность
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#8e9690]">
                Встроенное шифрование VLESS TLS 1.3 и политика полного отсутствия логов (Zero-Logs).
              </p>
            </div>

            {/* Bottom Graphic: 3 Concentric Orbital Radar Rings with Orbiting Satellites */}
            <div className="relative mt-8 flex h-36 items-center justify-center">
              {/* Outer Radar Ring */}
              <div
                className="absolute h-32 w-32 rounded-full border"
                style={{ borderColor: 'rgba(215, 255, 59, 0.15)' }}
              />
              {/* Middle Radar Ring */}
              <div
                className="h-22 w-22 absolute rounded-full border"
                style={{ borderColor: 'rgba(215, 255, 59, 0.25)' }}
              />
              {/* Inner Radar Core Ring */}
              <div
                className="absolute h-12 w-12 rounded-full border bg-[#0d1610]"
                style={{
                  borderColor: `${accentLime}80`,
                  boxShadow: `0 0 20px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.35)'}`,
                }}
              />

              {/* Center Glowing Shield */}
              <ShieldCheck className="relative z-10 h-5 w-5" style={{ color: accentLime }} />

              {/* Orbiting Satellite Node 1 (Top) */}
              <div
                className="absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full shadow-lg"
                style={{
                  backgroundColor: accentLime,
                  boxShadow: `0 0 10px ${accentLime}`,
                }}
              />
              {/* Orbiting Satellite Node 2 (Right) */}
              <div
                className="absolute right-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full shadow-lg"
                style={{
                  backgroundColor: accentLime,
                  boxShadow: `0 0 10px ${accentLime}`,
                }}
              />
              {/* Orbiting Satellite Node 3 (Bottom Left) */}
              <div
                className="absolute bottom-3 left-8 h-2 w-2 rounded-full bg-emerald-400"
                style={{ boxShadow: '0 0 8px #34d399' }}
              />
            </div>
          </div>
        </div>

        {/* 4. Footer Feature Bar */}
        <div className="mt-20 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#636d65]">
            ПОДДЕРЖИВАЕМЫЕ ПРОТОКОЛЫ И КЛИЕНТЫ
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-xs font-bold tracking-wider text-[#7a857c] sm:gap-12">
            <div className="flex items-center gap-2 transition-colors hover:text-white">
              <span className="text-[#d7ff3b]">⚡</span>
              <span>VLESS REALITY</span>
            </div>
            <div className="flex items-center gap-2 transition-colors hover:text-white">
              <span className="text-[#d7ff3b]">⚡</span>
              <span>HYSTERIA 2</span>
            </div>
            <div className="flex items-center gap-2 transition-colors hover:text-white">
              <span className="text-[#d7ff3b]">⚡</span>
              <span>HAPP CLIENT</span>
            </div>
            <div className="flex items-center gap-2 transition-colors hover:text-white">
              <span className="text-[#d7ff3b]">⚡</span>
              <span>INCY APP</span>
            </div>
            <div className="flex items-center gap-2 transition-colors hover:text-white">
              <span className="text-[#d7ff3b]">⚡</span>
              <span>SMART TV</span>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Quick Connect & QR Code Modal on Click */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-2xl">
          <div className="fresh-glass-pill relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: accentLime }}
              >
                Подключение устройства
              </span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-xs text-[#8e9690] hover:text-[#f5f5f7]"
              >
                ✕
              </button>
            </div>

            {/* QR Viewport */}
            <div className="mx-auto my-3 flex h-52 w-52 items-center justify-center rounded-2xl border border-white/10 bg-white p-3 shadow-inner">
              <QRCodeSVG value={subscriptionUrl} size={185} level="M" includeMargin={false} />
            </div>

            <p className="mt-3 text-xs text-[#8e9690]">
              Отсканируйте камерой в приложении Happ, v2rayNG или Streisand.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handle1ClickHapp}
                className="fresh-glow-btn flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold text-black"
              >
                <span>Открыть в Happ</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="fresh-secondary-btn flex items-center justify-center gap-2 rounded-full py-2 text-xs font-medium"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Ссылка скопирована!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" style={{ color: accentLime }} />
                    <span>Скопировать ключ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
