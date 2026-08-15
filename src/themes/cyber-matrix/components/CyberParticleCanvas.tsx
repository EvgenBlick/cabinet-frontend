import React, { useEffect, useRef } from 'react';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  alpha: number;
  targetAlpha: number;
  glow: number;
  orbitAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
}

export const CyberParticleCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { config } = useThemeEngine();
  const mouseRef = useRef<{ x: number; y: number; isHovering: boolean }>({
    x: -1000,
    y: -1000,
    isHovering: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Initialize particles
    const particleCount = config.enableParticles ? Math.min(config.particleCount || 100, 140) : 0;
    const particles: Particle[] = [];
    const colorHex = config.accentColor || '#00ff66';

    const centerX = width * 0.5;
    const centerY = height * 0.45;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 40 + Math.random() * (Math.min(width, height) * 0.38);
      particles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * (radius * 0.65),
        vx: (Math.random() - 0.5) * 0.8 * config.particleSpeed,
        vy: (Math.random() - 0.5) * 0.8 * config.particleSpeed,
        size: Math.random() * 2.2 + 0.8,
        baseSize: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.7 + 0.2,
        targetAlpha: Math.random() * 0.8 + 0.2,
        glow: Math.random() * 12 + 6,
        orbitAngle: angle,
        orbitRadius: radius,
        orbitSpeed:
          (0.003 + Math.random() * 0.006) * config.particleSpeed * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isMouseIn = mouseRef.current.isHovering;

      // Draw faint cyber connection threads between close particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 7000) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / 84) * 0.18;
            ctx.strokeStyle = `rgba(0, 255, 102, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update & Draw individual glowing particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 3D Orbital swirl math
        p.orbitAngle += p.orbitSpeed;
        const targetX = centerX + Math.cos(p.orbitAngle) * p.orbitRadius;
        const targetY =
          centerY + Math.sin(p.orbitAngle) * (p.orbitRadius * 0.65) + Math.sin(time + i) * 15;

        // Smooth easing towards orbit position
        p.x += (targetX - p.x) * 0.04 + p.vx;
        p.y += (targetY - p.y) * 0.04 + p.vy;

        // Interactive mouse repel / attract
        if (isMouseIn) {
          const mdx = p.x - mx;
          const mdy = p.y - my;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 160) {
            const force = (1 - mdist / 160) * 4;
            p.x += (mdx / mdist) * force;
            p.y += (mdy / mdist) * force;
            p.alpha = Math.min(1, p.alpha + 0.05);
          }
        }

        // Draw particle glow
        ctx.save();
        ctx.shadowBlur = p.glow;
        ctx.shadowColor = colorHex;
        ctx.fillStyle = colorHex;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [config]);

  if (!config.enableParticles) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 h-full w-full opacity-85 ${className}`}
    />
  );
};
