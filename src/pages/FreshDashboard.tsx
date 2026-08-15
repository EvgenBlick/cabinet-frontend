import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/store/auth';
import { subscriptionApi } from '@/api/subscription';
import { FreshDesktopDashboard } from '@/components/themes/fresh/desktop/FreshDesktopDashboard';
import { FreshMobileDashboard } from '@/components/themes/fresh/mobile/FreshMobileDashboard';

export function FreshDashboard() {
  const navigate = useNavigate();
  const isTabletOrDesktop = useMediaQuery('(min-width: 768px)');
  const { user } = useAuthStore();

  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
    retry: 1,
  });

  const { data: devicesData } = useQuery({
    queryKey: ['subscription-devices'],
    queryFn: subscriptionApi.getDevices,
    retry: 1,
  });

  const subscription = subData?.subscription || null;

  const connectedDevicesCount = Array.isArray(devicesData)
    ? devicesData.length
    : (devicesData as any)?.devices?.length || (user as any)?.active_devices_count || 1;

  const daysLeft = subscription?.days_left ?? (user as any)?.subscription_days_left ?? null;

  const handleBuySubscription = () => {
    navigate('/subscription');
  };

  const handleOpenConnection = () => {
    navigate('/connection');
  };

  const handleOpenSupport = () => {
    navigate('/support');
  };

  if (isTabletOrDesktop) {
    return (
      <FreshDesktopDashboard
        subscription={subscription}
        connectedDevicesCount={connectedDevicesCount}
        daysLeft={daysLeft}
        onBuySubscription={handleBuySubscription}
        onOpenConnection={handleOpenConnection}
        onOpenSupport={handleOpenSupport}
      />
    );
  }

  return (
    <FreshMobileDashboard
      subscription={subscription}
      connectedDevicesCount={connectedDevicesCount}
      daysLeft={daysLeft}
      onBuySubscription={handleBuySubscription}
      onOpenConnection={handleOpenConnection}
      onOpenSupport={handleOpenSupport}
    />
  );
}

export default FreshDashboard;
