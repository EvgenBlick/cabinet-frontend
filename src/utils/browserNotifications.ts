export type BrowserNotificationPreferences = { enabled: boolean; sound: boolean; dismissed: boolean };
export type BrowserNotificationEvent = { key: string; title: string; body: string; path: string; kind: 'ticket' | 'news' | 'expiry' | 'traffic' };
const DEFAULTS: BrowserNotificationPreferences = { enabled: false, sound: false, dismissed: false };
const PREFIX = 'cabinet:browser-notifications:';
const memoryClaims = new Map<string, number>();
const memoryPreferences = new Map<string, BrowserNotificationPreferences>();
let audio: AudioContext | null = null;
let lastSound = 0;
let registration: Promise<ServiceWorkerRegistration> | null = null;
export type BrowserPushStatus = 'idle' | 'registering' | 'ready' | 'failed' | 'unsupported';
const pushStatuses = new Map<string, BrowserPushStatus>();
export type BrowserPushOwner = { user_id: number | null; guest_ticket_id: number | null };
export function browserPushMatchesRecipient(payload: { recipient_user_id?: number | null; recipient_guest_ticket_id?: number | null }, owner: BrowserPushOwner): boolean {
  return owner.user_id !== null
    ? payload.recipient_user_id === owner.user_id && payload.recipient_guest_ticket_id == null
    : owner.guest_ticket_id !== null && payload.recipient_guest_ticket_id === owner.guest_ticket_id && payload.recipient_user_id == null;
}
export async function setBrowserPushOwner(owner: BrowserPushOwner | null, endpoint: string | null = null): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const worker = await navigator.serviceWorker.getRegistration('/browser-notifications/');
  if (!worker?.active) return;
  await new Promise<void>((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => { channel.port1.close(); reject(new Error('Push identity sync timed out')); }, 3000);
    channel.port1.onmessage = (event) => { clearTimeout(timer); channel.port1.close(); event.data === 'saved' ? resolve() : reject(new Error('Push identity unavailable')); };
    worker.active!.postMessage({ type: 'cabinet:push-owner', owner: owner && { ...owner, endpoint } }, [channel.port2]);
  });
}
export const getBrowserPushStatus = (userId: number | string | null): BrowserPushStatus => pushStatuses.get(String(userId)) || 'idle';
export function setBrowserPushStatus(userId: number | string | null, status: BrowserPushStatus) {
  pushStatuses.set(String(userId), status);
  window.dispatchEvent(new Event('cabinet:browser-notification-preferences'));
}

export async function synchronizeBrowserPush(userId: number | string | null, publicKey: string, save: (value: PushSubscriptionJSON) => Promise<unknown>): Promise<boolean> {
  setBrowserPushStatus(userId, 'registering');
  try {
    const subscription = await registerBrowserPushSubscription(publicKey);
    await save(subscription);
    setBrowserPushStatus(userId, 'ready');
    return true;
  } catch { setBrowserPushStatus(userId, 'failed'); return false; }
}

export async function unsubscribeBrowserPush(): Promise<void> {
  await setBrowserPushOwner(null);
  const subscription = await getBrowserPushSubscription();
  await subscription?.unsubscribe();
}

/** Only identity is persisted; credentials and push endpoints stay out of storage. */
export async function reconcileBrowserPushIdentity(identity: string | null): Promise<void> {
  const key = 'cabinet:browser-push-identity';
  let previous: string | null = null;
  try { previous = localStorage.getItem(key); } catch { /* Unknown identity fails closed. */ }
  const next = identity || 'signed-out';
  if (previous === next) return;
  await unsubscribeBrowserPush();
  try { localStorage.setItem(key, next); } catch { /* Retry safely on the next mount. */ }
}

export function getBrowserGuestSupportIdentity(): { ticketId: number; accessToken: string } | null {
  try {
    const value = JSON.parse(localStorage.getItem('ultima-guest-support') || 'null');
    return Number.isInteger(value?.ticketId) && value.ticketId > 0 && typeof value.accessToken === 'string' && value.accessToken
      ? { ticketId: value.ticketId, accessToken: value.accessToken } : null;
  } catch { return null; }
}

async function activeWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) throw new Error('Service workers unavailable');
  registration ??= navigator.serviceWorker.register('/notification-sw.js', { scope: '/browser-notifications/' });
  try {
    const worker = await registration;
    if (!worker.active) {
      const candidate = worker.installing || worker.waiting;
      if (candidate) await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('Worker activation timed out')), 8000);
        candidate.addEventListener('statechange', () => {
          if (candidate.state === 'activated') { clearTimeout(timeout); resolve(); }
          if (candidate.state === 'redundant') { clearTimeout(timeout); reject(new Error('Worker unavailable')); }
        });
      });
    }
    return worker;
  } catch (error) { registration = null; throw error; }
}

export async function registerBrowserPushSubscription(publicKey: string): Promise<PushSubscriptionJSON> {
  const worker = await activeWorker();
  const current = await worker.pushManager.getSubscription();
  if (current) return current.toJSON();
  const normalized = publicKey.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
  const key = Uint8Array.from(decoded, (char) => char.charCodeAt(0));
  const subscription = await worker.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key.buffer });
  return subscription.toJSON();
}

export async function getBrowserPushSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null;
  const worker = await navigator.serviceWorker.getRegistration('/browser-notifications/');
  return worker ? worker.pushManager.getSubscription() : null;
}

export type NewsNotificationBaseline = { seen: Set<number>; maxId: number; latestPublishedAt: number };
export function advanceNewsNotificationBaseline<T extends { id: number; published_at?: string | null }>(baseline: NewsNotificationBaseline | null, items: T[]): { baseline: NewsNotificationBaseline; fresh: T[] } {
  const fresh = baseline ? items.filter((item) => !baseline.seen.has(item.id) &&
    (item.id > baseline.maxId || Date.parse(item.published_at || '') > baseline.latestPublishedAt)) : [];
  const next = baseline || { seen: new Set<number>(), maxId: 0, latestPublishedAt: 0 };
  for (const item of items) { next.seen.add(item.id); next.maxId = Math.max(next.maxId, item.id); next.latestPublishedAt = Math.max(next.latestPublishedAt, Date.parse(item.published_at || '') || 0); }
  return { baseline: next, fresh };
}

export function getBrowserNotificationPreferences(userId: number | string | null): BrowserNotificationPreferences {
  if (memoryPreferences.has(String(userId))) return memoryPreferences.get(String(userId))!;
  try {
    const value = JSON.parse(localStorage.getItem(`${PREFIX}${userId}`) || '{}');
    return { enabled: value.enabled === true, sound: value.sound === true, dismissed: value.dismissed === true };
  } catch { return { ...DEFAULTS }; }
}

export function setBrowserNotificationPreferences(userId: number | string | null, patch: Partial<BrowserNotificationPreferences>) {
  const value = { ...getBrowserNotificationPreferences(userId), ...patch };
  try { localStorage.setItem(`${PREFIX}${userId}`, JSON.stringify(value)); memoryPreferences.delete(String(userId)); }
  catch { memoryPreferences.set(String(userId), value); }
  window.dispatchEvent(new Event('cabinet:browser-notification-preferences'));
  return value;
}

export function browserNotificationPermission(): NotificationPermission | 'unsupported' {
  return typeof Notification !== 'undefined' && window.isSecureContext ? Notification.permission : 'unsupported';
}

export async function unlockBrowserNotificationAudio(): Promise<boolean> {
  try {
    if (!audio) audio = new AudioContext();
    if (audio.state === 'suspended') await audio.resume();
    return audio.state === 'running';
  } catch { return false; }
}

export async function enableBrowserNotifications(userId: number | string | null): Promise<NotificationPermission | 'unsupported'> {
  if (browserNotificationPermission() === 'unsupported') return 'unsupported';
  // This call must remain directly inside the click handler, before any await.
  let permission: NotificationPermission;
  try { permission = await Notification.requestPermission(); }
  catch { return browserNotificationPermission(); }
  setBrowserNotificationPreferences(userId, { enabled: permission === 'granted', dismissed: true });
  return permission;
}

function playSound() {
  if (!audio || audio.state !== 'running' || Date.now() - lastSound < 1000) return;
  lastSound = Date.now();
  try {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const start = audio.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(740, start);
    oscillator.frequency.setValueAtTime(980, start + 0.08);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.045, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.start(start); oscillator.stop(start + 0.22);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  } catch { /* Audio may be suspended when the browser backgrounds the tab. */ }
}

async function showSystemNotification(event: BrowserNotificationEvent) {
  const path = event.path.startsWith('/') && !event.path.startsWith('//') ? event.path : '/';
  const options: NotificationOptions = { body: event.body, tag: event.key, silent: true, icon: '/samurai_original_medallion.png', data: { path } };
  if ('serviceWorker' in navigator) {
    try {
      const worker = await activeWorker();
      await worker.showNotification(event.title, options);
      return;
    } catch { registration = null; }
  }
  try {
    const notification = new Notification(event.title, options);
    notification.onclick = () => { window.focus(); window.location.assign(path); notification.close(); };
  } catch { /* Persistent notifications are required on some mobile browsers. */ }
}

function claim(userId: number | string | null, event: BrowserNotificationEvent) {
  const key = `${PREFIX}seen:${userId}`;
  const id = `${userId}:${event.key}`;
  const now = Date.now();
  const ttl = event.kind === 'news' ? 30 * 86400000 : 10000;
  let seen: Record<string, number> = {};
  try { seen = JSON.parse(localStorage.getItem(key) || '{}'); } catch { /* In-memory fallback below. */ }
  const last = Math.max(Number(seen[event.key]) || 0, memoryClaims.get(id) || 0);
  if (last && now - last < ttl) return false;
  memoryClaims.set(id, now);
  seen[event.key] = now;
  const recent = Object.entries(seen).sort((a, b) => b[1] - a[1]).slice(0, 100);
  try { localStorage.setItem(key, JSON.stringify(Object.fromEntries(recent))); } catch { /* Restricted storage. */ }
  return true;
}

/** For authenticated or guest events; preferences must have been explicitly enabled. */
export async function notifyBrowserEvent(userId: number | string | null, event: BrowserNotificationEvent): Promise<boolean> {
  const prefs = getBrowserNotificationPreferences(userId);
  if (!prefs.enabled && !prefs.sound) return false;
  const deliver = async () => {
    if (!claim(userId, event)) return false;
    if (prefs.sound) playSound();
    if (prefs.enabled && browserNotificationPermission() === 'granted') await showSystemNotification(event);
    return true;
  };
  // Web Locks serialize claims across tabs without storing private message content.
  if (navigator.locks) return navigator.locks.request(`${PREFIX}${userId}:${event.key}`, deliver);
  return deliver();
}

export function browserEventFingerprint(text: string): string {
  let hash = 2166136261;
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(36);
}
