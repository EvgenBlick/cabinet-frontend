import React, { useState } from 'react';
import { ChevronDown, MessageCircle, Send } from 'lucide-react';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';
import { CyberParticleCanvas } from '../components/CyberParticleCanvas';
import { CyberFloatingDock } from '../components/CyberFloatingDock';

const FAQS = [
  {
    q: 'Как подключить VPN на телефоне или компьютере?',
    a: 'Перейдите в раздел «Подключение», скачайте официальный клиент Happ или Incy, затем нажмите кнопку «Открыть в приложении Happ» для моментального добавления подписки в один клик.',
  },
  {
    q: 'Как работает умная маршрутизация Яндекса и российских сервисов?',
    a: 'Система автоматически определяет запросы к Яндексу (Музыка, Кинопоиск, Карты, Такси), Госуслугам и мобильным банкам РФ и направляет их напрямую без VPN. Это обеспечивает максимальную скорость вашего провайдера и экономит трафик.',
  },
  {
    q: 'Что делать, если подключение не устанавливается?',
    a: '1. Убедитесь, что в приложении Happ включен режим TUN.\n2. В настройках подписки нажмите «Обновить» (Refresh).\n3. Попробуйте сменить сервер (Швеция, Нидерланды или Польша).\n4. Если проблема сохраняется, напишите в нашу поддержку 24/7 в Telegram.',
  },
  {
    q: 'Сколько устройств можно подключить одновременно?',
    a: 'По одной активной подписке можно одновременно использовать до 5 любых ваших устройств (iPhone, Android, Windows, Mac, Android TV).',
  },
  {
    q: 'Ведутся ли логи активности пользователей?',
    a: 'Нет. Мы строго придерживаемся политики Zero-Logs — никакие данные о посещаемых сайтах, DNS-запросах или переданных файлах не сохраняются на серверах.',
  },
];

export const CyberSupportPage: React.FC = () => {
  const { config } = useThemeEngine();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const accent = config.accentColor || '#00ff66';

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#040705] pb-32 text-[#f5f5f7] selection:bg-emerald-500/30 selection:text-white">
      <CyberParticleCanvas />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-10 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-1.5 text-xs text-[#8e9690]">
            <span
              className="h-2 w-2 animate-ping rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span className="font-bold text-white">Круглосуточная помощь 24/7</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Центр поддержки и FAQ
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs text-[#8e9690] sm:text-sm">
            Ответы на частые вопросы по настройке клиентов Happ и Incy, а также прямая связь с
            дежурным инженером.
          </p>
        </div>

        {/* Telegram Direct Support Banner */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#080d0a]/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#229ED9] text-white shadow-xl">
                <Send className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Чат поддержки в Telegram</h3>
                <p className="text-xs text-[#8e9690]">
                  Среднее время ответа оператора — менее 2 минут. Решаем любые вопросы по настройке.
                </p>
              </div>
            </div>

            <a
              href="https://t.me/support"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#229ED9] px-6 py-3.5 text-xs font-black text-white shadow-lg transition-transform hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Написать в Telegram</span>
            </a>
          </div>
        </div>

        {/* System Status Indicators */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#080d0a]/80 p-4">
            <span className="text-xs text-[#8e9690]">Европейские ноды</span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span
                className="h-2 w-2 animate-pulse rounded-full"
                style={{ backgroundColor: accent }}
              />
              100% Онлайн
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#080d0a]/80 p-4">
            <span className="text-xs text-[#8e9690]">Шлюз инкапсуляции</span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span
                className="h-2 w-2 animate-pulse rounded-full"
                style={{ backgroundColor: accent }}
              />
              VLESS / Hysteria2
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#080d0a]/80 p-4">
            <span className="text-xs text-[#8e9690]">Политика логов</span>
            <span className="font-mono text-xs font-bold text-white">Zero-Logs Active</span>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="mt-8 space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-white">
            Часто задаваемые вопросы:
          </h2>

          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#080d0a]/90 backdrop-blur-xl transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <span className="text-xs font-bold text-white sm:text-sm">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#8e9690] transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                    style={{ color: isOpen ? accent : undefined }}
                  />
                </button>

                {isOpen && (
                  <div className="whitespace-pre-line border-t border-white/5 px-5 pb-5 pt-3 text-xs leading-relaxed text-[#c4ceca]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <CyberFloatingDock />
    </div>
  );
};
