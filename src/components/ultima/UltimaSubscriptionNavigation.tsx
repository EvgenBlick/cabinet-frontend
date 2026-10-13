import { NavLink } from 'react-router';
import { useHaptic } from '@/platform';

export function UltimaSubscriptionNavigation() {
  const haptic = useHaptic();
  return (
    <nav aria-label="Тарифы и управление подпиской" className="cabinet-glass-navigation mb-5 grid grid-cols-2 gap-1 rounded-[22px] border border-white/[0.12] bg-white/[0.035] p-1">
      {[
        { to: '/subscription', label: 'Тарифы' },
        { to: '/ultima/subscription-info', label: 'Управление подпиской' },
      ].map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => { if (to === '/subscription') haptic.impact('light'); }}
          end
          className={({ isActive }) =>
            `cabinet-glass-control flex min-h-11 items-center justify-center rounded-[18px] border border-transparent px-3 py-2.5 text-center text-[13px] font-medium transition-[transform,opacity] duration-200 active:scale-[0.98] ${
              isActive
                ? 'border-white/[0.12] bg-white/[0.1] text-[#e2e2e8]'
                : 'text-white/70 hover:bg-white/[0.04] hover:text-white'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
