import React from 'react';
import { useThemeEngine } from './ThemeEngineContext';

export const DynamicThemeBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { config, activeTheme } = useThemeEngine();

  const bgUrl = config.customBgUrl;
  const overlayOpacity = config.bgOverlayOpacity ?? 0.75;
  const blurMap: Record<string, string> = {
    none: '0px',
    sm: '6px',
    md: '16px',
    lg: '28px',
    xl: '48px',
  };
  const blurPx = blurMap[config.bgBlur] || '16px';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden bg-[#040705] transition-colors duration-500 ${className}`}
    >
      {/* 1. Wallpaper Image Layer with Blur */}
      {bgUrl && (
        <div
          className="absolute inset-[-20px] bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out"
          style={{
            backgroundImage: `url("${bgUrl}")`,
            filter: `blur(${blurPx}) brightness(0.85)`,
            transform: 'scale(1.04)', // prevents blur edge bleed
          }}
        />
      )}

      {/* 2. Dynamic Dark/Glass Overlay Layer */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundColor:
            activeTheme === 'fresh'
              ? '#060907'
              : activeTheme === 'samurai_gold'
                ? '#0a0907'
                : '#040705',
          opacity: overlayOpacity,
        }}
      />

      {/* 3. Radial Accent Glow (Top Center) */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${config.accentGlowColor || 'rgba(0, 255, 102, 0.15)'} 0%, transparent 65%)`,
          opacity: 0.65,
        }}
      />

      {/* 4. Cyber Matrix Subtle Mesh Grid */}
      {config.enableMeshGrid && (
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(to right, ${config.accentColor || '#00ff66'} 1px, transparent 1px), linear-gradient(to bottom, ${config.accentColor || '#00ff66'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      )}
    </div>
  );
};
