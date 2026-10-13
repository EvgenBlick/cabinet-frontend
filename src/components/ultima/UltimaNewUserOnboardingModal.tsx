import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { subscriptionApi } from '@/api/subscription';
import { useAuthStore } from '@/store/auth';
import {
  applyUltimaAutoRenewPreference,
  readUltimaAutoRenewPreference,
  writeUltimaAutoRenewPreference,
} from '@/features/ultima/autoRenewPreference';
import type { SubscriptionStatusResponse } from '@/types';

export function UltimaNewUserOnboardingModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const [step, setStep] = useState<'welcome' | 'tariffs' | 'success'>('welcome');
  const [autoRenew, setAutoRenew] = useState(() => readUltimaAutoRenewPreference(userId) ?? false);
  const panel = useRef<HTMLElement>(null);
  const {
    data: trial,
    isLoading: isTrialLoading,
    isError: isTrialError,
    refetch: refetchTrial,
  } = useQuery({
    queryKey: ['trial-info'],
    queryFn: subscriptionApi.getTrialInfo,
    retry: false,
  });
  const {
    data: options,
    isLoading: areTariffsLoading,
    isError: isTariffError,
    refetch: refetchTariffs,
  } = useQuery({
    queryKey: ['onboarding-purchase-options'],
    queryFn: subscriptionApi.getAvailablePurchaseOptions,
  });
  const tariffs =
    options?.sales_mode === 'tariffs'
      ? options.tariffs.filter((tariff) => tariff.is_available)
      : [];
  const trialMutation = useMutation({
    mutationFn: async () => {
      const subscription = await subscriptionApi.activateTrial();
      writeUltimaAutoRenewPreference(userId, autoRenew);
      return applyUltimaAutoRenewPreference(userId, subscription);
    },
    onSuccess: (result) => {
      setStep('success');
      queryClient.setQueryData<SubscriptionStatusResponse>(['subscription'], {
        has_subscription: true,
        subscription: result.subscription,
      });
      void queryClient.invalidateQueries({ queryKey: ['trial-info'] });
      void queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !trialMutation.isPending) onClose();
      if (event.key !== 'Tab') return;
      const elements = panel.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), a[href]',
      );
      if (!elements?.length) return;
      const first = elements[0],
        last = elements[elements.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === panel.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === panel.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose, trialMutation.isPending]);
  const chooseTariff = (tariffId?: number) => {
    writeUltimaAutoRenewPreference(userId, autoRenew);
    onClose();
    navigate(tariffId ? `/subscription?tariffId=${tariffId}` : '/subscription');
  };
  const buttonClass =
    'min-h-11 rounded-xl bg-[#d4b37f] px-4 py-3 text-sm font-semibold text-[#121418] disabled:opacity-50';
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-4">
      <section
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ultima-onboarding-title"
        tabIndex={-1}
        data-testid="ultima-new-user-onboarding"
        className="relative max-h-[min(90dvh,720px)] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#d4b37f]/30 bg-[#121418] p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.85)] outline-none sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#d4b37f]">
              Samurai Service
            </p>
            <h1 id="ultima-onboarding-title" className="mt-2 text-2xl font-bold">
              {step === 'success'
                ? 'Пробный период подключён'
                : step === 'tariffs'
                  ? 'Выберите тариф'
                  : 'Как начнём?'}
            </h1>
          </div>
          <button
            type="button"
            aria-label="Закрыть выбор подписки"
            disabled={trialMutation.isPending}
            onClick={onClose}
            className="h-10 w-10 shrink-0 rounded-xl border border-white/10 text-xl text-white/60"
          >
            ×
          </button>
        </div>
        {step === 'success' ? (
          <div className="space-y-4">
            <p className="text-sm text-white/65">
              Всё готово. Подключите устройство, чтобы начать пользоваться VPN.
            </p>
            {trialMutation.data?.error && (
              <p role="alert" className="text-sm text-amber-200">
                {trialMutation.data.error}
              </p>
            )}
            <button
              type="button"
              className={`${buttonClass} w-full`}
              onClick={() => {
                onClose();
                navigate('/connection');
              }}
            >
              Подключить устройство
            </button>
          </div>
        ) : (
          <>
            {step === 'welcome' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <section className="flex flex-col rounded-2xl border border-[#d4b37f]/30 bg-[#d4b37f]/5 p-4">
                  <h2 className="font-semibold">Пробный период</h2>
                  <p className="my-3 flex-1 text-sm leading-relaxed text-white/60">
                    {isTrialLoading
                      ? 'Проверяем доступность…'
                      : trial?.is_available
                        ? `${trial.duration_days} дн. · ${trial.requires_payment ? `${trial.price_rubles} ₽` : 'бесплатно'} · устройств: ${trial.device_limit}`
                        : 'Пробный период сейчас недоступен. Можно сразу выбрать тариф.'}
                  </p>
                  <button
                    type="button"
                    disabled={!trial?.is_available || trialMutation.isPending}
                    className={buttonClass}
                    onClick={() => trialMutation.mutate()}
                  >
                    {trialMutation.isPending
                      ? 'Подключаем…'
                      : trial?.requires_payment
                        ? 'Подключить пробный период'
                        : 'Попробовать бесплатно'}
                  </button>
                </section>
                <section className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <h2 className="font-semibold">Тарифные планы</h2>
                  <p className="my-3 flex-1 text-sm leading-relaxed text-white/60">
                    Все доступные тарифы, цены и лимиты. Выберите подходящий вариант сразу.
                  </p>
                  <button
                    type="button"
                    disabled={trialMutation.isPending}
                    className={buttonClass}
                    onClick={() => setStep('tariffs')}
                  >
                    Выбрать тариф
                  </button>
                </section>
              </div>
            ) : (
              <div className="space-y-3">
                {areTariffsLoading && (
                  <p role="status" className="text-sm text-white/60">
                    Загружаем тарифы…
                  </p>
                )}
                {tariffs.map((tariff) => {
                  const prices = tariff.periods.map((p) => p.price_kopeks);
                  const price = tariff.is_daily
                    ? `${(tariff.daily_price_kopeks ?? 0) / 100} ₽ / день`
                    : prices.length
                      ? `от ${Math.min(...prices) / 100} ₽`
                      : 'Цена при оформлении';
                  return (
                    <button
                      key={tariff.id}
                      type="button"
                      onClick={() => chooseTariff(tariff.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left hover:border-[#d4b37f]/50"
                    >
                      <span className="min-w-0">
                        <strong className="block text-sm">{tariff.name}</strong>
                        <span className="mt-1 block text-xs text-white/55">
                          {tariff.traffic_limit_label} · {tariff.device_limit} устройств
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-[#d4b37f]">{price}</span>
                    </button>
                  );
                })}
                {!areTariffsLoading && !tariffs.length && (
                  <button
                    type="button"
                    className={`${buttonClass} w-full`}
                    onClick={() => chooseTariff()}
                  >
                    Перейти к оформлению тарифа
                  </button>
                )}
                {isTariffError && (
                  <button
                    type="button"
                    className="text-sm text-[#d4b37f]"
                    onClick={() => void refetchTariffs()}
                  >
                    Повторить загрузку тарифов
                  </button>
                )}
                {trial?.is_available && (
                  <button
                    type="button"
                    className="text-sm text-[#d4b37f]"
                    onClick={() => setStep('welcome')}
                  >
                    ← Вернуться к пробному периоду
                  </button>
                )}
              </div>
            )}
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 p-4">
              <input
                type="checkbox"
                checked={autoRenew}
                disabled={trialMutation.isPending}
                onChange={(event) => setAutoRenew(event.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[#d4b37f]"
              />
              <span>
                <span className="block text-sm font-semibold">Продлевать подписку с баланса?</span>
                <span className="mt-1 block text-xs leading-relaxed text-white/55">
                  За день до окончания. Отключается на главной или во вкладке «Управление
                  подпиской». Для суточного тарифа действует посуточная оплата.
                </span>
              </span>
            </label>
            {step === 'welcome' && (
              <button
                type="button"
                disabled={trialMutation.isPending}
                className="mt-4 w-full py-2 text-sm text-[#d4b37f]"
                onClick={() => setStep('tariffs')}
              >
                Отказаться от пробного периода и выбрать тариф →
              </button>
            )}
            {isTrialError && (
              <p role="alert" className="mt-3 text-sm text-amber-200">
                Не удалось проверить пробный период.{' '}
                <button type="button" className="underline" onClick={() => void refetchTrial()}>
                  Повторить
                </button>
              </p>
            )}
            {trialMutation.isError && (
              <p role="alert" className="mt-3 text-sm text-red-300">
                Не удалось подключить пробный период. Попробуйте ещё раз или выберите тариф.
              </p>
            )}
          </>
        )}
      </section>
    </div>,
    document.body,
  );
}
