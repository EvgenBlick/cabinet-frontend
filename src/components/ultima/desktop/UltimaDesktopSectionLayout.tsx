import { type ReactNode } from 'react';
import { ultimaSurfaceStyle } from '@/features/ultima/surfaces';
import { cn } from '@/lib/utils';
import { UltimaDesktopWorkspace } from './UltimaDesktopWorkspace';

type UltimaDesktopMetric = {
  label: string;
  value: string;
  hint?: string;
};

type UltimaDesktopSectionLayoutProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  eyebrow?: string;
  metrics?: UltimaDesktopMetric[];
  heroActions?: ReactNode;
  aside?: ReactNode;
  bottomNav: ReactNode;
  children: ReactNode;
  contentClassName?: string;
};

type UltimaDesktopPanelProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function UltimaDesktopPanel({
  title,
  subtitle,
  children,
  className,
}: UltimaDesktopPanelProps) {
  return (
    <section
      className={cn('rounded-2xl border p-5', className)}
      style={ultimaSurfaceStyle}
    >
      {title ? (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold leading-tight text-white">{title}</h2>
            {subtitle ? (
              <p className="mt-1.5 max-w-[64ch] text-sm leading-[1.55] text-white/[0.58]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function UltimaDesktopSectionLayout({
  title,
  subtitle,
  eyebrow,
  metrics,
  heroActions,
  aside,
  bottomNav,
  children,
  contentClassName,
}: UltimaDesktopSectionLayoutProps) {
  const normalizedEyebrow = eyebrow?.trim().toLowerCase();
  const normalizedTitle = title.trim().toLowerCase();
  const displayEyebrow =
    normalizedEyebrow && normalizedEyebrow !== normalizedTitle ? eyebrow : undefined;

  return (
    <UltimaDesktopWorkspace bottomNav={bottomNav}>
      <div className={cn('space-y-6', contentClassName)}>
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            {displayEyebrow ? <p className="mb-2 text-sm text-[#d4b37f]">{displayEyebrow}</p> : null}
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">{title}</h1>
            <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-white/55">{subtitle}</p>
          </div>
          {heroActions ? <div className="flex flex-wrap items-center gap-3">{heroActions}</div> : null}
        </header>

        {metrics && metrics.length > 0 ? (
          <dl className="flex flex-wrap gap-x-10 gap-y-5 border-y border-white/[0.08] py-5" aria-label="Сводка">
            {metrics.map((metric) => (
              <div key={`${metric.label}-${metric.value}`} className="min-w-0 flex-1 basis-[180px]">
                <dt className="text-sm text-white/55">{metric.label}</dt>
                <dd className="mt-1 break-words text-2xl font-semibold text-white">{metric.value}</dd>
                {metric.hint ? <p className="mt-1 text-sm leading-relaxed text-white/45">{metric.hint}</p> : null}
              </div>
            ))}
          </dl>
        ) : null}

        <div className={cn('min-w-0', aside && 'grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]')}>
          <div className="min-w-0">{children}</div>
          {aside ? <aside className="min-w-0 space-y-5">{aside}</aside> : null}
        </div>
      </div>
    </UltimaDesktopWorkspace>
  );
}
