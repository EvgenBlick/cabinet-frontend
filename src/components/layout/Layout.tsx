import { AppShell } from './AppShell';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';
import { DynamicThemeBackground } from '@/themes/core/DynamicThemeBackground';
import WebSocketNotifications from '@/components/WebSocketNotifications';
import SuccessNotificationModal from '@/components/SuccessNotificationModal';
import CampaignBonusNotifier from '@/components/CampaignBonusNotifier';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { activeTheme } = useThemeEngine();

  // Modern themes provide their own unified responsive shell & dock
  if (activeTheme === 'cyber_matrix' || activeTheme === 'fresh' || activeTheme === 'samurai_gold') {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden">
        <DynamicThemeBackground />
        <WebSocketNotifications />
        <SuccessNotificationModal />
        <CampaignBonusNotifier />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
