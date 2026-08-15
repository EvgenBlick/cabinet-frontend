import LanguageSwitcher from '@/components/LanguageSwitcher';
import PageLoader from '@/components/common/PageLoader';
import {
  LoginBranding,
  LoginCheckEmailCard,
  LoginEmailAuthSection,
  LoginOAuthSection,
  LoginTelegramSection,
  useLoginPage,
} from '@/features/auth/login';
import { AuthSupportAction } from '@/features/auth/shared/AuthSupportAction';
import { useUltimaMode } from '@/hooks/useUltimaMode';
import { Navigate } from 'react-router';
import { useAuthStore } from '@/store/auth';

import { useThemeEngine } from '@/themes/core/ThemeEngineContext';
import { CyberLoginPage } from '@/themes/cyber-matrix/pages/CyberLoginPage';
import { FreshLoginPage } from '@/themes/fresh/pages/FreshLoginPage';

export default function Login() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { activeTheme } = useThemeEngine();
  const { isUltimaMode, isUltimaModeReady } = useUltimaMode();
  const {
    safeTop,
    safeBottom,
    branding,
    logoShape,
    logoLoaded,
    appLogo,
    appName,
    logoUrl,
    referralCode,
    isEmailAuthEnabled,
    registeredEmail,
    error,
    isLoading,
    isTelegramWebApp,
    botUsername,
    isOAuthProvidersLoading,
    oauthProviders,
    oauthLoading,
    isEmailAuthLoading,
    showForgotPassword,
    forgotPasswordSent,
    forgotPasswordEmail,
    forgotPasswordError,
    forgotPasswordLoading,
    authMode,
    firstName,
    email,
    password,
    confirmPassword,
    setForgotPasswordEmail,
    setAuthMode,
    setFirstName,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleLogoLoad,
    handleLogoError,
    handleBackToLogin,
    handleRetryTelegramAuth,
    handleOAuthLogin,
    handleForgotPassword,
    closeForgotPasswordModal,
    handleEmailSubmit,
    handleShowForgotPassword,
  } = useLoginPage();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (activeTheme === 'cyber_matrix') {
    return <CyberLoginPage />;
  }

  if (activeTheme === 'fresh') {
    return <FreshLoginPage />;
  }

  if (!isUltimaModeReady) {
    return <PageLoader variant="ultima" />;
  }

  const authPanelContent = registeredEmail ? (
    <LoginCheckEmailCard email={registeredEmail} onBackToLogin={handleBackToLogin} />
  ) : (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-error-400/25 bg-error-500/10 px-4 py-3 text-sm leading-5 text-error-200">
          {error}
        </div>
      )}

      <LoginEmailAuthSection
        isEmailAuthLoading={isEmailAuthLoading}
        isEmailAuthEnabled={isEmailAuthEnabled}
        showForgotPassword={showForgotPassword}
        forgotPasswordSent={forgotPasswordSent}
        forgotPasswordEmail={forgotPasswordEmail}
        onForgotPasswordEmailChange={setForgotPasswordEmail}
        forgotPasswordError={forgotPasswordError}
        forgotPasswordLoading={forgotPasswordLoading}
        onForgotPasswordSubmit={handleForgotPassword}
        onCloseForgotPassword={closeForgotPasswordModal}
        authMode={authMode}
        onAuthModeChange={setAuthMode}
        onEmailSubmit={handleEmailSubmit}
        firstName={firstName}
        onFirstNameChange={setFirstName}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        confirmPassword={confirmPassword}
        onConfirmPasswordChange={setConfirmPassword}
        isLoading={isLoading}
        onShowForgotPassword={handleShowForgotPassword}
      />

      {!showForgotPassword && (
        <div className={isEmailAuthEnabled ? 'mt-5 border-t border-dark-700/45 pt-1' : 'space-y-4'}>
          <LoginTelegramSection
            isLoading={isLoading}
            isTelegramWebApp={isTelegramWebApp}
            hasError={Boolean(error)}
            botUsername={botUsername}
            referralCode={referralCode || undefined}
            onRetryTelegramAuth={handleRetryTelegramAuth}
          />

          <LoginOAuthSection
            isLoading={isOAuthProvidersLoading}
            providers={oauthProviders}
            oauthLoading={oauthLoading}
            onOAuthLogin={handleOAuthLogin}
            showDivider={isEmailAuthEnabled}
          />
        </div>
      )}
      {!showForgotPassword && <AuthSupportAction visible containerClassName="mt-4" />}
    </>
  );

  const safeAreaStyle = {
    paddingTop: safeTop > 0 ? `${safeTop + 16}px` : 'calc(1rem + env(safe-area-inset-top, 0px))',
    paddingBottom:
      safeBottom > 0 ? `${safeBottom + 16}px` : 'calc(1rem + env(safe-area-inset-bottom, 0px))',
  };

  const handleDevDemoLogin = () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({ sub: '1', exp: Math.floor(Date.now() / 1000) + 86400 * 365 }),
    );
    const dummyToken = `${header}.${payload}.dummy_signature`;
    const dummyUser = {
      id: 321,
      telegram_id: 123456789,
      first_name: 'Евгений',
      username: 'samurai_master',
      has_subscription: true,
      subscription_days_left: 30,
      active_devices_count: 1,
      balance: 1500,
      balance_rubles: 1500,
      balance_kopeks: 150000,
      created_at: new Date().toISOString(),
    } as any;

    localStorage.setItem('cabinet-dev-auth', 'true');
    localStorage.setItem('cabinet_ultima_mode', 'true');
    sessionStorage.setItem('access_token', dummyToken);
    sessionStorage.setItem('refresh_token', dummyToken);
    sessionStorage.setItem('user', JSON.stringify(dummyUser));

    useAuthStore.getState().setTokens(dummyToken, dummyToken);
    useAuthStore.getState().setUser(dummyUser);

    window.location.href = '/';
  };

  if (isUltimaMode) {
    return (
      <div
        className="ultima-login relative min-h-[100dvh] overflow-x-hidden bg-[#070908] text-[#f5f5f7]"
        style={safeAreaStyle}
      >
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[20%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#d4b37f]/15 via-[#1b261e]/20 to-transparent blur-[140px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#d4b37f]/5 blur-[100px]" />
        </div>

        <div
          className="fixed right-4 z-50"
          style={{
            top: safeTop > 0 ? `${safeTop + 12}px` : 'calc(12px + env(safe-area-inset-top, 0px))',
          }}
        >
          <LanguageSwitcher />
        </div>

        <main className="relative z-10 mx-auto grid w-full max-w-md gap-8 px-4 pb-16 pt-12 lg:min-h-[calc(100dvh-64px)] lg:max-w-[1100px] lg:grid-cols-[minmax(0,1fr)_minmax(420px,460px)] lg:items-center lg:gap-16 lg:px-8">
          {/* Left Column: Samurai Brand Identity */}
          <header className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#d4b37f]/40 bg-gradient-to-b from-[#1c241e] to-[#101412] p-2 shadow-[0_0_35px_rgba(212,179,127,0.2)]">
              <img
                src="/samurai_original_medallion.png"
                alt="Samurai Service"
                className="h-14 w-14 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#f5f5f7] sm:text-4xl lg:text-5xl">
              Samurai Service <br />
              <span className="font-serif-accent font-normal text-[#d4b37f]">Личный кабинет</span>
            </h1>

            <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-[#8e929b] sm:text-base">
              Безопасный доступ, управление тарифом и быстрое подключение всех ваших устройств.
            </p>

            <div className="mt-8 hidden flex-col gap-3 text-xs text-[#8e929b] lg:flex">
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4b37f]/15 text-[#d4b37f]">
                  ✓
                </span>
                <span>Защита от блокировок и умная маршрутизация</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4b37f]/15 text-[#d4b37f]">
                  ✓
                </span>
                <span>Поддержка iOS, Android, Windows, Mac и Android TV</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4b37f]/15 text-[#d4b37f]">
                  ✓
                </span>
                <span>Служба поддержки 24/7</span>
              </div>
            </div>
          </header>

          {/* Right Column: Auth Panel Card */}
          <section className="verdant-bento-card min-w-0 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
            {authPanelContent}

            {/* Quick Demo Test Access Button */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={handleDevDemoLogin}
                className="verdant-glow-btn w-full rounded-2xl py-3 text-center text-xs font-bold uppercase tracking-wide shadow-lg transition-transform hover:scale-[1.01]"
              >
                ⚡ Войти в кабинет (Быстрый тест)
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-[100dvh] items-center justify-center overflow-x-hidden px-4 sm:px-6 lg:px-8"
      style={safeAreaStyle}
    >
      <div className="fixed inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-500/10 via-transparent to-transparent" />

      <div
        className="fixed right-3 z-50"
        style={{
          top: safeTop > 0 ? `${safeTop + 12}px` : 'calc(12px + env(safe-area-inset-top, 0px))',
        }}
      >
        <LanguageSwitcher />
      </div>

      <main className="relative grid w-full max-w-md gap-6 lg:max-w-[980px] lg:grid-cols-[minmax(0,0.8fr)_minmax(420px,480px)] lg:items-center lg:gap-16">
        <div>
          <LoginBranding
            branding={branding}
            logoShape={logoShape}
            logoLoaded={logoLoaded}
            appLogo={appLogo}
            appName={appName}
            logoUrl={logoUrl}
            onLogoLoad={handleLogoLoad}
            onLogoError={handleLogoError}
            referralCode={referralCode}
            isEmailAuthEnabled={isEmailAuthEnabled}
          />
        </div>

        <section className="card rounded-lg p-5 sm:p-6">{authPanelContent}</section>
      </main>
    </div>
  );
}
