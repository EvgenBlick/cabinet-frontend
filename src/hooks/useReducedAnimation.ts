import { useSyncExternalStore } from 'react';
import { getEffectiveReducedAnimation, getReducedAnimationPreference, getSystemReducedAnimation, setReducedAnimationPreference, subscribeReducedAnimation } from '@/features/preferences/reducedAnimation';
export function useReducedAnimation() {
  const reduced = useSyncExternalStore(subscribeReducedAnimation, getEffectiveReducedAnimation, () => false);
  const enabled = useSyncExternalStore(subscribeReducedAnimation, getReducedAnimationPreference, () => false);
  const systemReduced = useSyncExternalStore(subscribeReducedAnimation, getSystemReducedAnimation, () => false);
  return { reduced, enabled, systemReduced, setEnabled: setReducedAnimationPreference };
}
