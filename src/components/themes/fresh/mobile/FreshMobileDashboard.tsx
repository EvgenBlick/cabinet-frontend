import { useNavigate } from 'react-router';
import {
  ArrowRight,
  CreditCard,
  Headphones,
  Newspaper,
  Radio,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  Users,
  Zap,
} from 'lucide-react';
import type { Subscription } from '@/types';
import { useAuthStore } from '@/store/auth';
import { useBranding } from '@/hooks/useBranding';
import { useFreshTheme } from '@/hooks/useFreshTheme';
import { DynamicThemeBackground } from '@/themes/core/DynamicThemeBackground';

export interface FreshMobileDashboardProps {
  subscription: Subscription | null;
  connectedDevicesCount: number;
  daysLeft: number | null;
  onBuySubscription: () => void;
  onOpenConnection: () => void;
  onOpenSupport: () => void;
}

export function FreshMobileDashboard({
  subscription,
  connectedDevicesCount,
  daysLeft,
  onBuySubscription,
  onOpenConnection,
  onOpenSupport,
}: FreshMobileDashboardProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const { appName, logoUrl } = useBranding();
  const { config } = useFreshTheme();

  const isSubActive = daysLeft === null || daysLeft > 0;
  const activeSlots = connectedDevicesCount > 0 ? connectedDevicesCount : 1;
  const totalSlots = subscription?.device_limit || 5;

  return (
    <div className="relative min-h-screen px-4 pb-28 pt-5 text-[#f5f5f7]">
      <DynamicThemeBackground />
      {/* 1. Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0e1611]"
            style={{
              borderColor: `${config.accentColor}40`,
              boxShadow: `0 0 12px ${config.accentGlowColor}`,
            }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-5 w-5 object-contain" />
            ) : (
              <Sparkles className="h-4 w-4" style={{ color: config.accentColor }} />
            )}
          </div>
          <span className="text-sm font-extrabold tracking-wider text-[#f5f5f7]">
            {appName ? appName.toUpperCase() : 'VPN SERVICE'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-[#8e929b]"
            >
              <ShieldCheck className="h-3 w-3" style={{ color: config.accentColor }} />
              <span>Админ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
          >
            <User className="h-4 w-4" style={{ color: config.accentColor }} />
          </button>
        </div>
      </div>

      {/* 2. Main Fresh Medallion Plan Card */}
      <div className="fresh-bento-card mt-5 p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e929b]">
                Ваш тариф
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor: `${config.accentColor}15`,
                  color: config.accentColor,
                  border: `1px solid ${config.accentColor}30`,
                }}
              >
                ● {isSubActive ? 'Активен' : 'Не активен'}
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#f5f5f7]">
              {appName || 'Fresh VPN'}
            </h2>
            <p className="text-xs text-[#8e929b]">
              {isSubActive ? 'Безлимитный скоростной доступ' : 'Подписка приостановлена'}
            </p>
          </div>

          {/* Glowing Central Neon Core */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-gradient-to-b from-[#121c15] to-[#0a0f0c] shadow-lg"
            style={{
              borderColor: `${config.accentColor}50`,
              boxShadow: `0 0 25px ${config.accentGlowColor}`,
            }}
          >
            <Sparkles className="h-7 w-7" style={{ color: config.accentColor }} />
          </div>
        </div>

        {/* Telemetry Metrics Row */}
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
            <span className="text-[9px] uppercase tracking-wider text-[#8e929b]">Дней</span>
            <div className="text-sm font-extrabold text-[#f5f5f7]">
              {daysLeft !== null ? daysLeft : '∞'}
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
            <span className="text-[9px] uppercase tracking-wider text-[#8e929b]">Слотов</span>
            <div className="text-sm font-extrabold text-[#f5f5f7]">
              {activeSlots}/{totalSlots}
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
            <span className="text-[9px] uppercase tracking-wider text-[#8e929b]">Скорость</span>
            <div className="text-sm font-extrabold text-emerald-400">10 Gbps</div>
          </div>
        </div>

        {/* Action button inside card */}
        <button
          type="button"
          onClick={onOpenConnection}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5 text-xs font-semibold text-[#8e929b] transition-all hover:text-[#f5f5f7]"
        >
          <span>Детали подключения</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 3. Quick Action Cards */}
      <div className="mt-4 space-y-3">
        {/* Connect Action */}
        <button
          type="button"
          onClick={onOpenConnection}
          className="fresh-bento-card flex w-full items-center justify-between p-4 text-left transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0e1611]"
              style={{ borderColor: `${config.accentColor}30` }}
            >
              <Smartphone className="h-5 w-5" style={{ color: config.accentColor }} />
            </div>
            <div>
              <div className="text-sm font-bold text-[#f5f5f7]">Подключить устройство</div>
              <div className="text-[11px] text-[#8e929b]">QR-код и быстрое добавление в Happ</div>
            </div>
          </div>
          <span
            className="rounded-lg px-2.5 py-1 text-[11px] font-bold"
            style={{
              backgroundColor: `${config.accentColor}20`,
              color: config.accentColor,
            }}
          >
            QR
          </span>
        </button>

        {/* Refer Friend Action */}
        <button
          type="button"
          onClick={() => navigate('/referral')}
          className="fresh-bento-card flex w-full items-center justify-between p-4 text-left transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#8e929b]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#f5f5f7]">Позови друга</div>
              <div className="text-[11px] text-[#8e929b]">+3 дня к подписке за каждого друга</div>
            </div>
          </div>
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-[#8e929b]">
            Бонус ↗
          </span>
        </button>
      </div>

      {/* 4. Bottom Main Action CTA */}
      <div className="mt-5">
        <button
          type="button"
          onClick={onBuySubscription}
          className="fresh-glow-btn flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-extrabold shadow-xl"
        >
          <CreditCard className="h-4 w-4" />
          <span>Продлить или выбрать тариф</span>
        </button>
      </div>

      {/* 5. Floating Bottom Navigation Dock */}
      <nav className="fixed bottom-3 left-4 right-4 z-50">
        <div className="fresh-glass-pill mx-auto flex max-w-md items-center justify-around rounded-full py-2 shadow-2xl">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-semibold text-white"
          >
            <Zap className="h-4 w-4" style={{ color: config.accentColor }} />
            <span>Главная</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/connection')}
            className="flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium text-[#8e929b] hover:text-white"
          >
            <Radio className="h-4 w-4" />
            <span>Подключение</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/news')}
            className="flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium text-[#8e929b] hover:text-white"
          >
            <Newspaper className="h-4 w-4" />
            <span>Новости</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium text-[#8e929b] hover:text-white"
          >
            <User className="h-4 w-4" />
            <span>Профиль</span>
          </button>

          <button
            type="button"
            onClick={onOpenSupport}
            className="flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium text-[#8e929b] hover:text-white"
          >
            <Headphones className="h-4 w-4" />
            <span>Поддержка</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
