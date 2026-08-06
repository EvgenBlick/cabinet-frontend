import { useEffect, useState } from 'react';
import PageLoader from '@/components/common/PageLoader';
import { getTelegramInitData, isInTelegramWebApp } from '@/hooks/useTelegramSDK';
import { getCachedUltimaMode } from '@/hooks/useUltimaMode';
import { useAuthStore } from '@/store/auth';

let startupPromise: Promise<void> | null = null;

const shouldAttemptTelegramAuth = () => {
  if (!isInTelegramWebApp() || !getTelegramInitData()) return false;

  return ![
    '/auth/oauth/callback',
    '/auth/telegram/callback',
    '/auth/telegram',
    '/support/guest',
  ].includes(window.location.pathname);
};

const runStartup = async () => {
  await useAuthStore.getState().initialize();

  const initData = getTelegramInitData();
  const auth = useAuthStore.getState();
  if (!shouldAttemptTelegramAuth() || !initData || auth.isAuthenticated) return;

  await auth.loginWithTelegram(initData);
};

export function AppStartupGate({
  children,
  isLocaleReady,
}: {
  children: React.ReactNode;
  isLocaleReady: boolean;
}) {
  const authIsLoading = useAuthStore((state) => state.isLoading);
  const [isStarting, setIsStarting] = useState(() => authIsLoading || shouldAttemptTelegramAuth());

  useEffect(() => {
    let active = true;

    if (!startupPromise) {
      startupPromise = runStartup().finally(() => {
        startupPromise = null;
      });
    }

    void startupPromise
      .catch(() => {
        // The regular login page provides recovery actions for a genuine auth failure.
      })
      .finally(() => {
        if (active) setIsStarting(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (isStarting || authIsLoading || !isLocaleReady) {
    return <PageLoader variant={getCachedUltimaMode() === false ? 'dark' : 'ultima'} />;
  }

  return children;
}
