import '@/styles/auth-surfaces.css';
import GlobeBackground from '@/components/backgrounds/GlobeBackground';
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
import { useUltimaAuthBranding } from '@/features/auth/shared/useUltimaAuthBranding';
import { useUltimaMode } from '@/hooks/useUltimaMode';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';

export default function Login() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isUltimaMode, isUltimaModeReady } = useUltimaMode();
  useEffect(() => {
    document.documentElement.classList.toggle('ultima-liquid-glass', isUltimaMode);
    return () => document.documentElement.classList.remove('ultima-liquid-glass');
  }, [isUltimaMode]);
  const { showUltimaBrandLogo } = useUltimaAuthBranding(isUltimaMode);
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
        <div className="mt-4 space-y-3">
          <LoginOAuthSection
            isLoading={isOAuthProvidersLoading}
            providers={oauthProviders}
            oauthLoading={oauthLoading}
            onOAuthLogin={handleOAuthLogin}
          />

          <div className="mt-3">
            <LoginTelegramSection
              isLoading={isLoading}
              isTelegramWebApp={isTelegramWebApp}
              hasError={Boolean(error)}
              botUsername={botUsername}
              referralCode={referralCode || undefined}
              onRetryTelegramAuth={handleRetryTelegramAuth}
            />
          </div>
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

  if (isUltimaMode) {
    return (
      <div
        className="ultima-login cabinet-auth-screen relative min-h-[100dvh] overflow-x-hidden"
        style={{
          ...safeAreaStyle,
          background:
            'linear-gradient(160deg, color-mix(in srgb, var(--ultima-color-bg-top) 28%, transparent) 0%, color-mix(in srgb, var(--ultima-color-bg-bottom) 40%, #000000) 100%)',
        }}
      >
        <div className="ultima-app-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden"><GlobeBackground /></div>

        <div
          className="fixed right-3 z-50"
          style={{
            top: safeTop > 0 ? `${safeTop + 12}px` : 'calc(12px + env(safe-area-inset-top, 0px))',
          }}
        >
          <LanguageSwitcher />
        </div>

        <main className="relative z-10 mx-auto grid w-full max-w-md gap-7 px-4 lg:max-w-[512px] lg:gap-5 lg:px-4">
          <header className="flex flex-col items-center pt-8 text-center lg:pt-4">
            <UltimaAuthBrandMark
              appName={appName}
              logoUrl={logoUrl}
              showBrandLogo={showUltimaBrandLogo}
              className="mb-4 lg:mb-6"
            />
            <p className="max-w-[34ch] text-[14px] leading-6 text-white/60 lg:text-[16px]">
              {authMode === 'register'
                ? t(
                    'auth.registerPageIntro',
                    'Create one account for your subscription and devices.',
                  )
                : t('auth.loginToAccount', 'Sign in to manage your subscription and devices.')}
            </p>
            <div className="mt-5 hidden items-center gap-2 text-sm text-white/45 lg:hidden">
              <ShieldCheck className="h-4 w-4 text-accent-300" />
              {t('auth.secureLoginHint', 'Secure sign-in with email, Telegram or OAuth.')}
            </div>
          </header>

          <section
            className="cabinet-auth-panel cabinet-content-card w-full max-w-[480px] justify-self-center min-w-0 rounded-2xl border p-5 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-6 lg:rounded-lg"
            style={{
              borderColor:
                'color-mix(in srgb, var(--ultima-color-surface-border) 28%, transparent)',
              background: 'color-mix(in srgb, var(--ultima-color-surface) 72%, #071013)',
            }}
          >
            {authPanelContent}
          </section>

          <p className="pb-2 text-center text-[11px] text-white/40 lg:hidden">
            {t('auth.secureLoginHint', 'Secure sign-in with email, Telegram or OAuth.')}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div
      className="cabinet-auth-screen relative flex min-h-[100dvh] items-center justify-center overflow-x-hidden px-4 sm:px-6 lg:px-8"
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

      <main className="relative grid w-full max-w-md gap-6 lg:max-w-[480px] lg:gap-5">
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

        <section className="cabinet-auth-panel card w-full max-w-[480px] justify-self-center rounded-lg p-5 sm:p-6">{authPanelContent}</section>
      </main>
    </div>
  );
}
