import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Check,
  Copy,
  CreditCard,
  Crown,
  LogOut,
  Settings,
  ShieldCheck,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { subscriptionApi } from '@/api/subscription';
import { referralApi } from '@/api/referral';
import { useFreshThemeContext } from '../FreshThemeContext';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';
import { FreshNavbar } from '../components/FreshNavbar';

export function FreshProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const { config } = useFreshThemeContext();
  const { toggleStudio } = useThemeEngine();
  const [copiedRef, setCopiedRef] = useState(false);

  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
  });

  const { data: refData } = useQuery({
    queryKey: ['referral-info'],
    queryFn: referralApi.getReferralInfo,
  });

  const subscription = subData?.subscription;
  const accentLime = config.accentColor || '#d7ff3b';
  const balanceRub =
    user?.balance_rubles ?? (user?.balance_kopeks ? Math.floor(user.balance_kopeks / 100) : 1500);

  const refLink =
    (refData as any)?.referral_link ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/r/${(user as any)?.id || 'ref'}`
      : 'https://samuraiservice.top/r/ref');

  const handleCopyRef = () => {
    navigator.clipboard.writeText(refLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const daysLeft = subscription?.days_left ?? 30;
  const trafficUsedGb = subscription?.traffic_used_gb ?? 14.8;
  const trafficLimitGb = subscription?.traffic_limit_gb || 100;

  return (
    <div className="fresh-backdrop-container min-h-screen pb-32 font-sans text-[#f5f5f7] selection:bg-[#d7ff3b]/30 selection:text-white">
      <FreshNavbar />

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-[#0d1610] shadow-xl"
              style={{
                borderColor: `${accentLime}60`,
                boxShadow: `0 0 25px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.3)'}`,
              }}
            >
              <User className="h-8 w-8" style={{ color: accentLime }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">
                  {user?.first_name || user?.username || 'Пользователь'}
                </h1>
                {isAdmin && (
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase text-black"
                    style={{ backgroundColor: accentLime }}
                  >
                    <Crown className="h-3 w-3" />
                    ADMIN
                  </span>
                )}
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase"
                  style={{ backgroundColor: `${accentLime}20`, color: accentLime }}
                >
                  ● Активен
                </span>
              </div>
              <p className="font-mono text-xs text-[#8e9690]">
                ID: #{(user as any)?.telegram_id || user?.id || '777412'} • @
                {user?.username || 'user'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={toggleStudio}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-transform hover:scale-105"
                style={{ borderColor: `${accentLime}40` }}
              >
                <Settings className="h-4 w-4" style={{ color: accentLime }} />
                <span>Theme Studio</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              <span>Выйти</span>
            </button>
          </div>
        </div>

        {/* 2-Column Bento Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Balance & Topup Card (6 cols) */}
          <div className="fresh-bento-card p-6 shadow-xl lg:col-span-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Баланс личного кабинета
              </span>
              <CreditCard className="h-4 w-4" style={{ color: accentLime }} />
            </div>

            <div className="my-6">
              <span className="text-xs text-[#8e9690]">Доступно на счете:</span>
              <div className="mt-1 font-mono text-4xl font-black text-white">{balanceRub} ₽</div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/balance/top-up?amount=500')}
              className="fresh-glow-btn flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black text-black shadow-xl transition-transform hover:scale-105"
              style={{
                backgroundColor: accentLime,
                boxShadow: `0 0 20px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.4)'}`,
              }}
            >
              <Zap className="h-4 w-4 fill-black" />
              <span>Пополнить баланс</span>
            </button>
          </div>

          {/* Subscription Telemetry Card (6 cols) */}
          <div className="fresh-bento-card p-6 shadow-xl lg:col-span-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Статус подписки
              </span>
              <ShieldCheck className="h-4 w-4" style={{ color: accentLime }} />
            </div>

            <div className="my-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8e9690]">Активный тариф:</span>
                <span className="text-xs font-bold text-white">
                  {subscription?.tariff_name || 'Безлимитный PRO 10G'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8e9690]">Осталось дней:</span>
                <span className="text-xs font-bold text-[#d7ff3b]">{daysLeft} дней</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8e9690]">Использовано трафика:</span>
                <span className="text-xs font-bold text-white">
                  {trafficUsedGb} / {trafficLimitGb} ГБ
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/subscription')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white hover:bg-white/10"
            >
              <span>Продлить тариф</span>
            </button>
          </div>

          {/* Referral Partner Card (12 cols) */}
          <div className="fresh-bento-card p-6 shadow-xl lg:col-span-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#d7ff3b]" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Реферальная программа: +3 дня за каждого друга и 25% бонусов
                </span>
              </div>
              <span className="rounded-full bg-[#d7ff3b]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#d7ff3b]">
                Бонус 25%
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="max-w-xl text-xs leading-relaxed text-[#8e9690]">
                Отправьте персональную ссылку друзьям. При их первой оплате вы получите бонусные дни
                и постоянный пассивный кэшбэк на баланс кабинета.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={refLink}
                  className="w-64 rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 font-mono text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="fresh-glow-btn flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-black"
                  style={{ backgroundColor: accentLime }}
                >
                  {copiedRef ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedRef ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
