import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { UltimaDesktopSectionLayout, UltimaDesktopPanel } from './UltimaDesktopSectionLayout';

type UltimaDesktopAgreementProps = {
  title: string;
  subtitle: string;
  updatedAtLabel: string | null;
  htmlContent: string;
  isLoading: boolean;
  emptyLabel: string;
  bottomNav: ReactNode;
};

export function UltimaDesktopAgreement({
  title,
  subtitle,
  updatedAtLabel,
  htmlContent,
  isLoading,
  emptyLabel,
  bottomNav,
}: UltimaDesktopAgreementProps) {
  const { t } = useTranslation();
  return (
    <UltimaDesktopSectionLayout icon={null} title={title} subtitle={subtitle} bottomNav={bottomNav}>
      <UltimaDesktopPanel className="max-w-[900px]">
        <p className="mb-6 border-b border-white/[0.08] pb-4 text-sm text-white/55">
          {t('common.lastUpdated', { defaultValue: 'Последнее обновление' })}: {' '}
          {updatedAtLabel ?? t('common.notSpecified', { defaultValue: 'Не указано' })}
        </p>
        {isLoading ? (
          <div role="status" aria-label={t('common.loading', { defaultValue: 'Загрузка' })} className="flex min-h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d4b37f]/40 border-t-transparent" />
          </div>
        ) : htmlContent ? (
          <div
            className="prose prose-invert max-w-none break-words text-[15px] leading-[1.75] [&_a]:break-all [&_a]:text-[#d4b37f] [&_a]:underline [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:leading-tight [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mb-2 [&_p]:mb-4 [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : <p className="text-white/60">{emptyLabel}</p>}
      </UltimaDesktopPanel>
    </UltimaDesktopSectionLayout>
  );
}
