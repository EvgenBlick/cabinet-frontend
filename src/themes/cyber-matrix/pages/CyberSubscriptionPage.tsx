import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Check, Flame, ShieldCheck, Zap } from 'lucide-react';
import { subscriptionApi } from '@/api/subscription';
import { useAuthStore } from '@/store/auth';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';
import { CyberParticleCanvas } from '../components/CyberParticleCanvas';
import { CyberFloatingDock } from '../components/CyberFloatingDock';

interface Plan {
  id: string;
  name: string;
  durationMonths: number;
  priceRub: number;
  oldPriceRub?: number;
  discountBadge?: string;
  isPopular?: boolean;
  pricePerMonth: number;
  features?: string[];
}

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'plan_1m',
    name: '1 Месяц',
    durationMonths: 1,
    priceRub: 150,
    pricePerMonth: 150,
  },
  {
    id: 'plan_3m',
    name: '3 Месяца',
    durationMonths: 3,
    priceRub: 390,
    oldPriceRub: 450,
    discountBadge: '-15%',
    pricePerMonth: 130,
  },
  {
    id: 'plan_6m',
    name: '6 Месяцев',
    durationMonths: 6,
    priceRub: 690,
    oldPriceRub: 900,
    discountBadge: '-25%',
    pricePerMonth: 115,
  },
  {
    id: 'plan_12m',
    name: '12 Месяцев',
    durationMonths: 12,
    priceRub: 1190,
    oldPriceRub: 1800,
    discountBadge: '-35%',
    isPopular: true,
    pricePerMonth: 99,
  },
];

export const CyberSubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { config } = useThemeEngine();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_12m');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
  });

  const { data: purchaseOptions } = useQuery({
    queryKey: ['purchase-options'],
    queryFn: subscriptionApi.getPurchaseOptions,
  });

  const plans: Plan[] = React.useMemo(() => {
    if (
      purchaseOptions &&
      (purchaseOptions as any).tariffs &&
      (purchaseOptions as any).tariffs.length > 0
    ) {
      return (purchaseOptions as any).tariffs.map((t: any) => {
        const months = Math.max(1, Math.round((t.duration_days || 30) / 30));
        const price = t.price_rubles ?? Math.round((t.price_kopeks || 0) / 100);
        return {
          id: String(t.id),
          name: t.name,
          durationMonths: months,
          priceRub: price,
          oldPriceRub: t.old_price_rubles,
          discountBadge: t.discount_badge,
          isPopular: !!t.is_popular,
          pricePerMonth: Math.round(price / months),
          features: t.features,
        };
      });
    }
    return DEFAULT_PLANS;
  }, [purchaseOptions]);

  const daysLeft = subData?.subscription?.days_left ?? 30;
  const accent = config.accentColor || '#00ff66';
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0] || DEFAULT_PLANS[0];

  const handleProceedToPayment = () => {
    setIsProcessing(true);
    navigate(`/balance/top-up?amount=${selectedPlan.priceRub}&plan=${selectedPlan.id}`);
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#040705] pb-32 text-[#f5f5f7] selection:bg-emerald-500/30 selection:text-white">
      <CyberParticleCanvas />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-1.5 text-xs text-[#8e9690]">
            <span
              className="h-2 w-2 animate-ping rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span className="font-bold text-white">Выбор тарифного плана</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Тарифы и подписка
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs text-[#8e9690] sm:text-sm">
            Высокоскоростной доступ без ограничений по трафику с европейскими серверами и гарантией
            аптайма 99.9%.
          </p>
        </div>

        {/* Current Active Plan Status Banner */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#080d0a]/90 p-5 shadow-xl backdrop-blur-xl sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-black/60 shadow-lg"
                style={{
                  borderColor: `${accent}60`,
                  boxShadow: `0 0 15px ${config.accentGlowColor}`,
                }}
              >
                <ShieldCheck className="h-6 w-6" style={{ color: accent }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Текущий статус: Активен</span>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    {daysLeft} дней осталось
                  </span>
                </div>
                <div className="text-xs text-[#8e9690]">
                  Продление добавит выбранный срок к текущей активной подписке без потери дней.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#8e9690]">Баланс счета:</span>
              <span className="font-mono text-base font-extrabold text-white">
                {(user as any)?.balance_rubles ?? 1500} ₽
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid (4 Plans) */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all duration-300 ${
                  isSelected
                    ? 'scale-[1.02] border-emerald-400/80 bg-[#0a140d]/95 shadow-2xl'
                    : 'border-white/10 bg-[#080d0a]/80 hover:border-white/20 hover:bg-[#080d0a]/95'
                }`}
                style={{
                  boxShadow: isSelected ? `0 0 30px ${config.accentGlowColor}` : undefined,
                }}
              >
                {/* Popular / Best value badge */}
                {plan.isPopular && (
                  <div
                    className="absolute right-4 top-4 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black text-black shadow-md"
                    style={{ backgroundColor: accent }}
                  >
                    <Flame className="h-3 w-3 fill-black" />
                    <span>ХИТ ПРОДАЖ</span>
                  </div>
                )}

                {plan.discountBadge && !plan.isPopular && (
                  <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                    {plan.discountBadge}
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-black text-white">
                      {plan.priceRub} ₽
                    </span>
                    {plan.oldPriceRub && (
                      <span className="font-mono text-sm text-[#8e9690] line-through">
                        {plan.oldPriceRub} ₽
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-xs text-[#8e9690]">
                    ~{plan.pricePerMonth} ₽ / месяц
                  </div>

                  {/* Plan Features */}
                  <div className="mt-6 space-y-2.5 border-t border-white/5 pt-5 text-xs text-[#c4ceca]">
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5" style={{ color: accent }} />
                      <span>Безлимитный трафик</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5" style={{ color: accent }} />
                      <span>10 Гбит/с порты (ЕС)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5" style={{ color: accent }} />
                      <span>До 5 устройств сразу</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5" style={{ color: accent }} />
                      <span>Умный обход Яндекса</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition-all ${
                    isSelected
                      ? 'text-black shadow-lg'
                      : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: isSelected ? accent : undefined,
                  }}
                >
                  <span>{isSelected ? 'Выбран тариф' : 'Выбрать'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Plan Summary & Checkout Action */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-[#080d0a]/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="text-xs text-[#8e9690]">Итого к оплате:</span>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-3xl font-black text-white">
                  {selectedPlan.priceRub} ₽
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  (Тариф: {selectedPlan.name} без автосписаний)
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-xs font-black text-black shadow-xl transition-transform hover:scale-105"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 0 25px ${config.accentGlowColor}`,
                }}
              >
                <Zap className="h-4 w-4" />
                <span>Оплатить через СБП / Картой / Криптой</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 🇷🇺 Умная маршрутизация Яндекса баннер */}
        <div className="mt-6 rounded-3xl border border-[#00ff66]/30 bg-gradient-to-br from-[#08140c]/90 to-[#040906]/95 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-black"
              style={{ backgroundColor: accent }}
            >
              Я
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Умная маршрутизация Яндекса включена во все тарифы
            </span>
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-[#c4ceca]">
            Вам не придется отключать VPN для заказа Такси, прослушивания Яндекс Музыки, просмотра
            Кинопоиска или оплаты в мобильных банках — система автоматически направляет этот трафик
            напрямую без задержек.
          </p>
        </div>
      </main>

      <CyberFloatingDock />
    </div>
  );
};
