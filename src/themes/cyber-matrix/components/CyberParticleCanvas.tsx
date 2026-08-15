import React, { useEffect, useRef } from 'react';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';

// Offscreen sprite cache to eliminate ctx.shadowBlur rasterization in RAF
const createGlowSprite = (color: string, radius: number): HTMLCanvasElement => {
  const sprite = document.createElement('canvas');
  const size = radius * 4;
  sprite.width = size;
  sprite.height = size;
  const sCtx = sprite.getContext('2d');
  if (!sCtx) return sprite;

  const gradient = sCtx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, radius * 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.4, color);
  gradient.addColorStop(1, 'transparent');

  sCtx.fillStyle = gradient;
  sCtx.beginPath();
  sCtx.arc(size / 2, size / 2, radius * 2, 0, Math.PI * 2);
  sCtx.fill();
  return sprite;
};

export const CyberParticleCanvas: React.FC<{ className?: string }> = React.memo(
  ({ className = '' }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { config } = useThemeEngine();
    const mouseRef = useRef<{ x: number; y: number; isHovering: boolean }>({
      x: -1000,
      y: -1000,
      isHovering: false,
    });

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !config.enableParticles) return;

      const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
      if (!ctx) return;

      let animationFrameId: number;
      let lastTime = performance.now();
      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);

      let width = window.innerWidth;
      let height = window.innerHeight;
      let centerX = width * 0.5;
      let centerY = height * 0.45;

      const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        centerX = width * 0.5;
        centerY = height * 0.45;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      handleResize();

      const particleCount = Math.min(config.particleCount || 80, 100);
      const colorHex = config.accentColor || '#00ff66';
      const glowSprite = createGlowSprite(colorHex, 8);

      const particles = Array.from({ length: particleCount }, () => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 40 + Math.random() * (Math.min(width, height) * 0.38);
        return {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * (radius * 0.65),
          vx: (Math.random() - 0.5) * 0.8 * config.particleSpeed,
          vy: (Math.random() - 0.5) * 0.8 * config.particleSpeed,
          size: Math.random() * 2.2 + 0.8,
          alpha: Math.random() * 0.7 + 0.2,
          orbitAngle: angle,
          orbitRadius: radius,
          orbitSpeed:
            (0.003 + Math.random() * 0.006) * config.particleSpeed * (Math.random() > 0.5 ? 1 : -1),
        };
      });

      const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
        mouseRef.current.isHovering = true;
      };

      const handleMouseLeave = () => {
        mouseRef.current.isHovering = false;
        mouseRef.current.x = -1000;
        mouseRef.current.y = -1000;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          mouseRef.current.x = e.touches[0].clientX;
          mouseRef.current.y = e.touches[0].clientY;
          mouseRef.current.isHovering = true;
        }
      };

      const handleTouchEnd = () => {
        mouseRef.current.isHovering = false;
        mouseRef.current.x = -1000;
        mouseRef.current.y = -1000;
      };

      let isVisible = !document.hidden;
      const handleVisibility = () => {
        isVisible = !document.hidden;
      };

      document.addEventListener('visibilitychange', handleVisibility);
      window.addEventListener('resize', handleResize);
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd);

      const render = (now: number) => {
        animationFrameId = requestAnimationFrame(render);
        if (!isVisible) return;

        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        ctx.clearRect(0, 0, width, height);

        // 1. Single-pass batched lines for connected particles
        ctx.beginPath();
        ctx.strokeStyle = `${colorHex}18`;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            if (dx * dx + dy * dy < 4900) {
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
            }
          }
        }
        ctx.stroke();

        // 2. High-speed sprite particle rendering
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.orbitAngle += p.orbitSpeed * (dt * 60);
          const targetX = centerX + Math.cos(p.orbitAngle) * p.orbitRadius;
          const targetY = centerY + Math.sin(p.orbitAngle) * (p.orbitRadius * 0.65);

          p.x += (targetX - p.x) * 0.04 + p.vx;
          p.y += (targetY - p.y) * 0.04 + p.vy;

          if (mouseRef.current.isHovering) {
            const mdx = p.x - mouseRef.current.x;
            const mdy = p.y - mouseRef.current.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < 120) {
              const force = (1 - mDist / 120) * 4;
              p.x += (mdx / (mDist || 1)) * force;
              p.y += (mdy / (mDist || 1)) * force;
            }
          }

          ctx.globalAlpha = p.alpha;
          const spriteSize = p.size * 6;
          ctx.drawImage(
            glowSprite,
            p.x - spriteSize / 2,
            p.y - spriteSize / 2,
            spriteSize,
            spriteSize,
          );
        }
        ctx.globalAlpha = 1;
      };

      animationFrameId = requestAnimationFrame(render);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('visibilitychange', handleVisibility);
        cancelAnimationFrame(animationFrameId);
      };
    }, [config.enableParticles, config.particleCount, config.particleSpeed, config.accentColor]);

    if (!config.enableParticles) return null;

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 h-full w-full ${className}`}
      />
    );
  },
);
