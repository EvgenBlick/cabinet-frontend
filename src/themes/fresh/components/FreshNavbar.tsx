import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  ChevronDown,
  CreditCard,
  Headphones,
  HelpCircle,
  Laptop,
  LogOut,
  Shield,
  Smartphone,
  Tv,
  User as UserIcon,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useBranding } from '@/hooks/useBranding';
import { useFreshThemeContext } from '../FreshThemeContext';
import { FreshSupportModal } from './FreshSupportModal';
import { cn } from '@/lib/utils';

export function FreshNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const logout = useAuthStore((state) => state.logout);
  const { appName, logoUrl } = useBranding();
  const { config, openModal } = useFreshThemeContext();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLogo = config.customLogoUrl || logoUrl;
  const brandTitle = (config.customBrandName || appName || 'VERDANT').toUpperCase();
  const accentLime = config.accentColor || '#d7ff3b';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const balanceRub =
    user?.balance_rubles ?? (user?.balance_kopeks ? Math.floor(user.balance_kopeks / 100) : 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-4 pb-2 pt-4 transition-all duration-300">
        <div
          ref={dropdownRef}
          className="fresh-glass-pill relative mx-auto flex max-w-5xl items-center justify-between rounded-full px-5 py-2.5 shadow-2xl"
        >
          {/* 1. Left: Dynamic Brand Logo & Name */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group flex items-center gap-2.5 focus:outline-none"
          >
            {activeLogo ? (
              <img
                src={activeLogo}
                alt=""
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <svg
                className="h-5 w-5 transition-transform group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="none"
                stroke={accentLime}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            )}
            <span
              className="text-[13px] font-black tracking-[0.16em] text-[#f5f5f7]"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {brandTitle}
            </span>
          </button>

          {/* 2. Middle Nav Links with Dropdown Menus */}
          <nav className="hidden items-center gap-6 lg:flex">
            {/* Главная */}
            <button
              type="button"
              onClick={() => {
                setActiveDropdown(null);
                navigate('/');
              }}
              className={cn(
                'relative text-[13px] font-medium tracking-wide transition-colors focus:outline-none',
                location.pathname === '/' || location.pathname === '/fresh'
                  ? 'text-[#f5f5f7]'
                  : 'text-[#8e9690] hover:text-[#f5f5f7]',
              )}
            >
              Главная
              {(location.pathname === '/' || location.pathname === '/fresh') && (
                <span
                  className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                  style={{
                    backgroundColor: accentLime,
                    boxShadow: `0 0 6px ${accentLime}`,
                  }}
                />
              )}
            </button>

            {/* Подключение (Dropdown) */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'connection' ? null : 'connection')
                }
                className={cn(
                  'flex items-center gap-1 text-[13px] font-medium tracking-wide transition-colors focus:outline-none',
                  location.pathname.startsWith('/connection') ||
                    location.pathname.startsWith('/fresh/connection')
                    ? 'text-[#f5f5f7]'
                    : 'text-[#8e9690] hover:text-[#f5f5f7]',
                )}
              >
                <span>Подключение</span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-200',
                    activeDropdown === 'connection' && 'rotate-180 text-white',
                  )}
                />
              </button>

              {activeDropdown === 'connection' && (
                <div className="fresh-bento-card animate-in fade-in slide-in-from-top-2 absolute left-0 top-10 w-64 p-3 shadow-2xl backdrop-blur-3xl duration-200">
                  <div className="space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        navigate('/connection');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-[#f5f5f7] hover:bg-white/10"
                    >
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#0e1611]"
                        style={{ borderColor: `${accentLime}40` }}
                      >
                        <Smartphone className="h-3.5 w-3.5" style={{ color: accentLime }} />
                      </div>
                      <div>
                        <div className="font-bold">iOS & Android</div>
                        <div className="text-[10px] text-[#8e9690]">Приложения Happ и Incy</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        navigate('/connection');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-[#f5f5f7] hover:bg-white/10"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#8e9690]">
                        <Laptop className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-bold">Windows & macOS</div>
                        <div className="text-[10px] text-[#8e9690]">Клиенты для ПК и ноутбуков</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        navigate('/connection');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-[#f5f5f7] hover:bg-white/10"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#8e9690]">
                        <Tv className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-bold">Android TV & Smart TV</div>
                        <div className="text-[10px] text-[#8e9690]">
                          Удобное подключение по коду
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Ресурсы / Тарифы / База знаний */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'resources' ? null : 'resources')
                }
                className={cn(
                  'flex items-center gap-1 text-[13px] font-medium tracking-wide transition-colors focus:outline-none',
                  location.pathname === '/subscription' || location.pathname === '/news'
                    ? 'text-[#f5f5f7]'
                    : 'text-[#8e9690] hover:text-[#f5f5f7]',
                )}
              >
                <span>Ресурсы</span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-200',
                    activeDropdown === 'resources' && 'rotate-180 text-white',
                  )}
                />
              </button>

              {activeDropdown === 'resources' && (
                <div className="fresh-bento-card animate-in fade-in slide-in-from-top-2 absolute left-0 top-10 w-56 p-3 shadow-2xl backdrop-blur-3xl duration-200">
                  <div className="space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        navigate('/subscription');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left text-[#f5f5f7] hover:bg-white/10"
                    >
                      <CreditCard className="h-4 w-4" style={{ color: accentLime }} />
                      <div>
                        <div className="font-semibold">Тарифные планы</div>
                        <div className="text-[10px] text-[#8e9690]">Оплата подписки и баланс</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        navigate('/news');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left text-[#f5f5f7] hover:bg-white/10"
                    >
                      <HelpCircle className="h-4 w-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold">FAQ и База знаний</div>
                        <div className="text-[10px] text-[#8e9690]">Частые вопросы и ответы</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        openModal('support');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left text-[#f5f5f7] hover:bg-white/10"
                    >
                      <Headphones className="h-4 w-4 text-sky-400" />
                      <div>
                        <div className="font-semibold">Поддержка 24/7</div>
                        <div className="text-[10px] text-[#8e9690]">Помощь в Telegram</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* 3. Right: User Profile & Connect CTA Button */}
          <div className="flex items-center gap-3">
            {/* Quick Connect CTA Button */}
            <button
              type="button"
              onClick={() => navigate('/connection')}
              className="fresh-glow-btn flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all focus:outline-none"
              style={{
                backgroundColor: accentLime,
                boxShadow: `0 0 20px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.4)'}`,
              }}
            >
              <Zap className="h-3.5 w-3.5 fill-black text-black" />
              <span>Подключить →</span>
            </button>

            {/* User Profile Pill Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1.5 pr-2.5 text-xs text-[#f5f5f7] transition-colors hover:bg-white/10 focus:outline-none"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 font-bold">
                  {user?.first_name?.[0] || 'U'}
                </div>
                <span className="hidden font-medium sm:inline">
                  {user?.first_name || 'Кабинет'}
                </span>
                <ChevronDown className="h-3 w-3 text-[#8e9690]" />
              </button>

              {activeDropdown === 'profile' && (
                <div className="fresh-bento-card animate-in fade-in slide-in-from-top-2 absolute right-0 top-11 w-56 p-3 shadow-2xl backdrop-blur-3xl duration-200">
                  <div className="space-y-1.5 text-xs">
                    <div className="border-b border-white/10 px-1 pb-2">
                      <div className="font-bold text-white">
                        {user?.first_name || 'Пользователь'}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#8e9690]">
                        Баланс: <span className="font-semibold text-white">{balanceRub} ₽</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        navigate('/profile');
                      }}
                      className="flex w-full items-center gap-2 rounded-xl p-2 text-left text-[#f5f5f7] hover:bg-white/10"
                    >
                      <UserIcon className="h-4 w-4 text-[#8e9690]" />
                      <span>Мой профиль и слоты</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        navigate('/subscription');
                      }}
                      className="flex w-full items-center gap-2 rounded-xl p-2 text-left text-[#f5f5f7] hover:bg-white/10"
                    >
                      <CreditCard className="h-4 w-4 text-[#8e9690]" />
                      <span>Пополнить баланс</span>
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDropdown(null);
                          navigate('/admin/fresh-theme');
                        }}
                        className="flex w-full items-center gap-2 rounded-xl p-2 text-left text-amber-300 hover:bg-white/10"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Настройки тем (Админ)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl p-2 text-left text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Выйти</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <FreshSupportModal />
    </>
  );
}
