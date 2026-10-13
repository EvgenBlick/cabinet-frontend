import { useReducedAnimation } from '@/hooks/useReducedAnimation';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';

const positions = new Map<string, { left: number; containerWidth: number }>();

/** A single pill, measured in pixels; hidden page-owned navs never participate. */
export function CabinetNavigationDrop({ container, activeKey, kind }: {
  container: RefObject<HTMLElement | null>;
  activeKey: string;
  kind: 'bottom' | 'desktop';
}) {
  const { reduced } = useReducedAnimation();
  const x = useMotionValue(0);
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const [geometry, setGeometry] = useState<{ width: number; height: number; top: number } | null>(null);
  const initialized = useRef(false);
  useEffect(() => {
    const nav = container.current;
    if (!nav) return;
    let stop: (() => void) | undefined;
    const measure = () => {
      const button = nav.querySelector<HTMLElement>('.cabinet-navigation-tab[data-active="true"]');
      if (!button) { setGeometry(null); return; }
      if (!nav.getBoundingClientRect().width || !button.getBoundingClientRect().width) return;
      const left = button.offsetLeft;
      const saved = positions.get(kind);
      if (!initialized.current) x.set(!reduced && saved && Math.abs(saved.containerWidth - nav.clientWidth) < 2 ? saved.left : left);
      setGeometry({ width: button.offsetWidth, height: button.offsetHeight, top: button.offsetTop });
      initialized.current = true;
      positions.set(kind, { left, containerWidth: nav.clientWidth });
      stop?.();
      if (reduced) { x.set(left); scaleX.set(1); scaleY.set(1); }
      else {
        const animations = [animate(x, left, { type: 'spring', stiffness: 380, damping: 31, mass: .7 }),
          animate(scaleX, [1, 1.07, 1], { duration: .34, ease: 'easeOut' }), animate(scaleY, [1, .95, 1], { duration: .34, ease: 'easeOut' })];
        stop = () => animations.forEach((animation) => animation.stop());
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => { observer.disconnect(); stop?.(); };
  }, [container, activeKey, kind, reduced, x, scaleX, scaleY]);
  if (!geometry) return null;
  return <motion.span aria-hidden="true" className="cabinet-liquid-tab-pill cabinet-navigation-drop" style={{ x, scaleX, scaleY, ...geometry }} />;
}
