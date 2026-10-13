import { useReducedAnimation } from '@/hooks/useReducedAnimation';
import { useEffect, useRef, type CSSProperties } from 'react';
import { usePlatform } from '@/platform';
import '@/styles/glass-celebration.css';

/** Decoration after the user confirms VPN works; it never infers connectivity. */
export function GlassCelebration() {
  const { platform, haptic } = usePlatform();
  const played = useRef(false);
  const { reduced } = useReducedAnimation();
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    if (reduced) return;
    if (platform !== 'telegram') {
      try { navigator.vibrate?.([45, 70, 25, 40, 25, 40, 90]); } catch { /* Optional hardware feedback. */ }
      return;
    }
    haptic.impact('medium');
    const timers = [115, 180].map(delay => window.setTimeout(() => haptic.selection(), delay));
    timers.push(window.setTimeout(() => haptic.notification('success'), 260));
    return () => timers.forEach(window.clearTimeout);
  }, [platform, haptic, reduced]);
  if (reduced) return null;
  return <div className="glass-celebration" aria-hidden="true" data-testid="glass-celebration">
    {Array.from({ length: 32 }, (_, index) => {
      const angle = (index / 32) * Math.PI * 2;
      const distance = 130 + (index % 5) * 32;
      return <span key={index} className="glass-celebration-shard" style={{
        '--shard-x': `${Math.cos(angle) * distance}px`,
        '--shard-y': `${Math.sin(angle) * distance}px`,
        '--shard-rotation': `${index * 47}deg`,
        '--shard-delay': `${(index % 4) * 25}ms`,
      } as CSSProperties} />;
    })}
  </div>;
}
