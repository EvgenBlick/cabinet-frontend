import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Laptop,
  QrCode,
  Smartphone,
  Tv,
  Zap,
} from 'lucide-react';
import { subscriptionApi } from '@/api/subscription';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';
import { CyberParticleCanvas } from '../components/CyberParticleCanvas';
import { CyberFloatingDock } from '../components/CyberFloatingDock';
import { FreshQrModal } from '@/themes/fresh/components/FreshQrModal';

const PLATFORM_GUIDES = {
  ios: {
    id: 'ios',
    title: 'iOS & iPadOS',
    icon: Smartphone,
    recommendedApp: 'Happ (Рекомендуется)',
    recommendedDesc:
      'Официальный современный клиент с поддержкой авто-подключения и умного обхода блокировок.',
    appStoreUrl: 'https://apps.apple.com/app/happ-proxy-utility/id6504287215',
    altApp: 'Incy',
    altDesc: 'Удобное альтернативное приложение Incy для iOS.',
    altUrl: 'https://apps.apple.com',
  },
  android: {
    id: 'android',
    title: 'Android',
    icon: Smartphone,
    recommendedApp: 'Happ (Рекомендуется)',
    recommendedDesc:
      'Максимальная скорость, маскировка трафика и быстрое добавление подписки в 1 клик.',
    appStoreUrl: 'https://play.google.com/store/apps/details?id=com.happproxy',
    apkUrl: 'https://github.com/happ-proxy/happ-android/releases/latest',
    altApp: 'Incy',
    altDesc: 'Приложение Incy для Android.',
    altUrl: 'https://play.google.com',
  },
  windows: {
    id: 'windows',
    title: 'Windows',
    icon: Laptop,
    recommendedApp: 'Happ для Windows',
    recommendedDesc: 'Быстрый запуск в системном трее и авто-обновление конфигураций.',
    appStoreUrl: 'https://github.com/happ-proxy/happ-windows/releases/latest',
    altApp: 'Incy Desktop',
    altDesc: 'Клиент Incy для Windows ПК.',
    altUrl: 'https://github.com',
  },
  macos: {
    id: 'macos',
    title: 'macOS',
    icon: Laptop,
    recommendedApp: 'Happ для Mac',
    recommendedDesc: 'Нативная поддержка Apple Silicon (M1/M2/M3/M4) и Intel.',
    appStoreUrl: 'https://apps.apple.com/app/happ-proxy-utility/id6504287215',
    altApp: 'Incy для Mac',
    altDesc: 'Клиент Incy для macOS.',
    altUrl: 'https://apps.apple.com',
  },
  tv: {
    id: 'tv',
    title: 'Android TV',
    icon: Tv,
    recommendedApp: 'Happ TV',
    recommendedDesc: 'Специальная версия Happ, оптимизированная под пульт телевизора.',
    appStoreUrl: 'https://play.google.com/store/apps/details?id=com.happproxy',
    altApp: 'Incy TV',
    altDesc: 'Приложение Incy для Smart TV и приставок.',
    altUrl: 'https://play.google.com',
  },
};

export const CyberConnectionPage: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<keyof typeof PLATFORM_GUIDES>('ios');
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const { config } = useThemeEngine();

  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
  });

  const subscription = subData?.subscription;
  const subscriptionUrl =
    (subscription as any)?.subscription_url ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/api/sub/${(subscription as any)?.id || 'demo'}`
      : 'https://samuraiservice.top/sub/connect');

  const accent = config.accentColor || '#00ff66';
  const guide = PLATFORM_GUIDES[selectedPlatform];

  const handleCopy = () => {
    navigator.clipboard.writeText(subscriptionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handle1ClickHapp = () => {
    const rawHappUrl = `happ://add/crypt3#${encodeURIComponent(subscriptionUrl)}`;
    window.location.href = rawHappUrl;
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#040705] pb-32 text-[#f5f5f7] selection:bg-emerald-500/30 selection:text-white">
      <CyberParticleCanvas />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        {/* Top Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-1.5 text-xs text-[#8e9690]">
            <span
              className="h-2 w-2 animate-pulse rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span className="font-bold text-white">Инструкция по подключению</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Подключение всех устройств
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs text-[#8e9690] sm:text-sm">
            Выберите вашу операционную систему, скачайте официальный клиент и добавьте подписку в
            один клик.
          </p>
        </div>

        {/* Platform Selector Segmented Bar */}
        <div className="mt-8 flex items-center justify-center overflow-x-auto pb-2">
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#080d0a]/90 p-1.5 shadow-2xl backdrop-blur-2xl">
            {Object.values(PLATFORM_GUIDES).map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPlatform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlatform(p.id as any)}
                  className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-white/15 text-white shadow-md'
                      : 'text-[#8e9690] hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" style={{ color: isSelected ? accent : undefined }} />
                  <span>{p.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Platform Guide Bento Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: 3 Connection Steps (7 cols) */}
          <div className="space-y-4 lg:col-span-7">
            {/* Step 1: Download App */}
            <div className="rounded-3xl border border-white/10 bg-[#080d0a]/90 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-black"
                  style={{ backgroundColor: accent }}
                >
                  1
                </span>
                <h3 className="text-base font-bold text-white">Установите приложение</h3>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-[#050806] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{guide.recommendedApp}</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ backgroundColor: `${accent}20`, color: accent }}
                      >
                        Рекомендуем
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#8e9690]">{guide.recommendedDesc}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <a
                    href={guide.appStoreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-black shadow-lg transition-transform hover:scale-105"
                    style={{ backgroundColor: accent }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Скачать из Store</span>
                  </a>

                  {(guide as any).apkUrl && (
                    <a
                      href={(guide as any).apkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Скачать APK</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Alternative App (Incy) */}
              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                <div>
                  <span className="font-semibold text-white">{guide.altApp}</span>
                  <span className="ml-2 text-[#8e9690]">{guide.altDesc}</span>
                </div>
                <a
                  href={guide.altUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#8e9690] hover:text-white"
                >
                  <span>Перейти</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Step 2: Import Subscription */}
            <div className="rounded-3xl border border-white/10 bg-[#080d0a]/90 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-black"
                  style={{ backgroundColor: accent }}
                >
                  2
                </span>
                <h3 className="text-base font-bold text-white">Добавьте подписку</h3>
              </div>

              <p className="mt-2 text-xs text-[#8e9690]">
                Нажмите кнопку для моментального авто-импорта или скопируйте персональный ключ
                подписки.
              </p>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={handle1ClickHapp}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-black shadow-lg transition-transform hover:scale-105"
                  style={{
                    backgroundColor: accent,
                    boxShadow: `0 0 20px ${config.accentGlowColor}`,
                  }}
                >
                  <Zap className="h-4 w-4" />
                  <span>Открыть в приложении Happ</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-white/10"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="font-bold text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" style={{ color: accent }} />
                      <span>Копировать ключ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 3: Connect & Enjoy */}
            <div className="rounded-3xl border border-white/10 bg-[#080d0a]/90 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-black"
                  style={{ backgroundColor: accent }}
                >
                  3
                </span>
                <h3 className="text-base font-bold text-white">Включите защиту</h3>
              </div>
              <p className="mt-2 text-xs text-[#8e9690]">
                В приложении нажмите круглую кнопку «Подключить» (Connect). Все сайты станут
                мгновенно доступны на максимальной скорости.
              </p>
            </div>
          </div>

          {/* Right Column: QR Card & Yandex Split Routing (5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            {/* QR Card */}
            <div className="rounded-3xl border border-white/10 bg-[#080d0a]/90 p-6 text-center shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  QR-код для камеры
                </span>
                <QrCode className="h-4 w-4" style={{ color: accent }} />
              </div>

              <div className="my-5 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setShowQr(true)}
                  className="group relative flex h-48 w-48 items-center justify-center rounded-2xl border border-white/10 bg-white p-3 shadow-2xl transition-transform hover:scale-105"
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(subscriptionUrl)}`}
                    alt="QR"
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <span className="rounded-xl bg-black/80 px-3 py-1.5 text-xs font-bold text-white">
                      Увеличить QR ↗
                    </span>
                  </div>
                </button>
                <p className="mt-3 text-xs text-[#8e9690]">
                  Наведите камеру в приложении Happ или Incy для моментального добавления
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowQr(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
              >
                <span>Развернуть на весь экран</span>
              </button>
            </div>

            {/* 🔥 Наша фишка: Умная маршрутизация Яндекса и РФ */}
            <div className="rounded-3xl border border-[#00ff66]/30 bg-gradient-to-br from-[#08140c]/90 to-[#040906]/95 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-black"
                  style={{ backgroundColor: accent }}
                >
                  Я
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Умная маршрутизация Яндекса и РФ
                </span>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-[#c4ceca]">
                Все сервисы <strong className="text-white">Яндекса</strong> (Музыка, Кинопоиск,
                Поиск, Карты, Такси), а также <strong>Госуслуги и Банки</strong> работают напрямую
                на максимальной скорости вашего провайдера без VPN. Трафик не расходуется, а
                YouTube, Instagram и ChatGPT защищены на 100%.
              </p>
            </div>
          </div>
        </div>
      </main>

      <CyberFloatingDock />

      <FreshQrModal
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        subscriptionUrl={subscriptionUrl}
      />
    </div>
  );
};
