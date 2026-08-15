import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Check, ShieldCheck, Wallet } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { subscriptionApi } from '@/api/subscription';
import { useFreshThemeContext } from '../FreshThemeContext';
import { FreshNavbar } from '../components/FreshNavbar';

const FALLBACK_PLANS = [
  {
    id: 1,
    periodDays: 30,
    title: '1 Месяц',
    priceRub: 199,
    popular: false,
    discount: null,
    features: [
      '5 устройств одновременно',
      '10 Gbps европейский порт',
      'Безлимитный трафик',
      'Anti-DPI VLESS + Hysteria 2',
      'Поддержка 24/7',
    ],
  },
  {
    id: 3,
    periodDays: 90,
    title: '3 Месяца',
    priceRub: 499,
    popular: true,
    discount: 'Скидка 20%',
    features: [
      '5 устройств одновременно',
      '10 Gbps европейский порт',
      'Безлимитный трафик',
      'Приоритетный пинг в играх',
      'Anti-DPI VLESS + Hysteria 2',
      'Поддержка 24/7',
    ],
  },
  {
    id: 12,
    periodDays: 365,
    title: '1 Год',
    priceRub: 1490,
    popular: false,
    discount: 'Скидка 40%',
    features: [
      '5 устройств одновременно',
      'Выделенный скоростной канал',
      'Безлимитный трафик',
      'Резервные серверы Швеция/Нидерланды',
      'VIP поддержка',
    ],
  },
];

export function FreshSubscriptionPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { config } = useFreshThemeContext();
  const [selectedPlanId, setSelectedPlanId] = useState<number>(3);

  const { data: purchaseOptionsData } = useQuery({
    queryKey: ['purchase-options'],
    queryFn: subscriptionApi.getPurchaseOptions,
  });

  const rawOptions = (purchaseOptionsData as any)?.options;
  const plans =
    Array.isArray(rawOptions) && rawOptions.length > 0
      ? rawOptions.map((opt: any, idx: number) => ({
          id: opt.period_days || idx + 1,
          periodDays: opt.period_days || 30,
          title: opt.title || `${opt.period_days / 30} Мес`,
          priceRub: opt.price_rubles || Math.round(opt.price_kopeks / 100) || 199,
          popular: opt.period_days === 90 || opt.is_popular,
          discount:
            opt.discount_text ||
            (opt.period_days === 90 ? 'Скидка 20%' : opt.period_days === 365 ? 'Скидка 40%' : null),
          features: opt.features || [
            '5 устройств одновременно',
            '10 Gbps европейский порт',
            'Безлимитный трафик',
            'Anti-DPI VLESS + Hysteria 2',
            'Поддержка 24/7',
          ],
        }))
      : FALLBACK_PLANS;

  const selectedPlan = plans.find((p: any) => p.id === selectedPlanId) || plans[1] || plans[0];
  const accentLime = config.accentColor || '#d7ff3b';
  const balanceRub =
    user?.balance_rubles ?? (user?.balance_kopeks ? Math.floor(user.balance_kopeks / 100) : 1500);

  const handleProceedToPayment = () => {
    navigate(`/balance/top-up?amount=${selectedPlan.priceRub}&plan=${selectedPlan.id}`);
  };

  const handleQuickTopup = (amount: number) => {
    navigate(`/balance/top-up?amount=${amount}`);
  };

  return (
    <div className="fresh-backdrop-container min-h-screen pb-28 font-sans text-[#f5f5f7] selection:bg-[#d7ff3b]/30 selection:text-white">
      <FreshNavbar />

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0d1610]/80 px-4 py-1.5 text-xs text-[#8e9690]">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: accentLime, boxShadow: `0 0 8px ${accentLime}` }}
            />
            <span className="font-semibold text-white">Выбор тарифа и пополнение</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Тарифные планы
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-[#9ca59e]">
            Честные цены без скрытых платежей. Все тарифы включают полную скорость 10 Gbps и
            неограниченный трафик.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan: any) => {
            const isSelected = selectedPlan.id === plan.id;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`fresh-bento-card relative flex cursor-pointer flex-col justify-between p-7 transition-all duration-300 ${
                  isSelected
                    ? 'scale-[1.02] shadow-2xl ring-2 ring-[#d7ff3b]'
                    : 'hover:border-white/20'
                }`}
                style={{
                  boxShadow: isSelected
                    ? `0 0 35px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.25)'}`
                    : undefined,
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-black uppercase text-black"
                    style={{ backgroundColor: accentLime }}
                  >
                    ПОПУЛЯРНЫЙ ВЫБОР
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">{plan.title}</h3>
                    {plan.discount && (
                      <span className="rounded-md border border-[#d7ff3b]/40 bg-[#d7ff3b]/10 px-2 py-0.5 text-[10px] font-bold text-[#d7ff3b]">
                        {plan.discount}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.priceRub} ₽</span>
                    <span className="text-xs text-[#8e9690]">/ {plan.periodDays} дней</span>
                  </div>

                  <div className="my-6 h-px w-full bg-white/10" />

                  <ul className="space-y-3 text-xs text-[#c8d0ca]">
                    {plan.features.map((feat: string, fIdx: number) => (
                      <li key={fIdx} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-[#d7ff3b]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlanId(plan.id);
                      handleProceedToPayment();
                    }}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black transition-all ${
                      isSelected
                        ? 'fresh-glow-btn text-black'
                        : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                    }`}
                    style={{
                      backgroundColor: isSelected ? accentLime : undefined,
                    }}
                  >
                    <span>Выбрать тариф</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Balance & Instant Top-up Widget */}
        <div className="fresh-bento-card mt-12 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                <Wallet className="h-4 w-4 text-[#d7ff3b]" />
                <span>Баланс кабинета</span>
              </div>
              <div className="mt-1 font-mono text-3xl font-black text-white">
                Текущий баланс: {balanceRub} ₽
              </div>
              <p className="mt-1 text-xs text-[#8e9690]">
                Пополните баланс любым удобным способом для автоматического продления тарифа
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[200, 500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickTopup(amt)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:border-[#d7ff3b] hover:bg-[#d7ff3b]/10 hover:text-[#d7ff3b]"
                >
                  +{amt} ₽
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Russian Yandex Direct Routing Banner */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-[#080d0a]/90 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#ffcc00]/30 bg-[#ffcc00]/10 text-lg font-black text-[#ffcc00]">
                Я
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Умный обход: Яндекс, Госуслуги, Банки без задержек
                </h4>
                <p className="text-xs text-[#8e9690]">
                  Российские сайты работают напрямую через локального провайдера на полной скорости
                  без включения и выключения VPN.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-xs font-bold text-[#d7ff3b]">
              <ShieldCheck className="h-4 w-4" />
              <span>Smart Split-Tunneling 3.0</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
