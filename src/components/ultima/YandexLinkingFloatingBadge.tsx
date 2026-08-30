import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Globe, X } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth';

const DISMISS_STORAGE_KEY = 'samurai_yandex_link_badge_dismissed_ts';
const DISMISS_DURATION_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

export function YandexLinkingModal({
  isOpen,
  onClose,
  onDismiss,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoToLinking = () => {
    onClose();
    navigate('/account-linking');
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[28px] sm:rounded-3xl border border-white/[0.14] bg-[#0c0e15] p-5 shadow-2xl sm:p-6 text-white max-h-[90dvh] overflow-y-auto"
          >
            {/* Top mobile handle */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/[0.2] sm:hidden" />

            {/* Background Ambient Glow */}
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-[#fc3f1d]/20 blur-3xl" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fc3f1d] shadow-[0_4px_20px_rgba(252,63,29,0.35)]">
                  <span className="text-2xl font-black text-white leading-none">Я</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white sm:text-lg">
                    {t('yandexBadge.modalTitle', { defaultValue: 'Вход через Яндекс ID' })}
                  </h3>
                  <p className="text-xs text-white/[0.5]">
                    {t('yandexBadge.modalSubtitle', { defaultValue: 'Быстрый вход без Telegram' })}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-white/40 hover:bg-white/[0.08] hover:text-white transition-colors"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Description */}
            <p className="mt-4 text-xs leading-relaxed text-white/[0.75]">
              Привяжите ваш Яндекс ID к личному кабинету Samurai Service. Это позволит моментально входить на сайт в 1 клик через любой браузер без ожидания Telegram:
            </p>

            {/* Feature Cards */}
            <div className="mt-3.5 space-y-2">
              <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5 text-xs">
                <Zap className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Мгновенный вход в 1 клик</span>
                  <p className="text-[11px] text-white/[0.55] mt-0.5">
                    Входите с телефона, ПК или планшета через кнопку «Войти с Яндекс ID».
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5 text-xs">
                <Globe className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Доступ без Telegram</span>
                  <p className="text-[11px] text-white/[0.55] mt-0.5">
                    Управляйте подпиской и серверами, даже если Telegram заблокирован.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5 text-xs">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Полная синхронизация</span>
                  <p className="text-[11px] text-white/[0.55] mt-0.5">
                    Все ваши ключи, дни подписки и реферальный баланс сохраняются.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col gap-2 pb-2 sm:pb-0">
              <button
                type="button"
                onClick={handleGoToLinking}
                className="group flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#fc3f1d] via-[#f72d07] to-[#e02000] px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_20px_rgba(252,63,29,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_6px_28px_rgba(252,63,29,0.5)] active:scale-98"
              >
                <span>Привязать Яндекс ID</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={onDismiss}
                className="py-2 text-[11px] font-medium text-white/[0.45] hover:text-white/[0.8] transition-colors"
              >
                Не напоминать 2 дня
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/**
 * Mobile In-Dashboard Quick Action Row for Yandex ID Linking
 */
export function YandexLinkingQuickActionRow() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: identitiesData } = useQuery({
    queryKey: ['linked-identities'],
    queryFn: authApi.getLinkedIdentities,
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  const isYandexLinked = identitiesData?.identities?.some(
    (id) => id.provider?.toLowerCase() === 'yandex'
  ) ?? false;

  useEffect(() => {
    try {
      const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        setIsDismissed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now() + DISMISS_DURATION_MS));
    } catch {
      // ignore
    }
    setIsDismissed(true);
    setIsOpen(false);
  };

  if (!isAuthenticated || isYandexLinked || isDismissed) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between py-3 text-left transition-colors hover:bg-white/[0.02] border-t border-white/[0.06]"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fc3f1d] shadow-[0_2px_12px_rgba(252,63,29,0.35)]">
            <span className="text-base font-black text-white leading-none select-none">Я</span>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[14px] font-bold text-[#f5f5f7]">Вход через Яндекс ID</p>
            </div>
            <p className="mt-0.5 text-[11px] text-[#8e929b]">
              Привяжите для быстрого входа без Telegram
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-[#fc3f1d]/40 bg-[#fc3f1d]/15 px-3 py-1 text-[11px] font-bold text-white shadow-sm transition-transform active:scale-95">
          <span>Привязать</span>
          <span className="text-[10px]">→</span>
        </div>
      </button>

      <YandexLinkingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onDismiss={handleDismiss}
      />
    </>
  );
}

/**
 * Desktop / Tablet Floating Widget
 */
export function YandexLinkingFloatingBadge() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  const { data: identitiesData } = useQuery({
    queryKey: ['linked-identities'],
    queryFn: authApi.getLinkedIdentities,
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  const isYandexLinked = identitiesData?.identities?.some(
    (id) => id.provider?.toLowerCase() === 'yandex'
  ) ?? false;

  useEffect(() => {
    try {
      const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now() + DISMISS_DURATION_MS));
    } catch {
      // ignore
    }
    setIsDismissed(true);
    setIsOpen(false);
  };

  if (!isAuthenticated || isYandexLinked || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Desktop-only floating badge: positioned cleanly away from mobile docks */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="hidden lg:flex fixed bottom-8 right-8 z-40"
      >
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2.5 rounded-full border border-[#fc3f1d]/40 bg-[#0d0f17]/95 py-2 pl-2 pr-4 shadow-[0_4px_24px_rgba(252,63,29,0.35)] backdrop-blur-xl transition-colors hover:border-[#fc3f1d]/70 hover:shadow-[0_6px_32px_rgba(252,63,29,0.5)]"
          aria-label="Привязать Яндекс ID"
        >
          {/* Ambient Outer Aura */}
          <span className="pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#fc3f1d]/30 to-[#d4b37f]/20 blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />

          {/* Yandex Circular Icon with Beacon */}
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fc3f1d] shadow-[0_2px_10px_rgba(252,63,29,0.4)]">
            <span className="text-sm font-black text-white leading-none select-none">Я</span>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
            </span>
          </span>

          {/* Text labels */}
          <div className="relative text-left">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white tracking-wide">Яндекс ID</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <span className="block text-[10px] font-semibold text-[#fc7258]">
              {t('yandexBadge.linkAction', { defaultValue: 'Привязать аккаунт' })}
            </span>
          </div>

          <ArrowRight className="relative h-4 w-4 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
        </motion.button>
      </motion.div>

      <YandexLinkingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onDismiss={handleDismiss}
      />
    </>
  );
}
