import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { readUltimaAutoRenewPreference, writeUltimaAutoRenewPreference } from '@/features/ultima/autoRenewPreference';

export function UltimaAutoRenewChoice({ daily = false }: { daily?: boolean }) {
  const userId = useAuthStore((state) => state.user?.id);
  const [enabled, setEnabled] = useState(() => readUltimaAutoRenewPreference(userId) ?? false);
  if (daily) return <p className="mb-4 rounded-2xl border border-[#d4b37f]/25 bg-[#121418] p-4 text-xs leading-relaxed text-white/60">Суточный тариф оплачивается с баланса каждый день. После подключения оплату можно приостановить на главной или во вкладке «Управление подпиской».</p>;
  return <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#d4b37f]/25 bg-[#121418] p-4">
    <input type="checkbox" checked={enabled} aria-label="Продлевать подписку с баланса?" className="mt-1 h-4 w-4 shrink-0 accent-[#d4b37f]" onChange={(event) => {
      setEnabled(event.target.checked);
      writeUltimaAutoRenewPreference(userId, event.target.checked);
    }} />
    <span><span className="block text-sm font-semibold text-white">Продлевать подписку с баланса?</span><span className="mt-1 block text-xs leading-relaxed text-white/55">За день до окончания. Можно отключить на главной или в управлении подпиской.</span></span>
  </label>;
}
