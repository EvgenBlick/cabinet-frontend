import { useEffect, useState } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { brandingApi, preloadLogo, setCachedBranding } from '@/api/branding';
import { subscriptionApi } from '@/api/subscription';
import PageLoader from '@/components/common/PageLoader';
import { setCachedLiteMode } from '@/hooks/useLiteMode';
import { getTelegramInitData, isInTelegramWebApp } from '@/hooks/useTelegramSDK';
import { getCachedUltimaMode, setCachedUltimaMode } from '@/hooks/useUltimaMode';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

let startupPromise: Promise<void> | null = null;
const TELEGRAM_MIN_STARTUP_MS = 620;
const WEB_MIN_STARTUP_MS = 260;
const CONTENT_SETTLE_MS = 140;
const OVERLAY_FADE_MS = 420;

const shouldAttemptTelegramAuth = () => {
  if (!isInTelegramWebApp() || !getTelegramInitData()) return false;

  return ![
    '/auth/oauth/callback',
    '/auth/telegram/callback',
    '/auth/telegram',
    '/support/guest',
  ].includes(window.location.pathname);
};

const wait = (durationMs: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, durationMs));

const warmBranding = async (queryClient: QueryClient) => {
  const branding = await queryClient.ensureQueryData({
    queryKey: ['branding'],
    queryFn: async () => {
      const data = await brandingApi.getBranding();
      setCachedBranding(data);
      return data;
    },
    staleTime: 60_000,
  });
  await preloadLogo(branding);
};

const warmAppShell = async (queryClient: QueryClient) => {
  const ultimaModePromise = queryClient.ensureQueryData({
    queryKey: ['ultima-mode-enabled'],
    queryFn: async () => {
      const result = await brandingApi.getUltimaModeEnabled();
      setCachedUltimaMode(result.enabled);
      return result;
    },
    staleTime: 10_000,
  });
  const liteModePromise = queryClient.ensureQueryData({
    queryKey: ['lite-mode-enabled'],
    queryFn: async () => {
      const result = await brandingApi.getLiteModeEnabled();
      setCachedLiteMode(result.enabled);
      return result;
    },
    staleTime: 10_000,
  });

  await Promise.allSettled([
    import('@/pages/Dashboard'),
    warmBranding(queryClient),
    ultimaModePromise,
    liteModePromise,
    queryClient.ensureQueryData({
      queryKey: ['ultima-theme-config'],
      queryFn: brandingApi.getUltimaThemeConfig,
    }),
  ]);
};

const runStartup = async (queryClient: QueryClient) => {
  const startedAt = performance.now();

  try {
    await useAuthStore.getState().initialize();

    const initData = getTelegramInitData();
    const auth = useAuthStore.getState();
    if (shouldAttemptTelegramAuth() && initData && !auth.isAuthenticated) {
      await auth.loginWithTelegram(initData);
    }
  } catch {
    // The login page remains available if restoring or Telegram auth fails.
  }

  await warmAppShell(queryClient);

  if (useAuthStore.getState().isAuthenticated) {
    await Promise.allSettled([
      queryClient.ensureQueryData({
        queryKey: ['subscription'],
        queryFn: subscriptionApi.getSubscription,
        staleTime: 15_000,
      }),
      queryClient.ensureQueryData({
        queryKey: ['purchase-options'],
        queryFn: subscriptionApi.getPurchaseOptions,
        staleTime: 60_000,
      }),
    ]);
  }

  const minimumDuration = isInTelegramWebApp() ? TELEGRAM_MIN_STARTUP_MS : WEB_MIN_STARTUP_MS;
  await wait(Math.max(0, minimumDuration - (performance.now() - startedAt)));
};

export function AppStartupGate({
  children,
  isLocaleReady,
}: {
  children: React.ReactNode;
  isLocaleReady: boolean;
}) {
  const queryClient = useQueryClient();
  const authIsLoading = useAuthStore((state) => state.isLoading);
  const [isStarting, setIsStarting] = useState(true);
  const [isContentMounted, setIsContentMounted] = useState(false);
  const [isOverlayLeaving, setIsOverlayLeaving] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  useEffect(() => {
    let active = true;

    if (!startupPromise) {
      startupPromise = runStartup(queryClient).finally(() => {
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
  }, [queryClient]);

  const isBootstrapReady = !isStarting && !authIsLoading && isLocaleReady;

  useEffect(() => {
    if (!isBootstrapReady) return;

    setIsContentMounted(true);
    const revealTimer = window.setTimeout(() => {
      setIsOverlayLeaving(true);
    }, CONTENT_SETTLE_MS);
    const hideTimer = window.setTimeout(() => {
      setIsOverlayVisible(false);
    }, CONTENT_SETTLE_MS + OVERLAY_FADE_MS);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isBootstrapReady]);

  const loaderVariant = getCachedUltimaMode() === false ? 'dark' : 'ultima';

  return (
    <>
      {isContentMounted ? children : null}
      {isOverlayVisible ? (
        <div
          className={cn(
            'fixed inset-0 z-[10000] transition-[opacity,filter] ease-out',
            isOverlayLeaving ? 'pointer-events-none opacity-0 blur-sm' : 'opacity-100 blur-0',
          )}
          style={{ transitionDuration: `${OVERLAY_FADE_MS}ms` }}
          aria-hidden={isOverlayLeaving}
        >
          <PageLoader variant={loaderVariant} />
        </div>
      ) : null}
    </>
  );
}
