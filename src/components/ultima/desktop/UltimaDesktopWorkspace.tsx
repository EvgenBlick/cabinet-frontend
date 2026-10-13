import { isValidElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { UltimaDesktopNavbar } from './UltimaDesktopNavbar';
import './UltimaDesktopWorkspace.css';

type UltimaDesktopWorkspaceProps = {
  bottomNav: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
};

export function UltimaDesktopWorkspace({
  bottomNav,
  children,
  aside,
  className,
}: UltimaDesktopWorkspaceProps) {
  const navigationProps = isValidElement<{ onSupportClick?: () => void }>(bottomNav)
    ? bottomNav.props
    : undefined;
  return (
    <div className={cn('ultima-desktop-layout min-h-screen bg-[#07080a] text-white', className)}>
      <UltimaDesktopNavbar onOpenSupport={navigationProps?.onSupportClick} />
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className={cn('min-w-0', aside && 'grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]')}>
          <main className="min-w-0">{children}</main>
          {aside ? <aside className="min-w-0 space-y-5">{aside}</aside> : null}
        </div>
      </div>
    </div>
  );
}
