import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  CalendarDays,
  ChevronRight,
  Globe2,
  Gauge,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Users,
  Wrench,
} from 'lucide-react';
import { balanceApi } from '@/api/balance';
import { infoApi } from '@/api/info';
import { notificationsApi } from '@/api/notifications';
import { promoApi } from '@/api/promo';
import { referralApi } from '@/api/referral';
import { subscriptionApi } from '@/api/subscription';
import { tapRewardsApi, type TapRewardResponse } from '@/api/tapRewards';
import { UltimaReferralCta } from '@/components/ultima/UltimaReferralCta';
import { UltimaPendingPaymentCard } from '@/components/ultima/UltimaPendingPaymentCard';
import {
  UltimaDesktopDashboard,
  UltimaDesktopDashboardSkeleton,
  type UltimaDashboardStatusTone,
} from '@/components/ultima/desktop/UltimaDesktopDashboard';
import { ticketsApi } from '@/api/tickets';
import { UltimaBottomNav } from '@/components/ultima/UltimaBottomNav';
import { UltimaTrialGuide } from '@/components/ultima/UltimaTrialGuide';
import { UltimaTrafficWarningCard } from '@/components/ultima/UltimaTrafficWarningCard';
import { useCurrency } from '@/hooks/useCurrency';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePendingTopUpFollowUpState } from '@/hooks/usePendingTopUpFollowUpState';
import { useBrandLogoImage } from '@/hooks/useBrandLogoImage';
import { useBranding } from '@/hooks/useBranding';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/platform';
import { useAuthStore } from '@/store/auth';
import {
  readUltimaConnectionCompleted,
  readUltimaConnectionReminderHidden,
  readUltimaConnectionStep,
  writeUltimaConnectionCompleted,
  writeUltimaConnectionReminderHidden,
  writeUltimaConnectionStep,
} from '@/features/ultima/connectionFlow';
import {
  hasUltimaTrialGuideBeenAcknowledged,
  writeUltimaTrialGuideAcknowledged,
} from '@/features/ultima/trialOnboardingFlow';
import {
  getUltimaNextAction,
  ULTIMA_RENEWAL_NOTICE_DAYS,
  type UltimaNextActionKind,
} from '@/features/ultima/nextAction';
import { warmUltimaStartup } from '@/features/ultima/warmup';
import { trackAnalyticsEvent } from '@/utils/analyticsEvents';

type ShieldRipple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

type ShieldDigit = {
  id: number;
  x: number;
  y: number;
  value: number;
  driftX: number;
  driftY: number;
  size: number;
  duration: number;
  opacity: number;
  startRotate: number;
  endRotate: number;
  scale: number;
};

const MAX_VISIBLE_SHIELD_RIPPLES = 10;
const MAX_VISIBLE_SHIELD_DIGITS = 16;

export function UltimaDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const { currencySymbol } = useCurrency();
  const { logoLetter, hasCustomLogo, logoUrl, hasCachedBranding, isBrandingLoading } =
    useBranding();
  const haptic = useHaptic();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const isDesktopViewport = useMediaQuery('(min-width: 1024px)');
  const { pendingTopUp } = usePendingTopUpFollowUpState();
  const rippleIdRef = useRef(0);
  const digitIdRef = useRef(0);
  const tapCountRef = useRef(0);
  const tapResetTimeoutRef = useRef<number | null>(null);
  const tapRewardPendingRef = useRef(0);
  const tapRewardFlushTimeoutRef = useRef<number | null>(null);
  const dashboardMessageTimeoutRef = useRef<number | null>(null);
  const warmedLanguagesRef = useRef<Set<string>>(new Set());
  const trialAutoActivationAttemptedRef = useRef(false);
  const dashboardViewTrackedRef = useRef(false);
  const [shieldRipples, setShieldRipples] = useState<ShieldRipple[]>([]);
  const [shieldDigits, setShieldDigits] = useState<ShieldDigit[]>([]);
  const [connectionStep, setConnectionStep] = useState<1 | 2 | 3>(1);
  const [isConnectionCompleted, setIsConnectionCompleted] = useState(false);
  const [isReminderHidden, setIsReminderHidden] = useState(false);
  const [isTrialGuideVisible, setIsTrialGuideVisible] = useState(false);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const {
    data: subscriptionResponse,
    isFetched: isSubscriptionFetched,
    isError: isSubscriptionError,
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
    staleTime: 15000,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
  const { data: purchaseOptions } = useQuery({
    queryKey: ['purchase-options'],
    queryFn: subscriptionApi.getPurchaseOptions,
    staleTime: 60000,
    placeholderData: (previousData) => previousData,
  });
  const { data: notificationSettings } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: notificationsApi.getSettings,
    staleTime: 60000,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
  const { data: tapRewardProgress } = useQuery({
    queryKey: ['tap-rewards', 'progress'],
    queryFn: tapRewardsApi.getProgress,
    staleTime: 30000,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
  const tapRewardPauseMs = useMemo(() => {
    const seconds = tapRewardProgress?.streak_timeout_seconds ?? 1;
    return seconds > 0 ? Math.max(250, seconds * 1000) : 0;
  }, [tapRewardProgress?.streak_timeout_seconds]);
  const { data: promoOffers } = useQuery({
    queryKey: ['promo-offers'],
    queryFn: promoApi.getOffers,
    staleTime: 30000,
    placeholderData: (previousData) => previousData,
  });
  const { data: activeDiscount } = useQuery({
    queryKey: ['active-discount'],
    queryFn: promoApi.getActiveDiscount,
    staleTime: 30000,
    placeholderData: (previousData) => previousData,
  });
  const {
    isLoaded: isHomeLogoLoaded,
    handleLoad: handleHomeLogoLoad,
    handleError: handleHomeLogoError,
  } = useBrandLogoImage(logoUrl);
  const { data: referralInfo } = useQuery({
    queryKey: ['referral-info'],
    queryFn: referralApi.getReferralInfo,
    staleTime: 60000,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
  const { data: referralTerms } = useQuery({
    queryKey: ['referral-terms'],
    queryFn: referralApi.getReferralTerms,
    staleTime: 60000,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
  const subscription = subscriptionResponse?.subscription ?? null;
  const hasAnySubscription = subscriptionResponse?.has_subscription === true;
  const { data: dashboardDevicesData, isError: isDashboardDevicesError } = useQuery({
    queryKey: ['devices'],
    queryFn: subscriptionApi.getDevices,
    enabled: hasAnySubscription,
    staleTime: 10000,
    placeholderData: (previousData) => previousData,
  });
  const isI18nReady =
    i18n.isInitialized &&
    (typeof i18n.hasLoadedNamespace !== 'function' || i18n.hasLoadedNamespace('translation'));
  const isSubscriptionReady =
    isSubscriptionFetched || Boolean(subscriptionResponse) || isSubscriptionError;
  const isActive = Boolean(subscription?.is_active && !subscription?.is_expired);
  const isActiveTrial = Boolean(subscription?.is_trial && isActive);
  const trafficWarningThreshold = Math.max(
    25,
    Math.min(95, notificationSettings?.traffic_warning_percent ?? 80),
  );
  const trafficWarningLimitGb = Math.max(0, subscription?.traffic_limit_gb ?? 0);
  const trafficWarningUsedGb = Math.max(0, subscription?.traffic_used_gb ?? 0);
  const trafficWarningPercent = Math.max(0, Math.min(100, subscription?.traffic_used_percent ?? 0));
  const trafficWarningRemainingGb = Math.max(
    0,
    subscription?.metered_traffic_remaining_gb ?? trafficWarningLimitGb - trafficWarningUsedGb,
  );
  const isTrafficExhausted = Boolean(
    subscription?.metered_access_blocked ||
    trafficWarningPercent >= 100 ||
    trafficWarningRemainingGb <= 0,
  );
  const shouldShowTrafficWarning = Boolean(
    isActive &&
    trafficWarningLimitGb > 0 &&
    notificationSettings?.traffic_warning_enabled !== false &&
    trafficWarningPercent >= trafficWarningThreshold,
  );
  const statusLabel = !hasAnySubscription
    ? t('ultima.noSubscription', { defaultValue: 'Нет подписки' })
    : isActiveTrial
      ? t('subscription.trialStatus')
      : isActive
        ? t('subscription.active')
        : t('subscription.expired');
  const daysLeft = useMemo(() => {
    if (!subscription?.end_date) return null;
    const end = new Date(subscription.end_date).getTime();
    if (Number.isNaN(end)) return null;
    const diff = end - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [subscription?.end_date]);
  const statusToneKey: UltimaDashboardStatusTone = !isActive
    ? 'expired'
    : isActiveTrial
      ? 'trial'
      : (daysLeft ?? 99) <= ULTIMA_RENEWAL_NOTICE_DAYS
        ? 'warning'
        : 'active';
  const purchaseCtaLabel = useMemo(() => {
    if (isActiveTrial) {
      return t('ultima.buySubscriptionTrial', { defaultValue: 'Купить подписку' });
    }
    if (!hasAnySubscription) {
      return t('ultima.chooseTariff', { defaultValue: 'Выбрать тариф' });
    }
    if (!isActive) {
      return t('ultima.buySubscriptionRenew', { defaultValue: 'Продлить подписку' });
    }
    if ((daysLeft ?? 99) <= ULTIMA_RENEWAL_NOTICE_DAYS) {
      return t('subscription.renew', { defaultValue: 'Продлить' });
    }
    return t('subscription.extend', { defaultValue: 'Продлить подписку' });
  }, [daysLeft, hasAnySubscription, isActive, isActiveTrial, t]);
  const purchaseFromLabel = useMemo(() => {
    if (!purchaseOptions || purchaseOptions.sales_mode !== 'tariffs')
      return `от 199 ${currencySymbol}`;
    const periods = purchaseOptions.tariffs
      .filter((tariff) => tariff.is_available)
      .flatMap((tariff) => tariff.periods);
    if (!periods.length) return `от 199 ${currencySymbol}`;

    const discountedPerMonth = periods
      .filter(
        (period) =>
          (period.original_price_kopeks ?? 0) > period.price_kopeks &&
          period.price_per_month_kopeks > 0,
      )
      .map((period) => period.price_per_month_kopeks);

    if (discountedPerMonth.length) {
      const minPerMonth = Math.min(...discountedPerMonth);
      return `от ${Math.round(minPerMonth / 100)} ${currencySymbol}`;
    }

    const minTariff = Math.min(...periods.map((period) => period.price_kopeks));
    return `от ${Math.round(minTariff / 100)} ${currencySymbol}`;
  }, [purchaseOptions, currencySymbol]);

  const subEndDate =
    subscription?.end_date ||
    ((subscription as unknown as Record<string, unknown>)?.expires_at as string | undefined);

  const expiryLabel = (() => {
    if (!subEndDate) return t('subscription.notActive', { defaultValue: 'Не активна' });
    const date = new Date(subEndDate);
    if (Number.isNaN(date.getTime()))
      return t('subscription.notActive', { defaultValue: 'Не активна' });
    const formatted = date.toLocaleDateString(i18n.language || 'ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if ((i18n.language || '').toLowerCase().startsWith('ru')) {
      return `до ${formatted.replace(' г.', '')}`;
    }
    return formatted;
  })();
  const trialExpiryDateLabel = (() => {
    if (!subEndDate) return t('subscription.notActive', { defaultValue: 'Не активна' });
    const date = new Date(subEndDate);
    if (Number.isNaN(date.getTime()))
      return t('subscription.notActive', { defaultValue: 'Не активна' });
    const formatted = date.toLocaleDateString(i18n.language || 'ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if ((i18n.language || '').toLowerCase().startsWith('ru')) {
      return formatted.replace(' г.', '');
    }
    return formatted;
  })();
  const trialSignature = useMemo(() => {
    if (!subscription?.is_trial || !subscription.end_date) {
      return null;
    }
    return `${subscription.id}:${subscription.end_date}`;
  }, [subscription?.end_date, subscription?.id, subscription?.is_trial]);
  const isTrialGuideAcknowledged = hasUltimaTrialGuideBeenAcknowledged(user?.id, trialSignature);

  const { data: trialInfo } = useQuery({
    queryKey: ['trial-info'],
    queryFn: subscriptionApi.getTrialInfo,
    enabled: isSubscriptionReady && !hasAnySubscription,
    staleTime: 15000,
    placeholderData: (previousData) => previousData,
  });

  const activateTrialMutation = useMutation({
    mutationFn: subscriptionApi.activateTrial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['trial-info'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-options'] });
    },
  });
  const claimOfferMutation = useMutation({
    mutationFn: (offerId: number) => promoApi.claimOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-offers'] });
      queryClient.invalidateQueries({ queryKey: ['active-discount'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-options'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      setPromoMessage(t('promo.offers.activated', { defaultValue: 'Предложение активировано' }));
      window.setTimeout(() => setPromoMessage(null), 3500);
    },
    onError: () => {
      setPromoMessage(
        t('promo.offers.activationFailed', { defaultValue: 'Не удалось активировать предложение' }),
      );
      window.setTimeout(() => setPromoMessage(null), 3500);
    },
  });

  const showDashboardMessage = useCallback((message: string) => {
    setPromoMessage(message);
    if (dashboardMessageTimeoutRef.current !== null) {
      window.clearTimeout(dashboardMessageTimeoutRef.current);
    }
    dashboardMessageTimeoutRef.current = window.setTimeout(() => {
      setPromoMessage(null);
      dashboardMessageTimeoutRef.current = null;
    }, 3500);
  }, []);

  const getTapRewardMessage = useCallback(
    (result: TapRewardResponse) => {
      if (result.message) return result.message;

      if (result.reward_type === 'balance') {
        const amount = Math.round((result.reward_value ?? 0) / 100);
        return t('ultima.tapRewardBalance', {
          defaultValue: `Подарок за тапы: +${amount} ${currencySymbol}`,
          amount,
          currency: currencySymbol,
        });
      }

      const days = result.reward_value ?? 0;
      return t('ultima.tapRewardDays', {
        defaultValue: `Подарок за тапы: +${days} дн. к подписке`,
        days,
      });
    },
    [currencySymbol, t],
  );

  const flushTapRewards = useCallback(async () => {
    const pendingCount = tapRewardPendingRef.current;
    if (pendingCount <= 0) {
      return;
    }

    tapRewardPendingRef.current = 0;
    let remaining = pendingCount;
    let latestResponse: TapRewardResponse | null = null;
    let rewardResponse: TapRewardResponse | null = null;

    try {
      while (remaining > 0) {
        const response = await tapRewardsApi.recordTap();
        remaining -= 1;
        latestResponse = response;

        if (response.reward_granted) {
          rewardResponse = response;
        }

        if (!response.enabled) {
          break;
        }
      }
    } catch {
      if (remaining > 0) {
        tapRewardPendingRef.current += remaining;
        if (tapRewardFlushTimeoutRef.current === null) {
          tapRewardFlushTimeoutRef.current = window.setTimeout(() => {
            tapRewardFlushTimeoutRef.current = null;
            void flushTapRewards();
          }, 1200);
        }
      }
      return;
    }

    if (latestResponse) {
      queryClient.setQueryData(['tap-rewards', 'progress'], latestResponse);
    }

    if (!rewardResponse) {
      return;
    }

    showDashboardMessage(getTapRewardMessage(rewardResponse));
    queryClient.invalidateQueries({ queryKey: ['balance'] });
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
    queryClient.invalidateQueries({ queryKey: ['purchase-options'] });
    queryClient.invalidateQueries({ queryKey: ['tap-rewards', 'progress'] });
    void refreshUser();
  }, [getTapRewardMessage, queryClient, refreshUser, showDashboardMessage]);

  const scheduleTapRewardFlush = useCallback(() => {
    tapRewardPendingRef.current += 1;
    if (tapRewardFlushTimeoutRef.current !== null) {
      return;
    }

    tapRewardFlushTimeoutRef.current = window.setTimeout(() => {
      tapRewardFlushTimeoutRef.current = null;
      void flushTapRewards();
    }, 450);
  }, [flushTapRewards]);

  const scheduleTapCounterReset = useCallback(() => {
    if (tapResetTimeoutRef.current !== null) {
      window.clearTimeout(tapResetTimeoutRef.current);
      tapResetTimeoutRef.current = null;
    }

    if (tapRewardPauseMs <= 0) {
      return;
    }

    tapResetTimeoutRef.current = window.setTimeout(() => {
      tapCountRef.current = 0;
      tapResetTimeoutRef.current = null;
    }, tapRewardPauseMs);
  }, [tapRewardPauseMs]);

  useEffect(() => {
    // Warm subscription route chunk so dashboard -> purchase transition stays seamless.
    void import('./Subscription');
  }, []);

  useEffect(() => {
    if (!tapRewardProgress?.enabled) {
      tapCountRef.current = 0;
      return;
    }

    if (tapRewardPendingRef.current > 0) {
      return;
    }

    tapCountRef.current = Math.max(0, tapRewardProgress.progress_taps ?? 0);
  }, [tapRewardProgress?.enabled, tapRewardProgress?.progress_taps]);

  useEffect(() => {
    if (!isSubscriptionReady || hasAnySubscription) {
      return;
    }
    if (!trialInfo?.is_available) {
      return;
    }
    if (activateTrialMutation.isPending) {
      return;
    }
    if (trialAutoActivationAttemptedRef.current) {
      return;
    }
    trialAutoActivationAttemptedRef.current = true;
    activateTrialMutation.mutate();
  }, [activateTrialMutation, hasAnySubscription, isSubscriptionReady, trialInfo?.is_available]);

  const shouldHoldForAutoTrial = Boolean(!hasAnySubscription && activateTrialMutation.isPending);

  useEffect(() => {
    const language = i18n.language || 'ru';
    if (warmedLanguagesRef.current.has(language)) {
      return;
    }
    warmedLanguagesRef.current.add(language);
    void warmUltimaStartup(queryClient, { language });
  }, [i18n.language, queryClient]);

  useEffect(() => {
    const readStep = () => {
      setConnectionStep(readUltimaConnectionStep(user?.id));
      setIsConnectionCompleted(readUltimaConnectionCompleted(user?.id));
      setIsReminderHidden(readUltimaConnectionReminderHidden(user?.id));
    };

    readStep();
    window.addEventListener('focus', readStep);
    document.addEventListener('visibilitychange', readStep);
    return () => {
      window.removeEventListener('focus', readStep);
      document.removeEventListener('visibilitychange', readStep);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!trialSignature || !isActiveTrial) {
      setIsTrialGuideVisible(false);
      return;
    }

    if (isConnectionCompleted && !isTrialGuideAcknowledged) {
      writeUltimaTrialGuideAcknowledged(user?.id, trialSignature);
      setIsTrialGuideVisible(false);
    }
  }, [isActiveTrial, isConnectionCompleted, isTrialGuideAcknowledged, trialSignature, user?.id]);

  useEffect(() => {
    if (!trialSignature || !isActiveTrial || isConnectionCompleted || connectionStep !== 1) {
      setIsTrialGuideVisible(false);
      return;
    }
    if (isTrialGuideAcknowledged) {
      setIsTrialGuideVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setIsTrialGuideVisible(true);
    }, 420);

    return () => window.clearTimeout(timer);
  }, [
    connectionStep,
    isActiveTrial,
    isConnectionCompleted,
    isTrialGuideAcknowledged,
    trialSignature,
    user?.id,
  ]);

  useEffect(() => {
    return () => {
      if (tapResetTimeoutRef.current !== null) {
        window.clearTimeout(tapResetTimeoutRef.current);
      }
      if (tapRewardFlushTimeoutRef.current !== null) {
        window.clearTimeout(tapRewardFlushTimeoutRef.current);
      }
      if (dashboardMessageTimeoutRef.current !== null) {
        window.clearTimeout(dashboardMessageTimeoutRef.current);
      }
    };
  }, []);

  const handleShieldTap = useCallback(
    (event: React.MouseEvent<HTMLElement> | React.PointerEvent<HTMLElement>) => {
      haptic.impact('light');
      scheduleTapRewardFlush();
      const nextTapNumber = ++tapCountRef.current;
      scheduleTapCounterReset();

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const id = rippleIdRef.current++;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 1.85;
      setShieldRipples((previous) => [
        ...previous.slice(-(MAX_VISIBLE_SHIELD_RIPPLES - 1)),
        { id, x, y, size },
      ]);

      const side = nextTapNumber % 2 === 0 ? 1 : -1;
      const digitId = digitIdRef.current++;
      const digit = {
        id: digitId,
        x,
        y: y - 2,
        value: nextTapNumber,
        driftX: side * (10 + Math.random() * 10),
        driftY: -(28 + Math.random() * 18),
        size: 16 + Math.min(String(nextTapNumber).length, 3) * 1.5,
        duration: 820 + Math.random() * 180,
        opacity: 0.84 + Math.random() * 0.12,
        startRotate: side * (3 + Math.random() * 5),
        endRotate: side * (8 + Math.random() * 8),
        scale: 1.04 + Math.random() * 0.1,
      } satisfies ShieldDigit;
      setShieldDigits((previous) => [...previous.slice(-(MAX_VISIBLE_SHIELD_DIGITS - 1)), digit]);

      window.setTimeout(() => {
        setShieldRipples((previous) => previous.filter((ripple) => ripple.id !== id));
      }, 900);

      window.setTimeout(() => {
        setShieldDigits((previous) => previous.filter((item) => item.id !== digitId));
      }, 1280);
    },
    [haptic, scheduleTapCounterReset, scheduleTapRewardFlush],
  );

  const openSupport = () => {
    void import('./Support');
    void queryClient.prefetchQuery({
      queryKey: ['support-config'],
      queryFn: infoApi.getSupportConfig,
    });
    void queryClient.prefetchQuery({
      queryKey: ['tickets'],
      queryFn: () => ticketsApi.getTickets({ per_page: 20 }),
    });
    navigate('/support');
  };

  const openReferral = useCallback(() => {
    haptic.impact('light');
    trackAnalyticsEvent('ultima_referral_entry_click', {
      source: 'dashboard',
    });
    void import('./Referral');
    void queryClient.prefetchQuery({
      queryKey: ['referral-info'],
      queryFn: referralApi.getReferralInfo,
      staleTime: 15000,
    });
    void queryClient.prefetchQuery({
      queryKey: ['referral-terms'],
      queryFn: referralApi.getReferralTerms,
      staleTime: 15000,
    });
    void queryClient.prefetchQuery({
      queryKey: ['referral-list'],
      queryFn: () => referralApi.getReferralList({ per_page: 20 }),
      staleTime: 15000,
    });
    void queryClient.prefetchQuery({
      queryKey: ['referral-earnings'],
      queryFn: () => referralApi.getReferralEarnings({ per_page: 20 }),
      staleTime: 15000,
    });
    navigate('/referral');
  }, [haptic, navigate, queryClient]);

  const openConnection = useCallback(
    (resetToFirstStep = false) => {
      haptic.impact('light');

      if (resetToFirstStep) {
        writeUltimaConnectionCompleted(user?.id, false);
        writeUltimaConnectionStep(user?.id, 1);
        writeUltimaConnectionReminderHidden(user?.id, false);
        setConnectionStep(1);
        setIsConnectionCompleted(false);
        setIsReminderHidden(false);
      }

      void import('./Connection');
      void queryClient.prefetchQuery({
        queryKey: ['appConfig'],
        queryFn: () => subscriptionApi.getAppConfig(),
        staleTime: 15000,
      });
      navigate('/connection');
    },
    [haptic, navigate, queryClient, user?.id],
  );

  const acknowledgeTrialGuide = useCallback(() => {
    if (!trialSignature) {
      return;
    }
    writeUltimaTrialGuideAcknowledged(user?.id, trialSignature);
  }, [trialSignature, user?.id]);

  const handleTrialGuideStart = useCallback(() => {
    acknowledgeTrialGuide();
    setIsTrialGuideVisible(false);
    openConnection(true);
  }, [acknowledgeTrialGuide, openConnection]);

  const handleTrialGuideDismiss = useCallback(() => {
    acknowledgeTrialGuide();
    setIsTrialGuideVisible(false);
  }, [acknowledgeTrialGuide]);

  const openDevices = useCallback(
    (connect = false, source = 'dashboard') => {
      haptic.impact('light');
      trackAnalyticsEvent('ultima_devices_open', {
        source,
        connect,
      });
      void queryClient.prefetchQuery({
        queryKey: ['subscription'],
        queryFn: subscriptionApi.getSubscription,
        staleTime: 15000,
      });
      void queryClient.prefetchQuery({
        queryKey: ['devices'],
        queryFn: subscriptionApi.getDevices,
        staleTime: 10000,
      });
      void queryClient.prefetchQuery({
        queryKey: ['device-reduction-info'],
        queryFn: subscriptionApi.getDeviceReductionInfo,
        staleTime: 10000,
      });
      void import('./UltimaDevices');
      navigate(connect ? '/ultima/devices?connect=1' : '/ultima/devices');
    },
    [haptic, navigate, queryClient],
  );

  const openSubscriptionInfo = useCallback(() => {
    haptic.impact('light');
    void queryClient.prefetchQuery({
      queryKey: ['subscription'],
      queryFn: subscriptionApi.getSubscription,
      staleTime: 15000,
    });
    void import('./UltimaSubscriptionInfo');
    navigate('/ultima/subscription-info');
  }, [haptic, navigate, queryClient]);

  const openSubscriptionPurchase = useCallback(() => {
    haptic.impact('light');
    void queryClient.prefetchQuery({
      queryKey: ['purchase-options'],
      queryFn: subscriptionApi.getPurchaseOptions,
    });
    void queryClient.prefetchQuery({
      queryKey: ['payment-methods'],
      queryFn: balanceApi.getPaymentMethods,
    });
    void queryClient.prefetchQuery({
      queryKey: ['device-price', 'ultima-max'],
      queryFn: () => subscriptionApi.getDevicePrice(1),
    });
    void import('./Subscription');
    navigate('/subscription');
  }, [haptic, navigate, queryClient]);

  const openTrafficPurchase = useCallback(() => {
    trackAnalyticsEvent('ultima_traffic_warning_click', {
      source: 'dashboard',
      percent: Math.round(trafficWarningPercent),
      remaining_gb: trafficWarningRemainingGb,
      is_trial: isActiveTrial,
    });

    if (isActiveTrial) {
      openSubscriptionPurchase();
      return;
    }

    haptic.impact('light');
    void queryClient.prefetchQuery({
      queryKey: ['traffic-packages', 'ultima-purchase', subscription?.tariff_id],
      queryFn: subscriptionApi.getTrafficPackages,
      staleTime: 60000,
    });
    void import('./Subscription');
    navigate('/subscription?trafficTopUp=1');
  }, [
    haptic,
    isActiveTrial,
    navigate,
    openSubscriptionPurchase,
    queryClient,
    subscription?.tariff_id,
    trafficWarningPercent,
    trafficWarningRemainingGb,
  ]);

  const hasSetupReminder = connectionStep === 2 && !isReminderHidden && !isConnectionCompleted;
  const showTrialSetupCard =
    isActiveTrial &&
    connectionStep === 1 &&
    !isConnectionCompleted &&
    !isTrialGuideVisible &&
    isTrialGuideAcknowledged;
  const showConnectionCtaHighlight =
    isTrialGuideVisible || (showTrialSetupCard && !hasSetupReminder);
  const firstPromoOffer = useMemo(() => {
    const list = Array.isArray(promoOffers)
      ? promoOffers
      : Array.isArray((promoOffers as any)?.offers)
        ? (promoOffers as any).offers
        : Array.isArray((promoOffers as any)?.items)
          ? (promoOffers as any).items
          : [];
    return list.find((offer: any) => offer?.is_active && !offer?.is_claimed) ?? null;
  }, [promoOffers]);
  const showReferralEntry = Boolean(referralTerms?.is_enabled || referralInfo?.referral_link);
  const referralCommissionPercent =
    referralInfo?.commission_percent ?? referralTerms?.commission_percent ?? 0;
  const referralInviteTitle = t('ultima.referralInviteTitle', {
    defaultValue: 'Позови друга',
  });
  const referralInviteDescription =
    (referralTerms?.inviter_bonus_days ?? 0) > 0
      ? t('ultima.referralInviteDescriptionWithDays', {
          count: referralTerms?.inviter_bonus_days ?? 0,
          defaultValue: '+{{count}} d. subscription for an invitation.',
        })
      : t('ultima.referralInviteDescription', {
          defaultValue: 'Бонус к балансу за приглашение друга.',
        });
  const referralInviteBadgeLabel = t('ultima.referralInviteBadge', {
    defaultValue: 'Бонус',
  });
  const connectedDevicesCount = dashboardDevicesData?.devices?.length ?? 0;
  const dashboardDeviceLimit = Math.max(0, subscription?.device_limit ?? 0);
  const dashboardFreeDeviceSlots = Math.max(0, dashboardDeviceLimit - connectedDevicesCount);
  const isDashboardDevicesPending =
    hasAnySubscription && dashboardDevicesData === undefined && !isDashboardDevicesError;
  const isDashboardDevicesUnavailable =
    hasAnySubscription && dashboardDevicesData === undefined && isDashboardDevicesError;
  const showBrandLogoOnHome = Boolean(hasCustomLogo && logoUrl);
  const isHomeLogoDecisionPending = !hasCachedBranding && isBrandingLoading;
  const shouldReserveHomeLogoSlot = showBrandLogoOnHome || isHomeLogoDecisionPending;

  const suggestedPrimaryActionKind = getUltimaNextAction({
    hasAnySubscription,
    isActive,
    isExpired: Boolean(subscription?.is_expired),
    daysLeft,
    isConnectionCompleted,
    connectedDevicesCount,
    deviceLimit: dashboardDeviceLimit,
  });
  const primaryActionKind: UltimaNextActionKind =
    suggestedPrimaryActionKind === 'device' ? 'buy' : suggestedPrimaryActionKind;

  useEffect(() => {
    if (!isSubscriptionReady || dashboardViewTrackedRef.current) {
      return;
    }
    dashboardViewTrackedRef.current = true;
    trackAnalyticsEvent('ultima_dashboard_view', {
      has_subscription: hasAnySubscription,
      is_active: isActive,
      is_trial: isActiveTrial,
      days_left: daysLeft ?? null,
      connection_completed: isConnectionCompleted,
      primary_action: primaryActionKind,
    });
  }, [
    daysLeft,
    hasAnySubscription,
    isActive,
    isActiveTrial,
    isConnectionCompleted,
    isSubscriptionReady,
    primaryActionKind,
  ]);

  const primaryCtaLabel = useMemo(() => {
    const labels: Record<UltimaNextActionKind, string> = {
      buy: purchaseCtaLabel,
      renew: purchaseCtaLabel,
      setup: t('ultima.finishSetup', { defaultValue: 'Завершить установку' }),
      device: t('devices.connectFirstDevice', { defaultValue: 'Подключить устройство' }),
      subscription: t('subscription.desktopOpenInfo', { defaultValue: 'Открыть подписку' }),
    };
    return labels[primaryActionKind];
  }, [primaryActionKind, purchaseCtaLabel, t]);

  const primaryCtaMeta = useMemo(() => {
    if (primaryActionKind === 'setup') {
      return t('ultima.desktop.stepShort', {
        step: isConnectionCompleted ? 3 : connectionStep,
        defaultValue: `Шаг ${isConnectionCompleted ? 3 : connectionStep}/3`,
      });
    }
    if (primaryActionKind === 'subscription') {
      return statusLabel;
    }
    return purchaseFromLabel;
  }, [connectionStep, isConnectionCompleted, primaryActionKind, purchaseFromLabel, statusLabel, t]);

  const handlePrimaryAction = useCallback(() => {
    trackAnalyticsEvent('ultima_main_cta_click', {
      action: primaryActionKind,
      connection_completed: isConnectionCompleted,
      days_left: daysLeft ?? null,
    });

    if (primaryActionKind === 'setup') {
      openConnection();
      return;
    }

    if (primaryActionKind === 'subscription') {
      openSubscriptionInfo();
      return;
    }

    openSubscriptionPurchase();
  }, [
    daysLeft,
    isConnectionCompleted,
    openConnection,
    openSubscriptionInfo,
    openSubscriptionPurchase,
    primaryActionKind,
  ]);

  const renderHomeBrandMark = useCallback(() => {
    if (!shouldReserveHomeLogoSlot) {
      return <ShieldCheck className="h-[72px] w-[72px] text-white/95" strokeWidth={1.7} />;
    }

    return (
      <span
        className="relative z-10 flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border bg-black/20 p-3 backdrop-blur"
        style={{
          borderColor: 'color-mix(in srgb, var(--ultima-color-surface-border) 34%, transparent)',
          boxShadow:
            '0 0 20px color-mix(in srgb, var(--ultima-color-ring) 24%, transparent), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        {showBrandLogoOnHome ? (
          <img
            data-testid="ultima-home-brand-logo"
            src={logoUrl ?? undefined}
            alt="project-logo"
            className={cn(
              'absolute inset-0 h-full w-full rounded-full object-contain p-3 transition-opacity duration-200',
              isHomeLogoLoaded ? 'opacity-100' : 'opacity-0',
            )}
            loading="eager"
            decoding="sync"
            onLoad={handleHomeLogoLoad}
            onError={handleHomeLogoError}
          />
        ) : null}
        <span
          aria-hidden
          className={cn(
            'absolute inset-[3px] flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition-opacity duration-200',
            showBrandLogoOnHome && isHomeLogoLoaded ? 'opacity-0' : 'opacity-100',
          )}
        >
          <span className="text-2xl font-semibold text-white/70">{logoLetter}</span>
        </span>
      </span>
    );
  }, [
    handleHomeLogoError,
    handleHomeLogoLoad,
    isHomeLogoLoaded,
    logoLetter,
    logoUrl,
    shouldReserveHomeLogoSlot,
    showBrandLogoOnHome,
  ]);

  const renderShieldButton = useCallback(
    (className?: string) => (
      <button
        type="button"
        data-testid="ultima-shield-tap-target"
        aria-label={t('nav.dashboard')}
        onPointerDown={handleShieldTap}
        className={cn(
          'relative isolate mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-black/[0.15] focus-visible:outline-none',
          className,
        )}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <span
          aria-hidden
          data-ultima-transient-visual
          className="pointer-events-none absolute inset-0 z-0 overflow-visible"
        >
          {shieldRipples.map((ripple) => (
            <span
              key={ripple.id}
              className="ultima-tap-ring absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
              }}
            />
          ))}
        </span>
        {renderHomeBrandMark()}
        <span
          aria-hidden
          data-ultima-transient-visual
          className="pointer-events-none absolute inset-0 z-30 overflow-visible"
        >
          {shieldDigits.map((digit) => {
            const style = {
              left: digit.x,
              top: digit.y,
              fontSize: `${digit.size}px`,
              ['--ultima-digit-drift-x']: `${digit.driftX}px`,
              ['--ultima-digit-drift-y']: `${digit.driftY}px`,
              ['--ultima-digit-duration']: `${digit.duration}ms`,
              ['--ultima-digit-opacity']: `${digit.opacity}`,
              ['--ultima-digit-rotate-start']: `${digit.startRotate}deg`,
              ['--ultima-digit-rotate-end']: `${digit.endRotate}deg`,
              ['--ultima-digit-scale']: `${digit.scale}`,
            } as CSSProperties;

            return (
              <span
                key={digit.id}
                className="ultima-float-number absolute -translate-x-1/2 -translate-y-1/2"
                style={style}
              >
                {digit.value}
              </span>
            );
          })}
        </span>
      </button>
    ),
    [handleShieldTap, renderHomeBrandMark, shieldDigits, shieldRipples, t],
  );

  const shellClassName = cn(
    'ultima-shell ultima-shell-shared-nav-docked',
    isDesktopViewport && 'ultima-flat-frames ultima-shell-dashboard-desktop',
  );
  const bottomNav = <UltimaBottomNav active="home" onSupportClick={openSupport} />;
  const PrimaryCtaIcon = primaryActionKind === 'setup' ? Wrench : Globe2;
  const shouldConnectDeviceFromHome =
    isDashboardDevicesUnavailable || connectedDevicesCount <= 0 || dashboardFreeDeviceSlots > 0;
  const devicesHomeCtaTitle = isDashboardDevicesUnavailable
    ? t('devices.title', { defaultValue: 'Устройства' })
    : connectedDevicesCount <= 0
      ? t('devices.connectFirstDevice', { defaultValue: 'Подключить первое устройство' })
      : dashboardFreeDeviceSlots > 0
        ? t('devices.connectNewDeviceTitle', { defaultValue: 'Подключить новое устройство' })
        : t('devices.buySlot', { defaultValue: 'Купить слот' });
  const devicesHomeCtaSubtitle = isDashboardDevicesUnavailable
    ? t('devices.homeCtaUnavailable', { defaultValue: 'Не удалось обновить данные' })
    : connectedDevicesCount <= 0
      ? t('devices.homeCtaSubscriptionReady', {
          defaultValue: 'QR-код и ссылка подписки уже готовы',
        })
      : dashboardFreeDeviceSlots > 0
        ? t('devices.homeCtaFreeSlots', {
            count: dashboardFreeDeviceSlots,
            total: dashboardDeviceLimit,
            defaultValue: 'Свободно {{count}} из {{total}} слотов',
          })
        : t('devices.homeCtaNoSlots', {
            count: connectedDevicesCount,
            total: dashboardDeviceLimit,
            defaultValue: 'Подключено {{count}} из {{total}}',
          });
  const devicesHomeCtaAction = isDashboardDevicesUnavailable
    ? t('common.open', { defaultValue: 'Открыть' })
    : shouldConnectDeviceFromHome
      ? t('devices.subscriptionQrShort', { defaultValue: 'QR' })
      : t('devices.buySlotShort', { defaultValue: 'Слот' });
  const renderDevicesHomeCta = (variant: 'standalone' | 'inline' = 'standalone') =>
    hasAnySubscription ? (
      <button
        type="button"
        onClick={() =>
          openDevices(
            shouldConnectDeviceFromHome,
            shouldConnectDeviceFromHome ? 'home_device_connect_card' : 'home_device_slots_card',
          )
        }
        disabled={isDashboardDevicesPending}
        aria-busy={isDashboardDevicesPending}
        className={cn(
          'w-full text-left transition-all active:scale-[0.98]',
          variant === 'inline'
            ? 'rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-3.5 backdrop-blur-md hover:border-white/[0.15] hover:bg-white/[0.06]'
            : 'rounded-[22px] border border-white/[0.1] p-3.5 shadow-lg backdrop-blur-md',
        )}
        style={
          variant === 'inline'
            ? undefined
            : {
                borderColor:
                  'color-mix(in srgb, var(--ultima-color-surface-border) 28%, transparent)',
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ultima-color-surface) 50%, transparent), color-mix(in srgb, var(--ultima-color-secondary) 70%, transparent))',
              }
        }
      >
        <span className="relative flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border border-[#b89358]/40 bg-[#d4b37f]/10 text-[#d4b37f] shadow-inner">
            <MonitorSmartphone className="h-5 w-5" strokeWidth={2} />
          </span>
          {isDashboardDevicesPending ? (
            <>
              <span
                data-testid="ultima-device-cta-loading"
                className="min-w-0 flex-1"
                aria-label={t('common.loading', { defaultValue: 'Загрузка...' })}
              >
                <span className="block h-3.5 w-36 max-w-full animate-pulse rounded-full bg-white/[0.12]" />
                <span className="mt-2 block h-2.5 w-48 max-w-[82%] animate-pulse rounded-full bg-white/[0.07]" />
              </span>
              <span className="h-7 w-11 shrink-0 animate-pulse rounded-full border border-white/[0.08] bg-white/[0.05]" />
            </>
          ) : (
            <>
              <span className="min-w-0 flex-1">
                <span
                  data-testid="ultima-device-home-cta-title"
                  className="block text-[14px] font-bold leading-tight text-white"
                >
                  {devicesHomeCtaTitle}
                </span>
                <span className="mt-0.5 block truncate text-[11px] font-medium leading-tight text-white/[0.55]">
                  {devicesHomeCtaSubtitle}
                </span>
              </span>
              <span className="shrink-0 rounded-full border border-[#b89358]/40 bg-[#d4b37f]/10 px-3 py-1 text-[11px] font-extrabold text-[#d4b37f] shadow-sm">
                {devicesHomeCtaAction}
              </span>
            </>
          )}
        </span>
      </button>
    ) : null;
  const subscriptionTrafficLimitGb = Math.max(0, subscription?.traffic_limit_gb ?? 0);
  const subscriptionTrafficUsedGb = Math.max(0, subscription?.traffic_used_gb ?? 0);
  const subscriptionTrafficPercent = Math.max(
    0,
    Math.min(
      100,
      subscriptionTrafficLimitGb > 0
        ? Math.round((subscriptionTrafficUsedGb / subscriptionTrafficLimitGb) * 100)
        : (subscription?.traffic_used_percent ?? 0),
    ),
  );
  const trafficNumberFormatter = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 1,
  });
  const subscriptionTrafficUsageLabel =
    subscriptionTrafficLimitGb > 0
      ? `${trafficNumberFormatter.format(subscriptionTrafficUsedGb)} / ${trafficNumberFormatter.format(
          subscriptionTrafficLimitGb,
        )} ${t('common.units.gb', { defaultValue: 'ГБ' })}`
      : t('subscription.unlimited', { defaultValue: 'Безлимит' });
  const subscriptionTrafficRemainingGb = Math.max(
    0,
    subscriptionTrafficLimitGb - subscriptionTrafficUsedGb,
  );
  const mobileTrafficValue = !hasAnySubscription
    ? '—'
    : subscriptionTrafficLimitGb > 0
      ? `${trafficNumberFormatter.format(subscriptionTrafficRemainingGb)} ${t('common.units.gb', {
          defaultValue: 'ГБ',
        })}`
      : t('subscription.unlimited', { defaultValue: 'Безлимит' });
  const mobileDaysValue =
    daysLeft === null ? '—' : trafficNumberFormatter.format(Math.max(daysLeft, 0));
  const mobileOverviewCard = (
    <div className="relative flex flex-col gap-3.5 px-1 py-1">
      {/* 1. Top Admin Button (if Admin) */}
      {isAdmin && (
        <div className="flex justify-end pb-0.5">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 rounded-full border border-[#b89358]/40 bg-black/60 px-3.5 py-1 text-[11px] font-medium tracking-wide text-[#d4b37f] shadow-sm backdrop-blur-md transition-all hover:border-[#b89358]/80 active:scale-95"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#d4b37f]" strokeWidth={1.8} />
            <span>Админка</span>
          </button>
        </div>
      )}

      {/* 2. Main Subscription Card with Full Metrics and Samurai Video Emblem */}
      <div
        className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
        style={{
          background:
            'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left Column: Plan & Expiry */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8e929b]">
                Ваш тариф
              </span>
              <span className="flex items-center gap-1 rounded-full border border-[#b89358]/35 bg-black/60 px-2.5 py-0.5 text-[9px] font-semibold tracking-wider text-[#d4b37f] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d4b37f] shadow-[0_0_6px_#d4b37f]" />
                <span>{isActiveTrial ? 'ПРОБНЫЙ ПЕРИОД' : 'АКТИВЕН'}</span>
              </span>
            </div>

            <h1 className="mt-2 text-[24px] font-bold tracking-tight text-[#f5f5f7] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              Samurai Service
            </h1>
            <p className="mt-0.5 text-[12px] font-medium text-[#8e929b]">{expiryLabel}</p>
          </div>

          {/* Right Column: Samurai Video Emblem */}
          <div
            onClick={handleShieldTap}
            className="group relative flex h-[88px] w-[88px] shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95"
          >
            {/* Ambient Ring Glow */}
            <div className="absolute inset-0 rounded-full bg-[#b89358]/20 blur-md transition-opacity group-hover:opacity-100" />

            {/* Outer Bronze Ring */}
            <div className="relative h-full w-full overflow-hidden rounded-full border-[2px] border-[#c8aa76] bg-[#040506] shadow-[0_0_18px_rgba(184,147,88,0.4),inset_0_0_12px_rgba(0,0,0,0.98)]">
              <video
                src="/samurai_breathing.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 3 Metrics Row */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-white/[0.07] border-t border-white/[0.07] pt-4">
          {/* Metric 1: Traffic Remaining */}
          <div className="pr-2">
            <div className="flex items-center gap-1 text-[#8e929b]">
              <Gauge className="h-3.5 w-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Осталось</span>
            </div>
            <p className="mt-1 text-[15px] font-bold text-[#f5f5f7]">{mobileTrafficValue}</p>
          </div>

          {/* Metric 2: Devices Total */}
          <div className="px-2">
            <div className="flex items-center gap-1 text-[#8e929b]">
              <MonitorSmartphone className="h-3.5 w-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Устройств всего</span>
            </div>
            <p className="mt-1 text-[15px] font-bold text-[#f5f5f7]">
              {`${connectedDevicesCount}/${dashboardDeviceLimit}`}
            </p>
          </div>

          {/* Metric 3: Days Remaining */}
          <div className="pl-2">
            <div className="flex items-center gap-1 text-[#8e929b]">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Дней осталось</span>
            </div>
            <p className="mt-1 text-[15px] font-bold text-[#f5f5f7]">{mobileDaysValue}</p>
          </div>
        </div>

        {/* Progress Bar (Traffic usage with real calculated percent) */}
        {subscriptionTrafficLimitGb > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-medium text-[#8e929b]">
              <span>{subscriptionTrafficUsageLabel}</span>
              <span className="font-semibold text-[#d4b37f]">{`${subscriptionTrafficPercent}%`}</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.08] p-[1px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#b89358] via-[#d4b37f] to-[#f5e6d0] shadow-[0_0_10px_rgba(212,179,127,0.5)] transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(4, subscriptionTrafficPercent))}%` }}
              />
            </div>
          </div>
        )}

        {/* Subscription Details Link */}
        <button
          type="button"
          onClick={openSubscriptionInfo}
          className="mt-4 flex w-full items-center justify-between border-t border-white/[0.07] pt-3 text-[13px] font-semibold text-[#f5f5f7] transition-colors hover:text-[#d4b37f]"
        >
          <span>Детали подписки</span>
          <ChevronRight className="h-4 w-4 text-[#8e929b]" />
        </button>
      </div>

      {/* 3. Quick Actions Card (Быстрые действия) */}
      <div
        className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
        style={{
          background:
            'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
        }}
      >
        <div>
          <h2 className="text-[15px] font-bold text-[#f5f5f7]">Быстрые действия</h2>
          <p className="mt-0.5 text-[11px] text-[#8e929b]">Приглашения и подключение устройств</p>
        </div>

        <div className="mt-3 flex flex-col divide-y divide-white/[0.07]">
          {/* Action 1: Invite Resident */}
          <button
            type="button"
            onClick={openReferral}
            className="flex items-center justify-between py-3 text-left transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-black/40 text-[#d4b37f]">
                <Users className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#f5f5f7]">Позови друга</p>
                <p className="mt-0.5 text-[11px] text-[#8e929b]">
                  +3 дня к подписке за приглашение друга
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-[#b89358]/40 bg-black/60 px-3 py-1 text-[11px] font-bold text-[#d4b37f] shadow-sm">
              <span>Бонус</span>
              <span className="text-[10px]">↗</span>
            </div>
          </button>

          {/* Action 2: Connect Device */}
          <button
            type="button"
            onClick={() => openDevices(shouldConnectDeviceFromHome, 'home_device_connect_card')}
            className="flex items-center justify-between py-3 text-left transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-black/40 text-[#d4b37f]">
                <Smartphone className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#f5f5f7]">Подключить устройство</p>
                <p className="mt-0.5 text-[11px] text-[#8e929b]">
                  {dashboardFreeDeviceSlots > 0
                    ? `Свободно ${dashboardFreeDeviceSlots} из ${dashboardDeviceLimit} слотов`
                    : `Подключено ${connectedDevicesCount} из ${dashboardDeviceLimit}`}
                </p>
              </div>
            </div>
            <span className="rounded-full border border-[#b89358]/35 bg-black/60 px-3 py-1 text-[11px] font-bold text-[#f5f5f7]">
              QR
            </span>
          </button>
        </div>
      </div>

      {/* 4. Primary CTA Button: Deep Obsidian Titanium Glass with Animated Revolving Gold Light Beam */}
      <div className="pt-0.5">
        <button
          type="button"
          onClick={handlePrimaryAction}
          className="btn-gold-beam w-full shadow-[0_12px_28px_rgba(0,0,0,0.75)] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <div
            className="btn-gold-beam-inner min-h-[56px] justify-between px-5 py-3"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(34, 38, 45, 0.95) 0%, rgba(16, 18, 22, 0.98) 100%), url(/horizontal_brushed_steel.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="flex items-center gap-3 text-[#f5f5f7]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b89358]/20 text-[#d4b37f]">
                <PrimaryCtaIcon className="h-4 w-4 stroke-[2]" />
              </div>
              <span className="text-[15px] font-semibold tracking-wide text-[#f5f5f7]">
                {primaryCtaLabel}
              </span>
            </div>
            {primaryCtaMeta ? (
              <span className="rounded-full border border-[#b89358]/40 bg-black/50 px-3 py-1 text-[12px] font-bold text-[#d4b37f] shadow-inner">
                {primaryCtaMeta}
              </span>
            ) : (
              <ChevronRight className="h-4 w-4 text-[#d4b37f]" strokeWidth={2} />
            )}
          </div>
        </button>
      </div>
    </div>
  );
  const desktopTrafficWarning = shouldShowTrafficWarning ? (
    <UltimaTrafficWarningCard
      usedGb={trafficWarningUsedGb}
      limitGb={trafficWarningLimitGb}
      remainingGb={trafficWarningRemainingGb}
      percent={trafficWarningPercent}
      isExhausted={isTrafficExhausted}
      isMetered={subscription?.metered_traffic_enabled}
      isTrial={isActiveTrial}
      serverLabel={subscription?.metered_server_label}
      variant="desktop"
      onAction={openTrafficPurchase}
    />
  ) : null;
  const desktopPendingPaymentCta = pendingTopUp?.paymentUrl ? (
    <UltimaPendingPaymentCard source="dashboard_desktop" compact />
  ) : null;
  const desktopReferralCta = showReferralEntry ? (
    <UltimaReferralCta
      commissionPercent={referralCommissionPercent}
      onClick={openReferral}
      variant="desktop"
      title={referralInviteTitle}
      description={referralInviteDescription}
      badgeLabel={referralInviteBadgeLabel}
    />
  ) : null;
  const desktopActionCtaStack =
    desktopPendingPaymentCta || (!shouldShowTrafficWarning && desktopReferralCta) ? (
      <>
        {desktopPendingPaymentCta}
        {!shouldShowTrafficWarning ? desktopReferralCta : null}
      </>
    ) : null;
  const desktopShowTrialSetupCard = isActiveTrial && connectionStep === 1 && !isConnectionCompleted;
  const desktopTrialGuide = desktopShowTrialSetupCard ? (
    <UltimaTrialGuide
      variant="inline"
      expiryDateLabel={trialExpiryDateLabel}
      daysLeft={daysLeft}
      trafficLimitGb={subscription?.traffic_limit_gb ?? 0}
      deviceLimit={subscription?.device_limit ?? 0}
      onPrimaryAction={handleTrialGuideStart}
      onStatClick={openSubscriptionInfo}
    />
  ) : null;

  if (!isI18nReady || !isSubscriptionReady || shouldHoldForAutoTrial) {
    if (isDesktopViewport) {
      return (
        <div className={shellClassName}>
          <div className="ultima-shell-aura" />
          <UltimaDesktopDashboardSkeleton bottomNav={bottomNav} />
        </div>
      );
    }

    return (
      <div className="ultima-shell ultima-shell-shared-nav-docked">
        <div className="ultima-shell-inner ultima-shell-mobile-docked">
          <section className="flex min-h-0 flex-1 flex-col pt-[clamp(12px,2.4vh,22px)]">
            <div
              className="mb-4 min-h-[250px] animate-pulse rounded-[24px] border p-4"
              style={{
                borderColor:
                  'color-mix(in srgb, var(--ultima-color-surface-border) 24%, transparent)',
                background: 'color-mix(in srgb, var(--ultima-color-surface) 64%, transparent)',
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="h-3 w-24 rounded-full bg-white/[0.08]" />
                  <div className="mt-4 h-7 w-40 max-w-full rounded-full bg-white/[0.1]" />
                  <div className="mt-3 h-3 w-28 rounded-full bg-white/[0.06]" />
                </div>
                <div className="h-[104px] w-[104px] shrink-0 rounded-full bg-white/[0.06]" />
              </div>
              <div className="mt-4 h-14 border-y border-white/[0.07]" />
              <div className="mt-4 h-2 rounded-full bg-white/[0.07]" />
              <div className="mt-4 h-5 rounded-full bg-white/[0.06]" />
            </div>
            <div className="h-[176px] animate-pulse rounded-[24px] border border-white/[0.07] bg-white/[0.04]" />
          </section>
          <section className="ultima-mobile-dock-footer space-y-3">
            <div className="h-12 animate-pulse rounded-full bg-white/[0.08]" />
            <div className="h-12 animate-pulse rounded-full bg-white/[0.06]" />
          </section>
        </div>
      </div>
    );
  }

  if (isDesktopViewport) {
    return (
      <div className={shellClassName}>
        <div className="ultima-shell-aura" />
        <UltimaDesktopDashboard
          heroButton={renderShieldButton('h-[108px] w-[108px] lg:h-[124px] lg:w-[124px]')}
          referralCta={desktopActionCtaStack}
          devicesCta={shouldShowTrafficWarning ? null : renderDevicesHomeCta()}
          trafficWarning={desktopTrafficWarning}
          subscription={subscription}
          connectedDevicesCount={connectedDevicesCount}
          isDevicesLoading={isDashboardDevicesPending}
          expiryLabel={expiryLabel}
          statusLabel={statusLabel}
          statusTone={statusToneKey}
          daysLeft={daysLeft}
          connectionStep={connectionStep}
          isConnectionCompleted={isConnectionCompleted}
          primaryActionKind={primaryActionKind}
          primaryCtaLabel={primaryCtaLabel}
          primaryCtaMeta={primaryCtaMeta}
          promoMessage={promoMessage}
          activeDiscount={activeDiscount}
          firstPromoOffer={firstPromoOffer}
          showTrialSetupCard={desktopShowTrialSetupCard}
          trialGuide={desktopTrialGuide}
          showConnectionCtaHighlight={showConnectionCtaHighlight}
          onPrimaryAction={handlePrimaryAction}
          onBuySubscription={openSubscriptionPurchase}
          onOpenConnection={() => openConnection()}
          onOpenSupport={openSupport}
          onActivateOffer={
            firstPromoOffer ? () => claimOfferMutation.mutate(firstPromoOffer.id) : null
          }
          isActivatingOffer={claimOfferMutation.isPending}
          bottomNav={bottomNav}
        />
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      <div className="ultima-shell-inner ultima-shell-mobile-docked pb-32 lg:max-w-[680px] lg:justify-between">
        <section
          data-testid="ultima-dashboard-scroll-region"
          className="ultima-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto pb-2 pr-1 pt-1 lg:flex-none lg:overflow-visible lg:pb-2 lg:pr-0 lg:pt-8"
        >
          {mobileOverviewCard}
        </section>
      </div>

      {/* Fixed Bottom Navigation Dock */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 lg:hidden">
        <div className="pointer-events-auto mx-auto max-w-[540px]">
          <UltimaBottomNav active="home" onSupportClick={openSupport} />
        </div>
      </div>

      {isTrialGuideVisible && (
        <UltimaTrialGuide
          variant="overlay"
          expiryDateLabel={trialExpiryDateLabel}
          daysLeft={daysLeft}
          trafficLimitGb={subscription?.traffic_limit_gb ?? 0}
          deviceLimit={subscription?.device_limit ?? 0}
          onPrimaryAction={handleTrialGuideStart}
          onDismiss={handleTrialGuideDismiss}
        />
      )}
    </div>
  );
}
