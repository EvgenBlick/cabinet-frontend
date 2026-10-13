import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/api/subscription';
import { useAuthStore } from '@/store/auth';
import {
  applyUltimaAutoRenewPreference,
  readUltimaAutoRenewPreference,
} from '@/features/ultima/autoRenewPreference';
import type { Subscription, SubscriptionStatusResponse } from '@/types';

export function UltimaAutoRenewCard({ subscription }: { subscription: Subscription | null }) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const attempts = useRef(new Set<string>());
  const mounted = useRef(true);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isApplyingChoice, setIsApplyingChoice] = useState(false);
  const updateCachedSubscription = (updated: Subscription) => {
    queryClient.setQueryData<SubscriptionStatusResponse>(['subscription'], (previous) =>
      previous
        ? { ...previous, subscription: updated }
        : { has_subscription: true, subscription: updated },
    );
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!subscription || userId == null || readUltimaAutoRenewPreference(userId) == null) return;
    const attempt = `${userId}:${subscription.id}`;
    if (attempts.current.has(attempt)) return;
    attempts.current.add(attempt);
    setIsApplyingChoice(true);
    void applyUltimaAutoRenewPreference(userId, subscription).then((result) => {
      if (mounted.current && useAuthStore.getState().user?.id === userId) {
        setSetupError(result.error);
        setIsApplyingChoice(false);
        queryClient.setQueryData<SubscriptionStatusResponse>(['subscription'], (previous) =>
          previous?.subscription?.id === subscription.id
            ? { ...previous, subscription: result.subscription }
            : previous,
        );
      }
    });
  }, [subscription, userId, queryClient]);
  const mutation = useMutation({
    mutationFn: (enabled: boolean) =>
      subscriptionApi.updateAutopay(enabled, setupError ? 1 : subscription?.autopay_days_before),
    onSuccess: async (result) => {
      setSetupError(null);
      if (subscription) updateCachedSubscription({ ...subscription, ...result });
      try {
        if (userId != null) localStorage.removeItem(`ultima_autorenew_choice_${userId}`);
      } catch {
        /* Optional storage. */
      }
      await queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
  const dailyMutation = useMutation({
    mutationFn: subscriptionApi.togglePause,
    onSuccess: async (result) => {
      if (subscription)
        updateCachedSubscription({ ...subscription, is_daily_paused: result.is_paused });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['subscription'] }),
        queryClient.invalidateQueries({ queryKey: ['balance'] }),
      ]);
    },
  });
  if (!subscription) return null;
  const enabled = subscription.is_daily
    ? !subscription.is_daily_paused
    : mutation.isPending
      ? mutation.variables
      : subscription.autopay_enabled;
  const isPending = mutation.isPending || dailyMutation.isPending || isApplyingChoice;
  return (
    <section
      data-testid="ultima-autorenew-card"
      className="rounded-2xl border border-[#d4b37f]/25 bg-[#121418] p-4 text-white"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">
            {subscription.is_daily ? 'Ежедневная оплата с баланса' : 'Автопродление с баланса'}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-white/55">
            {subscription.is_daily
              ? `${(subscription.daily_price_kopeks ?? 0) / 100} ₽ в день. Выключение приостановит тариф и списания. Включение возобновит оплату.`
              : `Оплата с баланса за ${subscription.autopay_days_before ?? 3} дн. до окончания. Можно отключить здесь в любой момент.`}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(enabled)}
          aria-label={
            subscription.is_daily ? 'Ежедневная оплата с баланса' : 'Автопродление с баланса'
          }
          disabled={isPending}
          onClick={() =>
            subscription.is_daily
              ? dailyMutation.mutate()
              : mutation.mutate(!subscription.autopay_enabled)
          }
          className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors disabled:opacity-50 ${enabled ? 'border-[#d4b37f] bg-[#d4b37f]' : 'border-white/25 bg-white/10'}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${enabled ? 'left-0.5 translate-x-5' : 'left-0.5'}`}
          />
        </button>
      </div>
      <p className="mt-2 text-xs font-medium text-[#d4b37f]">
        {enabled ? 'Включено' : subscription.is_daily ? 'Приостановлено' : 'Выключено'}
      </p>
      {(mutation.isError || dailyMutation.isError || setupError) && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {setupError || 'Не удалось изменить настройки. Повторите попытку.'}
        </p>
      )}
    </section>
  );
}
