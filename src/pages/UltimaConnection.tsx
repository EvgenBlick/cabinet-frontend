import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import {
  Check,
  ChevronRight,
  CircleHelp,
  Copy,
  Download,
  ExternalLink,
  Laptop,
  Monitor,
  Radio,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tv,
  Zap,
} from 'lucide-react';
import { subscriptionApi } from '@/api/subscription';
import { UltimaBottomNav } from '@/components/ultima/UltimaBottomNav';
import { usePlatform } from '@/platform';
import { copyToClipboard } from '@/utils/clipboard';
import type { AppConfig } from '@/types';

type UltimaConnectionProps = {
  appConfig: AppConfig;
  onOpenDeepLink: (url: string) => void;
  onGoBack: () => void;
  onRefreshAppConfig?: () => void;
};

type PlatformTab = 'ios' | 'android' | 'windows' | 'macos' | 'tv';

const DEFAULT_PLATFORM_APPS: Record<
  PlatformTab,
  {
    name: string;
    description: string;
    recommended: boolean;
    downloads: { label: string; url: string; kind: 'store' | 'apk' | 'direct' }[];
  }[]
> = {
  ios: [
    {
      name: 'Happ (Рекомендуется)',
      description: 'Официальный современный клиент с поддержкой VLESS, Reality и авто-подключения.',
      recommended: true,
      downloads: [
        {
          label: 'App Store',
          url: 'https://apps.apple.com/app/happ-proxy-utility/id6504287215',
          kind: 'store',
        },
      ],
    },
    {
      name: 'Streisand',
      description: 'Быстрый и надежный VPN-клиент для iOS и iPadOS с поддержкой Xray.',
      recommended: false,
      downloads: [
        {
          label: 'App Store',
          url: 'https://apps.apple.com/app/streisand/id6450534064',
          kind: 'store',
        },
      ],
    },
  ],
  android: [
    {
      name: 'Happ (Рекомендуется)',
      description:
        'Максимальная скорость, маскировка трафика и быстрое добавление подписки в 1 клик.',
      recommended: true,
      downloads: [
        {
          label: 'Google Play',
          url: 'https://play.google.com/store/apps/details?id=com.happproxy',
          kind: 'store',
        },
        {
          label: 'Скачать APK (Прямая ссылка)',
          url: 'https://github.com/happ-proxy/happ-android/releases/latest',
          kind: 'apk',
        },
      ],
    },
    {
      name: 'v2rayNG',
      description: 'Классический проверенный клиент с тонкой настройкой маршрутизации.',
      recommended: false,
      downloads: [
        {
          label: 'Google Play',
          url: 'https://play.google.com/store/apps/details?id=com.v2ray.ang',
          kind: 'store',
        },
        {
          label: 'GitHub APK',
          url: 'https://github.com/2dust/v2rayNG/releases/latest',
          kind: 'apk',
        },
      ],
    },
  ],
  windows: [
    {
      name: 'Happ for Windows',
      description: 'Удобное приложение для Windows 10/11 с системным прокси и авто-запуском.',
      recommended: true,
      downloads: [
        {
          label: 'Скачать установщик (.exe)',
          url: 'https://github.com/happ-proxy/happ-desktop/releases/latest',
          kind: 'direct',
        },
      ],
    },
    {
      name: 'v2rayN',
      description: 'Мощный полнофункциональный клиент для опытных пользователей.',
      recommended: false,
      downloads: [
        {
          label: 'GitHub Release (.zip)',
          url: 'https://github.com/2dust/v2rayN/releases/latest',
          kind: 'direct',
        },
      ],
    },
  ],
  macos: [
    {
      name: 'Happ for Mac',
      description: 'Нативное приложение с поддержкой Apple Silicon M1/M2/M3/M4 и Intel.',
      recommended: true,
      downloads: [
        {
          label: 'Mac App Store',
          url: 'https://apps.apple.com/app/happ-proxy-utility/id6504287215',
          kind: 'store',
        },
      ],
    },
    {
      name: 'Streisand for Mac',
      description: 'Легкий и удобный клиент с быстрой интеграцией в строку меню.',
      recommended: false,
      downloads: [
        {
          label: 'Mac App Store',
          url: 'https://apps.apple.com/app/streisand/id6450534064',
          kind: 'store',
        },
      ],
    },
  ],
  tv: [
    {
      name: 'Happ Android TV',
      description: 'Адаптированный интерфейс для телевизоров и ТВ-приставок с управлением пультом.',
      recommended: true,
      downloads: [
        {
          label: 'Скачать APK для Android TV',
          url: 'https://github.com/happ-proxy/happ-android/releases/latest',
          kind: 'apk',
        },
      ],
    },
  ],
};

export function UltimaConnection({ appConfig, onOpenDeepLink }: UltimaConnectionProps) {
  const navigate = useNavigate();
  const { openLink } = usePlatform();
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState<PlatformTab>(() => {
    if (typeof window !== 'undefined' && navigator?.userAgent) {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) return 'ios';
      if (/android/.test(ua)) return /tv|television/.test(ua) ? 'tv' : 'android';
      if (/macintosh|mac os x/.test(ua)) return 'macos';
      if (/windows/.test(ua)) return 'windows';
    }
    return 'android';
  });

  // Query subscription for fresh URL
  const { data: subscriptionResponse } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
    staleTime: 15000,
  });

  const subscription = subscriptionResponse?.subscription as
    | (Subscription & { url?: string; subscription_url?: string })
    | undefined;
  const subscriptionUrl =
    subscription?.url ||
    subscription?.subscription_url ||
    appConfig?.subscriptionUrl ||
    'https://samuraiservice.org/sub/connect';

  const happDeepLink = useMemo(() => {
    if (appConfig?.subscriptionCryptoLink) {
      return appConfig.subscriptionCryptoLink;
    }
    if (subscriptionUrl) {
      return `happ://add/crypt3#${encodeURIComponent(subscriptionUrl)}`;
    }
    return 'happ://';
  }, [appConfig?.subscriptionCryptoLink, subscriptionUrl]);

  const handleCopySubscription = async () => {
    if (!subscriptionUrl) return;
    await copyToClipboard(subscriptionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenHapp = () => {
    if (happDeepLink) {
      onOpenDeepLink(happDeepLink);
    } else {
      openLink(subscriptionUrl);
    }
  };

  const platformApps = DEFAULT_PLATFORM_APPS[activePlatform] || DEFAULT_PLATFORM_APPS.android;

  return (
    <div className="min-h-screen px-3 pb-36 pt-3 text-white">
      <div className="mx-auto flex max-w-[540px] flex-col gap-3.5">
        {/* 1. Header */}
        <div className="px-1">
          <h1 className="text-[26px] font-bold text-[#f5f5f7] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            Подключение VPN
          </h1>
          <p className="mt-0.5 text-[13px] font-medium text-[#8e929b]">
            Подключение в 1 клик или через сканирование QR-кода
          </p>
        </div>

        {/* 2. Hero 1-Click Fast Connect & QR Card */}
        <div
          className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
          style={{
            background:
              'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
          }}
        >
          {/* Card Header with Badges */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#d4b37f]" />
              <span className="text-[14px] font-bold uppercase tracking-wider text-[#f5f5f7]">
                Быстрое подключение
              </span>
            </div>
            <span className="flex items-center gap-1 rounded-full border border-[#b89358]/40 bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-[#d4b37f]">
              <Sparkles className="h-3 w-3" />1 КЛИК
            </span>
          </div>

          {/* QR Code Section */}
          <div className="mt-5 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center rounded-[22px] border-2 border-[#b89358]/40 bg-white p-3.5 shadow-[0_0_28px_rgba(212,179,127,0.22)]">
              <QRCodeSVG value={subscriptionUrl} size={180} level="M" includeMargin={false} />
            </div>
            <p className="mt-2.5 text-center text-[11px] font-medium text-[#8e929b]">
              Наведите камеру в приложении Happ, v2rayNG или Streisand
            </p>
          </div>

          {/* Action CTAs */}
          <div className="mt-5 flex flex-col gap-2.5">
            {/* Primary Action Button with Rotating Gold Beam */}
            <div className="btn-gold-beam w-full">
              <button
                type="button"
                onClick={handleOpenHapp}
                className="btn-gold-beam-inner flex min-h-[48px] w-full items-center justify-center gap-2 px-4 py-2.5 text-[14px] font-bold text-[#0a0c0f]"
              >
                <Radio className="h-4 w-4 shrink-0" />
                <span>Открыть в приложении Happ</span>
                <ChevronRight className="h-4 w-4 opacity-80" />
              </button>
            </div>

            {/* Secondary Action: Copy Link */}
            <button
              type="button"
              onClick={handleCopySubscription}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-[13px] font-semibold text-[#f5f5f7] backdrop-blur-md transition-colors hover:bg-white/[0.08] active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Ссылка скопирована в буфер!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-[#d4b37f]" />
                  <span>Скопировать ссылку подписки</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. 3-Step Setup Guide */}
        <div
          className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
          style={{
            background:
              'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#d4b37f]" />
            <h2 className="text-[15px] font-bold text-[#f5f5f7]">Инструкция в 3 шага</h2>
          </div>

          <div className="mt-4 flex flex-col gap-3.5">
            {/* Step 1 */}
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-black/40 p-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#b89358]/50 bg-[#d4b37f]/15 text-[12px] font-bold text-[#d4b37f]">
                1
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-[#f5f5f7]">Установите приложение Happ</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#8e929b]">
                  Скачайте клиент из App Store, Google Play или прямым файлом APK ниже.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-black/40 p-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#b89358]/50 bg-[#d4b37f]/15 text-[12px] font-bold text-[#d4b37f]">
                2
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-[#f5f5f7]">Добавьте подписку</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#8e929b]">
                  Нажмите кнопку «Открыть в приложении Happ» выше или отсканируйте QR-код.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-black/40 p-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#b89358]/50 bg-[#d4b37f]/15 text-[12px] font-bold text-[#d4b37f]">
                3
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-[#f5f5f7]">Включите защиту</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#8e929b]">
                  В приложении выберите ближайшую локацию и нажмите большую круглую кнопку
                  подключения.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Platform App Catalog */}
        <div
          className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
          style={{
            background:
              'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-[#d4b37f]" />
              <h2 className="text-[15px] font-bold text-[#f5f5f7]">Приложения для устройств</h2>
            </div>
          </div>

          {/* Platform Selector Tabs */}
          <div className="mt-3.5 grid grid-cols-5 gap-1.5 rounded-2xl border border-white/[0.08] bg-black/50 p-1">
            {[
              { id: 'ios', label: 'iOS', icon: Smartphone },
              { id: 'android', label: 'Android', icon: Smartphone },
              { id: 'windows', label: 'Win', icon: Monitor },
              { id: 'macos', label: 'Mac', icon: Laptop },
              { id: 'tv', label: 'TV', icon: Tv },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activePlatform === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePlatform(tab.id as PlatformTab)}
                  className={`flex min-h-[38px] flex-col items-center justify-center gap-1 rounded-xl py-1 text-[11px] font-bold transition-all ${
                    isActive
                      ? 'border border-[#b89358]/60 bg-gradient-to-r from-[#d4b37f] to-[#b89358] text-[#0a0c0f] shadow-sm'
                      : 'text-[#8e929b] hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Platform Clients List */}
          <div className="mt-4 flex flex-col divide-y divide-white/[0.07]">
            {platformApps.map((app, i) => (
              <div key={i} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[14px] font-bold text-[#f5f5f7]">{app.name}</h3>
                  {app.recommended && (
                    <span className="rounded-full border border-[#b89358]/40 bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase text-[#d4b37f]">
                      ТОП ВЫБОР
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-[#8e929b]">{app.description}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {app.downloads.map((dl, j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => openLink(dl.url)}
                      className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-[12px] font-semibold text-[#f5f5f7] transition-all hover:border-[#d4b37f]/50 hover:bg-white/[0.08]"
                    >
                      <Download className="h-3.5 w-3.5 text-[#d4b37f]" />
                      <span>{dl.label}</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Support CTA Banner */}
        <button
          type="button"
          onClick={() => navigate('/support')}
          className="relative flex items-center justify-between overflow-hidden rounded-[22px] border border-[#5a5040]/30 p-4 shadow-md transition-all hover:border-[#d4b37f]/50 active:scale-[0.99]"
          style={{
            background: 'linear-gradient(180deg, #16191f 0%, #0d0f13 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#b89358]/35 bg-[#d4b37f]/10 text-[#d4b37f]">
              <CircleHelp className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold text-[#f5f5f7]">Нужна помощь с настройкой?</p>
              <p className="mt-0.5 text-[11px] text-[#8e929b]">
                Откроем поддержку и поможем настроить любое устройство
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[#8e929b]" />
        </button>
      </div>

      {/* 6. Fixed Bottom Navigation Dock */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 lg:hidden">
        <div className="pointer-events-auto mx-auto max-w-[540px]">
          <UltimaBottomNav active="connection" />
        </div>
      </div>
    </div>
  );
}
