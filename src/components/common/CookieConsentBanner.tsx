import { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, KeyRound, Palette, Users, X } from 'lucide-react';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';

const COOKIE_CONSENT_KEY = 'samurai_cookie_consent_accepted_v1';

export function CookieConsentBanner() {
  const { isTelegramWebApp } = useTelegramSDK();
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Never show inside Telegram Mini App
    if (isTelegramWebApp) return;

    try {
      const accepted = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!accepted) {
        // Show unobtrusively after 1.5 seconds
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, [isTelegramWebApp]);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    } catch {
      // ignore
    }
    setVisible(false);
    setShowModal(false);
  };

  // Do not render inside Telegram WebApp or if dismissed
  if (isTelegramWebApp || (!visible && !showModal)) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      {visible && !showModal && (
        <div
          role="region"
          aria-label="Уведомление о файлах cookie"
          className="pointer-events-none fixed bottom-3 left-3 right-3 z-50 flex justify-center sm:bottom-4 sm:right-4 sm:left-auto"
        >
          <div className="pointer-events-auto flex max-w-md items-center justify-between gap-3.5 rounded-xl border border-white/[0.14] bg-[#0d0f14]/95 px-4 py-2.5 text-[11px] text-[#c5c8d0] shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Cookie className="h-4 w-4 shrink-0 text-[#d4b37f]" />
              <p className="leading-snug">
                Используем cookie и локальное хранилище для работы сайта.{' '}
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="font-medium text-[#d4b37f] underline underline-offset-2 hover:text-[#f3dfbe] transition-colors"
                >
                  Подробнее
                </button>
              </p>
            </div>

            <button
              type="button"
              onClick={handleAccept}
              className="shrink-0 rounded-lg bg-gradient-to-r from-[#d4b37f] to-[#be9a65] px-3.5 py-1.5 text-[11px] font-bold text-[#0a0c0f] shadow-[0_2px_10px_rgba(212,179,127,0.25)] transition-all hover:scale-105 active:scale-95"
            >
              Принять
            </button>
          </div>
        </div>
      )}

      {/* Detailed Modal on "Подробнее" */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.14] bg-[#0f1218] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d4b37f]/30 bg-[#d4b37f]/10 text-[#d4b37f]">
                  <Cookie className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Использование Cookie и данных
                  </h3>
                  <p className="text-xs text-white/[0.5]">
                    Политика прозрачности и конфиденциальности
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-white/[0.4] hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-white/[0.75]">
              <p>
                Мы используем только технические файлы cookie и данные локального хранилища (localStorage), строго необходимые для стабильной и безопасной работы сервиса:
              </p>

              <div className="grid gap-2.5 pt-1">
                <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <KeyRound className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Авторизация и сессии</span>
                    <p className="text-white/[0.6] mt-0.5">
                      Хранение зашифрованных токенов доступа для защищённого входа без необходимости повторного ввода пароля.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <Palette className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Персонализация интерфейса</span>
                    <p className="text-white/[0.6] mt-0.5">
                      Запоминание выбранной темы оформления, языка и настроек отображения личного кабинета.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <Users className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Реферальная программа</span>
                    <p className="text-white/[0.6] mt-0.5">
                      Временное сохранение кода пригласившего пользователя при переходе по ссылке.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-purple-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Zero-Logs и безопасность</span>
                    <p className="text-white/[0.6] mt-0.5">
                      Мы не используем сторонние рекламные трекеры и не передаём ваши данные третьим лицам.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#d4b37f] to-[#be9a65] py-2.5 text-xs font-bold text-[#0a0c0f] shadow-[0_4px_16px_rgba(212,179,127,0.25)] transition-all hover:scale-[1.02] active:scale-98"
              >
                Принять и продолжить
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-white/[0.12] bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-white/[0.8] hover:bg-white/[0.1] transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
