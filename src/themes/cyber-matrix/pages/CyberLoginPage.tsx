import React from 'react';
import { Headphones, Lock, Send, ShieldCheck, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';
import { CyberParticleCanvas } from '../components/CyberParticleCanvas';
import { tokenStorage } from '@/utils/token';
import { useNavigate } from 'react-router';

export const CyberLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useThemeEngine();
  const accent = config.accentColor || '#00ff66';
  const brandName = config.customBrandName || 'DOTDNA CYBER';

  const handleTelegramLogin = () => {
    window.location.href = '/api/auth/telegram';
  };

  const handleYandexLogin = () => {
    window.location.href = '/api/auth/yandex';
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleQuickDemoLogin = () => {
    // Generate valid mock JWT payload with expiration far in the future
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 86400 * 365, user_id: 777 }),
    );
    const validJwt = `${header}.${payload}.signature`;

    const dummyUser = {
      id: 1,
      telegram_id: 6636301647,
      username: 'EvgenBlick',
      first_name: 'Евгений',
      role: 'admin',
      balance_rubles: 5000,
      balance_kopeks: 500000,
      subscription_days_left: 365,
    };
    tokenStorage.setTokens(validJwt, validJwt);
    useAuthStore.getState().setTokens(validJwt, validJwt);
    useAuthStore.getState().setUser(dummyUser as any);
    useAuthStore.getState().setIsAdmin(true);
    navigate('/');
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#040705] text-[#f5f5f7] selection:bg-emerald-500/30 selection:text-white">
      <CyberParticleCanvas />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-between px-4 py-8 sm:px-6 sm:py-12">
        {/* Top Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-2xl border bg-black/60 shadow-lg"
              style={{
                borderColor: `${accent}60`,
                boxShadow: `0 0 15px ${config.accentGlowColor}`,
              }}
            >
              {config.customLogoUrl ? (
                <img src={config.customLogoUrl} alt="" className="h-5 w-5 object-contain" />
              ) : (
                <ShieldCheck className="h-4 w-4" style={{ color: accent }} />
              )}
            </div>
            <span className="text-sm font-black tracking-widest text-white">{brandName}</span>
          </div>

          <a
            href="https://t.me/support"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-[#8e9690] transition-colors hover:text-white"
          >
            <Headphones className="h-3.5 w-3.5" style={{ color: accent }} />
            <span>Поддержка 24/7</span>
          </a>
        </header>

        {/* Center Grid */}
        <main className="my-auto grid grid-cols-1 items-center gap-12 py-10 lg:grid-cols-12">
          {/* Left Hero Description (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3.5 py-1 text-xs text-[#8e9690]">
              <span
                className="h-2 w-2 animate-ping rounded-full"
                style={{ backgroundColor: accent }}
              />
              <span className="font-semibold text-white">CYBER SECURITY & VPN MATRIX</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Defending the Digital <br />
              <span
                className="font-serif font-normal italic"
                style={{ color: accent, textShadow: `0 0 35px ${config.accentGlowColor}` }}
              >
                on the Dot.
              </span>
            </h1>

            <p className="max-w-lg text-sm leading-relaxed text-[#8e9690] sm:text-base">
              Управление защищенной подпиской, высокоскоростные европейские 10 Gbps узлы и умный
              обход блокировок для всех ваших устройств.
            </p>

            <div className="space-y-3 pt-2 text-xs text-[#c4ceca] sm:text-sm">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                  style={{ backgroundColor: accent }}
                >
                  ✓
                </span>
                <span>Выделенные ноды в Швеции, Нидерландах и Польше с пингом от 14 ms</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                  style={{ backgroundColor: accent }}
                >
                  ✓
                </span>
                <span>Поддержка клиентов Happ & Incy на iOS, Android, Windows, Mac и TV</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                  style={{ backgroundColor: accent }}
                >
                  ✓
                </span>
                <span>
                  Умная маршрутизация: Яндекс, Банки и Госуслуги работают напрямую без VPN
                </span>
              </div>
            </div>
          </div>

          {/* Right Bento Auth Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080d0a]/95 p-7 shadow-2xl backdrop-blur-2xl sm:p-9">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Вход в кабинет
                </h2>
                <p className="mt-1.5 text-xs text-[#8e9690]">
                  Авторизуйтесь для доступа к управлению подпиской
                </p>
              </div>

              {/* OAuth Providers: Telegram, Yandex ID, Google */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleTelegramLogin}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#229ED9] py-3.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                  <span>Войти через Telegram</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleYandexLogin}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <span className="font-bold text-red-400">Яндекс</span>
                    <span>ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <span className="font-bold text-blue-400">G</span>
                    <span>Google</span>
                  </button>
                </div>
              </div>

              {/* Dev Fast Access */}
              <div className="mt-6 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-xs font-bold transition-all hover:scale-105"
                  style={{
                    borderColor: `${accent}60`,
                    backgroundColor: `${accent}15`,
                    color: accent,
                  }}
                >
                  <Zap className="h-4 w-4" />
                  <span>⚡ Тестовый вход в кабинет</span>
                </button>
              </div>

              <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#6a736c]">
                <Lock className="h-3 w-3" />
                <span>Защищенное 256-битное шифрование</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-white/5 pt-6 text-center text-xs text-[#6a736c]">
          © {new Date().getFullYear()} {brandName}. Все права защищены.
        </footer>
      </div>
    </div>
  );
};
