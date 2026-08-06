import { useEffect, useState } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { brandingApi, preloadLogo, setCachedBranding, type BrandingInfo } from '@/api/branding';
import { subscriptionApi } from '@/api/subscription';
import { setCachedLiteMode } from '@/hooks/useLiteMode';
import { getTelegramInitData, isInTelegramWebApp } from '@/hooks/useTelegramSDK';
import { setCachedUltimaMode } from '@/hooks/useUltimaMode';
import { useAuthStore } from '@/store/auth';

let startupPromise: Promise<void> | null = null;
const TELEGRAM_MIN_STARTUP_MS = 620;
const WEB_MIN_STARTUP_MS = 260;
const CONTENT_SETTLE_MS = 120;
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

const syncStaticStartupLogo = async (branding: BrandingInfo) => {
  const image = document.getElementById('app-startup-brand-image') as HTMLImageElement | null;
  const mark = document.querySelector<HTMLElement>('#app-startup-overlay .startup-loader-mark');
  const logoUrl = brandingApi.getLogoUrl(branding);
  if (!image || !mark || !logoUrl) return;

  if (image.src !== logoUrl) {
    image.src = logoUrl;
  }

  try {
    await image.decode();
  } catch {
    if (!image.complete || image.naturalWidth === 0) return;
  }

  if (image.naturalWidth > 0) {
    mark.classList.add('has-brand-logo');
    document.documentElement.classList.add('startup-logo-ready');
  }
};

const warmBranding = async (queryClient: QueryClient) => {
  const branding = await queryClient.ensureQueryData({
    queryKey: ['branding'],
    queryFn: brandingApi.getBranding,
    staleTime: 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(180 * 2 ** attempt, 720),
  });
  setCachedBranding(branding);
  await preloadLogo(branding);
  await syncStaticStartupLogo(branding);
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
  const shellWarmupPromise = warmAppShell(queryClient);

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

  await shellWarmupPromise;

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
  }, [isBootstrapReady]);

  useEffect(() => {
    if (!isContentMounted) return;

    let revealTimer = 0;
    let removeTimer = 0;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        document.documentElement.classList.add('app-content-mounted');
        revealTimer = window.setTimeout(() => {
          document.documentElement.classList.add('app-ready');
          removeTimer = window.setTimeout(() => {
            document.getElementById('app-startup-overlay')?.remove();
          }, OVERLAY_FADE_MS);
        }, CONTENT_SETTLE_MS);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(revealTimer);
      window.clearTimeout(removeTimer);
    };
  }, [isContentMounted]);

  return isContentMounted ? children : null;
}
