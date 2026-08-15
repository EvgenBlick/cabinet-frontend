import { Suspense } from 'react';
import { Navigate, useLocation } from 'react-router';
import Layout from '../layout/Layout';
import PageLoader from '../common/PageLoader';
import {
  BlacklistedScreen,
  ChannelSubscriptionScreen,
  MaintenanceScreen,
  UltimaChannelSubscriptionScreen,
} from '../blocking';
import { useAuthStore } from '../../store/auth';
import { useBlockingStore } from '../../store/blocking';
import { saveReturnUrl } from '../../utils/token';
import { getCachedUltimaMode } from '../../hooks/useUltimaMode';

const resolveLoaderVariant = (pathname: string): 'dark' | 'light' | 'ultima' | 'fresh' => {
  if (
    pathname.startsWith('/fresh') ||
    (typeof window !== 'undefined' && localStorage.getItem('cabinet_active_theme') === 'fresh')
  ) {
    return 'fresh';
  }

  const cachedUltima = getCachedUltimaMode();
  if (cachedUltima === true) {
    return 'ultima';
  }

  // For first-open in Ultima flow there may be no cache yet.
  if (
    cachedUltima === null &&
    (pathname === '/' ||
      pathname === '/subscription' ||
      pathname === '/connection' ||
      pathname.startsWith('/ultima/'))
  ) {
    return 'ultima';
  }

  return 'dark';
};

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader variant={resolveLoaderVariant(location.pathname)} />;
  }

  if (!isAuthenticated) {
    saveReturnUrl();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Layout>{children}</Layout>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  const location = useLocation();
  const isDevAuth =
    typeof window !== 'undefined' && sessionStorage.getItem('cabinet-dev-auth') === 'true';

  if (isLoading && !isDevAuth) {
    return <PageLoader variant="light" />;
  }

  if (!isAuthenticated && !isDevAuth) {
    saveReturnUrl();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin && !isDevAuth) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

export function LazyPage({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader variant={resolveLoaderVariant(location.pathname)} contained />}>
      {children}
    </Suspense>
  );
}

export function BlockingOverlay() {
  const { blockingType } = useBlockingStore();

  if (blockingType === 'maintenance') {
    return <MaintenanceScreen />;
  }

  if (blockingType === 'channel_subscription') {
    return getCachedUltimaMode() ? (
      <UltimaChannelSubscriptionScreen />
    ) : (
      <ChannelSubscriptionScreen />
    );
  }

  if (blockingType === 'blacklisted') {
    return <BlacklistedScreen />;
  }

  return null;
}
