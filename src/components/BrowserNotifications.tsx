import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router';
import { Bell, X } from 'lucide-react';
import { useIsTelegram } from '@/platform';
import { useAuthStore } from '@/store/auth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { newsApi } from '@/api/news';
import { notificationsApi } from '@/api/notifications';
import apiClient from '@/api/client';
import { useToast } from '@/components/Toast';
import {
  browserEventFingerprint, browserNotificationPermission, enableBrowserNotifications,
  getBrowserNotificationPreferences, notifyBrowserEvent, setBrowserNotificationPreferences,
  unlockBrowserNotificationAudio,
  advanceNewsNotificationBaseline, type NewsNotificationBaseline,
  getBrowserGuestSupportIdentity, getBrowserPushSubscription,
  synchronizeBrowserPush, getBrowserPushStatus, setBrowserPushStatus,
  setBrowserPushOwner, browserPushMatchesRecipient, reconcileBrowserPushIdentity,
} from '@/utils/browserNotifications';

type PushConfig = { enabled: boolean; public_key: string | null };
type RuntimeEvent = { type: string; recipient_user_id?: number | null; recipient_guest_ticket_id?: number | null; event_id?: string; ticket_id?: number; article_id?: number; message?: string; title?: string; body?: string; url?: string; slug?: string };
const getPushConfig = async () => (await apiClient.get<PushConfig>('/cabinet/public/notifications/push/config')).data;

function usePreferences(userId: number | null) {
  const [preferences, setPreferences] = useState(() => getBrowserNotificationPreferences(userId));
  const [permission, setPermission] = useState(browserNotificationPermission);
  const [pushStatus, setPushStatus] = useState(() => getBrowserPushStatus(userId));
  useEffect(() => {
    const refresh = () => { setPreferences(getBrowserNotificationPreferences(userId)); setPermission(browserNotificationPermission()); setPushStatus(getBrowserPushStatus(userId)); };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('cabinet:browser-notification-preferences', refresh);
    return () => {
      window.removeEventListener('storage', refresh); window.removeEventListener('focus', refresh);
      window.removeEventListener('cabinet:browser-notification-preferences', refresh);
    };
  }, [userId]);
  return { preferences, permission, pushStatus };
}

/** Mount once under router, auth, toast and WebSocket providers. */
export default function BrowserNotifications() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const isTelegram = useIsTelegram();
  const user = useAuthStore((state) => state.user);
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);
  const guest = location.pathname === '/support/guest';
  const userId = guest ? null : user?.id ?? null;
  const active = !isTelegram && !location.pathname.startsWith('/admin') && (guest || authenticated);
  const [promptAnchor, setPromptAnchor] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const refresh = () => setPromptAnchor(active ? document.getElementById('browser-notification-prompt-slot') : null);
    refresh();
    window.addEventListener('cabinet:notification-slot-ready', refresh);
    return () => window.removeEventListener('cabinet:notification-slot-ready', refresh);
  }, [location.pathname, active, guest]);
  const { preferences, permission, pushStatus } = usePreferences(userId);
  const [showResult, setShowResult] = useState(false);
  const [pushRetry, setPushRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const baseline = useRef<NewsNotificationBaseline | null>(null);
  const [guestIdentity, setGuestIdentity] = useState(getBrowserGuestSupportIdentity);
  const previousIdentity = useRef<string | null | undefined>(undefined);
  const identityChange = useRef<Promise<void>>(Promise.resolve());
  const { data: pushConfig, isError: pushConfigError } = useQuery({ queryKey: ['browser-push-config'], queryFn: getPushConfig, enabled: active, retry: false, staleTime: 300000 });
  const { data: serverPreferences } = useQuery({
    queryKey: ['notification-settings', userId], queryFn: notificationsApi.getSettings,
    enabled: active && !guest && authenticated && (preferences.enabled || preferences.sound), staleTime: 60000,
  });
  useEffect(() => {
    const retry = () => setPushRetry((value) => value + 1);
    window.addEventListener('cabinet:browser-push-retry', retry);
    return () => window.removeEventListener('cabinet:browser-push-retry', retry);
  }, []);

  useEffect(() => {
    const refresh = () => setGuestIdentity(getBrowserGuestSupportIdentity());
    window.addEventListener('storage', refresh);
    window.addEventListener('cabinet:guest-support-changed', refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('cabinet:guest-support-changed', refresh); };
  }, []);

  useEffect(() => {
    if (!guest && authLoading) return;
    const currentIdentity = guest
      ? guestIdentity ? `guest:${guestIdentity.ticketId}` : null
      : authenticated && user?.id ? `user:${user.id}` : null;
    if (previousIdentity.current !== currentIdentity) {
      identityChange.current = identityChange.current.catch(() => {}).then(() => reconcileBrowserPushIdentity(currentIdentity));
    }
    previousIdentity.current = currentIdentity;
  }, [guest, authLoading, authenticated, guestIdentity?.ticketId, user?.id]);

  useEffect(() => {
    if ((!guest && authLoading) || !active || !preferences.enabled || permission !== 'granted') return;
    if (pushConfigError) { setBrowserPushStatus(userId, 'failed'); return; }
    if (pushConfig && (!pushConfig.enabled || !pushConfig.public_key || !('PushManager' in window))) { setBrowserPushStatus(userId, 'unsupported'); return; }
    if (!pushConfig?.enabled || !pushConfig.public_key || (guest && !guestIdentity) || (!guest && !serverPreferences)) return;
    let cancelled = false;
    const register = async () => {
      try {
        await identityChange.current;
        if (cancelled) return;
        await synchronizeBrowserPush(userId, pushConfig.public_key!, async (subscription) => {
          if (cancelled) throw new Error('Registration cancelled');
          if (guest && guestIdentity) await apiClient.put(`/cabinet/public/support/sessions/${guestIdentity.ticketId}/push-subscriptions`, subscription, { headers: { 'X-Guest-Token': guestIdentity.accessToken } });
          else await apiClient.put('/cabinet/notifications/push/subscriptions', { ...subscription, news_enabled: serverPreferences?.news_enabled === true });
          if (cancelled) throw new Error('Registration cancelled');
          await setBrowserPushOwner({ user_id: guest ? null : userId, guest_ticket_id: guest ? guestIdentity!.ticketId : null }, subscription.endpoint || null);
        });
      } catch { if (!cancelled) setBrowserPushStatus(userId, 'failed'); }
    };
    void register();
    return () => { cancelled = true; };
  }, [active, guest, authLoading, guestIdentity?.ticketId, guestIdentity?.accessToken, userId, preferences.enabled, permission, pushConfig?.enabled, pushConfig?.public_key, pushConfigError, serverPreferences?.news_enabled, pushRetry]);

  useEffect(() => {
    if (!active || !preferences.sound) return;
    const unlock = () => { void unlockBrowserNotificationAudio(); };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  }, [active, preferences.sound]);

  const onMessage = useCallback((message: RuntimeEvent) => {
    if (!active || guest || !authenticated || !userId) return;
    if (message.type === 'news.published' && message.article_id && serverPreferences?.news_enabled === true) {
      void queryClient.invalidateQueries({ queryKey: ['news'] });
      void notifyBrowserEvent(userId, {
        key: message.event_id || `news.published:${message.article_id}`, kind: 'news',
        title: 'Новая публикация', body: message.body || message.title || 'В кабинете опубликована новая статья.',
        path: message.url || '/ultima/news',
      }).then((delivered) => {
        if (delivered && document.visibilityState === 'visible') showToast({ title: 'Новая публикация', message: message.body || message.title || 'Откройте ленту новостей.', onClick: () => navigate('/ultima/news') });
      });
      return;
    }
    if (message.type !== 'ticket.admin_reply' || !message.ticket_id || (!guest && serverPreferences?.ticket_reply_enabled === false)) return;
    void notifyBrowserEvent(userId, {
      key: message.event_id || `ticket:${message.ticket_id}:${browserEventFingerprint(message.message || '')}`,
      kind: 'ticket', title: 'Поддержка ответила', body: 'Откройте обращение, чтобы прочитать новое сообщение.',
      path: `/support?ticket=${message.ticket_id}`,
    });
  }, [active, guest, authenticated, userId, serverPreferences, queryClient, showToast, navigate]);
  useWebSocket({ onMessage });

  useEffect(() => {
    if (!active || !('serviceWorker' in navigator)) return;
    const receive = (event: MessageEvent) => {
      if (event.data?.type !== 'cabinet:push-notification') return;
      const payload = event.data.payload as RuntimeEvent;
      if (!payload || !payload.event_id || !['ticket.admin_reply', 'news.published', 'subscription.expiring', 'traffic.warning'].includes(payload.type)) return;
      if (!browserPushMatchesRecipient(payload, { user_id: guest ? null : userId, guest_ticket_id: guest ? guestIdentity?.ticketId ?? null : null })) {
        event.ports[0]?.postMessage('handled'); return;
      }
      if (guest && (payload.type !== 'ticket.admin_reply' || payload.ticket_id !== guestIdentity?.ticketId)) return;
      if (!guest && !authenticated) return;
      if (payload.type === 'news.published' && serverPreferences?.news_enabled !== true) {
        event.ports[0]?.postMessage('handled'); return;
      }
      if (!guest && ((payload.type === 'ticket.admin_reply' && serverPreferences?.ticket_reply_enabled === false) || (payload.type === 'subscription.expiring' && serverPreferences?.subscription_expiry_enabled === false) || (payload.type === 'traffic.warning' && serverPreferences?.traffic_warning_enabled === false))) { event.ports[0]?.postMessage('handled'); return; }
      void notifyBrowserEvent(userId, {
        key: payload.event_id, kind: payload.type === 'news.published' ? 'news' : payload.type === 'subscription.expiring' ? 'expiry' : payload.type === 'traffic.warning' ? 'traffic' : 'ticket',
        title: payload.title || 'Новое уведомление', body: payload.body || 'Откройте кабинет, чтобы прочитать сообщение.',
        path: payload.url || (payload.ticket_id ? `/support?ticket=${payload.ticket_id}` : '/ultima/news'),
      }).then(() => event.ports[0]?.postMessage('handled')).catch(() => event.ports[0]?.postMessage('handled'));
    };
    navigator.serviceWorker.addEventListener('message', receive);
    return () => navigator.serviceWorker.removeEventListener('message', receive);
  }, [active, authenticated, guest, guestIdentity?.ticketId, userId, serverPreferences]);

  useEffect(() => {
    baseline.current = null;
    if (!active || guest || !authenticated || !userId || !(preferences.enabled || preferences.sound) || serverPreferences?.news_enabled !== true) return;
    let cancelled = false;
    let running = false;
    const poll = async () => {
      if (running) return;
      running = true;
      try {
        const response = await newsApi.getNews({ limit: 30 });
        if (cancelled) return;
        const items = response.items.filter((item) => item.is_published);
        const result = advanceNewsNotificationBaseline(baseline.current, items);
        baseline.current = result.baseline;
        const fresh = result.fresh;
        // Limit a burst after a background pause while keeping the complete feed accessible.
        for (const item of fresh.slice(0, 3)) {
          const delivered = await notifyBrowserEvent(userId, {
            key: `news.published:${item.id}`, kind: 'news', title: 'Новая публикация', body: item.title,
            path: `/ultima/news/${encodeURIComponent(item.slug)}`,
          });
          if (!cancelled && delivered && document.visibilityState === 'visible') showToast({
            title: 'Новая публикация', message: item.title, duration: 6000,
            onClick: () => navigate(`/ultima/news/${encodeURIComponent(item.slug)}`),
          });
        }
      } catch { /* Transient fetch failures must not reset the baseline or spam old news. */ }
      finally { running = false; }
    };
    void poll();
    const interval = window.setInterval(() => { void poll(); }, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [active, guest, authenticated, userId, preferences.enabled, preferences.sound, serverPreferences, showToast, navigate]);

  if (!active || !promptAnchor || (guest && !guestIdentity) || (!showResult && (preferences.dismissed || permission !== 'default'))) return null;
  return createPortal(
    <aside aria-label="Уведомления сайта" data-testid="browser-notification-prompt" className="cabinet-content-card relative mx-auto my-4 w-full max-w-6xl border p-4 pr-12 text-white shadow-xl">
      <button type="button" aria-label="Позже" className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full text-white/70" onClick={() => { setShowResult(false); setBrowserNotificationPreferences(userId, { dismissed: true }); }}><X className="h-4 w-4" /></button>
      <div className="flex items-center gap-2 pr-9 text-sm font-semibold"><Bell className="h-4 w-4" />Важные уведомления</div>
      <p className="mb-3 mt-2 text-sm leading-relaxed text-white/70">Ответы поддержки, новости и напоминания о подписке и трафике, в том числе при закрытом сайте. Категории можно выбрать в профиле. Браузер попросит разрешение.</p>
      {showResult ? <p role="status" className="mb-3 text-sm text-white/80">{pushStatus === 'ready' ? 'Фоновые уведомления подключены.' : pushStatus === 'failed' ? 'Фоновые уведомления не подключились. Пока работает только открытая вкладка.' : pushStatus === 'unsupported' ? 'Фоновые уведомления недоступны. Работает только открытая вкладка.' : permission === 'denied' ? 'Разрешение заблокировано браузером.' : permission === 'default' ? 'Разрешение ещё не выдано.' : 'Подключаем фоновые уведомления…'}</p> : null}
      <label className="mb-3 flex min-h-11 items-center gap-2 text-sm text-white/80"><input type="checkbox" checked={preferences.sound} onChange={(event) => {
        if (!event.target.checked) { setBrowserNotificationPreferences(userId, { sound: false }); return; }
        void unlockBrowserNotificationAudio().then((ok) => setBrowserNotificationPreferences(userId, { sound: ok }));
      }} />Со звуком</label>
      <button data-testid="browser-notification-enable" type="button" disabled={busy} className="cabinet-primary-action min-h-11 rounded-full px-4 py-2 text-sm font-semibold" onClick={() => {
        setBusy(true);
        setShowResult(true);
        void enableBrowserNotifications(userId).finally(() => setBusy(false));
      }}>{busy ? 'Запрашиваем разрешение…' : 'Включить уведомления'}</button>
    </aside>, promptAnchor
  );
}

/** Settings for the authenticated browser profile; no duplicated WS subscription. */
export function BrowserNotificationSettings() {
  const isTelegram = useIsTelegram();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const { preferences, permission, pushStatus } = usePreferences(userId);
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState('');
  if (isTelegram || !userId) return null;
  const permissionLabel = permission === 'granted' ? 'Разрешены' : permission === 'denied' ? 'Заблокированы в браузере' : permission === 'unsupported' ? 'Недоступны в этом браузере' : 'Разрешение ещё не выдано';
  return (
    <section data-testid="browser-notification-settings" className="cabinet-content-card border p-5">
      <h2 className="text-base font-semibold text-white">Уведомления сайта</h2>
      <p className="mt-1 text-sm leading-relaxed text-white/70">Ответы поддержки и новости на этом устройстве. Фоновые уведомления могут приходить при закрытом сайте; звук таких уведомлений управляется настройками системы.</p>
      <p role="status" className="mt-3 text-sm text-white/70">{feedback || permissionLabel}</p>
      {preferences.enabled && permission === 'granted' ? <p role="status" className="mt-2 text-sm text-white/70">{pushStatus === 'ready' ? 'Фоновые уведомления подключены' : pushStatus === 'failed' ? 'Не удалось подключить фоновые уведомления. Открытая вкладка продолжает получать события.' : pushStatus === 'unsupported' ? 'Этот браузер или сервер поддерживает только открытую вкладку.' : 'Подключаем фоновые уведомления…'}</p> : null}
      {preferences.enabled && (pushStatus === 'failed' || pushStatus === 'unsupported') ? <button type="button" className="mt-3 min-h-11 rounded-full border px-4 text-sm text-white" onClick={() => {
        void queryClient.invalidateQueries({ queryKey: ['browser-push-config'] }).then(() => window.dispatchEvent(new Event('cabinet:browser-push-retry')));
      }}>Повторить подключение</button> : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <button data-testid="browser-notification-toggle" type="button" disabled={permission === 'unsupported' || permission === 'denied'} className="cabinet-glass-control min-h-11 rounded-full border px-4 text-sm text-white" onClick={() => {
          if (preferences.enabled) {
            setBrowserNotificationPreferences(userId, { enabled: false });
            void getBrowserPushSubscription().then(async (subscription) => {
              if (!subscription) return;
              try { await apiClient.delete('/cabinet/notifications/push/subscriptions', { data: { endpoint: subscription.endpoint } }); }
              finally { await subscription.unsubscribe(); }
            }).catch(() => setFeedback('Уведомления выключены; сервер временно недоступен'));
            return;
          }
          void enableBrowserNotifications(userId).then((result) => setFeedback(result === 'granted' ? 'Разрешение браузера получено' : 'Браузер не разрешил уведомления'));
        }}>{preferences.enabled && permission === 'granted' ? 'Выключить уведомления' : 'Включить уведомления'}</button>
        <button data-testid="browser-notification-sound" aria-pressed={preferences.sound} type="button" className="cabinet-glass-control min-h-11 rounded-full border px-4 text-sm text-white" onClick={() => {
          if (preferences.sound) { setBrowserNotificationPreferences(userId, { sound: false }); return; }
          void unlockBrowserNotificationAudio().then((ok) => {
            setBrowserNotificationPreferences(userId, { sound: ok });
            setFeedback(ok ? 'Звук включён для этой вкладки' : 'Браузер не разрешил воспроизведение звука');
          });
        }}>Звук: {preferences.sound ? 'включён' : 'выключен'}</button>
      </div>
      {permission === 'denied' ? <p className="mt-3 text-sm text-white/70">Разрешите уведомления в настройках сайта рядом с адресной строкой браузера.</p> : null}
    </section>
  );
}
