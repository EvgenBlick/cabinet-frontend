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
import { UltimaAuthBrandMark } from '@/features/auth/shared/UltimaAuthBrandMark';
import { useUltimaMode } from '@/hooks/useUltimaMode';
import { Navigate } from 'react-router';
import { useAuthStore } from '@/store/auth';

export default function Login() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isUltimaMode, isUltimaModeReady } = useUltimaMode();
  const {
    safeTop,
    safeBottom,
    branding,
    logoShape,
    logoLoaded,
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

      {import.meta.env.DEV && (
        <div className="mt-4 pt-2 border-t border-dashed border-amber-500/30">
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('cabinet-dev-auth', 'true');
              localStorage.removeItem('samurai_yandex_link_badge_dismissed_ts');
              window.location.href = '/';
            }}
            className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-center text-xs font-mono font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            ⚡ [DEV ONLY] Тестовый вход в кабинет
          </button>
        </div>
      )}
    </>
  );

  const safeAreaStyle = {
    paddingTop: safeTop > 0 ? `${safeTop + 16}px` : 'calc(1rem + env(safe-area-inset-top, 0px))',
    paddingBottom:
      safeBottom > 0 ? `${safeBottom + 16}px` : 'calc(1rem + env(safe-area-inset-bottom, 0px))',
  };


  if (isUltimaMode) {
    return (
      <div
        className="ultima-login relative min-h-[100dvh] overflow-x-hidden bg-[#070908] text-[#f5f5f7]"
        style={safeAreaStyle}
      >
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[20%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#d4b37f]/15 via-[#14161c]/20 to-transparent blur-[140px]" />
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
            <div className="mb-6">
              <UltimaAuthBrandMark
                appName={appName}
                logoUrl={logoUrl}
                showBrandLogo={Boolean(branding?.has_custom_logo)}
                variant="hero"
                animated={true}
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
                <span>Высокоскоростной защищённый доступ</span>
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
          <section className="samurai-bento-card min-w-0 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
            {authPanelContent}

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
            appName={appName}
            logoUrl={logoUrl}
            onLogoLoad={handleLogoLoad}
            onLogoError={handleLogoError}
            referralCode={referralCode}
            isEmailAuthEnabled={isEmailAuthEnabled}
          />
        </div>

        <section className="card rounded-lg p-5 sm:p-6">
          {authPanelContent}
        </section>
      </main>
    </div>
  );
}
