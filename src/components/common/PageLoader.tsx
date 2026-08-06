import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { brandingApi, getCachedBranding, preloadLogo, setCachedBranding } from '@/api/branding';
import { useBrandLogoImage } from '@/hooks/useBrandLogoImage';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  variant?: 'dark' | 'light' | 'ultima';
  contained?: boolean;
}

export default function PageLoader({ variant = 'dark', contained = false }: PageLoaderProps) {
  const { t } = useTranslation();
  const cachedBranding = getCachedBranding();
  const { data: branding } = useQuery({
    queryKey: ['branding'],
    queryFn: async () => {
      const data = await brandingApi.getBranding();
      setCachedBranding(data);
      await preloadLogo(data);
      return data;
    },
    initialData: cachedBranding ?? undefined,
    staleTime: 5 * 60 * 1000,
    enabled: !contained,
  });
  const appName = branding?.name || cachedBranding?.name || import.meta.env.VITE_APP_NAME || 'VPN';
  const logoUrl = branding ? brandingApi.getLogoUrl(branding) : null;
  const { isLoaded, hasError, handleLoad, handleError } = useBrandLogoImage(logoUrl);
  const showLogo = Boolean(branding?.has_custom_logo && logoUrl && !hasError);

  if (contained) {
    return (
      <div
        data-testid="route-loader"
        className="flex min-h-[42dvh] w-full items-center justify-center"
        aria-label={t('common.loading', 'Загрузка')}
      >
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/10 px-4 py-3 backdrop-blur-sm">
          <span
            className={cn(
              'h-2.5 w-2.5 animate-pulse rounded-full',
              variant === 'ultima' ? 'bg-[var(--ultima-color-primary)]' : 'bg-accent-400',
            )}
          />
          <span className="text-sm font-medium text-dark-300">
            {t('common.loadingSection', 'Загружаем раздел')}
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'ultima') {
    return (
      <div
        data-testid="app-startup-loader"
        className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-6"
        style={{
          background:
            'radial-gradient(70% 48% at 70% 42%, color-mix(in srgb, var(--ultima-color-aura) 24%, transparent), transparent 72%), linear-gradient(165deg, color-mix(in srgb, var(--ultima-color-bg-top) 88%, #020617) 0%, color-mix(in srgb, var(--ultima-color-bg-bottom) 86%, #020617) 100%)',
        }}
      >
        <div className="ultima-shell-aura opacity-70" />
        <div
          aria-hidden
          className="absolute h-72 w-72 animate-pulse rounded-full border opacity-30"
          style={{
            borderColor: 'color-mix(in srgb, var(--ultima-color-ring) 30%, transparent)',
            boxShadow: '0 0 80px color-mix(in srgb, var(--ultima-color-aura) 14%, transparent)',
          }}
        />

        <div className="relative z-10 flex w-full max-w-xs flex-col items-center text-center">
          <div
            className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border bg-black/20 p-3 backdrop-blur-md"
            style={{
              borderColor:
                'color-mix(in srgb, var(--ultima-color-surface-border) 34%, transparent)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.12), 0 0 44px color-mix(in srgb, var(--ultima-color-aura) 20%, transparent)',
            }}
          >
            <ShieldCheck
              className={cn(
                'absolute h-11 w-11 text-white/90 transition-opacity duration-200',
                showLogo && isLoaded ? 'opacity-0' : 'opacity-100',
              )}
              strokeWidth={1.7}
            />
            {showLogo ? (
              <img
                src={logoUrl ?? undefined}
                alt=""
                className={cn(
                  'absolute inset-0 h-full w-full object-contain p-3 transition-opacity duration-200',
                  isLoaded ? 'opacity-100' : 'opacity-0',
                )}
                loading="eager"
                decoding="async"
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : null}
          </div>

          <p className="mt-5 max-w-full truncate text-xl font-semibold text-white">{appName}</p>
          <p className="mt-2 text-sm text-white/55">
            {t('common.preparingCabinet', 'Подготавливаем кабинет')}
          </p>
          <div className="mt-5 flex items-center gap-2" aria-hidden>
            {[0, 1, 2].map((step) => (
              <span
                key={step}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ultima-color-primary)]"
                style={{ animationDelay: `${step * 160}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const spinnerColor = variant === 'dark' ? 'border-accent-500' : 'border-blue-500';
  const bgClass =
    variant === 'dark'
      ? 'bg-gradient-to-b from-dark-950 via-dark-950 to-dark-900'
      : 'bg-gradient-to-b from-white via-slate-50 to-slate-100';

  return (
    <div className={`flex min-h-[100dvh] items-center justify-center ${bgClass}`}>
      <div
        className={`h-10 w-10 border-[3px] ${spinnerColor} animate-spin rounded-full border-t-transparent`}
      />
    </div>
  );
}
