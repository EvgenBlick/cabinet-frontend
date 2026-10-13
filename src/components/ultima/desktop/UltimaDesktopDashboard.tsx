import { UltimaTrafficBreakdown } from '@/components/ultima/UltimaTrafficBreakdown';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '@/api/subscription';
import { copyToClipboard } from '@/utils/clipboard';
import { Check, ChevronRight, Copy, MessageCircle, QrCode, X } from 'lucide-react';
import type { ActiveDiscount, PromoOffer } from '@/api/promo';
import type { UltimaNextActionKind } from '@/features/ultima/nextAction';
import type { Subscription } from '@/types';
import { UltimaDesktopNavbar } from './UltimaDesktopNavbar';
import { SamuraiVideoHero } from '@/components/ultima/SamuraiVideoHero';

export type UltimaDashboardStatusTone = 'active' | 'trial' | 'warning' | 'expired';

type UltimaDesktopDashboardProps = {
  heroButton?: ReactNode;
  subscriptionControls?: ReactNode;
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
  subscription, subscriptionControls, referralCta, devicesCta, trafficWarning,
  connectedDevicesCount = 0, isDevicesLoading, expiryLabel, statusLabel,
  daysLeft: initialDaysLeft, primaryCtaLabel, showTrialSetupCard, trialGuide,
  onPrimaryAction, onBuySubscription, onOpenConnection, onOpenSupport,
}: UltimaDesktopDashboardProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [selectedClient, setSelectedClient] = useState<'happ' | 'incy'>('happ');
  const { data: appConfig, isPending: connectionLoading, isError: connectionError, refetch: retryConnection } = useQuery({
    queryKey: ['app-config'], queryFn: subscriptionApi.getAppConfig, enabled: Boolean(subscription), retry: false,
  });
  const linksHidden = Boolean(subscription?.hide_subscription_link || appConfig?.hideLink);
  const protectedLinks = appConfig?.cryptoLinksEnabled !== false;
  const candidateLink = selectedClient === 'happ' ? appConfig?.subscriptionCryptoLink : appConfig?.subscriptionIncyCryptoLink;
  const isProtectedLink = selectedClient === 'happ'
    ? /^happ:\/\/crypt\d+\//i.test(candidateLink?.trim() ?? '')
    : /^incy:\/\/crypt\d+\//i.test(candidateLink?.trim() ?? '');
  const subscriptionUrl = linksHidden || !appConfig ? null : protectedLinks
    ? isProtectedLink ? candidateLink!.trim() : null
    : subscription?.subscription_url?.trim() || null;
  const daysLeft = initialDaysLeft ?? subscription?.days_left ?? 0;
  const isSubscriptionActive = subscription?.is_active === true && subscription.is_expired !== true;
  const trafficLimitGb = subscription?.traffic_limit_gb ?? 0;
  const trafficUsedGb = subscription?.traffic_used_gb ?? 0;
  const formatTraffic = (value: number) => value.toLocaleString('ru-RU', { maximumFractionDigits: 1 });
  const deviceLimit = subscription?.device_limit ?? 0;
  const secondaryButton = 'dashboard-main-action flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-[#f5f5f7] transition-colors hover:border-[#d4b37f]/40 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d4b37f]';

  useEffect(() => {
    if (!copiedLink) return;
    const timer = window.setTimeout(() => setCopiedLink(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copiedLink]);

  useEffect(() => {
    if (!showQrModal) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowQrModal(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [showQrModal]);

  const handleCopyLink = async () => {
    if (!subscriptionUrl) return;
    try {
      await copyToClipboard(subscriptionUrl);
      setCopiedLink(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-[#f5f5f7] selection:bg-[#d4b37f]/30">
      <UltimaDesktopNavbar onBuySubscription={onBuySubscription} onOpenSupport={onOpenSupport} />
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Личный кабинет</h1>
          <p className="mt-2 text-sm text-[#8e929b]">Подписка, устройства и подключение VPN.</p>
        </div>
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
          <section className="samurai-bento-card min-w-0 p-6 lg:col-span-7" aria-label="Ваша подписка">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 shrink-0"><SamuraiVideoHero /></div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#d4b37f]">
                  {statusLabel || (isSubscriptionActive ? 'Подписка активна' : 'Подписка не активна')}
                </p>
                <h2 className="mt-1 break-words text-2xl font-semibold">
                  {subscription?.tariff_name || (subscription?.is_trial ? 'Пробный период' : 'Ваша подписка')}
                </h2>
                <p className="mt-2 text-sm text-[#8e929b]">
                  {expiryLabel ? `Срок действия: ${expiryLabel}` : isSubscriptionActive ? `Осталось ${daysLeft} дней` : 'Выберите тариф для подключения'}
                </p>
              </div>
            </div>
            <dl className="my-6 grid grid-cols-3 gap-3 border-y border-white/[0.08] py-5">
              <div><dt className="text-xs text-[#8e929b]">Осталось</dt><dd className="mt-2 text-xl font-semibold">{subscription ? `${Math.max(0, daysLeft)} дн.` : '—'}</dd></div>
              <div><dt className="text-xs text-[#8e929b]">Устройства</dt><dd className="mt-2 text-xl font-semibold">{isDevicesLoading ? '…' : subscription ? `${connectedDevicesCount} / ${deviceLimit || '∞'}` : '—'}</dd></div>
              <div><dt className="text-xs text-[#8e929b]">Трафик</dt><dd className="mt-2 text-base font-semibold">{subscription ? `${formatTraffic(trafficUsedGb)} / ${trafficLimitGb > 0 ? formatTraffic(trafficLimitGb) : '∞'} ГБ` : '—'}</dd></div>
            </dl>
            <UltimaTrafficBreakdown subscription={subscription} />
            <button type="button" onClick={onPrimaryAction} className="dashboard-main-action samurai-gold-btn flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-black">
              <span>{primaryCtaLabel || 'Выбрать тариф'}</span><ChevronRight className="h-4 w-4" />
            </button>
            <div className="mt-5 space-y-4">{subscriptionControls}</div>
          </section>
          <div className="min-w-0 space-y-4 lg:col-span-5">
            <section className="samurai-bento-card p-6">
              <h2 className="text-lg font-semibold">Подключение VPN</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#8e929b]">Выберите Happ или INCY и следуйте инструкции для вашего устройства.</p>
              <div className="mt-5 space-y-3">
                <button type="button" onClick={onOpenConnection} className={`${secondaryButton} cabinet-key-button`}><span>Настроить подключение</span><ChevronRight className="h-4 w-4 text-[#d4b37f]" /></button>
                {subscription && !linksHidden ? <>
                  {protectedLinks ? <div role="group" aria-label="Приложение для защищённой ссылки" className="grid grid-cols-2 gap-2">
                    {(['happ', 'incy'] as const).map(client => <button key={client} type="button" data-testid={`dashboard-crypto-client-${client}`} aria-pressed={selectedClient === client}
                      onClick={() => { setSelectedClient(client); setCopiedLink(false); setCopyError(false); }}
                      className={`cabinet-glass-control min-h-11 rounded-full border px-4 py-2 text-sm ${selectedClient === client ? 'border-[#e2e2e8]/50 bg-[#e2e2e8]/15 text-[#e0e0e8]' : 'border-white/10 text-white/70'}`}>
                      {client === 'happ' ? 'Happ' : 'INCY'}
                    </button>)}
                  </div> : null}
                  <button type="button" disabled={!subscriptionUrl} onClick={handleCopyLink} className={`${secondaryButton} disabled:opacity-45`}><span>{copiedLink ? 'Ссылка скопирована' : 'Скопировать ссылку подписки'}</span>{copiedLink ? <Check className="h-4 w-4 text-[#d4b37f]" /> : <Copy className="h-4 w-4 text-[#8e929b]" />}</button>
                  <button type="button" disabled={!subscriptionUrl} onClick={() => setShowQrModal(true)} className={`${secondaryButton} disabled:opacity-45`}><span>QR-код подписки</span><QrCode className="h-4 w-4 text-[#d4b37f]" /></button>
                  {!subscriptionUrl ? <p role="status" className="text-sm text-[#aeb6c3]">{connectionLoading ? 'Подготавливаем защищённую ссылку…' : 'Защищённая ссылка пока недоступна.'}</p> : null}
                  {connectionError ? <button type="button" className={secondaryButton} onClick={() => void retryConnection()}>Повторить загрузку ссылки</button> : null}
                </> : null}
              </div>
              {copyError ? <p role="alert" className="mt-3 text-sm text-amber-200">Не удалось скопировать ссылку. Используйте QR-код.</p> : null}
              {showTrialSetupCard ? <div className="mt-5">{trialGuide}</div> : null}
            </section>
            {trafficWarning}
            {devicesCta}
            {referralCta}
            <section className="samurai-bento-card p-5">
              <h2 className="text-base font-semibold">Нужна помощь?</h2>
              <p className="mt-2 text-sm text-[#8e929b]">Обратитесь в поддержку, если возникли вопросы с оплатой или подключением.</p>
              <button type="button" onClick={onOpenSupport} className={`${secondaryButton} mt-4`}><span>Написать в поддержку</span><MessageCircle className="h-4 w-4 text-[#d4b37f]" /></button>
            </section>
          </div>
        </div>
      </main>
      {showQrModal && subscriptionUrl && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/85 p-6 backdrop-blur-xl" onClick={() => setShowQrModal(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="subscription-qr-title" className="samurai-bento-card relative my-auto w-full max-w-sm p-6 text-center" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-4"><h2 id="subscription-qr-title" className="text-lg font-semibold text-[#f5f5f7]">QR-код подписки</h2><button autoFocus type="button" aria-label="Закрыть QR-код" onClick={() => setShowQrModal(false)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-[#8e929b] hover:text-white"><X className="h-5 w-5" /></button></div>
            <div data-testid="dashboard-subscription-qr" data-connection-uri={subscriptionUrl} className="mx-auto my-5 flex h-56 w-56 items-center justify-center rounded-xl bg-white p-3"><QRCodeSVG value={subscriptionUrl} size={200} level="M" /></div>
            <p className="text-sm leading-relaxed text-[#8e929b]">Откройте сканер QR-кода в Happ или INCY на устройстве, которое хотите подключить.</p>
            <button type="button" onClick={handleCopyLink} className={`${secondaryButton} mt-5`}><span>{copiedLink ? 'Ссылка скопирована' : 'Скопировать ссылку'}</span><Copy className="h-4 w-4" /></button>
            {copyError ? <p role="alert" className="mt-3 text-sm text-amber-200">Копирование недоступно. Отсканируйте QR-код.</p> : null}
          </section>
        </div>, document.body,
      )}
    </div>
  );
}

export function UltimaDesktopDashboardSkeleton({ bottomNav }: { bottomNav?: ReactNode } = {}) {
  return <div className="min-h-screen p-6"><div className="mx-auto max-w-6xl animate-pulse space-y-6"><div className="h-12 rounded-xl bg-white/5" /><div className="grid gap-5 lg:grid-cols-12"><div className="h-96 rounded-2xl bg-white/5 lg:col-span-7" /><div className="h-96 rounded-2xl bg-white/5 lg:col-span-5" /></div></div>{bottomNav}</div>;
}
