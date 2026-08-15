import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CreditCard, HelpCircle, Home, Radio, User } from 'lucide-react';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';

const NAV_ITEMS = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/connection', label: 'Подключение', icon: Radio },
  { path: '/subscription', label: 'Тарифы', icon: CreditCard },
  { path: '/profile', label: 'Профиль', icon: User },
  { path: '/support', label: 'Помощь', icon: HelpCircle },
];

export const CyberFloatingDock: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = useThemeEngine();
  const accent = config.accentColor || '#00ff66';

  return (
    <nav
      aria-label="Плавающая панель навигации"
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
    >
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#080d0a]/85 p-2 shadow-2xl backdrop-blur-2xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-white/15 text-white shadow-lg'
                  : 'text-[#8e9690] hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <Icon
                className="h-4 w-4 transition-transform duration-300"
                style={{ color: isActive ? accent : undefined }}
              />
              <span className={isActive ? 'block' : 'hidden sm:block'}>{item.label}</span>

              {/* Active Neon Dot Indicator */}
              {isActive && (
                <span
                  className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full shadow-md"
                  style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
