const KEY = 'samurai:reduce-animation';
const EVENT = 'samurai:reduce-animation-change';
const QUERY = '(prefers-reduced-motion: reduce)';

export function getReducedAnimationPreference(): boolean {
  if (sessionPreference !== undefined) return sessionPreference;
  try { return window.localStorage.getItem(KEY) === 'true'; } catch { return false; }
}
export function getSystemReducedAnimation(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
}
export function isAnimationReduced(): boolean {
  return getEffectiveReducedAnimation();
}
export function setReducedAnimationPreference(enabled: boolean): void {
  try { window.localStorage.setItem(KEY, String(enabled)); } catch { /* Continue for this session. */ }
  sessionPreference = enabled;
  window.dispatchEvent(new Event(EVENT));
}
let sessionPreference: boolean | undefined;
export function getEffectiveReducedAnimation(): boolean {
  return (sessionPreference ?? getReducedAnimationPreference()) || getSystemReducedAnimation();
}
export function subscribeReducedAnimation(listener: () => void): () => void {
  const media = window.matchMedia(QUERY);
  const storage = (event: StorageEvent) => { if (event.key === KEY || event.key === null) { sessionPreference = undefined; listener(); } };
  window.addEventListener(EVENT, listener);
  window.addEventListener('storage', storage);
  media.addEventListener('change', listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener('storage', storage);
    media.removeEventListener('change', listener);
  };
}
