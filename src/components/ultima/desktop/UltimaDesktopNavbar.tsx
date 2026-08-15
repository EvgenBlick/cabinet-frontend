import { useLocation, useNavigate } from 'react-router';
import { CreditCard, Headphones, Newspaper, Radio, ShieldCheck, User, Zap } from 'lucide-react';
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
      icon: Zap,
      path: '/',
      active: location.pathname === '/' || location.pathname === '/ultima',
    },
    {
      id: 'connection',
      label: 'Подключение',
      icon: Radio,
      path: '/connection',
      active: location.pathname.startsWith('/connection'),
    },
    {
      id: 'subscription',
      label: 'Тарифы',
      icon: CreditCard,
      path: '/subscription',
      active: location.pathname.startsWith('/subscription'),
      onClick: onBuySubscription ? () => onBuySubscription() : undefined,
    },
    {
      id: 'news',
      label: 'Новости',
      icon: Newspaper,
      path: '/ultima/news',
      active: location.pathname.startsWith('/ultima/news') || location.pathname.startsWith('/news'),
    },
    {
      id: 'support',
      label: 'Поддержка',
      icon: Headphones,
      path: '/support',
      active: location.pathname.startsWith('/support'),
      onClick: onOpenSupport ? () => onOpenSupport() : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 pb-2 pt-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/[0.08] bg-[#0c0f0d]/80 px-4 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        {/* 1. Left: Brand */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="group flex items-center gap-2.5 focus:outline-none"
        >
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#d4b37f]/40 bg-[#121614] p-1.5 shadow-[0_0_15px_rgba(212,179,127,0.25)] transition-all group-hover:scale-105 group-hover:border-[#d4b37f]">
            <img
              src="/samurai_original_medallion.png"
              alt=""
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <span className="text-[13px] font-bold tracking-wider text-[#f5f5f7] transition-colors group-hover:text-[#d4b37f]">
            {appName ? appName.toUpperCase() : 'SAMURAI SERVICE'}
          </span>
        </button>

        {/* 2. Center: Segmented Navigation Pill (Desktop only) */}
        <nav className="hidden items-center rounded-full border border-white/[0.06] bg-white/[0.03] p-1 lg:flex">
          {navItems.map((item) => {
            const isActive = item.active;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick || (() => navigate(item.path))}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all',
                  isActive
                    ? 'bg-white/[0.1] text-[#f5f5f7] shadow-sm'
                    : 'text-[#8e929b] hover:bg-white/[0.04] hover:text-[#f5f5f7]',
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* 3. Right: Balance & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Balance Pill */}
          <button
            type="button"
            onClick={() => (onBuySubscription ? onBuySubscription() : navigate('/subscription'))}
            className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-[#8e929b] transition-all hover:border-[#d4b37f]/40 hover:bg-white/[0.06] hover:text-[#f5f5f7]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="font-semibold text-[#f5f5f7]">{balanceFormatted}</span>
          </button>

          {/* Admin shortcut */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="hidden items-center gap-1 rounded-full border border-[#d4b37f]/30 bg-[#141815] px-2.5 py-1.5 text-[11px] font-medium text-[#d4b37f] hover:bg-[#1c221e] sm:flex"
            >
              <ShieldCheck className="h-3 w-3" />
              <span>Админ</span>
            </button>
          )}

          {/* Profile Button */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              location.pathname.startsWith('/profile')
                ? 'border-[#d4b37f]/60 bg-[#d4b37f]/15 text-[#d4b37f]'
                : 'border-white/[0.08] bg-white/[0.03] text-[#8e929b] hover:border-white/20 hover:text-[#f5f5f7]',
            )}
            title="Личный кабинет"
          >
            <User className="h-3.5 w-3.5 text-[#d4b37f]" />
            <span className="hidden sm:inline">
              {user?.first_name || user?.username || 'Кабинет'}
            </span>
          </button>

          {/* Glowing Connect Button */}
          <button
            type="button"
            onClick={() => navigate('/connection')}
            className="verdant-glow-btn flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all hover:scale-105"
          >
            <span>Подключить</span>
            <span>→</span>
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
