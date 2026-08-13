import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, Settings, ShieldCheck, Sparkles, User } from 'lucide-react';
import type { UltimaBottomNavTab } from '@/features/ultima/navigation';

type UltimaBottomNavProps = {
  active: UltimaBottomNavTab;
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
  onProfileClick,
  onSupportClick,
}: UltimaBottomNavProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getButtonClassName = (isActive: boolean) =>
    isActive
      ? 'relative flex h-11 flex-1 items-center justify-center text-[#d4b37f] transition-all'
      : 'relative flex h-11 flex-1 items-center justify-center text-[#7e838c] transition-all hover:text-[#c8aa76]';

  return (
    <nav className="ultima-bottom-nav mx-auto flex items-center justify-around rounded-2xl border-t border-white/[0.08] bg-gradient-to-b from-[#2b2e34]/95 to-[#16181b]/95 p-1 shadow-[0_-4px_24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
      {/* 1. Dashboard (Grid) */}
      <button
        type="button"
        onClick={onHomeClick ?? (() => navigate('/'))}
        className={getButtonClassName(active === 'home')}
        aria-label="Главная"
      >
        <LayoutGrid className="h-6 w-6 stroke-[1.8] drop-shadow-sm" />
      </button>

      {/* 2. Connection / Settings (Gear) */}
      <button
        type="button"
        onClick={onConnectionClick ?? (() => navigate('/connection'))}
        className={getButtonClassName(active === 'connection')}
        aria-label="Настройки"
      >
        <Settings className="h-6 w-6 stroke-[1.8] drop-shadow-sm" />
      </button>

      {/* 3. Profile (User) */}
      <button
        type="button"
        onClick={onProfileClick ?? (() => navigate('/profile'))}
        className={getButtonClassName(active === 'profile')}
        aria-label="Профиль"
      >
        <User className="h-6 w-6 stroke-[1.8] drop-shadow-sm" />
      </button>

      {/* 4. Support / Security (Shield with Sparkle) */}
      <button
        type="button"
        onClick={onSupportClick ?? (() => navigate('/support'))}
        className={getButtonClassName(active === 'support')}
        aria-label="Поддержка"
      >
        <div className="relative flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 stroke-[1.8] drop-shadow-sm" />
          <Sparkles className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 fill-[#d4b37f] text-[#d4b37f]" />
        </div>
      </button>
    </nav>
  );
}
