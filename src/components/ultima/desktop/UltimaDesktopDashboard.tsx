import { useState, type ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Activity,
  ArrowUpRight,
  Check,
  Copy,
  QrCode,
  Server,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { ActiveDiscount, PromoOffer } from '@/api/promo';
import type { UltimaNextActionKind } from '@/features/ultima/nextAction';
import type { Subscription } from '@/types';
import { UltimaDesktopNavbar } from './UltimaDesktopNavbar';

export type UltimaDashboardStatusTone = 'active' | 'trial' | 'warning' | 'expired';

type UltimaDesktopDashboardProps = {
  heroButton?: ReactNode;
  referralCta?: ReactNode;
  devicesCta?: ReactNode;
  trafficWarning?: ReactNode;
  subscription: Subscription | null;
  connectedDevicesCount: number;
  isDevicesLoading?: boolean;
  expiryLabel?: string;
  statusLabel?: string;
  statusTone?: UltimaDashboardStatusTone;
  daysLeft: number | null;
  connectionStep?: 1 | 2 | 3;
  isConnectionCompleted?: boolean;
  primaryActionKind?: UltimaNextActionKind;
  primaryCtaLabel?: string;
  primaryCtaMeta?: string;
  promoMessage?: string | null;
  activeDiscount?: ActiveDiscount;
  firstPromoOffer?: PromoOffer | null;
  showTrialSetupCard?: boolean;
  trialGuide?: ReactNode | null;
  showConnectionCtaHighlight?: boolean;
  onPrimaryAction: () => void;
  onBuySubscription: () => void;
  onOpenConnection: () => void;
  onOpenSupport: () => void;
  onActivateOffer?: (() => void) | null;
  isActivatingOffer?: boolean;
};

export function UltimaDesktopDashboard({
  subscription,
  connectedDevicesCount,
  daysLeft,
  onBuySubscription,
  onOpenConnection,
  onOpenSupport,
}: UltimaDesktopDashboardProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const subAny = subscription as any;
  const subscriptionUrl =
    subAny?.subscription_url ||
    subAny?.url ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/api/sub/${subAny?.id || 'demo'}`
      : 'vless://samurai-service');

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

  const isSubActive = daysLeft === null || daysLeft > 0;
  const deviceSlotsTotal = subscription?.device_limit || 5;
  const activeSlots = connectedDevicesCount > 0 ? connectedDevicesCount : 1;
  const slotPercentage = Math.min(100, Math.round((activeSlots / deviceSlotsTotal) * 100));

  return (
    <div className="font-sans-body min-h-screen bg-[#070908] text-[#f5f5f7] selection:bg-[#d4b37f]/30 selection:text-[#f5f5f7]">
      {/* 1. Ambient Background Lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#d4b37f]/10 via-[#1b261e]/15 to-transparent blur-[130px]" />
        <div className="absolute -left-[15%] top-[35%] h-[500px] w-[500px] rounded-full bg-[#1b261e]/15 blur-[150px]" />
        <div className="absolute -right-[15%] top-[45%] h-[500px] w-[500px] rounded-full bg-[#d4b37f]/5 blur-[150px]" />
      </div>

      {/* 2. Floating Navbar */}
      <UltimaDesktopNavbar onBuySubscription={onBuySubscription} onOpenSupport={onOpenSupport} />

      {/* 3. Main Hero Content */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 md:pt-14">
        {/* Hero Headlines */}
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 text-xs text-[#8e929b] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span>Samurai Service • Скоростной защищённый доступ</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-[#f5f5f7] sm:text-5xl md:text-6xl">
            Личный кабинет <br />
            <span className="font-serif-accent font-normal text-[#d4b37f]">Samurai Service</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#8e929b] sm:text-base">
            Управление подпиской, европейские серверы с низким пингом и моментальное подключение
            всех устройств.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <button
              type="button"
              onClick={onOpenConnection}
              className="verdant-glow-btn flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold tracking-wide transition-all"
            >
              <span>Подключить устройство</span>
              <span className="text-base font-normal">→</span>
            </button>

            <button
              type="button"
              onClick={onBuySubscription}
              className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-[#f5f5f7] backdrop-blur-md transition-all hover:border-[#d4b37f]/40 hover:bg-white/[0.08]"
            >
              <span>Тарифы и продление</span>
            </button>
          </div>
        </div>

        {/* 4. The 3 Modern High-Tech Bento Cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Bento 1: Quick Connect & Subscription Key */}
          <div className="verdant-bento-card group flex flex-col justify-between p-6 sm:p-7">
            <div>
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#d4b37f] transition-all group-hover:border-[#d4b37f]/40 group-hover:bg-[#d4b37f]/10">
                  <QrCode className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8e929b]">
                  Устройства
                </span>
              </div>

              <h3 className="text-lg font-bold tracking-tight text-[#f5f5f7]">
                Быстрое подключение
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#8e929b]">
                Скопируйте ссылку подписки или откройте приложение для импорта.
              </p>
            </div>

            {/* Functional Widget: Key Box + 1-Click Button */}
            <div className="my-5 space-y-2.5">
              {/* Key Copy Box */}
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/[0.08] bg-[#0c100e]/80 p-2.5 backdrop-blur-md">
                <span className="truncate font-mono text-[11px] text-[#8e929b]">
                  {subscriptionUrl
                    ? subscriptionUrl.replace(/^https?:\/\/[^/]+/, 'https://samuraiservice.org')
                    : 'https://samuraiservice.org/sub/connect'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-[#f5f5f7] transition-all hover:bg-[#d4b37f]/20 hover:text-[#d4b37f]"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-[#d4b37f]" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>

              {/* 1-Click Import Button */}
              <button
                type="button"
                onClick={handle1ClickHapp}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d4b37f]/30 bg-[#d4b37f]/10 py-2.5 text-xs font-bold text-[#d4b37f] transition-all hover:border-[#d4b37f]/60 hover:bg-[#d4b37f]/20"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Открыть в приложении Happ</span>
              </button>

              {/* Slots meter with Progress Bar */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8e929b]">Слотов устройств:</span>
                  <span className="font-semibold text-[#f5f5f7]">
                    {activeSlots} из {deviceSlotsTotal}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#d4b37f] to-emerald-400 transition-all duration-500"
                    style={{ width: `${slotPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Link */}
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex items-center justify-between text-xs font-semibold text-[#d4b37f] transition-all hover:text-[#f5f5f7]"
            >
              <span>Показать QR-код для ТВ и мобильных</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Bento 2: Telemetry & Traffic */}
          <div className="verdant-bento-card group flex flex-col justify-between p-6 sm:p-7">
            <div>
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#d4b37f] transition-all group-hover:border-[#d4b37f]/40 group-hover:bg-[#d4b37f]/10">
                  <Activity className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8e929b]">
                  Тариф
                </span>
              </div>

              <h3 className="text-lg font-bold tracking-tight text-[#f5f5f7]">Тариф и трафик</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#8e929b]">
                Мониторинг активной подписки и параметров скорости канала.
              </p>
            </div>

            {/* Functional Widget: Live Metrics & Activity Bars */}
            <div className="my-5 space-y-3">
              {/* Status Banner */}
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#0c100e]/80 p-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8e929b]">
                    Срок действия
                  </span>
                  <div className="text-base font-extrabold text-[#f5f5f7]">
                    {daysLeft !== null ? `${daysLeft} дн.` : 'Бессрочно'}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  {isSubActive ? 'Активен' : 'Завершён'}
                </span>
              </div>

              {/* Speed & Uplink Metric Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="text-[#8e929b]">Канал:</span>
                  <div className="font-semibold text-[#f5f5f7]">10 Gbps Port</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="text-[#8e929b]">Трафик:</span>
                  <div className="font-semibold text-emerald-400">Безлимит</div>
                </div>
              </div>

              {/* Linear-style Activity Visualizer */}
              <div className="rounded-2xl border border-white/5 bg-black/30 p-3">
                <div className="mb-2 flex items-center justify-between text-[10px] text-[#8e929b]">
                  <span>Пинг в ЕС: ~14 ms</span>
                  <span className="text-emerald-400">Zero-Loss</span>
                </div>
                <div className="flex h-7 items-end justify-between gap-1">
                  {[40, 65, 50, 85, 90, 70, 60, 95, 80, 88, 72, 98, 85, 90].map((height, i) => (
                    <div
                      key={i}
                      className="w-full rounded-t-sm bg-gradient-to-t from-[#d4b37f]/20 to-[#d4b37f] transition-all duration-300 hover:brightness-125"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Link */}
            <button
              type="button"
              onClick={onBuySubscription}
              className="flex items-center justify-between text-xs font-semibold text-[#d4b37f] transition-all hover:text-[#f5f5f7]"
            >
              <span>Продлить тариф</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Bento 3: Server Locations & Protection */}
          <div className="verdant-bento-card group flex flex-col justify-between p-6 sm:p-7">
            <div>
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#d4b37f] transition-all group-hover:border-[#d4b37f]/40 group-hover:bg-[#d4b37f]/10">
                  <Server className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8e929b]">
                  Узлы сети
                </span>
              </div>

              <h3 className="text-lg font-bold tracking-tight text-[#f5f5f7]">Серверы и сеть</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#8e929b]">
                Высокоскоростные европейские локации с защитой от блокировок.
              </p>
            </div>

            {/* Functional Widget: Live European Nodes List */}
            <div className="my-5 space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-xs transition-colors hover:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-base">🇸🇪</span>
                  <span className="font-semibold text-[#f5f5f7]">Швеция (Стокгольм)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-[#8e929b]">14 ms</span>
                  <span className="font-medium text-emerald-400">● Онлайн</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-xs transition-colors hover:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-base">🇳🇱</span>
                  <span className="font-semibold text-[#f5f5f7]">Нидерланды (Амстердам)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-[#8e929b]">18 ms</span>
                  <span className="font-medium text-emerald-400">● Онлайн</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-xs transition-colors hover:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-base">🇵🇱</span>
                  <span className="font-semibold text-[#f5f5f7]">Польша (Варшава)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-[#8e929b]">22 ms</span>
                  <span className="font-medium text-emerald-400">● Онлайн</span>
                </div>
              </div>

              {/* Protection Badge */}
              <div className="mt-2 flex items-center justify-between rounded-xl border border-[#d4b37f]/20 bg-[#d4b37f]/5 px-3 py-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#d4b37f]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="font-semibold">Умная защита</span>
                </div>
                <span className="text-[#8e929b]">Без блокировок • Zero-Logs</span>
              </div>
            </div>

            {/* Bottom Action Link */}
            <button
              type="button"
              onClick={onOpenSupport}
              className="flex items-center justify-between text-xs font-semibold text-[#d4b37f] transition-all hover:text-[#f5f5f7]"
            >
              <span>Служба поддержки 24/7</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* 5. Supported Technologies / Ecosystem strip */}
        <div className="mt-16 border-t border-white/5 pt-8">
          <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-widest text-[#8e929b]">
            Поддерживаемые устройства и приложения
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-semibold tracking-wider text-[#636872]">
            <span className="transition-colors hover:text-[#d4b37f]">IOS</span>
            <span>•</span>
            <span className="transition-colors hover:text-[#d4b37f]">ANDROID</span>
            <span>•</span>
            <span className="transition-colors hover:text-[#d4b37f]">MACOS</span>
            <span>•</span>
            <span className="transition-colors hover:text-[#d4b37f]">WINDOWS</span>
            <span>•</span>
            <span className="transition-colors hover:text-[#d4b37f]">ANDROID TV</span>
            <span>•</span>
            <span className="transition-colors hover:text-[#d4b37f]">SMART TV</span>
            <span>•</span>
            <span className="transition-colors hover:text-[#d4b37f]">HAPP</span>
          </div>
        </div>
      </main>

      {/* 6. Instant QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
          <div className="verdant-glass-pill relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4b37f]">
                QR-код подключения
              </span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-xs text-[#8e929b] hover:text-[#f5f5f7]"
              >
                ✕
              </button>
            </div>

            {/* QR Viewport */}
            <div className="mx-auto my-3 flex h-52 w-52 items-center justify-center rounded-2xl border border-white/10 bg-white p-3 shadow-inner">
              <QRCodeSVG value={subscriptionUrl} size={185} level="M" includeMargin={false} />
            </div>

            <p className="mt-3 text-xs text-[#8e929b]">
              Отсканируйте камерой в приложении Happ, v2rayNG или Streisand.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handle1ClickHapp}
                className="verdant-glow-btn flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold"
              >
                <span>Открыть в Happ</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-2 text-xs font-medium text-[#f5f5f7] hover:bg-white/[0.08]"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Ключ скопирован!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#d4b37f]" />
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

export function UltimaDesktopDashboardSkeleton({
  bottomNav: _bottomNav,
}: {
  bottomNav?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070908] p-8 text-[#f5f5f7]">
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-12 rounded-full bg-white/[0.04]" />
        <div className="mx-auto h-16 w-3/4 rounded-2xl bg-white/[0.04]" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="h-80 rounded-3xl bg-white/[0.04]" />
          <div className="h-80 rounded-3xl bg-white/[0.04]" />
          <div className="h-80 rounded-3xl bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
