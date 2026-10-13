import { isProtectedClientLink } from '@/utils/templateEngine';
import { GlassCelebration } from '@/components/ultima/GlassCelebration';
import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { copyToClipboard } from '@/utils/clipboard';
import { useQuery } from '@tanstack/react-query';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Download,
  ExternalLink,
  Info,
  Laptop,
  Link2,
  QrCode,
  Copy,
  Monitor,
  Settings2,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { subscriptionApi } from '@/api/subscription';
import { UltimaDesktopNavbar } from '@/components/ultima/desktop/UltimaDesktopNavbar';
import { UltimaBottomNav } from '@/components/ultima/UltimaBottomNav';
import { VpnDiagnostics } from '@/components/connection/VpnDiagnostics';
import {
  ULTIMA_CONNECTION_PENDING_STEP2_KEY,
  ULTIMA_CONNECTION_PENDING_STEP3_KEY,
  readUltimaConnectionCompleted,
  readUltimaConnectionReminderHidden,
  readUltimaConnectionStep,
  writeUltimaConnectionCompleted,
  writeUltimaConnectionReminderHidden,
  writeUltimaConnectionStep,
} from '@/features/ultima/connectionFlow';
import {
  ultimaPaneClassName,
  ultimaPaneSurfaceStyle,
  ultimaPanelClassName,
  ultimaSurfaceStyle,
} from '@/features/ultima/surfaces';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/platform';
import { useAuthStore } from '@/store/auth';
import type {
  AppConfig,
  LocalizedText,
  RemnawaveAppClient,
  RemnawaveButtonClient,
  RemnawavePlatformData,
} from '@/types';
import { trackAnalyticsEvent } from '@/utils/analyticsEvents';

type Step = 1 | 2 | 3;

type UltimaConnectionProps = {
  appConfig: AppConfig;
  onOpenDeepLink: (url: string) => void;
  onGoBack: () => void;
  onRefreshAppConfig?: () => void;
};

type InstallOption = {
  key: string;
  label: string;
  url: string;
  kind: 'apk' | 'play' | 'appstore' | 'store' | 'download';
};

const PLATFORM_ORDER = ['ios', 'android', 'windows', 'macos', 'linux', 'androidTV', 'appleTV'];

const getLocalizedText = (text: LocalizedText | undefined, lang: string): string => {
  if (!text) return '';
  return text[lang] || text.en || text.ru || Object.values(text)[0] || '';
};

const detectPlatformKey = (): string | null => {
  if (typeof window === 'undefined' || !navigator?.userAgent) return null;
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return /tv|television/.test(ua) ? 'androidTV' : 'android';
  if (/macintosh|mac os x/.test(ua)) return 'macos';
  if (/windows/.test(ua)) return 'windows';
  if (/linux/.test(ua)) return 'linux';
  return null;
};

const resolveTemplateUrl = (
  value: string,
  subscriptionUrl: string | null,
  subscriptionCryptoLink?: string | null,
  subscriptionIncyCryptoLink?: string | null,
): string => {
  if (!value) return value;
  return value
    .replace(/\{\{\s*subscriptionUrl\s*\}\}/gi, subscriptionUrl ?? '')
    .replace(/\{\{\s*SUBSCRIPTION_LINK\s*\}\}/gi, subscriptionUrl ?? '')
    .replace(/\{\{\s*HAPP_CRYPT3_LINK\s*\}\}/gi, subscriptionCryptoLink ?? '')
    .replace(/\{\{\s*HAPP_CRYPT4_LINK\s*\}\}/gi, subscriptionCryptoLink ?? '')
    .replace(/\{\{\s*HAPP_CRYPT5_LINK\s*\}\}/gi, subscriptionCryptoLink ?? '')
    .replace(/\{\{\s*INCY_CRYPT1_LINK\s*\}\}/gi, subscriptionIncyCryptoLink ?? '');
};

const getPlatformDisplayName = (appConfig: AppConfig, key: string, language: string): string => {
  const platform = appConfig.platforms?.[key] as RemnawavePlatformData | undefined;
  const label = getLocalizedText(platform?.displayName, language);
  if (label) return label;

  const configuredName = getLocalizedText(appConfig.platformNames?.[key], language);
  if (configuredName) return configuredName;

  const fallback: Record<string, string> = {
    ios: 'iOS',
    android: 'Android',
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
    androidTV: 'Android TV',
    appleTV: 'Apple TV',
  };
  return fallback[key] || key;
};

const getAvailablePlatformKeys = (appConfig: AppConfig): string[] => {
  const configuredKeys = Object.keys(appConfig.platforms ?? {});
  const sorted = PLATFORM_ORDER.filter((key) => appConfig.platforms?.[key]?.apps?.length);
  const extra = configuredKeys.filter(
    (key) => !PLATFORM_ORDER.includes(key) && appConfig.platforms?.[key]?.apps?.length,
  );
  return [...sorted, ...extra];
};

const getAppKey = (app: RemnawaveAppClient, index: number): string => `${app.name}:${index}`;

const isClientApp = (app: RemnawaveAppClient, client: 'happ' | 'incy'): boolean =>
  [app.id, app.name, app.urlScheme, app.deepLink]
    .filter((value): value is string => typeof value === 'string')
    .some((value) => value.toLowerCase().includes(client));

const getButtonUrl = (button: RemnawaveButtonClient): string | null =>
  button.resolvedUrl || button.url || button.link || button.buttonLink || null;

const getAppButtons = (app: RemnawaveAppClient | null | undefined): RemnawaveButtonClient[] => {
  if (!app) return [];
  return [...(app.buttons ?? []), ...(app.blocks ?? []).flatMap((block) => block.buttons ?? [])];
};

const isSubscriptionButton = (button: RemnawaveButtonClient, label: string): boolean =>
  button.type === 'subscriptionLink' ||
  button.type === 'copyButton' ||
  label.includes('subscription') ||
  label.includes('подпис');

const classifyInstallKind = (label: string, url: string): InstallOption['kind'] => {
  const normalizedUrl = url.toLowerCase();
  if (label.includes('apk') || normalizedUrl.includes('.apk')) return 'apk';
  if (
    normalizedUrl.includes('play.google') ||
    label.includes('google play') ||
    label.includes('play market')
  ) {
    return 'play';
  }
  if (normalizedUrl.includes('apps.apple') || label.includes('app store')) return 'appstore';
  if (label.includes('store') || label.includes('market')) return 'store';
  return 'download';
};

const isInstallButton = (button: RemnawaveButtonClient, label: string, url: string): boolean => {
  if (button.type === 'subscriptionLink' || button.type === 'copyButton') return false;
  if (isSubscriptionButton(button, label)) return false;

  const normalizedUrl = url.toLowerCase();
  if (normalizedUrl.includes('.apk')) return true;
  if (normalizedUrl.includes('play.google') || normalizedUrl.includes('apps.apple')) return true;
  if (normalizedUrl.includes('github.com') && normalizedUrl.includes('release')) return true;

  return (
    label.includes('install') ||
    label.includes('download') ||
    label.includes('store') ||
    label.includes('market') ||
    label.includes('apk') ||
    label.includes('скач') ||
    label.includes('установ') ||
    label.includes('загруз')
  );
};

const labelForDirectInstallUrl = (field: string, url: string, language: string): string => {
  const normalized = url.toLowerCase();
  const isRu = language.toLowerCase().startsWith('ru');
  if (field.toLowerCase().includes('apk') || normalized.includes('.apk')) return 'APK';
  if (normalized.includes('play.google')) return 'Google Play';
  if (normalized.includes('apps.apple')) return 'App Store';
  return isRu ? 'Скачать напрямую' : 'Direct download';
};

const collectInstallOptions = (
  app: RemnawaveAppClient | null,
  appConfig: AppConfig,
  language: string,
): InstallOption[] => {
  if (!app) return [];

  const seen = new Set<string>();
  const options: InstallOption[] = [];
  const addOption = (label: string, rawUrl: string | null, key: string) => {
    if (!rawUrl) return;
    const resolved = resolveTemplateUrl(
      rawUrl,
      appConfig.subscriptionUrl,
      appConfig.subscriptionCryptoLink,
      appConfig.subscriptionIncyCryptoLink,
    );
    if (!resolved || resolved.includes('{{') || seen.has(resolved)) return;
    seen.add(resolved);
    const finalLabel = label.trim() || labelForDirectInstallUrl(key, resolved, language);
    options.push({
      key,
      label: finalLabel,
      url: resolved,
      kind: classifyInstallKind(finalLabel.toLowerCase(), resolved),
    });
  };

  getAppButtons(app).forEach((button, index) => {
    const label = getLocalizedText(button.text, language);
    const rawUrl = getButtonUrl(button);
    if (rawUrl && isInstallButton(button, label.toLowerCase(), rawUrl)) {
      addOption(label, rawUrl, `button-${index}`);
    }
  });

  const appUrls = app as RemnawaveAppClient & Record<string, unknown>;
  ['apkUrl', 'apkDownloadUrl', 'directDownloadUrl', 'downloadUrl', 'storeUrl'].forEach((field) => {
    const value = appUrls[field];
    if (typeof value === 'string') {
      addOption(labelForDirectInstallUrl(field, value, language), value, `app-${field}`);
    }
  });

  return options.slice(0, 6);
};

const findSetupUrls = (
  appConfig: AppConfig,
  language: string,
  app: RemnawaveAppClient | null,
): {
  installOptions: InstallOption[];
  installUrl: string | null;
  addSubscriptionUrl: string | null;
} => {
  if (!app) return { installOptions: [], installUrl: null, addSubscriptionUrl: null };

  const flatButtons = getAppButtons(app);
  const installOptions = collectInstallOptions(app, appConfig, language);
  let installUrl: string | null = null;
  let addSubscriptionUrl: string | null = isClientApp(app, 'incy')
    ? (appConfig.subscriptionIncyCryptoLink ?? app.deepLink ?? null)
    : isClientApp(app, 'happ')
      ? (appConfig.subscriptionCryptoLink ?? app.deepLink ?? null)
      : (app.deepLink ?? null);

  for (const button of flatButtons) {
    const localized = getLocalizedText(button.text, language).toLowerCase();
    const rawUrl = getButtonUrl(button);
    if (!rawUrl) continue;

    if (!addSubscriptionUrl && button.type === 'subscriptionLink') addSubscriptionUrl = rawUrl;
    if (
      !addSubscriptionUrl &&
      (localized.includes('подпис') || localized.includes('subscription'))
    ) {
      addSubscriptionUrl = rawUrl;
    }
    if (
      !installUrl &&
      (localized.includes('установ') ||
        localized.includes('download') ||
        localized.includes('play') ||
        localized.includes('store') ||
        localized.includes('apk'))
    ) {
      installUrl = rawUrl;
    }
    if (!installUrl && isInstallButton(button, localized, rawUrl)) installUrl = rawUrl;
  }

  const primaryInstall =
    installOptions.find((option) => option.kind === 'apk') ?? installOptions[0];
  const resolvedInstall = primaryInstall?.url
    ? primaryInstall.url
    : installUrl
      ? resolveTemplateUrl(
          installUrl,
          appConfig.subscriptionUrl,
          appConfig.subscriptionCryptoLink,
          appConfig.subscriptionIncyCryptoLink,
        )
      : null;
  const resolvedAddCandidate = addSubscriptionUrl
    ? resolveTemplateUrl(
        addSubscriptionUrl,
        appConfig.subscriptionUrl,
        appConfig.subscriptionCryptoLink,
        appConfig.subscriptionIncyCryptoLink,
      )
    : appConfig.subscriptionUrl;
  let resolvedAdd =
    resolvedAddCandidate && !resolvedAddCandidate.includes('{{')
      ? resolvedAddCandidate
      : appConfig.subscriptionUrl;

  // Protected client imports must never silently degrade to a regular subscription URL.
  if (appConfig.cryptoLinksEnabled !== false) {
    const client = isClientApp(app, 'incy') ? 'incy' : isClientApp(app, 'happ') ? 'happ' : null;
    if (client) {
      resolvedAdd = isProtectedClientLink(resolvedAddCandidate, client) ? resolvedAddCandidate : null;
    }
  }

  return { installOptions, installUrl: resolvedInstall, addSubscriptionUrl: resolvedAdd };
};

export function UltimaConnection({
  appConfig,
  onOpenDeepLink,
  onGoBack,
  onRefreshAppConfig,
}: UltimaConnectionProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const haptic = useHaptic();
  const user = useAuthStore((state) => state.user);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const detectedPlatform = useMemo(() => detectPlatformKey(), []);

  const [step, setStep] = useState<Step>(1);
  const [showInfo, setShowInfo] = useState(false);
  const [showFinishSuccess, setShowFinishSuccess] = useState(false);
  const [isReminderHidden, setIsReminderHidden] = useState(false);
  const [activePlatformKey, setActivePlatformKey] = useState<string | null>(() => {
    const keys = getAvailablePlatformKeys(appConfig);
    return detectedPlatform && keys.includes(detectedPlatform)
      ? detectedPlatform
      : (keys[0] ?? null);
  });
  const [selectedAppKey, setSelectedAppKey] = useState<string | null>(null);
  const [importMethod, setImportMethod] = useState<'link' | 'qr'>('link');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => { setImportMethod('link'); setCopyState('idle'); }, [selectedAppKey, activePlatformKey]);
  const [selectedInstallUrl, setSelectedInstallUrl] = useState<string | null>(null);
  const [returnNoticeStep, setReturnNoticeStep] = useState<2 | 3 | null>(null);
  const stepInitRef = useRef(false);

  const language = i18n.resolvedLanguage || i18n.language || 'ru';
  const availablePlatformKeys = useMemo(() => getAvailablePlatformKeys(appConfig), [appConfig]);

  useEffect(() => {
    const preferred =
      detectedPlatform && availablePlatformKeys.includes(detectedPlatform)
        ? detectedPlatform
        : (availablePlatformKeys[0] ?? null);
    setActivePlatformKey((current) =>
      current && availablePlatformKeys.includes(current) ? current : preferred,
    );
  }, [availablePlatformKeys, detectedPlatform]);

  const currentPlatformData = activePlatformKey
    ? (appConfig.platforms[activePlatformKey] as RemnawavePlatformData | undefined)
    : undefined;
  const currentPlatformApps = useMemo(
    () => currentPlatformData?.apps ?? [],
    [currentPlatformData?.apps],
  );

  useEffect(() => {
    if (!currentPlatformApps.length) {
      setSelectedAppKey(null);
      return;
    }
    setSelectedAppKey((current) => {
      if (current && currentPlatformApps.some((app, index) => getAppKey(app, index) === current)) {
        return current;
      }
      const featuredIndex = currentPlatformApps.findIndex((app) => app.featured || app.isFeatured);
      const index = featuredIndex >= 0 ? featuredIndex : 0;
      return getAppKey(currentPlatformApps[index]!, index);
    });
  }, [currentPlatformApps]);

  const selectedApp = useMemo(() => {
    if (!selectedAppKey) {
      return (
        currentPlatformApps.find((app) => app.featured || app.isFeatured) ??
        currentPlatformApps[0] ??
        null
      );
    }
    return (
      currentPlatformApps.find((app, index) => getAppKey(app, index) === selectedAppKey) ??
      currentPlatformApps.find((app) => app.featured || app.isFeatured) ??
      currentPlatformApps[0] ??
      null
    );
  }, [currentPlatformApps, selectedAppKey]);

  const setupUrls = useMemo(
    () => findSetupUrls(appConfig, language, selectedApp),
    [appConfig, language, selectedApp],
  );

  useEffect(() => {
    const preferred =
      setupUrls.installOptions.find((option) => option.kind === 'apk') ??
      setupUrls.installOptions[0];
    setSelectedInstallUrl((current) =>
      current && setupUrls.installOptions.some((option) => option.url === current)
        ? current
        : (preferred?.url ?? setupUrls.installUrl),
    );
  }, [setupUrls.installOptions, setupUrls.installUrl]);

  const { data: subscriptionResponse } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
    staleTime: 15000,
    placeholderData: (previousData) => previousData,
  });
  const subscription = subscriptionResponse?.subscription ?? null;
  const isActiveTrial = Boolean(
    subscription?.is_active && !subscription?.is_expired && subscription?.is_trial,
  );
  const canPermanentlyHideReminder = Boolean(
    subscription?.is_active && !subscription?.is_expired && !subscription?.is_trial,
  );

  useEffect(() => {
    const normalized = readUltimaConnectionStep(user?.id);
    const completed = readUltimaConnectionCompleted(user?.id);
    const hidden = readUltimaConnectionReminderHidden(user?.id);
    setStep(normalized);
    setIsReminderHidden(hidden);
    setShowInfo(normalized === 1 && !hidden && !completed);
  }, [user?.id]);

  useEffect(() => {
    const pendingStep2Key = `${ULTIMA_CONNECTION_PENDING_STEP2_KEY}:${user?.id ?? 'guest'}`;
    const pendingStep3Key = `${ULTIMA_CONNECTION_PENDING_STEP3_KEY}:${user?.id ?? 'guest'}`;

    const consumePendingState = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      try {
        const pendingStep3 =
          localStorage.getItem(pendingStep3Key) === '1' ||
          localStorage.getItem(ULTIMA_CONNECTION_PENDING_STEP3_KEY) === '1';
        const pendingStep2 =
          localStorage.getItem(pendingStep2Key) === '1' ||
          localStorage.getItem(ULTIMA_CONNECTION_PENDING_STEP2_KEY) === '1';

        if (pendingStep3) {
          localStorage.removeItem(pendingStep3Key);
          localStorage.removeItem(ULTIMA_CONNECTION_PENDING_STEP3_KEY);
          onRefreshAppConfig?.();
          setStep(3);
          setReturnNoticeStep(3);
          return;
        }
        if (pendingStep2) {
          localStorage.removeItem(pendingStep2Key);
          localStorage.removeItem(ULTIMA_CONNECTION_PENDING_STEP2_KEY);
          onRefreshAppConfig?.();
          setStep(2);
          setReturnNoticeStep(2);
        }
      } catch {
        // localStorage may be unavailable in a restricted webview.
      }
    };

    consumePendingState();
    window.addEventListener('focus', consumePendingState);
    document.addEventListener('visibilitychange', consumePendingState);
    return () => {
      window.removeEventListener('focus', consumePendingState);
      document.removeEventListener('visibilitychange', consumePendingState);
    };
  }, [onRefreshAppConfig, user?.id]);

  useEffect(() => {
    writeUltimaConnectionStep(user?.id, step);
  }, [step, user?.id]);

  useEffect(() => {
    if (!canPermanentlyHideReminder && isReminderHidden) {
      writeUltimaConnectionReminderHidden(user?.id, false);
      setIsReminderHidden(false);
    }
  }, [canPermanentlyHideReminder, isReminderHidden, user?.id]);

  useEffect(() => {
    if (!stepInitRef.current) {
      stepInitRef.current = true;
      return;
    }
    haptic.impact('light');
  }, [haptic, step]);

  const selectedAppName = selectedApp?.name || '—';
  const selectedInstallOption =
    setupUrls.installOptions.find((option) => option.url === selectedInstallUrl) ??
    setupUrls.installOptions[0] ??
    null;
  const appLaunchUrl = (() => {
    const addUrl = setupUrls.addSubscriptionUrl;
    if (!addUrl || !selectedApp) return null;
    const scheme = addUrl.match(/^([a-z][a-z0-9+.-]*):\/\//i)?.[1]?.toLowerCase();
    const configuredScheme = selectedApp.urlScheme
      ?.match(/^([a-z][a-z0-9+.-]*):\/\//i)?.[1]
      ?.toLowerCase();
    const appScheme = scheme && scheme !== 'http' && scheme !== 'https' ? scheme : configuredScheme;
    if (!appScheme) return addUrl;
    if (appScheme === 'happ' || appScheme === 'incy') return `${appScheme}://toggle`;
    if (appScheme !== 'http' && appScheme !== 'https') return `${appScheme}://`;
    return addUrl;
  })();

  const stepItems = [
    {
      step: 1 as Step,
      short: t('subscription.connection.stepInstallShort', { defaultValue: 'Приложение' }),
      title: t('subscription.connection.stepInstallTitle', {
        defaultValue: 'Установите приложение',
      }),
      description: t('subscription.connection.stepInstallDesc', {
        defaultValue: 'Выберите свое устройство и установите рекомендуемое VPN-приложение.',
      }),
      icon: Download,
    },
    {
      step: 2 as Step,
      short: t('subscription.connection.stepSubscriptionShort', { defaultValue: 'Подписка' }),
      title: t('subscription.connection.stepSubscriptionTitle', {
        defaultValue: 'Добавьте подписку',
      }),
      description: t('subscription.connection.stepSubscriptionDesc', {
        defaultValue: 'Одна кнопка передаст вашу подписку в выбранное приложение.',
      }),
      icon: Link2,
    },
    {
      step: 3 as Step,
      short: t('subscription.connection.stepVpnShort', { defaultValue: 'VPN' }),
      title: t('subscription.connection.stepDoneTitle', { defaultValue: 'Включите VPN' }),
      description: t('subscription.connection.stepDoneDesc', {
        defaultValue: 'Откройте приложение, включите подключение и проверьте интернет.',
      }),
      icon: ShieldCheck,
    },
  ];
  const currentStep = stepItems[step - 1]!;
  const CurrentStepIcon = currentStep.icon;

  const importantInfoDescription = isActiveTrial
    ? t('ultima.trialGuide.connectionInfoDesc', {
        defaultValue:
          'Пробный доступ уже активирован. Установите приложение, вернитесь сюда и добавьте подписку.',
      })
    : t('subscription.connection.importantInfoDesc', {
        defaultValue:
          'После установки вернитесь на этот экран. Второй шаг автоматически добавит вашу подписку в приложение.',
      });

  const handlePlatformChange = (platformKey: string) => {
    haptic.selection();
    setActivePlatformKey(platformKey);
    const apps = appConfig.platforms[platformKey]?.apps ?? [];
    const client = selectedApp && isClientApp(selectedApp, 'incy') ? 'incy' : selectedApp && isClientApp(selectedApp, 'happ') ? 'happ' : null;
    const matchingIndex = client ? apps.findIndex((app) => isClientApp(app, client)) : -1;
    const featuredIndex = apps.findIndex((app) => app.featured || app.isFeatured);
    const nextIndex = matchingIndex >= 0 ? matchingIndex : featuredIndex >= 0 ? featuredIndex : 0;
    setSelectedAppKey(apps[nextIndex] ? getAppKey(apps[nextIndex], nextIndex) : null);
  };

  const handleAppChange = (appKey: string) => {
    haptic.selection();
    setSelectedAppKey(appKey);
  };

  const goToStep = (nextStep: Step) => {
    if (nextStep > step) return;
    if (nextStep < 3) writeUltimaConnectionCompleted(user?.id, false);
    setReturnNoticeStep(null);
    setStep(nextStep);
  };

  const startInstallUrlFlow = (url: string) => {
    writeUltimaConnectionCompleted(user?.id, false);
    setReturnNoticeStep(null);
    trackAnalyticsEvent('ultima_connection_install_start', {
      platform: activePlatformKey,
      app: selectedApp?.name ?? null,
      source: selectedInstallOption?.kind ?? null,
      step,
    });
    try {
      localStorage.setItem(`${ULTIMA_CONNECTION_PENDING_STEP2_KEY}:${user?.id ?? 'guest'}`, '1');
      localStorage.setItem(ULTIMA_CONNECTION_PENDING_STEP2_KEY, '1');
    } catch {
      // localStorage may be unavailable in a restricted webview.
    }
    onOpenDeepLink(url);
  };

  const startInstallFlow = () => {
    const installUrl = selectedInstallUrl || setupUrls.installUrl;
    if (installUrl) startInstallUrlFlow(installUrl);
  };

  const confirmAppInstalled = () => {
    writeUltimaConnectionCompleted(user?.id, false);
    trackAnalyticsEvent('ultima_connection_install_confirmed', {
      platform: activePlatformKey,
      app: selectedApp?.name ?? null,
    });
    setReturnNoticeStep(null);
    setStep(2);
  };

  const startAddSubscriptionFlow = () => {
    if (!setupUrls.addSubscriptionUrl) return;
    writeUltimaConnectionCompleted(user?.id, false);
    setReturnNoticeStep(null);
    trackAnalyticsEvent('ultima_connection_add_subscription_start', {
      platform: activePlatformKey,
      app: selectedApp?.name ?? null,
      step,
    });
    try {
      localStorage.setItem(`${ULTIMA_CONNECTION_PENDING_STEP3_KEY}:${user?.id ?? 'guest'}`, '1');
      localStorage.setItem(ULTIMA_CONNECTION_PENDING_STEP3_KEY, '1');
    } catch {
      // localStorage may be unavailable in a restricted webview.
    }
    onOpenDeepLink(setupUrls.addSubscriptionUrl);
  };

  const confirmSubscriptionAdded = () => {
    writeUltimaConnectionCompleted(user?.id, false);
    trackAnalyticsEvent('ultima_connection_subscription_confirmed', {
      platform: activePlatformKey,
      app: selectedApp?.name ?? null,
    });
    setReturnNoticeStep(null);
    setStep(3);
  };

  const openToggleVpn = () => {
    if (!appLaunchUrl) return;
    trackAnalyticsEvent('ultima_connection_vpn_open', {
      platform: activePlatformKey,
      app: selectedApp?.name ?? null,
    });
    onOpenDeepLink(appLaunchUrl);
  };

  const finishFlow = () => {
    writeUltimaConnectionCompleted(user?.id, true);
    trackAnalyticsEvent('ultima_connection_flow_complete', {
      platform: activePlatformKey,
      app: selectedApp?.name ?? null,
      is_trial: isActiveTrial,
    });
    setShowFinishSuccess(true);
    window.setTimeout(() => {
      setShowFinishSuccess(false);
      writeUltimaConnectionStep(user?.id, 1);
      setStep(1);
      setShowInfo(false);
      onGoBack();
    }, 1200);
  };

  const dismissReminderForNow = () => setShowInfo(false);

  const hideReminderPermanently = () => {
    if (canPermanentlyHideReminder) {
      writeUltimaConnectionReminderHidden(user?.id, true);
      setIsReminderHidden(true);
    }
    setShowInfo(false);
  };

  const renderPicker = () => (
    <div data-testid="ultima-connection-picker" className="space-y-4">
      {availablePlatformKeys.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-white/[0.68]">
            <Monitor className="h-4 w-4" strokeWidth={1.8} />
            {t('subscription.connection.selectPlatform', { defaultValue: 'Выберите устройство' })}
          </div>
          <div className="grid grid-cols-2 gap-2 min-[460px]:grid-cols-3 lg:grid-cols-4">
            {availablePlatformKeys.map((platformKey) => {
              const isActive = platformKey === activePlatformKey;
              const isDetected = platformKey === detectedPlatform;
              return (
                <button
                  key={platformKey}
                  type="button"
                  data-testid={`ultima-connection-platform-${platformKey}`}
                  aria-pressed={isActive}
                  onClick={() => handlePlatformChange(platformKey)}
                  className={cn(
                    'flex min-h-[52px] min-w-0 items-center gap-2.5 rounded-[15px] border px-3 py-2.5 text-left transition-colors lg:rounded-[7px]',
                    isActive
                      ? 'border-[#d4b37f]/[0.32] bg-[#d4b37f]/[0.12] text-white'
                      : 'border-white/[0.08] bg-white/[0.025] text-white/[0.64] hover:bg-white/[0.05]',
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-white/[0.05] lg:rounded-[5px]">
                    {platformKey === 'android' || platformKey === 'ios' ? (
                      <Smartphone className="h-4 w-4" strokeWidth={1.8} />
                    ) : (
                      <Laptop className="h-4 w-4" strokeWidth={1.8} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold">
                      {getPlatformDisplayName(appConfig, platformKey, language)}
                    </span>
                    {isDetected ? (
                      <span className="mt-0.5 block truncate text-[12px] text-[#d4b37f]/[0.68]">
                        {t('subscription.connection.yourDevice', {
                          defaultValue: 'Ваше устройство',
                        })}
                      </span>
                    ) : null}
                  </span>
                  {isActive ? <Check className="h-4 w-4 shrink-0" strokeWidth={2.2} /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {currentPlatformApps.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-white/[0.68]">
            <Settings2 className="h-4 w-4" strokeWidth={1.8} />
            {t('subscription.connection.selectApp', { defaultValue: 'Выберите приложение' })}
          </div>
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
            {currentPlatformApps.map((app, index) => {
              const appKey = getAppKey(app, index);
              const isActive = appKey === selectedAppKey;
              return (
                <button
                  key={appKey}
                  type="button"
                  data-testid={`ultima-connection-app-${index}`}
                  aria-pressed={isActive}
                  onClick={() => handleAppChange(appKey)}
                  className={cn(
                    'flex min-h-[50px] min-w-0 items-center gap-3 rounded-[15px] border px-3 py-2.5 text-left transition-colors lg:rounded-[7px]',
                    isActive
                      ? 'border-[#d4b37f]/[0.32] bg-[#d4b37f]/[0.12] text-white'
                      : 'border-white/[0.08] bg-white/[0.025] text-white/[0.64] hover:bg-white/[0.05]',
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-white/[0.05] lg:rounded-[5px]">
                    <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold">{app.name}</span>
                    {app.featured || app.isFeatured ? (
                      <span className="mt-0.5 block text-[10px] text-amber-100/[0.72]">
                        {t('subscription.connection.featured', { defaultValue: 'Рекомендуем' })}
                      </span>
                    ) : null}
                  </span>
                  {isActive ? <Check className="h-4 w-4 shrink-0" strokeWidth={2.2} /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {step === 1 && setupUrls.installOptions.length > 1 ? (
        <div>
          <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-white/[0.68]">
            <Download className="h-4 w-4" strokeWidth={1.8} />
            {t('subscription.connection.downloadSource', { defaultValue: 'Способ установки' })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {setupUrls.installOptions.map((option, index) => {
              const isActive = option.url === selectedInstallUrl;
              return (
                <button
                  key={`${option.key}-${option.url}`}
                  type="button"
                  data-testid={`ultima-connection-source-${index}`}
                  aria-pressed={isActive}
                  onClick={() => {
                    haptic.selection();
                    setSelectedInstallUrl(option.url);
                  }}
                  className={cn(
                    'flex min-h-[44px] min-w-0 items-center justify-between gap-2 rounded-[14px] border px-3 py-2 text-left text-[12px] font-semibold transition-colors lg:rounded-[7px]',
                    isActive
                      ? 'border-[#d4b37f]/[0.3] bg-[#d4b37f]/[0.11] text-white'
                      : 'border-white/[0.08] bg-white/[0.025] text-white/[0.6] hover:bg-white/[0.05]',
                  )}
                >
                  <span className="min-w-0 break-words">{option.label}</span>
                  {isActive ? <Check className="h-4 w-4 shrink-0" strokeWidth={2.2} /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );

  const renderMobileProgress = () => (
    <ol
      data-testid="ultima-connection-progress"
      className="grid grid-cols-3 gap-1.5 rounded-[18px] border border-white/[0.08] bg-white/[0.025] p-1.5"
    >
      {stepItems.map((item) => {
        const isActive = item.step === step;
        const isDone = item.step < step;
        return (
          <li key={item.step} className="min-w-0">
            <button
              type="button"
              data-testid={`ultima-connection-step-${item.step}`}
              onClick={() => goToStep(item.step)}
              disabled={item.step > step}
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'flex min-h-[48px] w-full min-w-0 items-center justify-center gap-1.5 rounded-[13px] px-1.5 py-2 transition-colors',
                isActive && 'bg-[#d4b37f]/[0.13] text-white',
                isDone && 'text-[#d4b37f]/[0.84]',
                !isActive && !isDone && 'text-white/[0.38]',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
                  isActive || isDone
                    ? 'border-[#d4b37f]/[0.38] bg-[#d4b37f]/[0.12]'
                    : 'border-white/[0.12] bg-white/[0.03]',
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={2.2} /> : item.step}
              </span>
              <span className="min-w-0 truncate text-[11px] font-medium sm:text-[12px]">{item.short}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  const returnNotice =
    returnNoticeStep === step ? (
      <div
        role="status"
        className="flex items-start gap-3 rounded-[16px] border border-[#d4b37f]/[0.18] bg-[#d4b37f]/[0.08] px-3.5 py-3 text-[#d4b37f] lg:rounded-[7px]"
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
        <div className="min-w-0">
          <div className="text-[12px] font-semibold">
            {returnNoticeStep === 2
              ? t('subscription.connection.appOpenedTitle', { defaultValue: 'Приложение открыто' })
              : t('subscription.connection.subscriptionAddedTitle', {
                  defaultValue: 'Подписка передана',
                })}
          </div>
          <div className="mt-0.5 text-[11px] leading-relaxed text-[#d4b37f]/[0.66]">
            {returnNoticeStep === 2
              ? t('subscription.connection.appOpenedDesc', {
                  defaultValue: 'Если установка завершена, переходите к добавлению подписки.',
                })
              : t('subscription.connection.subscriptionAddedDesc', {
                  defaultValue: 'Осталось включить VPN и проверить подключение.',
                })}
          </div>
        </div>
      </div>
    ) : null;

  const primaryDisabled =
    (step === 1 && !(selectedInstallUrl || setupUrls.installUrl)) ||
    (step === 2 && !setupUrls.addSubscriptionUrl) ||
    (step === 3 && !appLaunchUrl);
  const primaryLabel =
    step === 1
      ? selectedInstallOption
        ? selectedInstallOption.kind === 'download'
          ? t('subscription.connection.downloadAppAction', {
              defaultValue: 'Скачать приложение',
            })
          : t('subscription.connection.installVia', {
              source: selectedInstallOption.label,
              defaultValue: 'Установить через {{source}}',
            })
        : t('subscription.connection.installAction', { defaultValue: 'Установить приложение' })
      : step === 2
        ? t('subscription.connection.addToSelectedApp', {
            app: selectedAppName,
            defaultValue: 'Добавить в {{app}}',
          })
        : t('subscription.connection.openVpnApp', {
            app: selectedAppName,
            defaultValue: 'Открыть {{app}}',
          });

  const connectionContent = (
    <div className="space-y-3 lg:space-y-4" data-testid="ultima-connection-guide">
      {renderMobileProgress()}
      {returnNotice}
      <section className={cn(ultimaPanelClassName, 'p-4 sm:p-5 lg:p-6')} style={ultimaSurfaceStyle}>
        {renderPicker()}
      </section>

      <section
        className={cn(ultimaPanelClassName, 'overflow-hidden p-4 sm:p-5 lg:p-6')}
        style={ultimaSurfaceStyle}
      >
        <header className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-[#d4b37f]/[0.2] bg-[#d4b37f]/[0.1] text-[#d4b37f] lg:rounded-[7px]">
            <CurrentStepIcon className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-medium text-[#d4b37f]/[0.62]">
              {t('subscription.connection.stepCounter', {
                current: step,
                total: 3,
                defaultValue: 'Шаг {{current}} из {{total}}',
              })}
            </div>
            <h2 className="mt-1 text-[20px] font-semibold leading-tight text-white sm:text-[22px]">
              {currentStep.title}
            </h2>
            <p className="mt-1.5 max-w-[62ch] text-[12px] leading-relaxed text-white/[0.56] sm:text-[13px]">
              {currentStep.description}
            </p>
          </div>
        </header>

        {step === 1 && showInfo ? (
          <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-[#d4b37f]/[0.12] bg-[#d4b37f]/[0.055] px-3.5 py-3 lg:rounded-[7px]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#d4b37f]/[0.74]" strokeWidth={1.8} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] leading-relaxed text-white/[0.65]">
                {importantInfoDescription}
              </p>
              {canPermanentlyHideReminder ? (
                <button
                  type="button"
                  onClick={hideReminderPermanently}
                  className="mt-1.5 text-[10px] font-medium text-[#d4b37f]/[0.65] hover:text-[#d4b37f]"
                >
                  {t('subscription.connection.hideReminderPermanently', {
                    defaultValue: 'Больше не показывать',
                  })}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={dismissReminderForNow}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] text-white/[0.44] hover:bg-white/[0.05] hover:text-white/[0.72]"
              aria-label={t('common.close', { defaultValue: 'Закрыть' })}
            >
              <X className="h-4 w-4" strokeWidth={1.9} />
            </button>
          </div>
        ) : null}

        <div className="mt-5">
          {step === 2 ? (
            <div className="space-y-3">
              <div role="group" aria-label="Способ добавления подписки" className="grid grid-cols-2 gap-2">
                {([{ id: 'link', label: 'Ссылка', Icon: Link2 }, { id: 'qr', label: 'QR-код', Icon: QrCode }] as const).map(({ id, label, Icon }) => (
                  <button key={id} type="button" data-testid={`ultima-connection-method-${id}`} aria-pressed={importMethod === id}
                    onClick={() => { setImportMethod(id); setCopyState('idle'); }}
                    className={cn('flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-[14px] font-medium', importMethod === id ? 'cabinet-primary-action' : 'cabinet-glass-control')}>
                    <Icon aria-hidden="true" className="h-5 w-5" />{label}
                  </button>
                ))}
              </div>
              {importMethod === 'qr' && setupUrls.addSubscriptionUrl ? (
                <div className="space-y-3 text-center" data-testid="ultima-connection-qr-panel">
                  <div className="mx-auto w-fit rounded-2xl bg-white p-4" data-testid="ultima-connection-qr" data-connection-uri={setupUrls.addSubscriptionUrl}>
                    <QRCodeSVG value={setupUrls.addSubscriptionUrl} size={224} level="M" marginSize={4} style={{ width: 'min(224px, 60vw)', height: 'auto' }} />
                  </div>
                  <p className="text-[14px] leading-relaxed">Откройте сканер QR-кода в {selectedAppName} и наведите камеру на код.</p>
                </div>
              ) : null}
              {importMethod === 'link' && setupUrls.addSubscriptionUrl ? (
                <button type="button" data-testid="ultima-connection-copy-link" className="cabinet-glass-control flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-3 text-[14px]"
                  onClick={async () => { try { await copyToClipboard(setupUrls.addSubscriptionUrl!); setCopyState('copied'); } catch { setCopyState('failed'); } }}>
                  <Copy aria-hidden="true" className="h-4 w-4" />{copyState === 'copied' ? 'Ссылка скопирована' : copyState === 'failed' ? 'Не удалось скопировать — повторить' : 'Скопировать ссылку'}
                </button>
              ) : null}
              <div
                className={cn(ultimaPaneClassName, 'flex items-start gap-3 px-3.5 py-3')}
                style={ultimaPaneSurfaceStyle}
              >
                <Link2
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#d4b37f]/[0.76]"
                  strokeWidth={1.8}
                />
                <div>
                  <div className="text-[12px] font-semibold text-white">
                    {importMethod === 'qr' ? 'Добавление по QR-коду' : 'Открыть ссылку в приложении'}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/[0.5]">
                    {importMethod === 'qr' ? 'QR-код передаёт ту же ссылку подписки в выбранное приложение.' : t('subscription.connection.oneTapImportDesc', {
                      defaultValue:
                        'Кнопка откроет выбранное приложение и передаст ссылку подписки автоматически.',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <div
                className={cn(
                  ultimaPaneClassName,
                  'flex items-start gap-3 border-[#d4b37f]/[0.16] px-3.5 py-3.5',
                )}
                style={ultimaPaneSurfaceStyle}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#d4b37f]/[0.12] text-[#d4b37f] lg:rounded-[6px]">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-white">
                    {t('subscription.connection.readyTitle', {
                      defaultValue: 'Все готово к подключению',
                    })}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/[0.54]">
                    {t('subscription.connection.readyDesc', {
                      app: selectedAppName,
                      defaultValue:
                        'Откройте {{app}}, включите VPN и вернитесь для завершения настройки.',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-5 border-t border-white/[0.07] pt-4">
          {!(step === 2 && importMethod === 'qr') && <button
            type="button"
            data-testid="ultima-connection-primary-action"
            onClick={
              step === 1 ? startInstallFlow : step === 2 ? startAddSubscriptionFlow : openToggleVpn
            }
            disabled={primaryDisabled}
            className="ultima-btn-pill ultima-btn-primary flex min-h-[48px] w-full items-center justify-center gap-2 px-4 py-3 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-45"
          >
            {step === 1 ? (
              <Download className="h-4 w-4" strokeWidth={2} />
            ) : step === 2 ? (
              <Link2 className="h-4 w-4" strokeWidth={2} />
            ) : (
              <ExternalLink className="h-4 w-4" strokeWidth={2} />
            )}
            <span className="min-w-0 break-words text-center">{primaryLabel}</span>
          </button>}

          {primaryDisabled ? (
            <p className="mt-2 text-center text-[11px] leading-relaxed text-amber-100/[0.65]">
              {t('subscription.connection.actionUnavailable', {
                defaultValue: 'Для выбранного приложения действие пока не настроено.',
              })}
            </p>
          ) : null}

          {step === 1 ? (
            <button
              type="button"
              data-testid="ultima-connection-secondary-action"
              onClick={confirmAppInstalled}
              className="mt-2.5 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-[13px] text-[12px] font-medium text-white/[0.62] transition-colors hover:bg-white/[0.04] hover:text-white lg:rounded-[6px]"
            >
              {t('subscription.connection.alreadyInstalled', {
                defaultValue: 'Приложение уже установлено',
              })}
              <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
          ) : step === 2 ? (
            <button
              type="button"
              data-testid="ultima-connection-secondary-action"
              onClick={confirmSubscriptionAdded}
              className="mt-2.5 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-[13px] text-[12px] font-medium text-white/[0.62] transition-colors hover:bg-white/[0.04] hover:text-white lg:rounded-[6px]"
            >
              {t('subscription.connection.alreadyAdded', {
                defaultValue: 'Подписка уже добавлена',
              })}
              <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
          ) : (
            <button
              type="button"
              data-testid="ultima-connection-finish-action"
              onClick={finishFlow}
              disabled={showFinishSuccess}
              className="ultima-btn-pill ultima-btn-secondary mt-2.5 flex min-h-[46px] w-full items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.9} />
              {t('subscription.connection.confirmWorking', {
                defaultValue: 'VPN работает — завершить',
              })}
            </button>
          )}
        </div>
      </section>

      <VpnDiagnostics client={selectedApp?.name} platform={activePlatformKey} importReady={selectedApp ? Boolean(setupUrls.addSubscriptionUrl) : null}
        onSupport={(context) => navigate('/support', { state: { vpnDiagnostics: context } })} />
      <button
        type="button"
        onClick={() => navigate('/support')}
        className="flex min-h-[48px] w-full items-center gap-3 rounded-[17px] border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5 text-left text-white/[0.66] transition-colors hover:bg-white/[0.05] hover:text-white"
      >
        <CircleHelp className="h-5 w-5 shrink-0" strokeWidth={1.8} />
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-semibold">
            {t('subscription.connection.needHelp', { defaultValue: 'Нужна помощь?' })}
          </span>
          <span className="mt-0.5 block text-[10px] text-white/[0.42]">
            {t('subscription.connection.supportHint', {
              defaultValue: 'Откроем поддержку и поможем с подключением.',
            })}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={1.8} />
      </button>
    </div>
  );

  const bottomNav = <UltimaBottomNav active="connection" />;
  const completionOverlay = showFinishSuccess ? createPortal(
    <div className="cabinet-success-overlay fixed inset-0 z-[100] flex items-center justify-center p-5 backdrop-blur-sm">
      <GlassCelebration />
      <div
        role="status"
        className="cabinet-content-card relative z-10 w-full max-w-[330px] rounded-[20px] border px-5 py-6 text-center shadow-2xl"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#d4b37f]/[0.14] text-[#d4b37f]">
          <CheckCircle2 className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <div className="mt-3 text-[17px] font-semibold text-white">
          {t('subscription.connection.completedTitle', { defaultValue: 'Настройка завершена' })}
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-white/[0.52]">
          {t('subscription.connection.completedDesc', {
            defaultValue: 'VPN готов к работе. Возвращаемся на главную.',
          })}
        </p>
      </div>
    </div>, document.body
  ) : null;

  if (isDesktop) {
    return (
      <div className="min-h-screen bg-[#07080a] text-white">
        <UltimaDesktopNavbar />
        <main className="mx-auto max-w-6xl px-6 py-6">
          <header className="mb-7">
            <h1 className="text-3xl font-semibold tracking-tight">
              {t('subscription.connection.setupPageTitle', { defaultValue: 'Настройка VPN' })}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              {t('subscription.connection.setupPageSubtitle', {
                defaultValue: 'Установите приложение и добавьте подписку за три коротких шага.',
              })}
            </p>
          </header>
          <div className="max-w-[820px]">{connectionContent}</div>
        </main>
        {completionOverlay}
      </div>
    );
  }

  return (
    <div className="ultima-shell ultima-shell-wide ultima-flat-frames">
      <div className="ultima-shell-aura" />
      <div className="ultima-shell-inner ultima-shell-mobile-docked">
        <header className="mb-2.5">
          <h1 className="text-[clamp(30px,8vw,38px)] font-semibold leading-none text-white">
            {t('subscription.connection.setupPageTitle', { defaultValue: 'Настройка VPN' })}
          </h1>
          <p className="mt-1.5 max-w-[42ch] text-[12px] leading-relaxed text-white/[0.54]">
            {t('subscription.connection.setupPageSubtitle', {
              defaultValue: 'Установите приложение и добавьте подписку за три коротких шага.',
            })}
          </p>
        </header>

        <div className="ultima-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
          {connectionContent}
        </div>

        <div className="ultima-mobile-dock-footer">
          <div className="ultima-nav-dock">{bottomNav}</div>
        </div>
      </div>
      {completionOverlay}
    </div>
  );
}
