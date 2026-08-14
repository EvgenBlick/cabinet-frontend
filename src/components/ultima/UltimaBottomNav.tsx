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

  const getButtonClassName = (isActive: boolean) =>
    isActive
      ? 'relative flex flex-col h-12 flex-1 items-center justify-center text-[#d4b37f] transition-all'
      : 'relative flex flex-col h-12 flex-1 items-center justify-center text-[#6e727c] transition-all hover:text-[#c8aa76]';

  return (
    <nav
      className="ultima-bottom-nav mx-auto flex items-center justify-around overflow-hidden rounded-2xl border-t border-[#5a5040]/35 px-2 py-1 shadow-[0_-8px_24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)]"
      style={{
        backgroundImage:
          'linear-gradient(180deg, rgba(28, 31, 36, 0.92) 0%, rgba(10, 12, 15, 0.98) 100%), url(/horizontal_brushed_steel.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 1. Dashboard (Grid) */}
      <button
        type="button"
        onClick={onHomeClick ?? (() => navigate('/'))}
        className={getButtonClassName(active === 'home')}
        aria-label="Главная"
      >
        <LayoutGrid
          className={`h-5 w-5 stroke-[1.8] ${active === 'home' ? 'text-[#d4b37f] drop-shadow-[0_0_8px_rgba(212,179,127,0.5)]' : ''}`}
        />
        {active === 'home' && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#d4b37f] shadow-[0_0_6px_#d4b37f]" />
        )}
      </button>

      {/* 2. Connection / Settings (Sliders) */}
      <button
        type="button"
        onClick={onConnectionClick ?? (() => navigate('/connection'))}
        className={getButtonClassName(active === 'connection')}
        aria-label="Подключение"
      >
        <SlidersHorizontal
          className={`h-5 w-5 stroke-[1.8] ${active === 'connection' ? 'text-[#d4b37f] drop-shadow-[0_0_8px_rgba(212,179,127,0.5)]' : ''}`}
        />
        {active === 'connection' && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#d4b37f] shadow-[0_0_6px_#d4b37f]" />
        )}
      </button>

      {/* 3. News / Info (Newspaper) */}
      <button
        type="button"
        onClick={onNewsClick ?? (() => navigate('/ultima/news'))}
        className={getButtonClassName(active === 'news')}
        aria-label="Инфо"
      >
        <Newspaper
          className={`h-5 w-5 stroke-[1.8] ${active === 'news' ? 'text-[#d4b37f] drop-shadow-[0_0_8px_rgba(212,179,127,0.5)]' : ''}`}
        />
        {active === 'news' && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#d4b37f] shadow-[0_0_6px_#d4b37f]" />
        )}
      </button>

      {/* 4. Profile (User) */}
      <button
        type="button"
        onClick={onProfileClick ?? (() => navigate('/profile'))}
        className={getButtonClassName(active === 'profile')}
        aria-label="Профиль"
      >
        <User
          className={`h-5 w-5 stroke-[1.8] ${active === 'profile' ? 'text-[#d4b37f] drop-shadow-[0_0_8px_rgba(212,179,127,0.5)]' : ''}`}
        />
        {active === 'profile' && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#d4b37f] shadow-[0_0_6px_#d4b37f]" />
        )}
      </button>

      {/* 5. Support (Headphones) */}
      <button
        type="button"
        onClick={onSupportClick ?? (() => navigate('/support'))}
        className={getButtonClassName(active === 'support')}
        aria-label="Поддержка"
      >
        <Headphones
          className={`h-5 w-5 stroke-[1.8] ${active === 'support' ? 'text-[#d4b37f] drop-shadow-[0_0_8px_rgba(212,179,127,0.5)]' : ''}`}
        />
        {active === 'support' && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#d4b37f] shadow-[0_0_6px_#d4b37f]" />
        )}
      </button>
    </nav>
  );
}
