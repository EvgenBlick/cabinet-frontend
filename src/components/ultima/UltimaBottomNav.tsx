import { useNavigate } from 'react-router';
import { Headphones, LayoutGrid, Newspaper, SlidersHorizontal, User } from 'lucide-react';
import type { UltimaBottomNavTab } from '@/features/ultima/navigation';

type UltimaBottomNavProps = {
  active: UltimaBottomNavTab | 'news';
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

  const tabs = [
    {
      id: 'home' as const,
      label: 'Главная',
      icon: LayoutGrid,
      onClick: onHomeClick ?? (() => navigate('/')),
    },
    {
      id: 'connection' as const,
      label: 'Настройка',
      icon: SlidersHorizontal,
      onClick: onConnectionClick ?? (() => navigate('/connection')),
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
      className="ultima-bottom-nav mx-auto flex items-center justify-around overflow-hidden rounded-3xl border border-[#d4b37f]/25 px-1 py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(212,179,127,0.22)] backdrop-blur-2xl"
      style={{
        background:
          'linear-gradient(165deg, rgba(18, 21, 28, 0.96) 0%, rgba(9, 11, 15, 0.99) 100%)',
      }}
    >
      {tabs.map(({ id, label, icon: Icon, onClick }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={onClick}
            aria-label={label}
            className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-2 transition-all ${
              isActive ? 'text-[#d4b37f]' : 'text-[#52565e] hover:text-[#8a7a5e]'
            }`}
          >
            {/* Active indicator — top line */}
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-6 rounded-full bg-[#d4b37f] shadow-[0_0_6px_#d4b37f88]" />
            )}
            <Icon
              className={`h-[18px] w-[18px] stroke-[1.7] transition-all ${
                isActive ? 'drop-shadow-[0_0_5px_rgba(212,179,127,0.55)]' : ''
              }`}
            />
            <span className="text-[9px] font-semibold tracking-wide">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
