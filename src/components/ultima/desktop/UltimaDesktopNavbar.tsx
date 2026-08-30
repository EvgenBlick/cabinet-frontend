import { useLocation, useNavigate } from 'react-router';
import { ShieldCheck, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useBranding } from '@/hooks/useBranding';
import { cn } from '@/lib/utils';

export function UltimaDesktopNavbar({
  onBuySubscription,
  onOpenSupport,
}: {
  onBuySubscription?: () => void;
  onOpenSupport?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  const { appName } = useBranding();

  const balanceFormatted = useMemoBalance(user?.balance_kopeks, user?.balance_rubles);

  const navItems = [
    {
      id: 'home',
      label: 'Главная',
      path: '/',
      active: location.pathname === '/' || location.pathname === '/ultima',
    },
    {
      id: 'connection',
      label: 'Подключение',
      path: '/connection',
      active: location.pathname.startsWith('/connection'),
    },
    {
      id: 'subscription',
      label: 'Тарифы',
      path: '/subscription',
      active: location.pathname.startsWith('/subscription'),
      onClick: onBuySubscription ? () => onBuySubscription() : undefined,
    },
    {
      id: 'news',
      label: 'Новости',
      path: '/ultima/news',
      active: location.pathname.startsWith('/ultima/news') || location.pathname.startsWith('/news'),
    },
    {
      id: 'support',
      label: 'Поддержка',
      path: '/support',
      active: location.pathname.startsWith('/support'),
      onClick: onOpenSupport ? () => onOpenSupport() : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#07090e]/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* 1. Left: Brand */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 focus:outline-none"
        >
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#d4b37f]/50 bg-[#0c0e14] p-1 shadow-[0_0_16px_rgba(212,179,127,0.3)] transition-transform group-hover:scale-105">
            <img
              src="/samurai_exact_circle.png"
              alt=""
              className="h-full w-full object-contain rounded-full"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <span className="font-sans text-sm font-black tracking-widest text-white transition-colors group-hover:text-[#d4b37f]">
            {appName ? appName.toUpperCase() : 'SAMURAISERVICE'}
          </span>
        </button>

        {/* 2. Center: Clean Navigation Tabs */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = item.active;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick || (() => navigate(item.path))}
                className={cn(
                  'rounded-xl px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all',
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-sm ring-1 ring-white/10'
                    : 'text-[#8e929b] hover:bg-white/[0.04] hover:text-white',
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* 3. Right: Balance & User Profile */}
        <div className="flex items-center gap-3">
          {/* Balance Pill -> Direct Top Up */}
          <button
            type="button"
            onClick={() => navigate('/balance/top-up?returnTo=/')}
            className="flex items-center gap-2 rounded-xl border border-[#d4b37f]/30 bg-[#d4b37f]/10 px-3.5 py-1.5 text-xs transition-all hover:border-[#d4b37f]/60 hover:bg-[#d4b37f]/15"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="font-bold text-[#d4b37f]">{balanceFormatted}</span>
            <span className="rounded-md bg-[#d4b37f]/20 px-1 text-[10px] font-black text-[#d4b37f]">+</span>
          </button>

          {/* Admin shortcut */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="hidden items-center gap-1.5 rounded-xl border border-[#d4b37f]/30 bg-[#12151c] px-3 py-1.5 text-xs font-semibold text-[#d4b37f] transition-all hover:bg-[#1a1f29] sm:flex"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Админ</span>
            </button>
          )}

          {/* Profile Button */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all',
              location.pathname.startsWith('/profile')
                ? 'border-[#d4b37f]/60 bg-[#d4b37f]/15 text-[#d4b37f]'
                : 'border-white/[0.08] bg-white/[0.03] text-[#8e929b] hover:border-white/20 hover:text-white',
            )}
          >
            <User className="h-3.5 w-3.5 text-[#d4b37f]" />
            <span>{user?.first_name || user?.username || 'Кабинет'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function useMemoBalance(kopeks?: number, rubles?: number): string {
  if (kopeks !== undefined && kopeks !== null) {
    const rub = Math.floor(kopeks / 100);
    return `${rub.toLocaleString('ru-RU')} ₽`;
  }
  if (rubles !== undefined && rubles !== null) {
    return `${Math.floor(rubles).toLocaleString('ru-RU')} ₽`;
  }
  return '0 ₽';
}
