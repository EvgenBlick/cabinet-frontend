import { useState, type ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  Headphones,
  MessageCircle,
  QrCode,
  Users,
  Zap,
} from 'lucide-react';
import type { ActiveDiscount, PromoOffer } from '@/api/promo';
import type { UltimaNextActionKind } from '@/features/ultima/nextAction';
import type { Subscription } from '@/types';
import { UltimaDesktopNavbar } from './UltimaDesktopNavbar';
import { YandexLinkingQuickActionRow } from '@/components/ultima/YandexLinkingFloatingBadge';
import { SamuraiVideoHero } from '@/components/ultima/SamuraiVideoHero';

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
  connectedDevicesCount = 0,
  expiryLabel,
  statusLabel,
  daysLeft: initialDaysLeft,
  primaryCtaLabel,
  onPrimaryAction,
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
      : 'https://samuraiservice.org/sub/connect');

  const daysLeft = initialDaysLeft ?? subscription?.days_left ?? 30;
  const isSubscriptionActive = (daysLeft > 0 && subscription?.status !== 'expired') || true;
  const trafficLimitGb = subscription?.traffic_limit_gb || 0;
  const trafficUsedGb = subscription?.traffic_used_gb || 0;
  const isUnlimitedTraffic = !trafficLimitGb || trafficLimitGb <= 0;
  const deviceLimit = Math.max(3, subscription?.device_limit ?? 3);

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

  return (
    <div className="font-sans min-h-screen bg-transparent text-[#f5f5f7] selection:bg-[#d4b37f]/30 selection:text-[#f5f5f7]">
      {/* 1. Floating Header Navbar */}
      <UltimaDesktopNavbar onBuySubscription={onBuySubscription} onOpenSupport={onOpenSupport} />

      {/* 2. Main Dashboard Cockpit */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">

        {/* Section 1: Hero Cockpit Grid (Master Status + Network Radar) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Hero Card (7 cols on Desktop, Full on Tablet) */}
          <div className="samurai-bento-card relative flex flex-col justify-between overflow-hidden p-6 sm:p-8 lg:col-span-7">
            {/* Top Row: VIP Status & Quick Link */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-2.5 w-2.5 rounded-full shadow-lg"
                  style={{
                    backgroundColor: isSubscriptionActive ? '#d4b37f' : '#ef4444',
                    boxShadow: isSubscriptionActive ? '0 0 12px #d4b37f' : '0 0 12px #ef4444',
                  }}
                />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#8e929b]">
                  {statusLabel || (isSubscriptionActive ? 'ТАРИФ АКТИВЕН' : 'ТРЕБУЕТСЯ ПОДКЛЮЧЕНИЕ')}
                </span>
              </div>
              <button
                type="button"
                onClick={onBuySubscription}
                className="group inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-[#d4b37f] transition-all hover:border-[#d4b37f]/40 hover:bg-white/[0.06]"
              >
                <span>Тарифы</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Center Area: Samurai Breathing Video Emblem & Title */}
            <div className="my-6 flex flex-col items-center text-center sm:my-8">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#d4b37f]/15 blur-2xl transition-all" />
                <div className="relative z-10 h-28 w-28 sm:h-32 sm:w-32">
                  <SamuraiVideoHero />
                </div>
              </div>

              <h1 className="mt-5 text-[2rem] font-black leading-none tracking-tight text-white sm:text-[2.5rem]">
                Samurai Service
              </h1>
              <p className="mt-2 text-[11px] font-medium tracking-widest text-[#6e727c]">
                {expiryLabel
                  ? `Срок действия: ${expiryLabel}`
                  : isSubscriptionActive
                    ? `Осталось ${daysLeft} дней`
                    : 'Подписка не активна'}
              </p>

              {/* 3 Core Metric Chips */}
              <div className="mt-6 grid w-full grid-cols-3 divide-x divide-white/[0.05] rounded-2xl border border-white/[0.07] bg-white/[0.025] py-4 shadow-sm">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6e727c]">
                    Осталось
                  </span>
                  <p className="mt-1 text-lg font-black text-white">{daysLeft} дн.</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6e727c]">
                    Устройства
                  </span>
                  <p className="mt-1 text-lg font-black text-white">
                    {connectedDevicesCount} / {deviceLimit}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6e727c]">
                    Трафик
                  </span>
                  <p className="mt-1 text-lg font-black text-white">
                    {isUnlimitedTraffic ? '∞' : `${trafficUsedGb}/${trafficLimitGb}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar: Primary Action + 1-Click Connect + Copy */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <button
                type="button"
                onClick={onPrimaryAction || onBuySubscription}
                className="samurai-gold-btn flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold text-black transition-transform active:scale-[0.98]"
              >
                <Zap className="h-4 w-4" />
                <span>{primaryCtaLabel || 'Выбрать тариф'}</span>
              </button>

              <button
                type="button"
                onClick={handle1ClickHapp}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] py-3 text-[13px] font-semibold text-white transition-all hover:border-[#d4b37f]/35 hover:bg-white/[0.07] active:scale-[0.98]"
              >
                <span className="text-[#d4b37f]">↗</span>
                <span>Импорт в Happ</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-xs font-semibold text-white transition-all hover:border-[#d4b37f]/40 hover:bg-white/[0.08] active:scale-[0.98]"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 text-[#d4b37f]" />
                    <span className="text-[#d4b37f]">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-[#8e929b]" />
                    <span>Скопировать ключ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column (5 cols on Desktop, Full on Tablet) */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            {/* Quick Connect Card — grows to fill available height */}
            <div className="samurai-bento-card flex flex-grow flex-col p-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d4b37f]">
                  Быстрое подключение
                </span>

                <div className="mt-4 space-y-2.5">
                  <button
                    type="button"
                    onClick={handle1ClickHapp}
                    className="samurai-gold-btn flex w-full items-center justify-between rounded-xl px-4 py-3 text-[13px] font-bold text-black transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-2.5">
                      <Zap className="h-4 w-4" />
                      <span>Подключить в 1 клик (Happ)</span>
                    </div>
                    <span className="text-black/60">→</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-[13px] font-semibold text-white transition-all hover:border-[#d4b37f]/35 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center gap-2.5">
                      {copiedLink ? (
                        <Check className="h-4 w-4 text-[#d4b37f]" />
                      ) : (
                        <Copy className="h-4 w-4 text-[#6e727c]" />
                      )}
                      <span>{copiedLink ? 'Ссылка скопирована!' : 'Скопировать ссылку подписки'}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-[#6e727c]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-[13px] font-semibold text-[#d4b37f] transition-all hover:border-[#d4b37f]/35 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode className="h-4 w-4" />
                      <span>Показать QR-код для камеры</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Platform hint — subtle, no noisy pill */}
                <p className="mt-4 text-[10px] leading-relaxed text-[#6e727c]">
                  iOS · Android · macOS · Windows · Linux · Smart TV
                </p>
              </div>
            </div>

            {/* Yandex ID Card */}
            <div className="samurai-bento-card p-5">
              <YandexLinkingQuickActionRow />
            </div>
          </div>
        </div>

        {/* Section 2: 3 Bento Info Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Card 1: Devices */}
          <div className="samurai-bento-card flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6e727c]">
                  Устройства
                </span>
                <span className="rounded-full border border-[#d4b37f]/25 bg-[#d4b37f]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#d4b37f]">
                  до {deviceLimit}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-[17px] font-bold text-white">Все платформы</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[#6e727c]">
                  iOS · Android · macOS · Windows · Linux · Smart TV
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenConnection}
              className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 text-[12px] font-semibold text-white transition-all hover:border-[#d4b37f]/35 hover:bg-white/[0.07]"
            >
              <span>Подключить устройство</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#d4b37f]" />
            </button>
          </div>

          {/* Card 2: Referral */}
          <div className="samurai-bento-card flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6e727c]">
                  Бонусная программа
                </span>
                <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                  +3 дня
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-[17px] font-bold text-white">Приглашайте друзей</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[#6e727c]">
                  Получайте по 3 дня подписки за каждого приглашённого.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2.5 text-[12px] text-[#d4b37f]">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium">Ваша реферальная ссылка готова</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/referral';
                }
              }}
              className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 text-[12px] font-semibold text-white transition-all hover:border-[#d4b37f]/35 hover:bg-white/[0.07]"
            >
              <span>Реферальный кабинет</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#d4b37f]" />
            </button>
          </div>

          {/* Card 3: Support */}
          <div className="samurai-bento-card flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6e727c]">
                  Поддержка
                </span>
                {/* Refined 24/7 — no garish green pill, just dot + text */}
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#6e727c]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d39966]" />
                  24/7 онлайн
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-[17px] font-bold text-white">Служба заботы</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[#6e727c]">
                  Помощь с настройкой на любом устройстве.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2.5 text-[12px] text-[#6e727c]">
                <Headphones className="h-3.5 w-3.5 shrink-0 text-[#d4b37f]" />
                <span>Среднее время ответа: 2 минуты</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSupport}
              className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 text-[12px] font-semibold text-white transition-all hover:border-[#d4b37f]/35 hover:bg-white/[0.07]"
            >
              <span>Написать в поддержку</span>
              <MessageCircle className="h-3.5 w-3.5 text-[#d4b37f]" />
            </button>
          </div>
        </div>
      </main>

      {/* 4. Fullscreen QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-2xl">
          <div className="samurai-bento-card relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4b37f]">
                QR-код подписки
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
              Наведите камеру в приложении Happ для мгновенного добавления.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handle1ClickHapp}
                className="samurai-gold-btn flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold text-black"
              >
                <span>Открыть в Happ</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-2 text-xs font-medium text-white hover:bg-white/10"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#d4b37f]" />
                    <span className="text-[#d4b37f]">Ссылка скопирована!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#d4b37f]" />
                    <span>Скопировать ссылку</span>
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

export function UltimaDesktopDashboardSkeleton({ bottomNav }: { bottomNav?: ReactNode } = {}) {
  return (
    <div className="min-h-screen bg-[#06070a] p-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-12 w-full rounded-2xl bg-white/5" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7 h-96 rounded-3xl bg-white/5" />
          <div className="col-span-5 h-96 rounded-3xl bg-white/5" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="h-64 rounded-3xl bg-white/5" />
          <div className="h-64 rounded-3xl bg-white/5" />
          <div className="h-64 rounded-3xl bg-white/5" />
        </div>
      </div>
      {bottomNav}
    </div>
  );
}
