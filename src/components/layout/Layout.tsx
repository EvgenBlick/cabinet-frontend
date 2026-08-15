import { AppShell } from './AppShell';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { activeTheme } = useThemeEngine();

  // Modern themes provide their own unified responsive shell & dock
  if (activeTheme === 'cyber_matrix' || activeTheme === 'fresh' || activeTheme === 'samurai_gold') {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
