import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  ChevronRight,
  Copy,
  CreditCard,
  Gift,
  KeyRound,
  LogOut,
  MonitorSmartphone,
  Ticket,
  Users,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/api/auth';
import { balanceApi } from '@/api/balance';
import { copyToClipboard } from '@/utils/clipboard';
import { UltimaBottomNav } from '@/components/ultima/UltimaBottomNav';
import { UltimaDesktopNavbar } from '@/components/ultima/desktop/UltimaDesktopNavbar';

export function UltimaProfile() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const logout = useAuthStore((state) => state.logout);
  const [idCopied, setIdCopied] = useState(false);

  // Queries
  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: balanceApi.getBalance,
    staleTime: 15000,
  });

  const { data: linkedIdentities, isLoading: linkedIdentitiesLoading } = useQuery({
    queryKey: ['linked-identities'],
    queryFn: authApi.getLinkedIdentities,
    staleTime: 15000,
  });

  // Calculations
  const identityCount = linkedIdentities?.identities?.length ?? 1;
  const hasBackupAccess = identityCount > 1;
  const isYandexLinked =
    linkedIdentities?.identities?.some((id) => id.provider?.toLowerCase() === 'yandex') ?? false;

  const displayInitial = useMemo(() => {
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return 'E';
  }, [user]);

  const displayName = useMemo(() => {
    if (user?.first_name) {
      return `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`;
    }
    if (user?.username) return user.username;
    return 'Евгений';
  }, [user]);

  const accountHandle = useMemo(() => {
    if (user?.username) {
      return `@${user.username.replace(/^@/, '')}`;
    }
    return `@samurai_master`;
  }, [user]);

  const userIdentifier = user?.telegram_id ?? user?.id ?? 'samurai';

  const balanceAmount =
    balanceData?.balance_rubles ??
    (balanceData?.balance_kopeks ? balanceData.balance_kopeks / 100 : 0);
  const balanceLabel = `${new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(balanceAmount)} ₽`;

  const registeredAtLabel = useMemo(() => {
    const raw = user?.created_at;
    if (!raw) return 'янв. 2026 г.';
    try {
      const date = new Date(raw);
      return new Intl.DateTimeFormat(i18n.language, { month: 'short', year: 'numeric' }).format(
        date,
      );
    } catch {
      return 'янв. 2026 г.';
    }
  }, [i18n.language, user?.created_at]);

  const handleCopyUserId = async () => {
    await copyToClipboard(String(userIdentifier));
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  };

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // ignore
    } finally {
      logout();
      navigate('/login');
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

      <div className="mx-auto max-w-[540px] px-3 pb-36 pt-4 lg:max-w-7xl lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-6 px-1">
          <h1 className="text-[26px] font-bold text-[#f5f5f7] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] lg:text-3xl">
            Личный кабинет
          </h1>
          <p className="mt-1 text-[13px] font-medium text-[#8e929b] lg:text-sm">
            Управление профилем, безопасностью и способами входа
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: User Profile Hero & Yandex ID (5 cols on lg) */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {/* 1. Main Profile & Balance Card */}
            <div
              className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
              }}
            >
              {/* User Info Header */}
              <div className="flex items-center gap-3.5">
                {/* Avatar Circle with Champagne Accent */}
                <div className="flex aspect-square h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#b89358]/50 bg-gradient-to-br from-[#d4b37f] to-[#a88247] shadow-[0_0_16px_rgba(212,179,127,0.3)]">
                  <span className="text-[18px] font-extrabold text-[#0a0c0f]">
                    {displayInitial}
                  </span>
                </div>

                {/* Names & Handle */}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold leading-tight text-[#f5f5f7] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {displayName}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-[#8e929b]">{accountHandle}</p>
                </div>

                {/* Status Badge */}
                <span className="flex items-center gap-1 rounded-full border border-[#b89358]/40 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d4b37f] shadow-sm backdrop-blur-md">
                  <span>{hasBackupAccess ? 'ЗАЩИЩЁН' : 'ОДИН ВХОД'}</span>
                </span>
              </div>

              {/* 3 Metrics Row */}
              <div className="mt-5 grid grid-cols-3 divide-x divide-white/[0.07] border-y border-white/[0.07] py-3.5">
                {/* Metric 1: Balance */}
                <div className="pr-2">
                  <div className="flex items-center gap-1 text-[#8e929b]">
                    <Wallet className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Баланс</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#f5f5f7]">{balanceLabel}</p>
                </div>

                {/* Metric 2: Login Methods */}
                <div className="px-2">
                  <div className="flex items-center gap-1 text-[#8e929b]">
                    <KeyRound className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Входы</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#f5f5f7]">
                    {linkedIdentitiesLoading ? '—' : identityCount}
                  </p>
                </div>

                {/* Metric 3: Member Since */}
                <div className="pl-2">
                  <div className="flex items-center gap-1 text-[#8e929b]">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">С нами с</span>
                  </div>
                  <p className="mt-1 truncate text-xs font-bold text-[#f5f5f7]">
                    {registeredAtLabel}
                  </p>
                </div>
              </div>

              {/* Gold Top Up Action Button with Animated Rotating Gold Beam */}
              <button
                type="button"
                data-testid="ultima-profile-top-up"
                onClick={() => navigate('/balance/top-up?returnTo=/profile')}
                className="btn-gold-beam mt-5 w-full shadow-[0_8px_24px_rgba(212,179,127,0.35)] transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <div
                  className="btn-gold-beam-inner min-h-[48px] gap-2.5 px-5 py-3"
                  style={{
                    background: 'linear-gradient(135deg, #f5e6d0 0%, #d4b37f 50%, #b89358 100%)',
                  }}
                >
                  <CreditCard className="h-4 w-4 text-[#0a0c0f]" strokeWidth={2.2} />
                  <span className="text-sm font-bold tracking-wide text-[#0a0c0f]">
                    Пополнить баланс
                  </span>
                </div>
              </button>
            </div>

            {/* High-Motivation Yandex Web Access Linking Card (with Animated Gold Beam) */}
            {!isYandexLinked && (
              <div className="gold-animated-beam-wrapper shadow-[0_16px_36px_rgba(0,0,0,0.8)]">
                <div
                  className="gold-animated-beam-content relative p-6"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(28, 31, 38, 0.98) 0%, rgba(12, 14, 18, 0.99) 100%)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#fc3f1d]/40 bg-gradient-to-br from-[#fc3f1d]/20 to-black/60 shadow-[0_0_16px_rgba(252,63,29,0.25)]">
                        <span className="text-[20px] font-black text-[#fc3f1d]">Я</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-[#f5f5f7]">
                            Доступ на сайте через Яндекс
                          </h2>
                          <span className="rounded-full border border-[#b89358]/40 bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#d4b37f]">
                            24/7 WEB
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-[#8e929b]">
                          Вход в личный кабинет на сайте без Telegram
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Motivational Reasons */}
                  <div className="mt-4 space-y-2 rounded-xl border border-white/[0.06] bg-black/35 p-3.5 text-xs">
                    <div className="flex items-center gap-2 text-[#f5f5f7]">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#d4b37f]/20 text-[10px] font-bold text-[#d4b37f]">
                        ✓
                      </span>
                      <span>Бесперебойный вход на сайте в любом браузере</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#f5f5f7]">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#d4b37f]/20 text-[10px] font-bold text-[#d4b37f]">
                        ✓
                      </span>
                      <span>Защита настроек даже при сбоях Telegram</span>
                    </div>
                  </div>

                  {/* Animated Gold Beam Action Button */}
                  <button
                    type="button"
                    onClick={() => navigate('/account-linking')}
                    className="btn-gold-beam mt-4 w-full shadow-[0_8px_24px_rgba(212,179,127,0.3)] transition-all hover:brightness-110 active:scale-[0.98]"
                  >
                    <div
                      className="btn-gold-beam-inner min-h-[46px] gap-2 px-4 py-2.5 font-bold text-[#0a0c0f]"
                      style={{
                        background:
                          'linear-gradient(135deg, #f5e6d0 0%, #d4b37f 50%, #b89358 100%)',
                      }}
                    >
                      <span className="text-xs font-extrabold tracking-wide text-[#0a0c0f]">
                        Привязать Яндекс ID
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#0a0c0f]" strokeWidth={2.5} />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons Footer: Copy ID & Logout */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleCopyUserId}
                className="flex min-h-[46px] items-center justify-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-[#f5f5f7] backdrop-blur-md transition-colors hover:bg-white/[0.06] active:scale-95"
              >
                <Copy className="h-4 w-4 text-[#d4b37f]" />
                <span>{idCopied ? 'ID скопирован' : `ID: ${userIdentifier}`}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-[46px] items-center justify-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 backdrop-blur-md transition-colors hover:bg-rose-500/15 active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти</span>
              </button>
            </div>
          </div>

          {/* Right Column: Security & Bonuses (7 cols on lg) */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {/* 2. Section 1: Account & Security */}
            <div
              className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
              }}
            >
              <div>
                <h2 className="text-base font-bold text-[#f5f5f7]">Аккаунт и безопасность</h2>
                <p className="mt-0.5 text-xs text-[#8e929b]">Устройства и способы входа</p>
              </div>

              <div className="mt-4 flex flex-col divide-y divide-white/[0.07]">
                {/* Connected Devices */}
                <button
                  type="button"
                  data-testid="ultima-profile-action-devices"
                  onClick={() => navigate('/devices')}
                  className="flex items-center justify-between py-4 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-black/40 text-[#d4b37f]">
                      <MonitorSmartphone className="h-5 w-5" strokeWidth={1.6} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#f5f5f7]">Подключённые устройства</p>
                      <p className="mt-0.5 text-xs text-[#8e929b]">
                        Подключения, удаление устройств и лимит
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#8e929b]" />
                </button>

                {/* Login Methods */}
                <button
                  type="button"
                  data-testid="ultima-profile-action-linking"
                  onClick={() => navigate('/account-linking')}
                  className="flex items-center justify-between py-4 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-black/40 text-[#d4b37f]">
                      <KeyRound className="h-5 w-5" strokeWidth={1.6} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#f5f5f7]">Способы входа</p>
                      <p className="mt-0.5 text-xs text-[#8e929b]">
                        Добавьте резервный способ входа
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-[#b89358]/35 bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-[#d4b37f]">
                      {`${identityCount} вход`}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#8e929b]" />
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Section 2: Bonuses & Possibilities */}
            <div
              className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
              }}
            >
              <div>
                <h2 className="text-base font-bold text-[#f5f5f7]">Бонусы и возможности</h2>
                <p className="mt-0.5 text-xs text-[#8e929b]">Приглашения, промокоды и подарки</p>
              </div>

              <div className="mt-4 flex flex-col divide-y divide-white/[0.07]">
                {/* Referral */}
                <button
                  type="button"
                  data-testid="ultima-profile-action-referral"
                  onClick={() => navigate('/referral')}
                  className="flex items-center justify-between py-4 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-black/40 text-[#d4b37f]">
                      <Users className="h-5 w-5" strokeWidth={1.6} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#f5f5f7]">Реферальная программа</p>
                      <p className="mt-0.5 text-xs text-[#8e929b]">
                        Получайте бонусы за приглашения
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#8e929b]" />
                </button>

                {/* Promocode */}
                <button
                  type="button"
                  data-testid="ultima-profile-action-promocode"
                  onClick={() => navigate('/promocode')}
                  className="flex items-center justify-between py-4 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-black/40 text-[#d4b37f]">
                      <Ticket className="h-5 w-5" strokeWidth={1.6} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#f5f5f7]">Промокод</p>
                      <p className="mt-0.5 text-xs text-[#8e929b]">Активация бонусов и скидок</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#8e929b]" />
                </button>

                {/* Gift */}
                <button
                  type="button"
                  data-testid="ultima-profile-action-gift"
                  onClick={() => navigate('/ultima/gift')}
                  className="flex items-center justify-between py-4 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-black/40 text-[#d4b37f]">
                      <Gift className="h-5 w-5" strokeWidth={1.6} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#f5f5f7]">Подарить</p>
                      <p className="mt-0.5 text-xs text-[#8e929b]">Создание подарочной подписки</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#8e929b]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation Dock */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 lg:hidden">
        <div className="pointer-events-auto mx-auto max-w-[540px]">
          <UltimaBottomNav active="profile" />
        </div>
      </div>
    </div>
  );
}
