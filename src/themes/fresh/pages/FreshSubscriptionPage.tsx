import { useState } from 'react';
import { ArrowRight, Check, CreditCard, Sparkles, Wallet, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useFreshThemeContext } from '../FreshThemeContext';
import { FreshNavbar } from '../components/FreshNavbar';

const TARIFF_PLANS = [
  {
    id: '1m',
    title: '1 Месяц',
    price: '199 ₽',
    duration: '30 дней',
    popular: false,
    features: [
      '5 устройств одновременно',
      '10 Gbps европейский порт',
      'Безлимитный трафик',
      'Поддержка 24/7',
    ],
  },
  {
    id: '3m',
    title: '3 Месяца',
    price: '499 ₽',
    duration: '90 дней',
    popular: true,
    discount: 'Скидка 20%',
    features: [
      '5 устройств одновременно',
      '10 Gbps европейский порт',
      'Безлимитный трафик',
      'Приоритетный пинг',
      'Поддержка 24/7',
    ],
  },
  {
    id: '12m',
    title: '1 Год',
    price: '1 490 ₽',
    duration: '365 дней',
    popular: false,
    discount: 'Скидка 40%',
    features: [
      '5 устройств одновременно',
      'Выделенный скоростной канал',
      'Безлимитный трафик',
      'Резервные серверы',
      'VIP поддержка',
    ],
  },
];

export function FreshSubscriptionPage() {
  const { user } = useAuthStore();
  const { config } = useFreshThemeContext();
  const [selectedPlan, setSelectedPlan] = useState('3m');
  const [topUpAmount, setTopUpAmount] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState<'sbp' | 'card' | 'crypto'>('sbp');
  const [isProcessing, setIsProcessing] = useState(false);

  const accentLime = config.accentColor || '#d7ff3b';
  const balanceRub =
    user?.balance_rubles ?? (user?.balance_kopeks ? Math.floor(user.balance_kopeks / 100) : 0);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert('Переход на защищенный платёжный шлюз...');
    }, 800);
  };

  return (
    <div className="fresh-backdrop-container min-h-screen font-sans text-[#f5f5f7] selection:bg-[#d7ff3b]/30 selection:text-white">
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
            Честные цены без скрытых платежей. Все тарифы включают полную скорость и неограниченный
            трафик.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TARIFF_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`fresh-bento-card relative cursor-pointer p-7 transition-all ${
                  isSelected
                    ? 'border-[#d7ff3b] shadow-[0_0_35px_rgba(215,255,59,0.2)]'
                    : 'border-white/10'
                }`}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-black shadow-lg"
                    style={{ backgroundColor: accentLime }}
                  >
                    Популярный выбор
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{plan.title}</h3>
                  {plan.discount && (
                    <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      {plan.discount}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-[#8e9690]">/ {plan.duration}</span>
                </div>

                <div className="my-6 space-y-2.5 border-t border-white/10 pt-5 text-xs">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-[#c8d0ca]">
                      <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: accentLime }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id);
                    handlePay();
                  }}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition-all ${
                    isSelected ? 'fresh-glow-btn text-black' : 'fresh-secondary-btn'
                  }`}
                >
                  <span>Выбрать тариф</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Balance Top-Up Section */}
        <div className="mt-14 rounded-3xl border border-white/10 bg-[#0d1610]/80 p-7 shadow-2xl backdrop-blur-3xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d7ff3b]">
                <Wallet className="h-4 w-4" />
                <span>Баланс кабинета</span>
              </div>
              <div className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Текущий баланс: {balanceRub} ₽
              </div>
              <p className="mt-1 text-xs text-[#8e9690]">
                Пополните баланс любым удобным способом для мгновенной оплаты подписки
              </p>
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {['200', '500', '1000', '2000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                    topUpAmount === amt
                      ? 'border-[#d7ff3b] bg-[#d7ff3b]/15 text-white'
                      : 'border-white/10 bg-white/[0.03] text-[#8e9690] hover:text-white'
                  }`}
                >
                  +{amt} ₽
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('sbp')}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                paymentMethod === 'sbp'
                  ? 'border-[#d7ff3b] bg-white/[0.08] shadow-lg'
                  : 'border-white/10 bg-white/[0.02] text-[#8e9690] hover:bg-white/[0.05]'
              }`}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d7ff3b]/20"
                style={{ color: accentLime }}
              >
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">СБП (QR-код)</div>
                <div className="text-[10px] text-[#8e9690]">Без комиссии 0%</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                paymentMethod === 'card'
                  ? 'border-[#d7ff3b] bg-white/[0.08] shadow-lg'
                  : 'border-white/10 bg-white/[0.02] text-[#8e9690] hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Банковская карта</div>
                <div className="text-[10px] text-[#8e9690]">МИР, Visa, Mastercard</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('crypto')}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                paymentMethod === 'crypto'
                  ? 'border-[#d7ff3b] bg-white/[0.08] shadow-lg'
                  : 'border-white/10 bg-white/[0.02] text-[#8e9690] hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Криптовалюта</div>
                <div className="text-[10px] text-[#8e9690]">USDT, TON, BTC</div>
              </div>
            </button>
          </div>

          {/* Pay Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing}
              className="fresh-glow-btn flex items-center gap-2 rounded-2xl px-8 py-3.5 text-xs font-extrabold text-black"
            >
              <span>Пополнить на {topUpAmount} ₽</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
