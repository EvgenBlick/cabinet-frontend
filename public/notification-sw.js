// The server sends authenticated or guest-session-bound Web Push events.
const pendingEvents = new Set();
const ownerKey = () => new Request(new URL('/browser-notifications/active-owner', self.location.origin));
let ownerWrites = Promise.resolve();
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'cabinet:push-owner') return;
  ownerWrites = ownerWrites.catch(() => {}).then(async () => {
    try {
      const owner = event.data.owner;
      const valid = owner && typeof owner.endpoint === 'string' &&
        ((Number.isInteger(owner.user_id) && owner.user_id > 0 && owner.guest_ticket_id == null) ||
         (Number.isInteger(owner.guest_ticket_id) && owner.guest_ticket_id > 0 && owner.user_id == null));
      const cache = await caches.open('cabinet-notification-owner-v1');
      await cache.put(ownerKey(), new Response(JSON.stringify(valid ? owner : null)));
      event.ports[0]?.postMessage('saved');
    } catch { event.ports[0]?.postMessage('failed'); }
  });
  event.waitUntil(ownerWrites);
});
async function matchesOwner(payload) {
  try {
    await ownerWrites;
    const saved = await (await caches.open('cabinet-notification-owner-v1')).match(ownerKey());
    const owner = saved && await saved.json();
    const subscription = await self.registration.pushManager.getSubscription();
    return Boolean(owner && subscription && owner.endpoint === subscription.endpoint && (owner.user_id != null
      ? payload.recipient_user_id === owner.user_id && payload.recipient_guest_ticket_id == null
      : payload.recipient_guest_ticket_id === owner.guest_ticket_id && payload.recipient_user_id == null));
  } catch { return false; }
}
self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    let payload;
    try { payload = event.data?.json(); } catch { return; }
    if (!payload || !['ticket.admin_reply', 'news.published', 'subscription.expiring', 'traffic.warning'].includes(payload.type) || typeof payload.event_id !== 'string') return;
    if (!await matchesOwner(payload)) return;
    const id = payload.event_id.slice(0, 200);
    if (pendingEvents.has(id)) return;
    pendingEvents.add(id);
    try {
      const cache = await caches.open('cabinet-notification-events-v1');
      const key = new Request(new URL(`/browser-notifications/events/${encodeURIComponent(id)}`, self.location.origin));
      if (await cache.match(key)) return;
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const requests = clients.map((client) => new Promise((resolve) => {
        const channel = new MessageChannel();
        const timeout = setTimeout(() => { channel.port1.close(); resolve(false); }, 800);
        channel.port1.onmessage = (message) => { clearTimeout(timeout); channel.port1.close(); resolve(message.data === 'handled'); };
        client.postMessage({ type: 'cabinet:push-notification', payload }, [channel.port2]);
      }));
      const results = await Promise.all(requests);
      if (!results.some(Boolean)) {
        if (!await matchesOwner(payload)) return;
        const raw = payload.url;
        const path = typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
        await self.registration.showNotification(String(payload.title || 'Samurai Service').slice(0, 120), {
          body: String(payload.body || 'В кабинете есть новое уведомление.').slice(0, 300),
          tag: id, icon: '/samurai_original_medallion.png', data: { path },
        });
      }
      await cache.put(key, new Response('seen'));
      const keys = await cache.keys();
      for (const old of keys.slice(0, Math.max(0, keys.length - 100))) await cache.delete(old);
    } finally { pendingEvents.delete(id); }
  })());
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const raw = event.notification.data?.path;
  const path = typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
  const url = new URL(path, self.location.origin);
  if (url.origin !== self.location.origin) return;
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const client = clients.find((item) => new URL(item.url).origin === self.location.origin);
    if (client) { await client.navigate(url.href); await client.focus(); }
    else await self.clients.openWindow(url.href);
  })());
});
