import React from 'react';
import { useThemeEngine } from './ThemeEngineContext';
import { useDeviceViewport } from './useDeviceViewport';

// Cyber Matrix views
import { CyberDesktopDashboard } from '@/themes/cyber-matrix/desktop/CyberDesktopDashboard';
import { CyberTabletDashboard } from '@/themes/cyber-matrix/tablet/CyberTabletDashboard';
import { CyberMobileDashboard } from '@/themes/cyber-matrix/mobile/CyberMobileDashboard';

// Fresh views (page wrapper handles queries internally)
import { FreshDashboardPage } from '@/themes/fresh/pages/FreshDashboardPage';

// Ultima view
import { UltimaDashboard } from '@/pages/UltimaDashboard';

// Classic view
import { FullDashboard } from '@/pages/Dashboard';

export const ThemeDashboardDispatcher: React.FC = () => {
  const { activeTheme } = useThemeEngine();
  const { isMobile, isTablet, isTelegramWebApp } = useDeviceViewport();

  // Force mobile view for Telegram WebApp or phone screens
  if (isTelegramWebApp || isMobile) {
    if (activeTheme === 'cyber_matrix') return <CyberMobileDashboard />;
    if (activeTheme === 'fresh') return <FreshDashboardPage />;
    if (activeTheme === 'samurai_gold') return <UltimaDashboard />;
    return <FullDashboard />;
  }

  // Tablet view (768 - 1199px)
  if (isTablet) {
    if (activeTheme === 'cyber_matrix') return <CyberTabletDashboard />;
    if (activeTheme === 'fresh') return <FreshDashboardPage />;
    if (activeTheme === 'samurai_gold') return <UltimaDashboard />;
    return <FullDashboard />;
  }

  // Full Desktop view (1200px+)
  if (activeTheme === 'cyber_matrix') return <CyberDesktopDashboard />;
  if (activeTheme === 'fresh') return <FreshDashboardPage />;
  if (activeTheme === 'samurai_gold') return <UltimaDashboard />;
  return <FullDashboard />;
};
