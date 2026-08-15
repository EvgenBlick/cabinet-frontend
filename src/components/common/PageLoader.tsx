import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { brandingApi, getCachedBranding, preloadLogo, setCachedBranding } from '@/api/branding';
import { useBrandLogoImage } from '@/hooks/useBrandLogoImage';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  variant?: 'dark' | 'light' | 'ultima' | 'fresh';
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
  const logoUrl = branding ? brandingApi.getLogoUrl(branding) : null;
  const { isLoaded, hasError, handleLoad, handleError } = useBrandLogoImage(logoUrl);
  const showLogo = Boolean(branding?.has_custom_logo && logoUrl && !hasError);

  // Auto-detect fresh theme from route or storage if not explicitly given
  const isFresh =
    variant === 'fresh' ||
    (typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/fresh') ||
        localStorage.getItem('cabinet_active_theme') === 'fresh'));

  if (isFresh && !contained) {
    return (
      <div
        data-testid="fresh-startup-loader"
        className="fresh-backdrop-container relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#060907] px-6 text-[#f5f5f7]"
      >
        {/* Soft emerald/lime ambient aura */}
        <div
          className="absolute h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{
            background:
              'radial-gradient(circle, rgba(215, 255, 59, 0.22) 0%, rgba(16, 185, 129, 0.12) 40%, transparent 70%)',
          }}
        />

        {/* Breathing concentric orbital rings */}
        <div
          aria-hidden
          className="absolute h-64 w-64 animate-ping rounded-full border border-[#d7ff3b]/20 opacity-20 duration-1000"
        />
        <div
          aria-hidden
          className="absolute h-48 w-48 animate-pulse rounded-full border border-[#d7ff3b]/30 shadow-[0_0_50px_rgba(215,255,59,0.15)]"
        />

        {/* Center Card */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="fresh-glass-pill relative flex h-20 w-20 animate-bounce items-center justify-center rounded-3xl border border-[#d7ff3b]/40 bg-[#0d1610] p-4 shadow-[0_0_35px_rgba(215,255,59,0.3)] transition-transform duration-1000">
            {showLogo ? (
              <img
                src={logoUrl || ''}
                alt=""
                className={cn(
                  'h-10 w-10 object-contain transition-opacity duration-300',
                  isLoaded ? 'opacity-100' : 'opacity-0',
                )}
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : (
              <svg
                className="h-9 w-9 text-[#d7ff3b]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d7ff3b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            )}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 animate-ping rounded-full bg-[#d7ff3b]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#c8d0ca]">
              Загрузка...
            </span>
          </div>
        </div>
      </div>
    );
  }

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
              isFresh
                ? 'bg-[#d7ff3b]'
                : variant === 'ultima'
                  ? 'bg-[var(--ultima-color-primary)]'
                  : 'bg-accent-400',
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
                '0 0 45px color-mix(in srgb, var(--ultima-color-primary) 18%, transparent)',
            }}
          >
            {showLogo ? (
              <img
                src={logoUrl || ''}
                alt=""
                className={cn(
                  'h-12 w-12 object-contain transition-opacity duration-300',
                  isLoaded ? 'opacity-100' : 'opacity-0',
                )}
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : (
              <ShieldCheck
                className="h-10 w-10 text-[var(--ultima-color-primary)]"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="mt-6 text-sm font-semibold uppercase tracking-wider text-[var(--ultima-color-primary)]">
            {branding?.name || 'Cabinet'}
          </div>
        </div>
      </div>
    );
  }

  // Default Dark/Light fallback
  return (
    <div
      data-testid="app-startup-loader"
      className={cn(
        'relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-6',
        variant === 'light' ? 'bg-[#fef9f0] text-dark-900' : 'bg-[#0a0f1a] text-white',
      )}
    >
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-[#d7ff3b]" />
        <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-white/70">
          Загрузка
        </span>
      </div>
    </div>
  );
}
