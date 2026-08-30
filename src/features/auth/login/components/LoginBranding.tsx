import type { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { BrandingInfo } from '@/api/branding';
import { UltimaAuthBrandMark } from '@/features/auth/shared/UltimaAuthBrandMark';

interface LoginBrandingProps {
  branding?: BrandingInfo;
  logoShape: 'square' | 'wide' | 'tall';
  logoLoaded: boolean;
  appName: string;
  logoUrl: string | null;
  onLogoLoad: (event: SyntheticEvent<HTMLImageElement>) => void;
  onLogoError: () => void;
  referralCode: string;
  isEmailAuthEnabled: boolean;
}

export function LoginBranding({
  branding,
  appName,
  logoUrl,
  referralCode,
  isEmailAuthEnabled,
}: LoginBrandingProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      {/* Animated Hero Brand Medallion */}
      <div className="mb-6">
        <UltimaAuthBrandMark
          appName={appName}
          logoUrl={logoUrl}
          showBrandLogo={Boolean(branding?.has_custom_logo)}
          variant="hero"
          animated={true}
        />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-[#f5f5f7] sm:text-4xl">
        {appName || 'Samurai Service'}
      </h1>
      <p className="mt-1.5 text-sm font-medium text-[#8e929b]">
        Вход в личный кабинет
      </p>

      {referralCode && isEmailAuthEnabled && (
        <div className="mt-4 rounded-xl border border-[#d4b37f]/30 bg-[#d4b37f]/10 p-3">
          <div className="flex items-center justify-center gap-2 text-[#d4b37f]">
            <span className="text-xs font-semibold">{t('auth.referralInvite')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
