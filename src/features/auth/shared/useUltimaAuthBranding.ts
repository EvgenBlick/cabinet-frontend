import { useQuery } from '@tanstack/react-query';
import { brandingApi, getCachedBranding, preloadLogo, setCachedBranding } from '@/api/branding';

const FALLBACK_NAME = import.meta.env.VITE_APP_NAME || 'VPN';

export function useUltimaAuthBranding(isUltimaMode: boolean) {
  const { data: branding } = useQuery({
    queryKey: ['branding'],
    queryFn: async () => {
      const data = await brandingApi.getBranding();
      setCachedBranding(data);
      await preloadLogo(data);
      return data;
    },
    initialData: getCachedBranding() ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
  });

  const appName = branding?.name || FALLBACK_NAME;
  const hasCustomLogo = branding?.has_custom_logo || false;
  const logoUrl = branding ? brandingApi.getLogoUrl(branding) : null;
  const showUltimaBrandLogo = Boolean(isUltimaMode && hasCustomLogo && logoUrl);

  return {
    appName,
    logoUrl,
    showUltimaBrandLogo,
  };
}
