import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthSupportActionProps {
  visible?: boolean;
  containerClassName?: string;
  buttonClassName?: string;
  usernameClassName?: string;
}

export function AuthSupportAction({
  visible = true,
  containerClassName,
  buttonClassName,
}: AuthSupportActionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!visible) {
    return null;
  }

  return (
    <div className={cn('w-full', containerClassName)}>
      <button
        type="button"
        onClick={() => navigate('/support/guest')}
        className={cn(
          'group relative flex min-h-[46px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-white/[0.16] bg-gradient-to-b from-white/[0.07] to-white/[0.02] px-4 py-2.5 text-xs font-semibold text-white/[0.9] shadow-[0_2px_12px_rgba(0,0,0,0.35)] transition-all hover:border-[#d4b37f]/50 hover:bg-[#d4b37f]/[0.08] hover:text-[#d4b37f] hover:shadow-[0_4px_20px_rgba(212,179,127,0.15)] active:scale-[0.98]',
          buttonClassName,
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <Headphones className="h-4 w-4 text-[#d4b37f] transition-transform group-hover:scale-110" />
        <span>{t('support.contactUs', { defaultValue: 'Связаться с поддержкой' })}</span>
      </button>
    </div>
  );
}
