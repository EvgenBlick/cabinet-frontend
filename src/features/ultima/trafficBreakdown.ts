import type { Subscription } from '@/types';
export function getTrafficBreakdown(subscription: Subscription) {
  const base = subscription.traffic_base_limit_gb;
  const bonus = subscription.traffic_device_bonus_gb;
  const purchased = subscription.traffic_purchased_gb;
  if (typeof base !== 'number' || typeof bonus !== 'number' || typeof purchased !== 'number') return null;
  if (![base, bonus, purchased, subscription.traffic_limit_gb].every(Number.isFinite) || base <= 0 || bonus < 0 || purchased < 0) return null;
  if (base + bonus + purchased !== subscription.traffic_limit_gb) return null;
  return { base, bonus, purchased, total: subscription.traffic_limit_gb };
}
export function parseTrafficTimestamp(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
