import { useTranslation } from 'react-i18next';
import type { Subscription } from '@/types';
import { getTrafficBreakdown, parseTrafficTimestamp } from '@/features/ultima/trafficBreakdown';

export function UltimaTrafficBreakdown({ subscription }: { subscription: Subscription | null | undefined }) {
  const { t, i18n } = useTranslation();
  if (!subscription || subscription.traffic_limit_gb <= 0) return null;
  const breakdown = getTrafficBreakdown(subscription);
  const updated = parseTrafficTimestamp(subscription.traffic_updated_at);
  const reset = parseTrafficTimestamp(subscription.traffic_next_reset_at);
  const format = (value: number) => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(value);
  return <div data-testid="traffic-breakdown" className="mt-3 space-y-2 border-t border-white/10 pt-3 text-[12px] leading-relaxed" style={{ color: 'var(--cabinet-muted)' }}>
    {breakdown ? <p>{subscription.metered_traffic_enabled ? "Лимит LTE" : "Лимит трафика"}: {format(breakdown.base)} ГБ по тарифу + {format(breakdown.bonus)} ГБ за устройства + {format(breakdown.purchased)} ГБ докуплено = {format(breakdown.total)} ГБ.</p>
      : subscription.traffic_limit_gb > 0 ? <p>Разбивка лимита трафика недоступна.</p> : null}
    {reset ? <p>Следующий сброс: {reset.toLocaleString(i18n.language)}</p>
      : subscription.traffic_reset_mode ? <p>{t(`subscription.trafficReset.${subscription.traffic_reset_mode}`, { defaultValue: subscription.traffic_reset_mode === 'NO_RESET' ? 'Без периодического сброса' : `Режим сброса: ${subscription.traffic_reset_mode}` })}</p> : null}
    {updated && <p>Данные проверены: <time dateTime={subscription.traffic_updated_at!}>{updated.toLocaleString(i18n.language)}</time></p>}
  </div>;
}
