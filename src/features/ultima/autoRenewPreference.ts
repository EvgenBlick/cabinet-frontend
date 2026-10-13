import { subscriptionApi } from '@/api/subscription';
import type { Subscription } from '@/types';

const key = (userId: number) => `ultima_autorenew_choice_${userId}`;
const pending = new Map<number, Promise<{ subscription: Subscription; error: string | null }>>();

export function readUltimaAutoRenewPreference(userId: number | undefined | null): boolean | null {
  if (userId == null) return null;
  try {
    const value = localStorage.getItem(key(userId));
    return value === 'true' ? true : value === 'false' ? false : null;
  } catch {
    return null;
  }
}

export function writeUltimaAutoRenewPreference(
  userId: number | undefined | null,
  enabled: boolean,
) {
  if (userId == null) return;
  try {
    localStorage.setItem(key(userId), String(enabled));
  } catch {
    /* Storage is optional. */
  }
}

function clearPreference(userId: number) {
  try {
    localStorage.removeItem(key(userId));
  } catch {
    /* Storage is optional. */
  }
}

export async function applyUltimaAutoRenewPreference(
  userId: number | undefined | null,
  subscription: Subscription,
) {
  const preference = readUltimaAutoRenewPreference(userId);
  if (userId == null || preference == null) return { subscription, error: null };
  const existing = pending.get(userId);
  if (existing) return existing;
  if (subscription.is_daily || subscription.autopay_enabled === preference) {
    clearPreference(userId);
    return { subscription, error: null };
  }
  const request = (async () => {
    try {
      const settings = await subscriptionApi.updateAutopay(preference, 1);
      clearPreference(userId);
      return { subscription: { ...subscription, ...settings }, error: null };
    } catch {
      return {
        subscription,
        error:
          'Подписка подключена, но не удалось сохранить автопродление. Попробуйте изменить настройку ещё раз.',
      };
    } finally {
      pending.delete(userId);
    }
  })();
  pending.set(userId, request);
  return request;
}
