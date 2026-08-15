import { Headphones, Lock, Send, Zap } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';
import { useFreshThemeContext } from '../FreshThemeContext';
import { useAuthStore } from '@/store/auth';

export function FreshLoginPage() {
  const { appName, logoUrl } = useBranding();
  const { config } = useFreshThemeContext();

  const activeLogo = config.customLogoUrl || logoUrl;
  const brandTitle = (config.customBrandName || appName || 'VERDANT').toUpperCase();
  const accentLime = config.accentColor || '#d7ff3b';

  // Telegram OAuth URL
  const handleTelegramLogin = () => {
    window.location.href = '/api/auth/telegram';
  };

  // Yandex OAuth URL
  const handleYandexLogin = () => {
    window.location.href = '/api/auth/yandex';
  };

  // Google OAuth URL
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  // Quick dev test login bypass
  const handleQuickDemoLogin = () => {
    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';
    const dummyUser = {
      id: 321,
      telegram_id: 123456789,
      username: 'EvgenBlick',
      first_name: 'Евгений',
      role: 'admin',
      balance_rubles: 1500,
      balance_kopeks: 150000,
      subscription_days_left: 30,
    };
    sessionStorage.setItem('cabinet-dev-auth', 'true');
    localStorage.setItem('access_token', dummyToken);
    localStorage.setItem('refresh_token', dummyToken);
    useAuthStore.getState().setTokens(dummyToken, dummyToken);
    useAuthStore.getState().setUser(dummyUser as any);
    window.location.href = '/fresh';
  };

  return (
    <div className="fresh-backdrop-container relative min-h-[100dvh] overflow-x-hidden font-sans text-[#f5f5f7] selection:bg-[#d7ff3b]/30 selection:text-white">
      {/* 1. Ambient Glow Flares */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-[20%] left-1/2 h-[600px] w-[850px] -translate-x-1/2 rounded-full blur-[140px]"
          style={{
            background: `radial-gradient(circle, ${config.accentGlowColor || 'rgba(215, 255, 59, 0.4)'} 0%, rgba(16, 38, 24, 0.25) 45%, transparent 75%)`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-between px-4 py-8 sm:px-6 sm:py-12">
        {/* Top Navbar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border bg-[#0d1610] shadow-lg"
              style={{
                borderColor: `${accentLime}60`,
                boxShadow: `0 0 15px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.3)'}`,
              }}
            >
              {activeLogo ? (
                <img src={activeLogo} alt="" className="h-6 w-6 object-contain" />
              ) : (
                <svg
                  className="h-5 w-5"
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
            </div>
            <span className="text-sm font-black tracking-[0.16em] text-[#f5f5f7]">
              {brandTitle}
            </span>
          </div>

          <a
            href="https://t.me/support"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-[#8e9690] transition-colors hover:border-white/20 hover:text-white"
          >
            <Headphones className="h-3.5 w-3.5" style={{ color: accentLime }} />
            <span>Поддержка</span>
          </a>
        </header>

        {/* Center 2-Column Grid */}
        <main className="my-auto grid grid-cols-1 items-center gap-12 py-10 lg:grid-cols-12">
          {/* Left Column: Real Service Information & Benefits (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0d1610]/80 px-3.5 py-1 text-xs text-[#8e9690]">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: accentLime,
                  boxShadow: `0 0 8px ${accentLime}`,
                }}
              />
              <span className="font-semibold text-white">Высокоскоростная защищенная сеть</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#f5f5f7] sm:text-6xl">
              Личный кабинет <br />
              <span
                className="font-serif font-normal italic"
                style={{
                  color: accentLime,
                  textShadow: `0 0 35px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.4)'}`,
                }}
              >
                {brandTitle}
              </span>
            </h1>

            <p className="max-w-lg text-sm leading-relaxed text-[#9ca59e] sm:text-base">
              Управление вашей подпиской, быстрый импорт конфигураций на любые устройства и доступ к
              серверам с минимальным пингом.
            </p>

            {/* Real Service Advantages Checklist */}
            <div className="space-y-3.5 pt-2 text-xs text-[#c8d0ca] sm:text-sm">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                  style={{ backgroundColor: accentLime }}
                >
                  ✓
                </span>
                <span>Выделенные европейские серверы 10 Гбит/с (Швеция, Нидерланды, Польша)</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                  style={{ backgroundColor: accentLime }}
                >
                  ✓
                </span>
                <span>Поддержка всех устройств: iOS, Android, macOS, Windows и Android TV</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                  style={{ backgroundColor: accentLime }}
                >
                  ✓
                </span>
                <span>Мгновенный импорт подписки в 1 клик в приложение Happ</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                  style={{ backgroundColor: accentLime }}
                >
                  ✓
                </span>
                <span>Умная защита от блокировок и полное отсутствие логов (Zero-Logs)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Fresh Bento Glass Auth Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="fresh-bento-card relative overflow-hidden p-7 shadow-2xl sm:p-9">
              {/* Card Header */}
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Вход в кабинет
                </h2>
                <p className="mt-1.5 text-xs text-[#8e9690]">
                  Войдите через удобный сервис для доступа к подписке
                </p>
              </div>

              {/* OAuth Providers: Telegram, Yandex ID, Google */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleTelegramLogin}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#229ED9] py-3 text-xs font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <Send className="h-4 w-4" />
                  <span>Войти через Telegram</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleYandexLogin}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <span className="font-bold text-red-400">Яндекс</span>
                    <span>ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <span className="font-bold text-blue-400">G</span>
                    <span>Google</span>
                  </button>
                </div>
              </div>

              {/* Quick Dev Demo Access Button */}
              <div className="mt-6 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-xs font-bold transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: `${accentLime}60`,
                    backgroundColor: `${accentLime}15`,
                    color: accentLime,
                  }}
                >
                  <Zap className="h-4 w-4" />
                  <span>⚡ Тестовый вход в кабинет</span>
                </button>
              </div>

              {/* Bottom Security Note */}
              <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#6a736c]">
                <Lock className="h-3 w-3" />
                <span>Защищенное 256-битное SSL соединение</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 pt-6 text-center text-xs text-[#6a736c]">
          <p>
            © {new Date().getFullYear()} {brandTitle}. Все права защищены. Конфиденциальность
            гарантирована.
          </p>
        </footer>
      </div>
    </div>
  );
}
