import type { SubscriptionStatusResponse } from '@/types';

export type ServiceStatus = { state: 'operational' | 'degraded' | 'outage' | 'unknown'; updated_at: string | null; nodes_total: number | null; nodes_online: number | null; message: string | null; maintenance: Array<{ message: string }> };
export const UNKNOWN_SERVICE: ServiceStatus = { state: 'unknown', updated_at: null, nodes_total: null, nodes_online: null, message: null, maintenance: [] };
export function normalizeServiceStatus(raw: unknown): ServiceStatus {
  if (!raw || typeof raw !== 'object') return UNKNOWN_SERVICE;
  const data = raw as Partial<ServiceStatus>;
  const validCount = (value: unknown) => Number.isInteger(value) && Number(value) >= 0;
  if (!['operational', 'degraded', 'outage', 'unknown'].includes(data.state || '')) return UNKNOWN_SERVICE;
  if (data.state !== 'unknown' && (!validCount(data.nodes_total) || !validCount(data.nodes_online) || !data.nodes_total || data.nodes_online! > data.nodes_total)) return UNKNOWN_SERVICE;
  if (data.state === 'operational' && !data.nodes_online || data.state === 'degraded' && (!data.nodes_online || data.nodes_online >= data.nodes_total!) || data.state === 'outage' && data.nodes_online !== 0) return UNKNOWN_SERVICE;
  return { state: data.state!, nodes_total: validCount(data.nodes_total) ? data.nodes_total! : null, nodes_online: validCount(data.nodes_online) ? data.nodes_online! : null,
    updated_at: typeof data.updated_at === 'string' && Number.isFinite(Date.parse(data.updated_at)) ? data.updated_at : null, message: typeof data.message === 'string' ? data.message.slice(0, 500) : null,
    maintenance: Array.isArray(data.maintenance) ? data.maintenance.filter((item) => item && typeof item.message === 'string').slice(0, 3).map((item) => ({ message: item.message.slice(0, 300) })) : [] };
}
export type DiagnosticCheck = { id: 'network' | 'subscription' | 'traffic' | 'devices' | 'import'; state: 'pass' | 'warning' | 'fail' | 'unknown'; title: string; detail: string };
export type VpnDiagnosticContext = { client: 'Happ' | 'INCY' | 'Не выбран'; platform: string; service: ServiceStatus['state']; checks: Array<Pick<DiagnosticCheck, 'id' | 'state'>>; checkedAt: string };
const platforms = ['ios', 'android', 'windows', 'macos', 'linux', 'androidTV', 'appleTV'];
export function detectDiagnosticPlatform(): string {
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) ? 'ios' : /android/.test(ua) ? 'android' : /windows/.test(ua) ? 'windows' : /macintosh|mac os x/.test(ua) ? 'macos' : /linux/.test(ua) ? 'linux' : '';
}
export function safeDiagnosticClient(value?: string | null): VpnDiagnosticContext['client'] {
  return value?.toLowerCase().includes('incy') ? 'INCY' : value?.toLowerCase().includes('happ') ? 'Happ' : 'Не выбран';
}
export function buildDiagnosticChecks(input: { online: boolean; subscription?: SubscriptionStatusResponse; devices?: { total: number; device_limit: number }; importReady?: boolean | null }): DiagnosticCheck[] {
  const response = typeof input.subscription?.has_subscription === 'boolean' && (!input.subscription.has_subscription || (input.subscription.subscription && typeof input.subscription.subscription.is_active === 'boolean' && typeof input.subscription.subscription.is_expired === 'boolean')) ? input.subscription : undefined;
  const sub = response?.subscription;
  const devices = input.devices && Number.isInteger(input.devices.total) && input.devices.total >= 0 && Number.isInteger(input.devices.device_limit) && input.devices.device_limit >= 0 ? input.devices : undefined;
  const active = sub?.is_active && !sub.is_expired && !sub.is_daily_paused;
  const trafficExhausted = sub && !sub.standard_traffic_unlimited && !sub.metered_traffic_enabled && sub.traffic_limit_gb > 0 && sub.traffic_used_gb >= sub.traffic_limit_gb;
  return [
    { id: 'network', state: input.online ? 'unknown' : 'fail', title: 'Сеть устройства', detail: input.online ? 'Браузер сообщает о подключении к сети. Доступность интернета и VPN-туннеля это не подтверждает.' : 'Браузер сообщает, что устройство не в сети. Проверьте Wi-Fi или мобильный интернет.' },
    { id: 'subscription', state: !response ? 'unknown' : active ? 'pass' : 'fail', title: 'Подписка', detail: !response ? 'Не удалось получить актуальные данные подписки.' : !sub ? 'Активной подписки нет.' : sub.is_daily_paused ? 'Подписка приостановлена.' : sub.is_expired ? 'Срок подписки истёк.' : active ? 'Подписка активна.' : 'Подписка не активна.' },
    { id: 'traffic', state: !sub ? 'unknown' : trafficExhausted ? 'fail' : sub.metered_access_blocked ? 'warning' : 'pass', title: 'Лимит трафика', detail: !sub ? 'Нет данных о трафике.' : trafficExhausted ? 'Доступный трафик израсходован.' : sub.metered_access_blocked ? 'Трафик платных локаций израсходован. Проверьте подключение к другой доступной локации.' : 'По данным подписки блокировка из-за трафика не обнаружена.' },
    { id: 'devices', state: !devices ? 'unknown' : devices.device_limit > 0 && devices.total >= devices.device_limit ? 'warning' : 'pass', title: 'Лимит устройств', detail: !devices ? 'Не удалось получить количество устройств.' : devices.device_limit > 0 && devices.total >= devices.device_limit ? 'Свободных мест для нового устройства нет. Уже добавленные устройства могут продолжать работать.' : 'Есть место для добавления устройства.' },
    { id: 'import', state: input.importReady == null ? 'unknown' : input.importReady ? 'pass' : 'fail', title: 'Импорт подписки', detail: input.importReady == null ? 'Проверьте выбранное приложение и ссылку на странице подключения.' : input.importReady ? 'Ссылка для выбранного приложения готова. Это не подтверждает, что подписка добавлена в клиент.' : 'Ссылка для выбранного приложения недоступна. Повторите загрузку страницы подключения.' },
  ];
}
export function createDiagnosticContext(client: string | null | undefined, platform: string | null | undefined, service: ServiceStatus['state'], checks: DiagnosticCheck[]): VpnDiagnosticContext {
  return { client: safeDiagnosticClient(client), platform: platforms.includes(platform || '') ? platform! : 'Не выбрана', service, checks: checks.map(({ id, state }) => ({ id, state })), checkedAt: new Date().toISOString() };
}
/** Whitelisted values only: never serializes URLs, keys, HWIDs or arbitrary router state. */
export function diagnosticTicketDraft(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const input = raw as Partial<VpnDiagnosticContext>;
  const clients = ['Happ', 'INCY', 'Не выбран'];
  const states = ['operational', 'degraded', 'outage', 'unknown'];
  const ids = ['network', 'subscription', 'traffic', 'devices', 'import'];
  const checkStates = ['pass', 'warning', 'fail', 'unknown'];
  if (!clients.includes(input.client || '') || !states.includes(input.service || '') || !Array.isArray(input.checks)) return null;
  const results = input.checks.filter((check) => check && ids.includes(check.id) && checkStates.includes(check.state)).slice(0, 5);
  const platform = platforms.includes(input.platform || '') ? input.platform : 'Не выбрана';
  const date = typeof input.checkedAt === 'string' && Number.isFinite(Date.parse(input.checkedAt)) ? new Date(input.checkedAt).toISOString() : 'не указано';
  const titles = { network: 'Сеть устройства', subscription: 'Подписка', traffic: 'Лимит трафика', devices: 'Лимит устройств', import: 'Импорт подписки' };
  const outcomes = { pass: 'проверка пройдена', warning: 'есть ограничение', fail: 'обнаружена проблема', unknown: 'не подтверждено' };
  const serviceLabels = { operational: 'доступны', degraded: 'частично недоступны', outage: 'недоступны', unknown: 'неизвестен' };
  return `VPN не работает.\nОпишите, что происходит и какую локацию вы выбираете:\n\n\nДиагностика кабинета:\nПриложение: ${input.client}\nПлатформа: ${platform}\nСтатус узлов: ${serviceLabels[input.service!]}\nПроверка: ${date}\n${results.map((check) => `${titles[check.id]}: ${outcomes[check.state]}`).join('\n')}\nПроверки кабинета не подтверждают работу VPN-туннеля.`;
}
