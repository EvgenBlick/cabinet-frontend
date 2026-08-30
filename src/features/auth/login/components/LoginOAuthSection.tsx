import { useTranslation } from 'react-i18next';
import OAuthProviderIcon from '@/components/OAuthProviderIcon';
import type { OAuthProvider } from '@/types';

interface LoginOAuthSectionProps {
  isLoading: boolean;
  providers: OAuthProvider[];
  oauthLoading: string | null;
  onOAuthLogin: (provider: string) => void;
  showDivider?: boolean;
}

export function LoginOAuthSection({
  isLoading,
  providers,
  oauthLoading,
  onOAuthLogin,
  showDivider = true,
}: LoginOAuthSectionProps) {
  const { t } = useTranslation();

  if (!isLoading && providers.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3">
      {showDivider && (
        <div className="my-3.5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.1]" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/[0.4]">
            {t('auth.or', 'или')}
          </span>
          <div className="h-px flex-1 bg-white/[0.1]" />
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {isLoading ? (
          <div className="flex min-h-[50px] w-full items-center justify-center gap-3 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 animate-pulse">
            <span className="h-6 w-6 rounded-full bg-white/[0.1]" />
            <span className="h-3 w-28 rounded bg-white/[0.1]" />
          </div>
        ) : (
          providers.map((provider) => {
            const isYandex = provider.name.toLowerCase() === 'yandex';
            const isGoogle = provider.name.toLowerCase() === 'google';
            const isThisLoading = oauthLoading === provider.name;

            return (
              <button
                key={provider.name}
                type="button"
                onClick={() => onOAuthLogin(provider.name)}
                disabled={oauthLoading !== null}
                className={`group relative flex min-h-[50px] w-full items-center justify-center gap-3 overflow-hidden rounded-xl border px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 ${
                  isYandex
                    ? 'border-white/[0.14] bg-gradient-to-r from-[#fc3f1d]/[0.08] via-white/[0.04] to-[#fc3f1d]/[0.08] text-white/[0.95] shadow-[0_4px_16px_rgba(252,63,29,0.12)] hover:border-[#fc3f1d]/60 hover:bg-[#fc3f1d]/[0.15] hover:shadow-[0_6px_24px_rgba(252,63,29,0.25)]'
                    : isGoogle
                      ? 'border-white/[0.14] bg-white/[0.04] text-white/[0.95] hover:border-white/[0.3] hover:bg-white/[0.08]'
                      : 'border-white/[0.1] bg-white/[0.03] text-white/[0.9] hover:border-white/[0.2] hover:bg-white/[0.06]'
                }`}
                title={provider.display_name}
              >
                {/* Background ambient light */}
                {isYandex && (
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#fc3f1d]/[0.05] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                )}

                {isThisLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <OAuthProviderIcon provider={provider.name} className="h-5 w-5 shrink-0" />
                )}

                <span className="truncate">
                  {isYandex
                    ? t('auth.loginWithYandex', { defaultValue: 'Войти с Яндекс ID' })
                    : isGoogle
                      ? t('auth.loginWithGoogle', { defaultValue: 'Войти через Google' })
                      : t('auth.loginWithProvider', {
                          provider: provider.display_name,
                          defaultValue: `Войти через ${provider.display_name}`,
                        })}
                </span>

                {isYandex && (
                  <span className="ml-auto hidden rounded-full border border-[#fc3f1d]/40 bg-[#fc3f1d]/20 px-2 py-0.5 text-[10px] font-medium text-[#ff8a75] sm:inline-block">
                    {t('auth.fastLogin', { defaultValue: 'Быстрый вход' })}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
