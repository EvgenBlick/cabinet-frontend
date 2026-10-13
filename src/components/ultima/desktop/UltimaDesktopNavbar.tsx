import { CabinetNavigationDrop } from '../CabinetNavigationDrop';
import { useRef } from 'react';
import { useHaptic } from '@/platform';
import { useLocation, useNavigate } from 'react-router';
import { ShieldCheck, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useBranding } from '@/hooks/useBranding';
import { cn } from '@/lib/utils';
import '@/styles/cabinet-navigation.css';

export function UltimaDesktopNavbar({
  onBuySubscription,
  onOpenSupport,
}: {
  onBuySubscription?: () => void;
  onOpenSupport?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const haptic = useHaptic();
  const navRef = useRef<HTMLElement>(null);
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
      id: 'manage-subscription',
      label: 'Подписка',
      path: '/ultima/subscription-info',
      active: location.pathname === '/ultima/subscription-info',
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
    <header className="cabinet-desktop-navigation cabinet-glass-navigation sticky top-0 z-50 w-full border-b border-white/[0.1] bg-[#17191f]/70 backdrop-blur-2xl">
      <div className="cabinet-desktop-navigation-inner mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-3 px-4 py-3.5 sm:px-6">
        {/* 1. Left: Brand */}
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="На главную"
          className="group flex min-h-11 shrink-0 items-center gap-3 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e2e2e8]"
        >
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.05] p-1 transition-transform duration-200 group-hover:scale-[1.03]">
            <img
              src="/samurai_original_medallion.png"
              alt=""
              className="h-full w-full object-contain rounded-full"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <span className="max-w-[190px] truncate text-[15px] font-semibold tracking-tight text-white">
            {appName || 'Samurai Service'}
          </span>
        </button>

        {/* 2. Center: Clean Navigation Tabs */}
        <nav ref={navRef} aria-label="Основная навигация" className="cabinet-desktop-navigation-tabs">
          <CabinetNavigationDrop container={navRef} activeKey={location.pathname} kind="desktop" />
          {navItems.map((item) => {
            const isActive = item.active;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                data-active={isActive}
                onClick={() => { if (item.id === 'subscription') haptic.impact('light'); (item.onClick || (() => navigate(item.path)))(); }}
                className="cabinet-navigation-tab cabinet-liquid-tab"
              >
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 3. Right: Balance & User Profile */}
        <div className="flex items-center gap-3">
          {/* Balance Pill -> Direct Top Up */}
          <button
            type="button"
            onClick={() => navigate(`/balance/top-up?returnTo=${encodeURIComponent(location.pathname)}`)}
            aria-label={`Пополнить баланс: ${balanceFormatted}`}
            className="cabinet-glass-control flex min-h-11 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-3.5 py-1.5 text-[13px] transition-[transform,opacity] duration-200 active:scale-[0.97]"
          >
            <span className="font-medium text-white">{balanceFormatted}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e2e2e8]/20 text-[15px] font-medium text-[#e2e2e8]">+</span>
          </button>

          {/* Admin shortcut */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="cabinet-glass-control hidden min-h-11 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 text-[13px] font-medium text-white/75 transition-[transform,opacity] duration-200 active:scale-[0.97] xl:flex"
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
              'cabinet-glass-control flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-[transform,opacity] duration-200 active:scale-[0.97]',
              location.pathname.startsWith('/profile')
                ? 'border-white/20 bg-white/[0.1] text-[#e2e2e8]'
                : 'border-white/[0.12] bg-white/[0.05] text-white/75 hover:text-white',
            )}
          >
            <User className="h-3.5 w-3.5 text-[#e2e2e8]" />
            <span className="max-w-[100px] truncate">{user?.first_name || user?.username || 'Кабинет'}</span>
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
