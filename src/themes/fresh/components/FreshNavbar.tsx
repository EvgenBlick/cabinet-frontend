import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  ChevronDown,
  CreditCard,
  Laptop,
  LogOut,
  ShieldCheck,
  Smartphone,
  Tv,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useBranding } from '@/hooks/useBranding';
import { useFreshThemeContext } from '../FreshThemeContext';
import { cn } from '@/lib/utils';

export function FreshNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuthStore();
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
    navigate('/fresh/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 pb-2 pt-4 transition-all duration-300">
      <div
        ref={dropdownRef}
        className="fresh-glass-pill relative mx-auto flex max-w-5xl items-center justify-between rounded-full px-5 py-2.5 shadow-2xl"
      >
        {/* 1. Left: Dynamic Brand Logo & Name */}
        <button
          type="button"
          onClick={() => navigate('/fresh')}
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
              navigate('/fresh');
            }}
            className={cn(
              'relative text-[13px] font-medium tracking-wide transition-colors focus:outline-none',
              location.pathname === '/fresh'
                ? 'text-[#f5f5f7]'
                : 'text-[#8e9690] hover:text-[#f5f5f7]',
            )}
          >
            Главная
            {location.pathname === '/fresh' && (
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
                      navigate('/fresh/connection');
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
                      <div className="text-[10px] text-[#8e9690]">Приложение Happ и QR-код</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate('/fresh/connection');
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
                      navigate('/fresh/connection');
                    }}
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-[#f5f5f7] hover:bg-white/10"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#8e9690]">
                      <Tv className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="font-bold">Android TV & Smart TV</div>
                      <div className="text-[10px] text-[#8e9690]">Удобное подключение по коду</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Тарифы */}
          <button
            type="button"
            onClick={() => {
              setActiveDropdown(null);
              navigate('/fresh/subscription');
            }}
            className={cn(
              'relative text-[13px] font-medium tracking-wide transition-colors focus:outline-none',
              location.pathname.startsWith('/fresh/subscription')
                ? 'text-[#f5f5f7]'
                : 'text-[#8e9690] hover:text-[#f5f5f7]',
            )}
          >
            Тарифы
          </button>

          {/* Новости & База знаний */}
          <button
            type="button"
            onClick={() => {
              setActiveDropdown(null);
              navigate('/fresh/news');
            }}
            className={cn(
              'relative text-[13px] font-medium tracking-wide transition-colors focus:outline-none',
              location.pathname.startsWith('/fresh/news')
                ? 'text-[#f5f5f7]'
                : 'text-[#8e9690] hover:text-[#f5f5f7]',
            )}
          >
            Новости & FAQ
          </button>

          {/* Поддержка */}
          <button
            type="button"
            onClick={() => {
              setActiveDropdown(null);
              openModal('support');
            }}
            className="text-[13px] font-medium tracking-wide text-[#8e9690] transition-colors hover:text-[#f5f5f7] focus:outline-none"
          >
            Поддержка
          </button>
        </nav>

        {/* 3. Right: Balance Pill, User Dropdown & Radiant CTA */}
        <div className="flex items-center gap-3">
          {/* Balance Pill */}
          <button
            type="button"
            onClick={() => navigate('/fresh/subscription')}
            className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-[#8e9690] transition-all hover:bg-white/[0.06] hover:text-[#f5f5f7] sm:flex"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: accentLime,
                boxShadow: `0 0 6px ${accentLime}`,
              }}
            />
            <span className="font-semibold text-[#f5f5f7]">{balanceRub} ₽</span>
          </button>

          {/* User Profile Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#d1d5db] transition-all hover:border-white/20 hover:text-white"
            >
              <User className="h-3.5 w-3.5" style={{ color: accentLime }} />
              <span className="hidden font-medium sm:inline">
                {user?.first_name || user?.username || 'Кабинет'}
              </span>
              <ChevronDown className="h-3 w-3 text-[#8e9690]" />
            </button>

            {activeDropdown === 'profile' && (
              <div className="fresh-bento-card animate-in fade-in slide-in-from-top-2 absolute right-0 top-10 w-56 p-3 shadow-2xl backdrop-blur-3xl duration-200">
                <div className="mb-2 border-b border-white/10 px-2 pb-2">
                  <div className="text-xs font-bold text-white">
                    {user?.first_name || user?.username || 'Пользователь'}
                  </div>
                  <div className="text-[11px] text-[#8e9690]">Баланс: {balanceRub} ₽</div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate('/fresh/profile');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left text-[#f5f5f7] hover:bg-white/10"
                  >
                    <User className="h-3.5 w-3.5" style={{ color: accentLime }} />
                    <span>Мой профиль и устройства</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate('/fresh/subscription');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left text-[#f5f5f7] hover:bg-white/10"
                  >
                    <CreditCard className="h-3.5 w-3.5" style={{ color: accentLime }} />
                    <span>Пополнить баланс</span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        navigate('/admin/fresh-theme');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left text-[#f5f5f7] hover:bg-white/10"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" style={{ color: accentLime }} />
                      <span>Настройка темы (Админ)</span>
                    </button>
                  )}

                  <div className="border-t border-white/10 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Выйти из кабинета</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Radiant Neon CTA Button: Подключить -> */}
          <button
            type="button"
            onClick={() => navigate('/fresh/connection')}
            className="fresh-glow-btn flex items-center gap-1.5 rounded-full px-5 py-2 text-[12px] font-extrabold tracking-wide text-black transition-all"
          >
            <span>Подключить</span>
            <span className="text-sm font-bold">→</span>
          </button>
        </div>
      </div>
    </header>
  );
}
