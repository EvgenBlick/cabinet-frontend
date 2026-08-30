import type { ReactNode } from 'react';
import { Check, Clock3, RefreshCw, SlidersHorizontal, WalletCards } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { UltimaDeviceStepper } from '@/components/ultima/UltimaDeviceStepper';
import { cn } from '@/lib/utils';

export type UltimaSubscriptionPeriodOption = {
  days: number;
  label: string;
  priceLabel: string;
  monthlyLabel: string;
  originalPriceLabel: string | null;
  isSelected: boolean;
  isBestDeal: boolean;
};

type UltimaSubscriptionConfiguratorProps = {
  title: string;
  subtitle: string;
  isCurrentTariff: boolean;
  canChangeTariff: boolean;
  isTariffSwitchFlow: boolean;
  switchFromLabel?: string | null;
  switchHint?: string | null;
  trafficLabel: string;
  baseDeviceLimit: number;
  selectedDeviceLimit: number;
  minDeviceLimit: number;
  maxDeviceLimit: number;
  extraDeviceSummary?: string | null;
  extraDevicePriceLabel?: string | null;
  deviceTrafficLabel?: string | null;
  periods: UltimaSubscriptionPeriodOption[];
  selectedPeriodLabel: string;
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
  minimumTopUpHint?: ReactNode;
  paymentRecoveryCard?: ReactNode;
  trafficTopUp?: ReactNode;
  bottomNav: ReactNode;
  isPayDisabled: boolean;
  onChangeTariff: () => void;
  onSelectDevice: (limit: number) => void;
  onSelectPeriod: (days: number) => void;
  onPay: () => void;
};

export function UltimaSubscriptionPeriodGrid({
  periods,
  onSelectPeriod,
  testIdPrefix,
}: {
  periods: UltimaSubscriptionPeriodOption[];
  onSelectPeriod: (days: number) => void;
  testIdPrefix: string;
}) {
  const { t } = useTranslation();

  return (
    <div
      role="radiogroup"
      aria-label={t('subscription.selectPeriod')}
      data-testid={`${testIdPrefix}-period-selector`}
      className="grid grid-cols-2 gap-2 sm:grid-cols-3"
    >
      {periods.map((period) => (
        <button
          key={period.days}
          type="button"
          role="radio"
          aria-checked={period.isSelected}
          data-testid={`${testIdPrefix}-period-${period.days}`}
          onClick={() => onSelectPeriod(period.days)}
          className={cn(
            'group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all duration-200 active:scale-[0.98]',
            period.isSelected
              ? 'border-[#d4b37f] bg-gradient-to-b from-[#d4b37f]/15 to-[#b89358]/5 shadow-[0_0_20px_rgba(212,179,127,0.15),inset_0_1px_0_rgba(212,179,127,0.3)] ring-1 ring-[#d4b37f]/50'
              : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
          )}
        >
          <div className="flex items-start justify-between gap-1.5">
            <span className="text-[13px] font-bold tracking-tight text-white">
              {period.label}
            </span>
            {period.isSelected ? (
              <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#d4b37f] text-black shadow-[0_0_8px_rgba(212,179,127,0.6)]">
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
            ) : period.isBestDeal ? (
              <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                {t('ultima.subscriptionBuilder.bestDeal', { defaultValue: 'Выгодно' })}
              </span>
            ) : null}
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[17px] font-black tracking-tight text-white">
                {period.priceLabel}
              </span>
              {period.originalPriceLabel ? (
                <span className="text-[10px] text-white/30 line-through">
                  {period.originalPriceLabel}
                </span>
              ) : null}
            </div>
            <div className="mt-0.5 text-[10px] font-medium text-[#8e929b]">
              {period.monthlyLabel}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export function UltimaSubscriptionConfigurator({
  title,
  subtitle,
  isCurrentTariff,
  canChangeTariff,
  isTariffSwitchFlow,
  switchFromLabel,
  switchHint,
  trafficLabel,
  baseDeviceLimit,
  selectedDeviceLimit,
  minDeviceLimit,
  maxDeviceLimit,
  extraDeviceSummary,
  extraDevicePriceLabel,
  deviceTrafficLabel,
  periods,
  selectedPeriodLabel,
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
  minimumTopUpHint,
  paymentRecoveryCard,
  trafficTopUp,
  bottomNav,
  isPayDisabled,
  onChangeTariff,
  onSelectDevice,
  onSelectPeriod,
  onPay,
}: UltimaSubscriptionConfiguratorProps) {
  const { t } = useTranslation();
  const canDecreaseDevices = selectedDeviceLimit > minDeviceLimit;
  const canIncreaseDevices = selectedDeviceLimit < maxDeviceLimit;

  return (
    <div className="font-sans min-h-screen bg-[#07080a] text-white selection:bg-[#d4b37f]/30 flex flex-col justify-between">
      <main
        className="mx-auto w-full max-w-lg flex-1 px-4 pb-6 pt-4 sm:px-6"
        data-testid="ultima-subscription-configurator"
      >
        {/* Header with Title and Change Plan button */}
        <header className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8e929b]">
              {t('ultima.subscriptionBuilder.pageTitle', { defaultValue: 'Подписка' })}
            </span>
            {canChangeTariff ? (
              <button
                type="button"
                onClick={onChangeTariff}
                data-testid="ultima-subscription-change-tariff"
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-[#d4b37f] transition-all hover:border-[#d4b37f]/40 hover:bg-white/[0.06] active:scale-95"
              >
                <RefreshCw className="h-3 w-3 transition-transform group-hover:rotate-180 duration-500" />
                <span>{t('ultima.subscriptionBuilder.changePlan', { defaultValue: 'Сменить тариф' })}</span>
              </button>
            ) : null}
          </div>

          <div className="mt-2 flex items-center gap-2.5">
            <h1 className="text-[26px] font-black tracking-tight text-white sm:text-[30px]">
              {title}
            </h1>
            {isCurrentTariff ? (
              <span className="rounded-full border border-[#d4b37f]/30 bg-[#d4b37f]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#d4b37f]">
                {t('subscription.currentTariff', { defaultValue: 'Текущий' })}
              </span>
            ) : null}
          </div>

          {subtitle ? (
            <p className="mt-1 text-[12px] leading-relaxed text-[#8e929b]">
              {subtitle}
            </p>
          ) : null}
        </header>

        {/* Card 1: Subscription Parameters */}
        <section
          className="samurai-bento-card mb-4 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(212,179,127,0.25)]"
          data-testid="ultima-subscription-parameters"
        >
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#8e929b]">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#d4b37f]" />
            <span>{t('ultima.subscriptionBuilder.parameters', { defaultValue: 'Параметры подписки' })}</span>
          </div>

          <div className="mt-4 grid grid-cols-2 divide-x divide-white/[0.07] border-y border-white/[0.07] py-3">
            <div className="pr-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8e929b]">
                {t('ultima.subscriptionBuilder.traffic', { defaultValue: 'Трафик' })}
              </span>
              <p className="mt-0.5 truncate text-[16px] font-black text-white" title={trafficLabel}>
                {trafficLabel}
              </p>
            </div>
            <div className="pl-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8e929b]">
                {t('ultima.subscriptionBuilder.baseDevices', { defaultValue: 'В тарифе' })}
              </span>
              <p className="mt-0.5 text-[16px] font-black text-white">
                {t('subscription.devices', { count: baseDeviceLimit, defaultValue: `${baseDeviceLimit} устр.` })}
              </p>
            </div>
          </div>

          {isTariffSwitchFlow ? (
            <div className="mt-3.5 rounded-xl border border-[#d4b37f]/30 bg-[#d4b37f]/[0.06] p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[12px] text-white/70">
                  <span>{switchFromLabel || '—'}</span>
                  <span className="mx-1.5 text-[#d4b37f]">→</span>
                  <span className="font-bold text-white">{title}</span>
                </div>
                <span className="text-[12px] font-black text-[#d4b37f]">{totalPriceLabel}</span>
              </div>
              {switchHint ? (
                <p className="mt-1 text-[10px] leading-relaxed text-[#8e929b]">{switchHint}</p>
              ) : null}
            </div>
          ) : (
            <div className="mt-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-white">
                  {t('ultima.subscriptionBuilder.deviceLimit', { defaultValue: 'Количество устройств' })}
                </p>
                <p className="mt-0.5 text-[10px] text-[#8e929b]">
                  {t('ultima.subscriptionBuilder.deviceHint', {
                    max: maxDeviceLimit,
                    defaultValue: `Выберите итоговое количество, максимум ${maxDeviceLimit}`,
                  })}
                </p>
              </div>
              <UltimaDeviceStepper
                value={selectedDeviceLimit}
                canDecrease={canDecreaseDevices}
                canIncrease={canIncreaseDevices}
                onDecrease={() => onSelectDevice(selectedDeviceLimit - 1)}
                onIncrease={() => onSelectDevice(selectedDeviceLimit + 1)}
                testIdPrefix="ultima-mobile"
              />
            </div>
          )}

          {extraDeviceSummary && !isTariffSwitchFlow ? (
            <div
              data-testid="ultima-mobile-extra-device-summary"
              className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-2.5 text-[11px]"
            >
              <div>
                <span className="text-[#8e929b]">{extraDeviceSummary}</span>
                {deviceTrafficLabel ? (
                  <span className="ml-2 text-[10px] text-[#d4b37f]/80 font-medium">({deviceTrafficLabel})</span>
                ) : null}
              </div>
              {extraDevicePriceLabel ? (
                <span className="font-bold text-[#d4b37f]">{extraDevicePriceLabel}</span>
              ) : null}
            </div>
          ) : null}
        </section>

        {/* Card 2: Period Selection */}
        {!isTariffSwitchFlow ? (
          <section className="samurai-bento-card mb-4 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(212,179,127,0.25)]">
            <div className="mb-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5 text-[#d4b37f]" />
                <div>
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#8e929b]">
                    {t('ultima.subscriptionBuilder.periodTitle', { defaultValue: 'Срок подписки' })}
                  </h2>
                  <p className="text-[10px] text-[#8e929b]/70">
                    {t('ultima.subscriptionBuilder.periodHint', { defaultValue: 'Чем больше период, тем выгоднее' })}
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-[#d4b37f]/30 bg-[#d4b37f]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#d4b37f]">
                {selectedPeriodLabel}
              </span>
            </div>

            <UltimaSubscriptionPeriodGrid
              periods={periods}
              onSelectPeriod={onSelectPeriod}
              testIdPrefix="ultima-mobile"
            />
          </section>
        ) : null}

        {/* Extra TopUp module if enabled */}
        {trafficTopUp ? <div className="mb-4">{trafficTopUp}</div> : null}

        {/* Pending Payment Recovery Notice (Compact card) */}
        {paymentRecoveryCard ? <div className="mb-4">{paymentRecoveryCard}</div> : null}
      </main>

      {/* Floating Glass Checkout Footer */}
      <footer className="sticky bottom-0 z-40 border-t border-white/[0.08] bg-[#07090e]/95 p-3.5 backdrop-blur-2xl">
        <div className="mx-auto max-w-lg">
          {minimumTopUpHint ? (
            <div className="mb-2 text-center text-[10px] text-amber-200/80">
              {minimumTopUpHint}
            </div>
          ) : null}
          {error ? (
            <div className="mb-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-center text-[11px] font-medium text-rose-300">
              {error}
            </div>
          ) : null}

          {/* Pricing Breakdown Bar */}
          <div
            className="mb-2.5 grid grid-cols-3 divide-x divide-white/[0.08] rounded-xl border border-white/[0.07] bg-white/[0.025] py-2 px-1 text-center"
            data-testid="ultima-subscription-price-summary"
          >
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#8e929b]">
                {t('ultima.subscriptionBuilder.subscriptionCost', { defaultValue: 'Стоимость' })}
              </span>
              <p className="mt-0.5 text-[13px] font-bold text-white">{totalPriceLabel}</p>
            </div>
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#8e929b]">
                {t('ultima.subscriptionBuilder.fromBalance', { defaultValue: 'С баланса' })}
              </span>
              <p className="mt-0.5 text-[13px] font-bold text-white">
                {hasBalanceApplied ? `−${balanceAppliedLabel}` : '—'}
              </p>
            </div>
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#8e929b]">
                {t('ultima.subscriptionBuilder.toTopUp', { defaultValue: 'К пополнению' })}
              </span>
              <p className="mt-0.5 text-[13px] font-black text-[#d4b37f]">
                {requiresTopUp ? payablePriceLabel : t('ultima.subscriptionBuilder.noTopUp', { defaultValue: '0 ₽' })}
              </p>
            </div>
          </div>

          {/* Primary Action Button with Gold Glow */}
          <button
            type="button"
            onClick={onPay}
            disabled={isPayDisabled}
            data-testid="ultima-subscription-primary-action"
            className="samurai-gold-btn flex w-full items-center justify-between rounded-2xl px-5 py-3.5 text-black transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <WalletCards className="h-5 w-5" />
              <span className="text-[14px] font-black tracking-wide">{actionLabel}</span>
            </div>
            <div className="text-right">
              <span
                data-testid="ultima-subscription-action-price"
                className="text-[15px] font-black"
              >
                {isFree ? t('subscription.free', { defaultValue: 'Бесплатно' }) : actionPriceLabel}
              </span>
              {!isFree && actionMetaLabel ? (
                <span className="block text-[8px] font-bold uppercase tracking-wider text-black/60">
                  {actionMetaLabel}
                </span>
              ) : null}
            </div>
          </button>

          {/* Navigation dock */}
          <div className="mt-2.5">{bottomNav}</div>
        </div>
      </footer>
    </div>
  );
}
