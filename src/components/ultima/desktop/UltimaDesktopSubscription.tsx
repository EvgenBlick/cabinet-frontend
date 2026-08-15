import type { CSSProperties, ReactNode } from 'react';
import { ArrowRight, CalendarDays, Layers3, Smartphone, WalletCards } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { UltimaDeviceStepper } from '@/components/ultima/UltimaDeviceStepper';
import {
  UltimaSubscriptionPeriodGrid,
  type UltimaSubscriptionPeriodOption,
} from '@/components/ultima/UltimaSubscriptionConfigurator';
import {
  ultimaAccentSurfaceStyle,
  ultimaCardClassName,
  ultimaSurfaceStyle,
} from '@/features/ultima/surfaces';
import { cn } from '@/lib/utils';
import { UltimaDesktopNavbar } from './UltimaDesktopNavbar';

type UltimaDesktopSubscriptionProps = {
  planSelector?: ReactNode;
  trafficTopUp?: ReactNode;
  title: string;
  subtitle: string;
  isCurrentTariff: boolean;
  isTariffSwitchFlow: boolean;
  switchFromLabel?: string | null;
  switchHint?: string | null;
  trafficLabel: string;
  baseDeviceLimit: number;
  selectedDeviceLimit: number;
  minDeviceLimit: number;
  maxDeviceLimit: number;
  periods: UltimaSubscriptionPeriodOption[];
  selectedPeriodLabel: string;
  extraDeviceChargeLabel?: string | null;
  deviceTrafficLabel?: string | null;
  legacyDeviceNotice?: string | null;
  onReduceDevices?: (() => void) | null;
  totalPriceLabel: string;
  balanceAppliedLabel: string;
  payablePriceLabel: string;
  hasBalanceApplied: boolean;
  requiresTopUp: boolean;
  isFree: boolean;
  actionLabel: string;
  actionPriceLabel: string;
  actionMetaLabel: string;
  error: string | null;
  paymentRecoveryCard?: ReactNode;
  awaitingPaymentCompletion: boolean;
  isFinalizingPending: boolean;
  isPayDisabled: boolean;
  bottomNav: ReactNode;
  onSelectDevice: (limit: number) => void;
  onSelectPeriod: (days: number) => void;
  onPay: () => void;
};

const defaultCardStyle: CSSProperties = ultimaSurfaceStyle;
const accentCardStyle: CSSProperties = ultimaAccentSurfaceStyle;

export function UltimaDesktopSubscription({
  planSelector,
  trafficTopUp,
  title,
  subtitle,
  isCurrentTariff,
  isTariffSwitchFlow,
  switchFromLabel,
  switchHint,
  trafficLabel,
  baseDeviceLimit,
  selectedDeviceLimit,
  minDeviceLimit,
  maxDeviceLimit,
  periods,
  selectedPeriodLabel,
  extraDeviceChargeLabel,
  deviceTrafficLabel,
  legacyDeviceNotice,
  onReduceDevices,
  totalPriceLabel,
  balanceAppliedLabel,
  payablePriceLabel,
  hasBalanceApplied,
  requiresTopUp,
  isFree,
  actionLabel,
  actionPriceLabel,
  actionMetaLabel,
  error,
  paymentRecoveryCard,
  awaitingPaymentCompletion,
  isFinalizingPending,
  isPayDisabled,
  onSelectDevice,
  onSelectPeriod,
  onPay,
}: UltimaDesktopSubscriptionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canDecreaseDevices = selectedDeviceLimit > minDeviceLimit;
  const canIncreaseDevices = selectedDeviceLimit < maxDeviceLimit;

  return (
    <div className="min-h-screen bg-[#07080a] text-white">
      {/* Desktop Frosted Glass Navbar */}
      <UltimaDesktopNavbar
        onBuySubscription={() => navigate('/subscription')}
        onOpenSupport={() => navigate('/support')}
      />

      <div className="mx-auto max-w-7xl px-8 py-8">
        {/* Header */}
        <div className="mb-6 px-1">
          <h1 className="text-3xl font-bold text-[#f5f5f7] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {t('subscription.purchaseTitle', { defaultValue: 'Тарифы и подписка' })}
          </h1>
          <p className="mt-1 text-sm font-medium text-[#8e929b]">
            {t('subscription.purchaseSubtitle', {
              defaultValue:
                'Выберите конфигурацию устройств и период, а оплата пересчитается автоматически.',
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Left Column: Plans & Configurator (8 cols on lg) */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {planSelector}

            {/* Configurator Card */}
            <section
              className={cn(ultimaCardClassName, 'p-6')}
              style={accentCardStyle}
              data-testid="ultima-desktop-subscription-configurator"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 max-w-[60ch]">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-white/[0.46]">
                    <Layers3 className="h-4 w-4 text-[#d4b37f]/[0.8]" />
                    {t('ultima.subscriptionBuilder.pageTitle')}
                  </div>
                  <div className="mt-3 flex min-w-0 items-center gap-3">
                    <h2 className="min-w-0 truncate text-[28px] font-bold leading-none text-white">
                      {title}
                    </h2>
                    {isCurrentTariff ? (
                      <span className="shrink-0 rounded-full border border-[#d4b37f]/40 bg-[#d4b37f]/15 px-3 py-1 text-[10px] font-bold text-[#d4b37f]">
                        {t('subscription.currentTariff')}
                      </span>
                    ) : null}
                  </div>
                  {subtitle ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/[0.65]">
                      {subtitle}
                    </p>
                  ) : null}
                </div>

                <div className="grid min-w-[280px] grid-cols-2 divide-x divide-white/[0.1] rounded-2xl border border-white/[0.1] bg-black/40 px-4 py-3">
                  <div className="pr-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/[0.4]">
                      {t('ultima.subscriptionBuilder.traffic')}
                    </div>
                    <div
                      className="mt-1 truncate text-sm font-bold text-white"
                      title={trafficLabel}
                    >
                      {trafficLabel}
                    </div>
                  </div>
                  <div className="pl-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/[0.4]">
                      {t('ultima.subscriptionBuilder.baseDevices')}
                    </div>
                    <div className="mt-1 text-sm font-bold text-white">
                      {t('subscription.devices', { count: baseDeviceLimit })}
                    </div>
                  </div>
                </div>
              </div>

              {isTariffSwitchFlow ? (
                <div className="mt-5 flex items-center justify-between gap-5 border-t border-white/[0.1] pt-5">
                  <div className="flex min-w-0 items-center gap-3 text-sm">
                    <span className="truncate text-white/[0.58]">{switchFromLabel || '—'}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#d4b37f]" />
                    <span className="truncate font-bold text-white">{title}</span>
                  </div>
                  {switchHint ? (
                    <p className="max-w-[48ch] text-right text-xs leading-relaxed text-white/[0.5]">
                      {switchHint}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-5 flex items-center justify-between gap-5 border-t border-white/[0.1] pt-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Smartphone className="h-4 w-4 text-[#d4b37f]" />
                      {t('ultima.subscriptionBuilder.deviceLimit')}
                    </div>
                    <p className="mt-1 text-xs text-white/[0.5]">
                      {t('ultima.subscriptionBuilder.deviceHint', { max: maxDeviceLimit })}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {extraDeviceChargeLabel ? (
                        <span className="text-amber-300">{extraDeviceChargeLabel}</span>
                      ) : null}
                      {deviceTrafficLabel ? (
                        <span className="text-[#d4b37f]">{deviceTrafficLabel}</span>
                      ) : null}
                    </div>
                  </div>
                  <UltimaDeviceStepper
                    value={selectedDeviceLimit}
                    canDecrease={canDecreaseDevices}
                    canIncrease={canIncreaseDevices}
                    onDecrease={() => onSelectDevice(selectedDeviceLimit - 1)}
                    onIncrease={() => onSelectDevice(selectedDeviceLimit + 1)}
                    testIdPrefix="ultima-desktop"
                    variant="desktop"
                  />
                </div>
              )}

              {legacyDeviceNotice ? (
                <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-amber-200">
                  <span>{legacyDeviceNotice}</span>
                  {onReduceDevices ? (
                    <button
                      type="button"
                      onClick={onReduceDevices}
                      className="shrink-0 text-xs font-bold text-amber-300 underline decoration-amber-400/40 underline-offset-4 hover:text-white"
                    >
                      {t('subscription.manageDevices', {
                        defaultValue: 'Управление устройствами',
                      })}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </section>

            {!isTariffSwitchFlow ? (
              <section className={cn(ultimaCardClassName, 'p-6')} style={defaultCardStyle}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#d4b37f]" />
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        {t('ultima.subscriptionBuilder.periodTitle')}
                      </h2>
                      <p className="mt-0.5 text-xs text-white/[0.5]">
                        {t('ultima.subscriptionBuilder.periodHint')}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white/[0.7]">
                    {selectedPeriodLabel}
                  </span>
                </div>
                <UltimaSubscriptionPeriodGrid
                  periods={periods}
                  onSelectPeriod={onSelectPeriod}
                  testIdPrefix="ultima-desktop"
                />
              </section>
            ) : null}

            {trafficTopUp}
          </div>

          {/* Right Column: Order Summary & Pay CTA (4 cols on lg) */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <section className={cn(ultimaCardClassName, 'p-6')} style={defaultCardStyle}>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/[0.45]">
                <WalletCards className="h-4 w-4 text-[#d4b37f]" />
                {t('ultima.subscriptionBuilder.orderTitle')}
              </div>
              <div className="mt-3 text-3xl font-bold leading-none text-white">
                {totalPriceLabel}
              </div>
              <div className="mt-1 text-xs text-white/[0.5]">{selectedPeriodLabel}</div>

              <div className="mt-5 divide-y divide-white/[0.08] border-y border-white/[0.08]">
                <div className="flex items-center justify-between gap-3 py-3 text-xs">
                  <span className="text-white/[0.55]">
                    {t('ultima.subscriptionBuilder.subscriptionCost')}
                  </span>
                  <span className="font-bold text-white">{totalPriceLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-3 py-3 text-xs">
                  <span className="text-white/[0.55]">
                    {t('ultima.subscriptionBuilder.fromBalance')}
                  </span>
                  <span className="font-bold text-white">
                    {hasBalanceApplied ? `−${balanceAppliedLabel}` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 py-3 text-xs">
                  <span className="text-white/[0.55]">
                    {t('ultima.subscriptionBuilder.toTopUp')}
                  </span>
                  <span className="font-bold text-[#d4b37f]">
                    {requiresTopUp ? payablePriceLabel : t('ultima.subscriptionBuilder.noTopUp')}
                  </span>
                </div>
              </div>

              {(awaitingPaymentCompletion || isFinalizingPending) && (
                <div className="mt-4 rounded-xl border border-[#d4b37f]/30 bg-[#d4b37f]/10 px-3.5 py-2.5 text-xs leading-relaxed text-[#d4b37f]">
                  {t('subscription.paymentPending')}
                </div>
              )}

              {error ? (
                <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-rose-200">
                  {error}
                </div>
              ) : null}

              {paymentRecoveryCard ? <div className="mt-4">{paymentRecoveryCard}</div> : null}

              {/* Gold Rotating Beam Checkout Button */}
              <div className="btn-gold-beam mt-6 w-full shadow-[0_8px_24px_rgba(212,179,127,0.35)]">
                <button
                  type="button"
                  onClick={onPay}
                  disabled={isPayDisabled}
                  data-testid="ultima-desktop-subscription-primary-action"
                  className="btn-gold-beam-inner flex min-h-[50px] w-full items-center justify-between px-5 py-3 text-left font-bold text-[#0a0c0f] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, #f5e6d0 0%, #d4b37f 50%, #b89358 100%)',
                  }}
                >
                  <span className="min-w-0 flex-1 truncate text-xs font-extrabold uppercase tracking-wide">
                    {actionLabel}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-black leading-none">
                      {isFree ? t('subscription.free') : actionPriceLabel}
                    </span>
                    {!isFree && actionMetaLabel ? (
                      <span className="mt-1 block text-[9px] font-bold uppercase leading-none text-[#0a0c0f]/70">
                        {actionMetaLabel}
                      </span>
                    ) : null}
                  </span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
