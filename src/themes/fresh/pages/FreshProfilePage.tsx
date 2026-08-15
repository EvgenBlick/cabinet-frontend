import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Check,
  Copy,
  LogOut,
  Plus,
  ShieldCheck,
  Smartphone,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { subscriptionApi } from '@/api/subscription';
import { useFreshThemeContext } from '../FreshThemeContext';
import { FreshNavbar } from '../components/FreshNavbar';

export function FreshProfilePage() {
  const { user, logout } = useAuthStore();
  const { config } = useFreshThemeContext();
  const [copiedRef, setCopiedRef] = useState(false);

  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
  });

  const subscription = subData?.subscription;
  const accentLime = config.accentColor || '#d7ff3b';
  const balanceRub =
    user?.balance_rubles ?? (user?.balance_kopeks ? Math.floor(user.balance_kopeks / 100) : 0);
  const refLink = `https://t.me/vpn_bot?start=${user?.telegram_id || 'user'}`;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(refLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="fresh-backdrop-container min-h-screen font-sans text-[#f5f5f7] selection:bg-[#d7ff3b]/30 selection:text-white">
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
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase"
                  style={{ backgroundColor: `${accentLime}20`, color: accentLime }}
                >
                  ● Активен
                </span>
              </div>
              <p className="text-xs text-[#8e9690]">ID аккаунта: {user?.id || 1}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Выйти из аккаунта</span>
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Devices and Subscription Details (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Active Devices Box */}
            <div className="fresh-bento-card p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Подключенные устройства</h3>
                  <p className="text-xs text-[#8e9690]">
                    Использовано 1 из {subscription?.device_limit || 5} слотов
                  </p>
                </div>

                <a
                  href="/fresh/connection"
                  className="fresh-glow-btn flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-black"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Добавить</span>
                </a>
              </div>

              {/* Devices List */}
              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0a0f0c] p-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]"
                      style={{ color: accentLime }}
                    >
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">iPhone 15 Pro Max</div>
                      <div className="text-[10px] text-emerald-400">
                        ● Онлайн • 14 ms (Стокгольм)
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#8e9690]">Текущее</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-3 text-xs text-[#8e9690]">
                  <span>Свободный слот для ПК или ТВ</span>
                  <a href="/fresh/connection" className="text-white hover:underline">
                    Подключить ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Referral Friends Box */}
            <div className="fresh-bento-card p-6 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d7ff3b]">
                <Users className="h-4 w-4" />
                <span>Пригласи друга</span>
              </div>
              <h3 className="mt-1 text-base font-bold text-white">
                Получайте +3 дня за каждого друга
              </h3>
              <p className="mt-1 text-xs text-[#8e9690]">
                Поделитесь персональной ссылкой: когда друг активирует бота, вы оба получите
                бонусные дни.
              </p>

              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={refLink}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="fresh-glow-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-black"
                >
                  {copiedRef ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedRef ? 'Скопировано' : 'Копировать'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Balance & Subscription Quick Status (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Balance Card */}
            <div className="fresh-bento-card p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  Баланс счёта
                </span>
                <Wallet className="h-4 w-4" style={{ color: accentLime }} />
              </div>
              <div className="mt-3 text-3xl font-black text-white">{balanceRub} ₽</div>
              <p className="mt-1 text-xs text-[#8e9690]">
                Средства используются для оплаты тарифов
              </p>

              <a
                href="/fresh/subscription"
                className="fresh-glow-btn mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-black"
              >
                <span>Пополнить баланс</span>
                <span>→</span>
              </a>
            </div>

            {/* Security Guarantee Box */}
            <div className="fresh-bento-card p-6 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Безопасность и приватность</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#c8d0ca]">
                Ваш трафик шифруется сквозным алгоритмом и маршрутизируется через защищенные
                дата-центры в ЕС. Журналы подключений не ведутся.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
