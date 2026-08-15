import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, X, Zap } from 'lucide-react';
import { useFreshThemeContext } from '../FreshThemeContext';

export interface FreshQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionUrl: string;
}

export function FreshQrModal({ isOpen, onClose, subscriptionUrl }: FreshQrModalProps) {
  const { config } = useFreshThemeContext();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const accentLime = config.accentColor || '#d7ff3b';

  const handleCopy = () => {
    navigator.clipboard.writeText(subscriptionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handle1ClickHapp = () => {
    const crypted = `happ://add/crypt3#${btoa(subscriptionUrl)}`;
    window.location.href = crypted;
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-2xl duration-200">
      <div className="fresh-bento-card relative w-full max-w-md rounded-3xl p-6 text-center shadow-2xl sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span
              className="flex h-2 w-2 rounded-full"
              style={{ backgroundColor: accentLime, boxShadow: `0 0 8px ${accentLime}` }}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Быстрое подключение
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm text-[#8e9690] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="my-5 flex flex-col items-center">
          <div className="flex h-56 w-56 items-center justify-center rounded-2xl border border-white/10 bg-white p-3.5 shadow-2xl">
            <QRCodeSVG value={subscriptionUrl} size={195} level="M" includeMargin={false} />
          </div>
          <p className="mt-3.5 text-xs leading-relaxed text-[#9ca59e]">
            Отсканируйте камерой в приложении <strong className="text-white">Happ</strong>,{' '}
            <strong className="text-white">v2rayNG</strong> или{' '}
            <strong className="text-white">Streisand</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handle1ClickHapp}
            className="fresh-glow-btn flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold text-black"
          >
            <Zap className="h-4 w-4" />
            <span>Импортировать в Happ (1 клик)</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="fresh-secondary-btn flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-medium"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-emerald-400">Ссылка скопирована в буфер!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" style={{ color: accentLime }} />
                <span>Скопировать ключ подписки</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
