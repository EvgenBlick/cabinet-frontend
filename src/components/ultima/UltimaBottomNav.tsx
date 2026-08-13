import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Headphones, LayoutDashboard, Newspaper, Settings2, UserRound } from 'lucide-react';
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
  onNewsClick,
  onProfileClick,
  onSupportClick,
}: UltimaBottomNavProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const navLabels: Record<UltimaBottomNavTab, string> = {
    home: t('nav.dashboard', { defaultValue: 'Главная' }),
    connection: t('lite.connect', { defaultValue: 'Подключиться' }),
    news: t('nav.info', { defaultValue: 'Информация' }),
    profile: t('nav.profile', { defaultValue: 'Профиль' }),
    support: t('nav.support', { defaultValue: 'Поддержка' }),
  };

  const getButtonClassName = (isActive: boolean) =>
    isActive
      ? 'relative flex h-11 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-200 active:scale-95 lg:h-11 lg:rounded-[8px] xl:justify-start xl:gap-3 xl:px-3'
      : 'relative flex h-11 items-center justify-center rounded-full text-white/50 transition-all duration-200 hover:bg-white/[0.06] hover:text-white/80 active:scale-95 lg:h-11 lg:rounded-[8px] xl:justify-start xl:gap-3 xl:px-3';

  return (
    <nav className="ultima-bottom-nav mx-auto grid grid-cols-5 items-center gap-1.5 rounded-full border border-white/[0.1] bg-black/40 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl lg:grid-cols-1 lg:gap-1.5 lg:rounded-[8px] lg:p-0 lg:shadow-none lg:backdrop-blur-none">
      <button
        type="button"
        data-ultima-nav-btn="1"
        data-ultima-nav-target="home"
        className={getButtonClassName(active === 'home')}
        onClick={onHomeClick ?? (() => navigate('/'))}
        aria-label={navLabels.home}
        title={navLabels.home}
      >
        <LayoutDashboard className="h-5 w-5 shrink-0" strokeWidth={active === 'home' ? 2.2 : 1.8} />
        <span className="hidden min-w-0 truncate text-sm font-medium xl:inline">
          {navLabels.home}
        </span>
      </button>
      <button
        type="button"
        data-ultima-nav-btn="1"
        data-ultima-nav-target="connection"
        className={getButtonClassName(active === 'connection')}
        onClick={onConnectionClick ?? (() => navigate('/connection'))}
        aria-label={navLabels.connection}
        title={navLabels.connection}
      >
        <Settings2 className="h-5 w-5 shrink-0" strokeWidth={active === 'connection' ? 2.2 : 1.8} />
        <span className="hidden min-w-0 truncate text-sm font-medium xl:inline">
          {navLabels.connection}
        </span>
      </button>
      <button
        type="button"
        data-ultima-nav-btn="1"
        data-ultima-nav-target="news"
        className={getButtonClassName(active === 'news')}
        onClick={onNewsClick ?? (() => navigate('/ultima/news'))}
        aria-label={navLabels.news}
        title={navLabels.news}
      >
        <Newspaper className="h-5 w-5 shrink-0" strokeWidth={active === 'news' ? 2.2 : 1.8} />
        <span className="hidden min-w-0 truncate text-sm font-medium xl:inline">
          {navLabels.news}
        </span>
      </button>
      <button
        type="button"
        data-ultima-nav-btn="1"
        data-ultima-nav-target="profile"
        className={getButtonClassName(active === 'profile')}
        onClick={onProfileClick ?? (() => navigate('/profile'))}
        aria-label={navLabels.profile}
        title={navLabels.profile}
      >
        <UserRound className="h-5 w-5 shrink-0" strokeWidth={active === 'profile' ? 2.2 : 1.8} />
        <span className="hidden min-w-0 truncate text-sm font-medium xl:inline">
          {navLabels.profile}
        </span>
      </button>
      <button
        type="button"
        data-ultima-nav-btn="1"
        data-ultima-nav-target="support"
        className={getButtonClassName(active === 'support')}
        onClick={onSupportClick ?? (() => navigate('/support'))}
        aria-label={navLabels.support}
        title={navLabels.support}
      >
        <Headphones className="h-5 w-5 shrink-0" strokeWidth={active === 'support' ? 2.2 : 1.8} />
        <span className="hidden min-w-0 truncate text-sm font-medium xl:inline">
          {navLabels.support}
        </span>
      </button>
    </nav>
  );
}
