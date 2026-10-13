import { CabinetNavigationDrop } from './CabinetNavigationDrop';
import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { useHaptic } from '@/platform';
import { Headphones, LayoutGrid, Newspaper, SlidersHorizontal, User, WalletCards } from 'lucide-react';
import type { UltimaBottomNavTab } from '@/features/ultima/navigation';
import '@/styles/cabinet-navigation.css';

type UltimaBottomNavProps = {
  active: UltimaBottomNavTab | 'subscription';
  onHomeClick?: () => void;
  onConnectionClick?: () => void;
  onNewsClick?: () => void;
  onProfileClick?: () => void;
  onSupportClick?: () => void;
};

export function UltimaBottomNav({
  active,
  onHomeClick,
  onConnectionClick,
  onNewsClick,
  onProfileClick,
  onSupportClick,
}: UltimaBottomNavProps) {
  const navigate = useNavigate();
  const haptic = useHaptic();
  const navRef = useRef<HTMLElement>(null);

  const tabs = [
    {
      id: 'home' as const,
      label: 'Главная',
      icon: LayoutGrid,
      onClick: onHomeClick ?? (() => navigate('/')),
    },
    {
      id: 'connection' as const,
      label: 'VPN',
      icon: SlidersHorizontal,
      onClick: onConnectionClick ?? (() => navigate('/connection')),
    },
    {
      id: 'subscription' as const,
      label: 'Тарифы',
      icon: WalletCards,
      onClick: () => navigate('/subscription'),
    },
    {
      id: 'news' as const,
      label: 'Новости',
      icon: Newspaper,
      onClick: onNewsClick ?? (() => navigate('/ultima/news')),
    },
    {
      id: 'profile' as const,
      label: 'Профиль',
      icon: User,
      onClick: onProfileClick ?? (() => navigate('/profile')),
    },
    {
      id: 'support' as const,
      label: 'Помощь',
      icon: Headphones,
      onClick: onSupportClick ?? (() => navigate('/support')),
    },
  ];


  return (
    <nav
      ref={navRef}
      aria-label="Навигация кабинета"
      className="ultima-bottom-nav cabinet-bottom-navigation cabinet-glass-navigation"
    >
      <CabinetNavigationDrop container={navRef} activeKey={active} kind="bottom" />
      {tabs.map(({ id, label, icon: Icon, onClick }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => { if (id === 'subscription') haptic.impact('light'); onClick(); }}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            data-active={isActive}
            className="cabinet-navigation-tab cabinet-liquid-tab"
          >
            <Icon aria-hidden="true" className="relative z-10 h-5 w-5 stroke-[1.7]" />
            <span className="cabinet-navigation-label relative z-10">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
