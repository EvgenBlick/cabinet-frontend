import { Link, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, CircleHelp, Loader2, RefreshCw, TriangleAlert, Wrench } from 'lucide-react';
import apiClient from '@/api/client';
import { subscriptionApi } from '@/api/subscription';
import { useAuthStore } from '@/store/auth';
import { buildDiagnosticChecks, createDiagnosticContext, detectDiagnosticPlatform, normalizeServiceStatus, UNKNOWN_SERVICE, type ServiceStatus, type VpnDiagnosticContext } from '@/utils/vpnDiagnostics';

const UNKNOWN = UNKNOWN_SERVICE;
async function getServiceStatus(): Promise<ServiceStatus> {
  const { data } = await apiClient.get<ServiceStatus>('/cabinet/info/service-status', { timeout: 10000 });
  return normalizeServiceStatus(data);
}
const labels: Record<ServiceStatus['state'], string> = { operational: 'Включённые узлы доступны', degraded: 'Часть узлов недоступна', outage: 'Узлы недоступны', unknown: 'Статус узлов неизвестен' };

export function VpnDiagnostics({ client, platform, importReady, onSupport, supportEnabled = true }: {
  client?: string | null; platform?: string | null; importReady?: boolean | null;
  onSupport: (context: VpnDiagnosticContext) => void; supportEnabled?: boolean;
}) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [chosenClient, setChosenClient] = useState('');
  const [chosenPlatform, setChosenPlatform] = useState(detectDiagnosticPlatform);
  const diagnosticClient = client ?? chosenClient;
  const diagnosticPlatform = platform ?? chosenPlatform;
  const userId = useAuthStore((state) => state.user?.id);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => { const refresh = () => setOnline(navigator.onLine); window.addEventListener('online', refresh); window.addEventListener('offline', refresh); return () => { window.removeEventListener('online', refresh); window.removeEventListener('offline', refresh); }; }, []);
  const serviceQuery = useQuery({ queryKey: ['service-status'], queryFn: getServiceStatus, staleTime: 30000, refetchInterval: 60000, retry: false });
  const subscriptionQuery = useQuery({ queryKey: ['vpn-diagnostics-subscription', userId], queryFn: subscriptionApi.getSubscription, enabled: open && Boolean(userId), staleTime: 0, retry: false });
  const devicesQuery = useQuery({ queryKey: ['vpn-diagnostics-devices', userId], queryFn: subscriptionApi.getDevices, enabled: open && Boolean(userId), staleTime: 0, retry: false });
  const service = serviceQuery.isError ? UNKNOWN : serviceQuery.data || UNKNOWN;
  const checking = subscriptionQuery.isFetching || devicesQuery.isFetching || serviceQuery.isFetching;
  const checks = buildDiagnosticChecks({ online, subscription: subscriptionQuery.isError ? undefined : subscriptionQuery.data, devices: devicesQuery.isError ? undefined : devicesQuery.data, importReady });
  const updatedAt = service.updated_at && Number.isFinite(Date.parse(service.updated_at)) ? new Date(service.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
  const refresh = () => { void Promise.allSettled([serviceQuery.refetch(), subscriptionQuery.refetch(), devicesQuery.refetch()]); };
  return <section className="cabinet-content-card space-y-4 rounded-[24px] border p-4" aria-label="Диагностика подключения" data-testid="vpn-diagnostics">
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${service.state === 'operational' ? 'bg-emerald-400' : service.state === 'unknown' ? 'bg-slate-400' : 'bg-amber-400'}`} />
      <div className="min-w-0 flex-1"><p className="text-[14px] font-semibold" data-testid="vpn-service-state" data-state={service.state}>{labels[service.state]}</p>
        <p className="mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--cabinet-text-secondary, #a1a1aa)' }}>{updatedAt ? `Проверено в ${updatedAt}. ` : ''}Статус узлов не проверяет VPN-туннель вашего устройства.</p></div>
    </div>
    {location.pathname!=="/status"&&<Link to="/status" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Подробный статус сервиса</Link>}
    {service.maintenance.map((item, index) => <p key={index} className="text-[12px] leading-relaxed" style={{ color: 'var(--cabinet-text-secondary, #a1a1aa)' }}>{item.message}</p>)}
    <button type="button" data-testid="vpn-diagnostics-open" aria-expanded={open} onClick={() => setOpen(!open)} className="cabinet-glass-control flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-3 text-[14px] font-medium"><Wrench aria-hidden="true" className="h-4 w-4" />{open ? 'Скрыть диагностику' : 'VPN не работает'}</button>
    {open && <div className="space-y-4" data-testid="vpn-diagnostics-results">
      <p className="text-[14px] leading-relaxed">Проверим подписку, трафик и лимит устройств. Данные кабинета помогают найти причину, но не заменяют проверку подключения в {diagnosticClient || 'VPN-приложении'}.</p>
      {client === undefined && <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1 text-[12px]">Приложение<select aria-label="Приложение для диагностики" className="min-h-11 w-full rounded-xl px-2 text-[14px]" value={chosenClient} onChange={(event) => setChosenClient(event.target.value)}><option value="">Не выбрано</option><option value="Happ">Happ</option><option value="INCY">INCY</option></select></label>
        <label className="space-y-1 text-[12px]">Устройство<select aria-label="Устройство для диагностики" className="min-h-11 w-full rounded-xl px-2 text-[14px]" value={chosenPlatform} onChange={(event) => setChosenPlatform(event.target.value)}>{[['', 'Не выбрано'], ['ios', 'iPhone / iPad'], ['android', 'Android'], ['windows', 'Windows'], ['macos', 'macOS'], ['linux', 'Linux'], ['androidTV', 'Android TV'], ['appleTV', 'Apple TV']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>}
      <ul className="space-y-3" aria-live="polite">{checks.map((check) => {
        const Icon = check.state === 'pass' ? CheckCircle2 : check.state === 'unknown' ? CircleHelp : TriangleAlert;
        return <li key={check.id} className="flex items-start gap-3" data-testid={`vpn-check-${check.id}`} data-state={check.state}><Icon aria-hidden="true" className={`mt-0.5 h-5 w-5 shrink-0 ${check.state === 'pass' ? 'text-emerald-400' : check.state === 'unknown' ? 'text-slate-400' : 'text-amber-400'}`} /><div><p className="text-[14px] font-medium">{check.title}</p><p className="mt-0.5 text-[14px] leading-relaxed" style={{ color: 'var(--cabinet-text-secondary, #a1a1aa)' }}>{check.detail}</p></div></li>;
      })}</ul>
      <div className="rounded-2xl border p-3 text-[14px] leading-relaxed" style={{ borderColor: 'var(--cabinet-border)' }}><p className="font-medium">Что можно попробовать</p><ol className="mt-2 list-decimal space-y-1 pl-5"><li>Выберите другую доступную локацию в приложении.</li><li>Переключитесь между Wi-Fi и мобильным интернетом.</li><li>Отключите другой VPN и снова подключитесь.</li></ol></div>
      <button type="button" onClick={refresh} disabled={checking} className="cabinet-glass-control flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl text-[14px] disabled:opacity-50">{checking ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <RefreshCw aria-hidden="true" className="h-4 w-4" />}{checking ? 'Проверяем данные' : 'Повторить проверку'}</button>
      <button type="button" data-testid="vpn-diagnostics-support" disabled={checking || !supportEnabled} onClick={() => onSupport(createDiagnosticContext(diagnosticClient, diagnosticPlatform, service.state, checks))} className="cabinet-primary-action min-h-12 w-full rounded-2xl px-4 text-[14px] font-semibold disabled:opacity-50">{supportEnabled ? 'Передать результат в поддержку' : 'Приём обращений недоступен'}</button>
      <p className="text-[12px] leading-relaxed" style={{ color: 'var(--cabinet-text-secondary, #a1a1aa)' }}>Откроется черновик обращения. Вы сможете проверить и изменить текст перед отправкой.</p>
    </div>}
  </section>;
}

