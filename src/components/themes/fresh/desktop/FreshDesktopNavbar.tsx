import { useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '@/store/auth';
import { useBranding } from '@/hooks/useBranding';
import { useFreshTheme } from '@/hooks/useFreshTheme';
import { cn } from '@/lib/utils';

export function FreshDesktopNavbar({
  onBuySubscription,
  onOpenSupport,
}: {
  onBuySubscription?: () => void;
  onOpenSupport?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { appName, logoUrl } = useBranding();
  const { config } = useFreshTheme();

  const brandTitle = appName ? appName.toUpperCase() : 'VERDANT';

  const navItems = [
    {
      id: 'product',
      label: 'Product',
      path: '/',
      active: location.pathname === '/' || location.pathname === '/fresh',
    },
    {
      id: 'solutions',
      label: 'Solutions',
      path: '/connection',
      active: location.pathname.startsWith('/connection'),
    },
    {
      id: 'pricing',
      label: 'Pricing',
      path: '/subscription',
      active: location.pathname.startsWith('/subscription'),
      onClick: onBuySubscription ? () => onBuySubscription() : undefined,
    },
    {
      id: 'resources',
      label: 'Resources',
      path: '/news',
      active: location.pathname.startsWith('/news') || location.pathname.startsWith('/ultima/news'),
    },
    {
      id: 'company',
      label: 'Company',
      path: '/support',
      active: location.pathname.startsWith('/support'),
      onClick: onOpenSupport ? () => onOpenSupport() : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 pb-2 pt-5 transition-all duration-300">
      <div className="fresh-glass-pill mx-auto flex max-w-5xl items-center justify-between rounded-full px-5 py-2.5 shadow-2xl">
        {/* 1. Left Brand: Sprout Leaf Icon + VERDANT text */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="group flex items-center gap-2.5 focus:outline-none"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-6 w-6 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            /* Custom sleek Verdant Leaf SVG from reference */
            <svg
              className="h-5 w-5 transition-transform group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke={config.accentColor || '#d7ff3b'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          )}
          <span
            className="text-[13px] font-black tracking-[0.18em] text-[#f5f5f7]"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {brandTitle}
          </span>
        </button>

        {/* 2. Middle Nav Links: Product, Solutions, Pricing, Resources, Company */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => {
            const isActive = item.active;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick || (() => navigate(item.path))}
                className={cn(
                  'relative text-[13px] font-medium tracking-wide transition-colors focus:outline-none',
                  isActive ? 'text-[#f5f5f7]' : 'text-[#8e9690] hover:text-[#f5f5f7]',
                )}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                    style={{
                      backgroundColor: config.accentColor || '#d7ff3b',
                      boxShadow: `0 0 6px ${config.accentColor || '#d7ff3b'}`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* 3. Right: Log in & Get Started -> */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(user ? '/profile' : '/login')}
            className="text-[13px] font-medium tracking-wide text-[#d1d5db] transition-colors hover:text-white"
          >
            {user ? user.first_name || user.username || 'Account' : 'Log in'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/connection')}
            className="fresh-glow-btn flex items-center gap-1.5 rounded-full px-5 py-2 text-[12px] font-extrabold tracking-wide transition-all"
          >
            <span>Get Started</span>
            <span className="text-sm font-bold">→</span>
          </button>
        </div>
      </div>
    </header>
  );
}
