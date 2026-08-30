import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Check,
  ChevronRight,
  CircleHelp,
  Copy,
  Download,
  ExternalLink,
  Monitor,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tv,
  Zap,
} from 'lucide-react';
import { subscriptionApi } from '@/api/subscription';
import { UltimaBottomNav } from '@/components/ultima/UltimaBottomNav';
import { UltimaDesktopNavbar } from '@/components/ultima/desktop/UltimaDesktopNavbar';
import { usePlatform } from '@/platform';
import { copyToClipboard } from '@/utils/clipboard';
import { resolveTemplate, hasTemplates } from '@/utils/templateEngine';
import { useAuthStore } from '@/store/auth';
import type {
  AppConfig,
  RemnawaveAppClient,
  RemnawavePlatformData,
  RemnawaveButtonClient,
  LocalizedText,
  Subscription,
} from '@/types';

type UltimaConnectionProps = {
  appConfig: AppConfig;
  onOpenDeepLink: (url: string) => void;
  onGoBack: () => void;
  onRefreshAppConfig?: () => void;
};

type DeviceCategory = 'mobile' | 'desktop' | 'tv';

const HAPP_TV_API = 'https://check.happ.su/sendtv';

function detectPlatform(): string {
  if (typeof window === 'undefined' || !navigator?.userAgent) return 'android';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return /tv|television/.test(ua) ? 'androidTV' : 'android';
  if (/macintosh|mac os x/.test(ua)) return 'macos';
  if (/windows/.test(ua)) return 'windows';
  if (/linux/.test(ua)) return 'linux';
  return 'android';
}

function getCategoryForPlatform(platform: string): DeviceCategory {
  if (platform === 'ios' || platform === 'android') return 'mobile';
  if (platform === 'windows' || platform === 'macos' || platform === 'linux') return 'desktop';
  return 'tv';
}

export function UltimaConnection({
  appConfig,
  onOpenDeepLink,
  onGoBack: _onGoBack,
}: UltimaConnectionProps) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { openLink } = usePlatform();
  const user = useAuthStore((state) => state.user);

  const initialPlatform = useMemo(() => detectPlatform(), []);
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>(() =>
    getCategoryForPlatform(initialPlatform),
  );

  const [activePlatformKey, setActivePlatformKey] = useState<string>(initialPlatform);
  const [copiedKey, setCopiedKey] = useState(false);

  // TV Quick Connect Code state
  const [tvCode, setTvCode] = useState('');
  const [tvSending, setTvSending] = useState(false);
  const [tvStatus, setTvStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  // Synchronize category when changing platform
  const handleSelectCategory = (cat: DeviceCategory) => {
    setDeviceCategory(cat);
    if (cat === 'mobile') {
      setActivePlatformKey(initialPlatform === 'ios' ? 'ios' : 'android');
    } else if (cat === 'desktop') {
      setActivePlatformKey(initialPlatform === 'macos' ? 'macos' : 'windows');
    } else {
      setActivePlatformKey('androidTV');
    }
  };

  // Subscription Data
  const { data: subscriptionResponse } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
    staleTime: 15000,
  });

  const subscription = subscriptionResponse?.subscription as
    | (Subscription & { url?: string; subscription_url?: string })
    | undefined;

  const rawSubscriptionUrl =
    subscription?.url ||
    subscription?.subscription_url ||
    appConfig?.subscriptionUrl ||
    '';

  const happCryptoLink = appConfig?.subscriptionCryptoLink?.trim() || null;
  const incyCryptoLink = appConfig?.subscriptionIncyCryptoLink?.trim() || null;

  // Active secure connection link (strictly crypt-protected to prevent raw link leaks)
  const activeSecureLink = happCryptoLink || incyCryptoLink || rawSubscriptionUrl;

  const getLocalizedText = useCallback(
    (text: LocalizedText | string | undefined): string => {
      if (!text) return '';
      if (typeof text === 'string') return text;
      const lang = i18n.language || 'ru';
      return text[lang] || text['ru'] || text['en'] || Object.values(text)[0] || '';
    },
    [i18n.language],
  );

  // Platform data & apps
  const currentPlatformData = appConfig?.platforms?.[activePlatformKey] as
    | RemnawavePlatformData
    | undefined;

  const currentPlatformApps = useMemo<RemnawaveAppClient[]>(() => {
    if (currentPlatformData?.apps && currentPlatformData.apps.length > 0) {
      return currentPlatformData.apps;
    }
    // Safe fallbacks
    if (activePlatformKey === 'ios') {
      return [
        {
          name: 'Happ',
          featured: true,
          deepLink: happCryptoLink || 'happ://add/crypt3#{{SUBSCRIPTION_LINK}}',
          buttons: [
            {
              text: { ru: 'App Store', en: 'App Store' },
              link: 'https://apps.apple.com/app/happ-proxy-utility/id6504287215',
              type: 'external',
            },
          ],
          blocks: [],
        },
      ];
    }
    if (activePlatformKey === 'android' || activePlatformKey === 'androidTV') {
      return [
        {
          name: 'Happ',
          featured: true,
          deepLink: happCryptoLink || 'happ://add/crypt3#{{SUBSCRIPTION_LINK}}',
          buttons: [
            {
              text: { ru: 'Google Play', en: 'Google Play' },
              link: 'https://play.google.com/store/apps/details?id=com.happproxy',
              type: 'external',
            },
            {
              text: { ru: 'Скачать APK', en: 'Download APK' },
              link: 'https://github.com/happ-proxy/happ-android/releases/latest',
              type: 'external',
            },
          ],
          blocks: [],
        },
      ];
    }
    return [
      {
        name: 'Happ',
        featured: true,
        deepLink: happCryptoLink || 'happ://add/crypt3#{{SUBSCRIPTION_LINK}}',
        buttons: [
          {
            text: { ru: 'Скачать клиент', en: 'Download' },
            link: 'https://github.com/happ-proxy/happ-windows/releases/latest',
            type: 'external',
          },
        ],
        blocks: [],
      },
    ];
  }, [currentPlatformData?.apps, activePlatformKey, happCryptoLink]);

  const [selectedAppIndex, setSelectedAppIndex] = useState(0);

  useEffect(() => {
    setSelectedAppIndex(0);
  }, [activePlatformKey]);

  const selectedApp = currentPlatformApps[selectedAppIndex] || currentPlatformApps[0];

  // Resolve template deep link
  const resolvedDeepLink = useMemo(() => {
    if (!selectedApp) return activeSecureLink;
    const rawLink = selectedApp.deepLink || selectedApp.urlScheme || '';
    if (!rawLink) {
      const appNameLower = (selectedApp.name || '').toLowerCase();
      if (appNameLower.includes('incy') && incyCryptoLink) return incyCryptoLink;
      if (happCryptoLink) return happCryptoLink;
      return activeSecureLink;
    }
    if (hasTemplates(rawLink)) {
      return resolveTemplate(rawLink, {
        subscriptionUrl: rawSubscriptionUrl || '',
        happCryptoLink: happCryptoLink || rawSubscriptionUrl,
        incyCryptoLink: incyCryptoLink || rawSubscriptionUrl,
        username: user?.username ?? undefined,
      });
    }
    return rawLink;
  }, [selectedApp, activeSecureLink, happCryptoLink, incyCryptoLink, rawSubscriptionUrl, user?.username]);

  const handleCopyLink = useCallback(async () => {
    const linkToCopy = resolvedDeepLink || activeSecureLink;
    if (!linkToCopy) return;
    await copyToClipboard(linkToCopy);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }, [resolvedDeepLink, activeSecureLink]);

  const handleOpenPrimary = () => {
    if (resolvedDeepLink) {
      onOpenDeepLink(resolvedDeepLink);
    } else if (activeSecureLink) {
      onOpenDeepLink(activeSecureLink);
    }
  };

  const getButtonLabel = (btn: RemnawaveButtonClient) => {
    const tLabel = getLocalizedText(btn.text);
    if (tLabel) return tLabel;
    const url = (btn.link || btn.url || btn.resolvedUrl || '').toLowerCase();
    if (url.includes('apps.apple.com')) return 'Скачать в App Store';
    if (url.includes('play.google.com')) return 'Скачать в Google Play';
    if (url.includes('github.com') || url.includes('.apk')) return 'Скачать APK (прямой файл)';
    if (url.includes('windows') || url.includes('.exe') || url.includes('.msi')) return 'Скачать для Windows';
    if (url.includes('macos') || url.includes('.dmg') || url.includes('.pkg')) return 'Скачать для macOS';
    return 'Скачать приложение';
  };

  // Send to TV Handler
  const handleSendToTv = async () => {
    const cleanCode = tvCode.trim().toUpperCase();
    if (cleanCode.length !== 5) {
      setTvStatus({ type: 'error', message: 'Введите 5-значный код с экрана ТВ' });
      return;
    }
    const linkToSend = happCryptoLink || rawSubscriptionUrl;
    if (!linkToSend) {
      setTvStatus({ type: 'error', message: 'Ключ подписки недоступен' });
      return;
    }

    setTvSending(true);
    setTvStatus(null);
    try {
      const base64Data = btoa(unescape(encodeURIComponent(linkToSend)));
      const res = await fetch(`${HAPP_TV_API}/${encodeURIComponent(cleanCode)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64Data }),
      });
      if (res.ok) {
        setTvStatus({
          type: 'success',
          message: '✓ Подписка успешно передана на ваш телевизор!',
        });
        setTvCode('');
      } else {
        setTvStatus({
          type: 'error',
          message: 'Код не найден. Проверьте код в приложении на ТВ.',
        });
      }
    } catch {
      setTvStatus({
        type: 'error',
        message: 'Ошибка отправки. Убедитесь, что телевизор подключен к сети.',
      });
    } finally {
      setTvSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-white">
      {/* Desktop Frosted Glass Navbar */}
      <div className="hidden lg:block">
        <UltimaDesktopNavbar
          onBuySubscription={() => navigate('/subscription')}
          onOpenSupport={() => navigate('/support')}
        />
      </div>

      <div className="mx-auto max-w-[580px] px-4 pb-44 pt-4 lg:max-w-4xl lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4b37f]/40 bg-gradient-to-b from-[#1c1f26] to-[#0a0c10] p-2 shadow-[0_0_24px_rgba(212,179,127,0.15)]">
            <ShieldCheck className="h-8 w-8 text-[#d4b37f]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#f5f5f7] sm:text-3xl">
            Подключение VPN
          </h1>
          <p className="mt-1 text-xs text-[#8e929b] sm:text-sm">
            Выберите ваше устройство для простой пошаговой настройки
          </p>
        </div>

        {/* 1. Device Category Switcher Tabs */}
        <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/[0.08] bg-black/60 p-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => handleSelectCategory('mobile')}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-bold transition-all ${
              deviceCategory === 'mobile'
                ? 'border border-[#b89358]/60 bg-gradient-to-r from-[#d4b37f] to-[#b89358] text-[#0a0c0f] shadow-[0_2px_12px_rgba(212,179,127,0.3)]'
                : 'text-[#8e929b] hover:text-white'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Телефон</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('desktop')}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-bold transition-all ${
              deviceCategory === 'desktop'
                ? 'border border-[#b89358]/60 bg-gradient-to-r from-[#d4b37f] to-[#b89358] text-[#0a0c0f] shadow-[0_2px_12px_rgba(212,179,127,0.3)]'
                : 'text-[#8e929b] hover:text-white'
            }`}
          >
            <Monitor className="h-4 w-4" />
            <span>Компьютер</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('tv')}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-bold transition-all ${
              deviceCategory === 'tv'
                ? 'border border-[#b89358]/60 bg-gradient-to-r from-[#d4b37f] to-[#b89358] text-[#0a0c0f] shadow-[0_2px_12px_rgba(212,179,127,0.3)]'
                : 'text-[#8e929b] hover:text-white'
            }`}
          >
            <Tv className="h-4 w-4" />
            <span>Телевизор</span>
          </button>
        </div>

        {/* Sub-platform toggle if relevant */}
        {deviceCategory === 'mobile' && (
          <div className="mb-6 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setActivePlatformKey('ios')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activePlatformKey === 'ios'
                  ? 'border border-[#d4b37f]/60 bg-[#d4b37f]/20 text-[#d4b37f]'
                  : 'border border-white/[0.08] bg-white/[0.03] text-[#8e929b] hover:text-white'
              }`}
            >
              iPhone / iPad (iOS)
            </button>
            <button
              type="button"
              onClick={() => setActivePlatformKey('android')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activePlatformKey === 'android'
                  ? 'border border-[#d4b37f]/60 bg-[#d4b37f]/20 text-[#d4b37f]'
                  : 'border border-white/[0.08] bg-white/[0.03] text-[#8e929b] hover:text-white'
              }`}
            >
              Android
            </button>
          </div>
        )}

        {deviceCategory === 'desktop' && (
          <div className="mb-6 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setActivePlatformKey('windows')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activePlatformKey === 'windows'
                  ? 'border border-[#d4b37f]/60 bg-[#d4b37f]/20 text-[#d4b37f]'
                  : 'border border-white/[0.08] bg-white/[0.03] text-[#8e929b] hover:text-white'
              }`}
            >
              Windows
            </button>
            <button
              type="button"
              onClick={() => setActivePlatformKey('macos')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activePlatformKey === 'macos'
                  ? 'border border-[#d4b37f]/60 bg-[#d4b37f]/20 text-[#d4b37f]'
                  : 'border border-white/[0.08] bg-white/[0.03] text-[#8e929b] hover:text-white'
              }`}
            >
              macOS
            </button>
          </div>
        )}

        {/* 2. ONBOARDING WIZARD STEPS */}
        {deviceCategory !== 'tv' ? (
          /* MOBILE & DESKTOP ONBOARDING FLOW */
          <div className="flex flex-col gap-4">
            {/* STEP 1: Download App */}
            <div className="samurai-bento-card relative overflow-hidden p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#b89358]/50 bg-[#d4b37f]/15 text-xs font-extrabold text-[#d4b37f]">
                  1
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#f5f5f7] sm:text-base">
                    Скачайте приложение {selectedApp?.name || 'Happ'}
                  </h2>
                  <p className="text-[11px] text-[#8e929b] sm:text-xs">
                    Если приложение уже установлено, переходите сразу ко 2 шагу
                  </p>
                </div>
              </div>

              {/* Download Action Buttons */}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {selectedApp?.buttons && selectedApp.buttons.length > 0 ? (
                  selectedApp.buttons.map((btn, idx) => {
                    const label = getButtonLabel(btn);
                    const link = btn.link || btn.url || btn.resolvedUrl || '';
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => openLink(link)}
                        className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl border border-[#d4b37f]/30 bg-white/[0.05] px-4 py-2.5 text-xs font-bold text-[#f5f5f7] transition-all hover:bg-[#d4b37f]/15 hover:border-[#d4b37f]/60 active:scale-[0.98]"
                      >
                        <Download className="h-4 w-4 text-[#d4b37f]" />
                        <span>{label}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </button>
                    );
                  })
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      openLink(
                        activePlatformKey === 'ios'
                          ? 'https://apps.apple.com/app/happ-proxy-utility/id6504287215'
                          : 'https://play.google.com/store/apps/details?id=com.happproxy',
                      )
                    }
                    className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl border border-[#d4b37f]/30 bg-white/[0.05] px-4 py-2.5 text-xs font-bold text-[#f5f5f7] transition-all hover:bg-[#d4b37f]/15"
                  >
                    <Download className="h-4 w-4 text-[#d4b37f]" />
                    <span>Скачать приложение</span>
                  </button>
                )}
              </div>
            </div>

            {/* STEP 2: Add Subscription */}
            <div className="samurai-bento-card relative overflow-hidden p-5 shadow-[0_12px_32px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(212,179,127,0.3)]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#b89358]/50 bg-[#d4b37f]/15 text-xs font-extrabold text-[#d4b37f]">
                    2
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#f5f5f7] sm:text-base">
                      Добавьте подписку
                    </h2>
                    <p className="text-[11px] text-[#8e929b] sm:text-xs">
                      Нажмите кнопку ниже для автоматического подключения
                    </p>
                  </div>
                </div>
                <span className="hidden items-center gap-1 rounded-full border border-[#b89358]/40 bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-[#d4b37f] sm:flex">
                  <Sparkles className="h-3 w-3" />1 КЛИК
                </span>
              </div>

              {/* Main Glowing Action Button */}
              <div className="mt-4">
                <div className="btn-gold-beam w-full">
                  <button
                    type="button"
                    onClick={handleOpenPrimary}
                    className="btn-gold-beam-inner flex min-h-[52px] w-full items-center justify-center gap-2.5 px-5 py-3 text-sm font-extrabold text-[#0a0c0f]"
                  >
                    <Zap className="h-4 w-4 shrink-0 fill-current" />
                    <span>Добавить подписку в {selectedApp?.name || 'Happ'}</span>
                    <ChevronRight className="h-4 w-4 opacity-80" />
                  </button>
                </div>
              </div>

              {/* Copy Key Button */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-[#8e929b] transition-all hover:bg-white/[0.06] hover:text-[#f5f5f7] active:scale-[0.98]"
                >
                  {copiedKey ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="font-bold text-emerald-400">Ключ успешно скопирован!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Скопировать ключ подключения вручную</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* STEP 3: Connect & Enjoy */}
            <div className="samurai-bento-card relative overflow-hidden p-5 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-xs font-bold text-[#8e929b]">
                  3
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#f5f5f7] sm:text-base">
                    Включите защиту
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#8e929b]">
                    В приложении {selectedApp?.name || 'Happ'} выберите любой сервер и нажмите главную кнопку включения. Защита активирована!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SMART TV ONBOARDING FLOW WITH NATIVE TV PUSH CODE */
          <div className="flex flex-col gap-4">
            {/* STEP 1: TV App */}
            <div className="samurai-bento-card relative overflow-hidden p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#b89358]/50 bg-[#d4b37f]/15 text-xs font-extrabold text-[#d4b37f]">
                  1
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#f5f5f7] sm:text-base">
                    Установите Happ на телевизор
                  </h2>
                  <p className="text-[11px] text-[#8e929b] sm:text-xs">
                    Найдите Happ в магазине приложений на Android TV или скачайте APK
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() =>
                    openLink('https://github.com/happ-proxy/happ-android/releases/latest')
                  }
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-bold text-[#f5f5f7] transition-all hover:bg-white/[0.08]"
                >
                  <Download className="h-4 w-4 text-[#d4b37f]" />
                  <span>Скачать APK для Android TV</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </button>
              </div>
            </div>

            {/* STEP 2: Send Code to TV */}
            <div className="samurai-bento-card relative overflow-hidden p-5 shadow-[0_12px_32px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(212,179,127,0.3)]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#b89358]/50 bg-[#d4b37f]/15 text-xs font-extrabold text-[#d4b37f]">
                  2
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#f5f5f7] sm:text-base">
                    Передайте подписку на телевизор
                  </h2>
                  <p className="text-[11px] text-[#8e929b] sm:text-xs">
                    Откройте Happ на ТВ — на экране высветится 5-значный код
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={5}
                    value={tvCode}
                    onChange={(e) => setTvCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="КОД С ТВ"
                    className="min-h-[48px] w-full rounded-xl border border-[#d4b37f]/40 bg-black/60 px-4 text-center font-mono text-lg font-bold tracking-widest text-[#f5f5f7] outline-none placeholder:text-[#8e929b]/50 focus:border-[#d4b37f] focus:ring-1 focus:ring-[#d4b37f]"
                  />
                  <button
                    type="button"
                    onClick={handleSendToTv}
                    disabled={tvSending || tvCode.trim().length !== 5}
                    className="samurai-gold-btn flex min-h-[48px] shrink-0 items-center gap-2 rounded-xl px-5 text-xs font-bold uppercase tracking-wider text-[#0a0c0f] shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                    <span>{tvSending ? 'Отправка...' : 'Отправить'}</span>
                  </button>
                </div>

                {tvStatus && (
                  <div
                    className={`rounded-xl p-3 text-center text-xs font-semibold ${
                      tvStatus.type === 'success'
                        ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {tvStatus.message}
                  </div>
                )}
              </div>
            </div>

            {/* STEP 3: Finish */}
            <div className="samurai-bento-card relative overflow-hidden p-5 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-xs font-bold text-[#8e929b]">
                  3
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#f5f5f7] sm:text-base">
                    Включите VPN на телевизоре
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#8e929b]">
                    Телевизор мгновенно применит вашу подписку. Нажмите кнопку включения на пульте ТВ и наслаждайтесь просмотром!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Support Banner */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/support')}
            className="samurai-bento-card relative flex w-full items-center justify-between overflow-hidden p-4 shadow-md transition-all hover:border-[#d4b37f]/50 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#b89358]/35 bg-[#d4b37f]/10 text-[#d4b37f]">
                <CircleHelp className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-[#f5f5f7]">Возникли сложности с настройкой?</p>
                <p className="mt-0.5 text-[11px] text-[#8e929b]">
                  Наша служба поддержки поможет подключить любое устройство
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#8e929b]" />
          </button>
        </div>
      </div>

      {/* Fixed Bottom Navigation Dock */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 lg:hidden">
        <div className="pointer-events-auto mx-auto max-w-[540px]">
          <UltimaBottomNav active="connection" />
        </div>
      </div>
    </div>
  );
}
