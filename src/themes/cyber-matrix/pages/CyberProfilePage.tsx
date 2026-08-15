import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Check,
  ChevronRight,
  Copy,
  CreditCard,
  Crown,
  LogOut,
  Settings,
  Users,
  Zap,
} from 'lucide-react';
import { subscriptionApi } from '@/api/subscription';
import { referralApi } from '@/api/referral';
import { useAuthStore } from '@/store/auth';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';
import { CyberParticleCanvas } from '../components/CyberParticleCanvas';
import { CyberFloatingDock } from '../components/CyberFloatingDock';

export const CyberProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { config, toggleStudio } = useThemeEngine();
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
  const daysLeft = subscription?.days_left ?? 30;
  const accent = config.accentColor || '#00ff66';
  const isAdmin = useAuthStore((state) => state.isAdmin);

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

  return (
    <div className="relative min-h-[100dvh] bg-[#040705] pb-32 text-[#f5f5f7] selection:bg-emerald-500/30 selection:text-white">
      <CyberParticleCanvas />

      <main className="relative z-10 mx-auto max-w-5xl px-4 pt-10 sm:px-6">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-3xl border bg-black/80 text-xl font-black text-white shadow-2xl"
              style={{ borderColor: accent, boxShadow: `0 0 25px ${config.accentGlowColor}` }}
            >
              {(user as any)?.first_name?.[0] || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">
                  {(user as any)?.first_name || 'Пользователь'}
                </h1>
                {isAdmin && (
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase text-black"
                    style={{ backgroundColor: accent }}
                  >
                    <Crown className="h-3 w-3" />
                    ADMIN
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-[#8e9690]">
                ID: #{(user as any)?.telegram_id || (user as any)?.id || '777412'} • @
                {(user as any)?.username || 'user'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={toggleStudio}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-transform hover:scale-105"
                style={{ borderColor: `${accent}40` }}
              >
                <Settings className="h-4 w-4" style={{ color: accent }} />
                <span>Theme Studio</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Выйти</span>
            </button>
          </div>
        </div>

        {/* Bento Profile Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Balance & Quick Topup Card (6 cols) */}
          <div className="rounded-3xl border border-white/10 bg-[#080d0a]/90 p-6 shadow-2xl backdrop-blur-xl md:col-span-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Баланс личного кабинета
              </span>
              <CreditCard className="h-4 w-4" style={{ color: accent }} />
            </div>

            <div className="my-6">
              <span className="text-xs text-[#8e9690]">Доступно на счете:</span>
              <div className="mt-1 font-mono text-4xl font-black text-white">
                {(user as any)?.balance_rubles ?? 1500} ₽
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/balance/top-up?amount=500')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black text-black shadow-xl transition-transform hover:scale-105"
              style={{
                backgroundColor: accent,
                boxShadow: `0 0 20px ${config.accentGlowColor}`,
              }}
            >
              <Zap className="h-4 w-4" />
              <span>Пополнить баланс</span>
            </button>
          </div>

          {/* Active Subscription Status (6 cols) */}
          <div className="rounded-3xl border border-white/10 bg-[#080d0a]/90 p-6 shadow-2xl backdrop-blur-xl md:col-span-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Активная подписка
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                {daysLeft} дней
              </span>
            </div>

            <div className="my-6 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8e9690]">Протокол подключения:</span>
                <span className="font-mono font-bold text-white">VLESS TLS 1.3 + Hysteria 2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8e9690]">Умная маршрутизация:</span>
                <span className="font-semibold text-emerald-400">Включена (Яндекс/РФ)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8e9690]">Устройств доступно:</span>
                <span className="font-mono font-bold text-white">До 5 устройств</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/subscription')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              <span>Управление тарифом и продление</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Referral Partner Section (12 cols) */}
          <div className="rounded-3xl border border-white/10 bg-[#080d0a]/90 p-6 shadow-2xl backdrop-blur-xl md:col-span-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" style={{ color: accent }} />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Партнерская реферальная программа (25%)
                </span>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] text-emerald-400">
                25% с каждого платежа
              </span>
            </div>

            <div className="my-6 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
              <div className="md:col-span-7">
                <p className="text-xs leading-relaxed text-[#c4ceca]">
                  Приглашайте друзей по вашей персональной ссылке и получайте{' '}
                  <strong className="text-white">25% от всех их пополнений</strong> на ваш баланс
                  навсегда. Накопленные средства можно использовать для оплаты или вывести.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    readOnly
                    value={refLink}
                    className="flex-1 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 font-mono text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold text-black shadow-lg"
                    style={{ backgroundColor: accent }}
                  >
                    {copiedRef ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Скопировать</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/5 bg-black/40 p-4 text-center md:col-span-5">
                <div>
                  <div className="text-[10px] text-[#8e9690]">Приглашено друзей</div>
                  <div className="mt-1 font-mono text-xl font-bold text-white">
                    {(refData as any)?.referrals_count ?? 3} чел.
                  </div>
                </div>
                <div className="border-l border-white/5">
                  <div className="text-[10px] text-[#8e9690]">Заработано бонусов</div>
                  <div className="mt-1 font-mono text-xl font-bold text-emerald-400">
                    {(refData as any)?.earned_rubles ?? 750} ₽
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CyberFloatingDock />
    </div>
  );
};
