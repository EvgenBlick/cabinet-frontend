import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useBrandLogoImage } from '@/hooks/useBrandLogoImage';
import { cn } from '@/lib/utils';

type BrandMarkVariant = 'hero' | 'card' | 'compact';

interface UltimaAuthBrandMarkProps {
  appName: string;
  logoUrl: string | null;
  showBrandLogo: boolean;
  variant?: BrandMarkVariant;
  className?: string;
  animated?: boolean;
}

export function UltimaAuthBrandMark({
  appName,
  logoUrl,
  showBrandLogo,
  variant = 'hero',
  className,
  animated = true,
}: UltimaAuthBrandMarkProps) {
  const logoRef = useRef<HTMLImageElement>(null);
  const {
    isLoaded: logoLoaded,
    hasError: logoFailed,
    handleLoad: markLogoLoaded,
    handleError: handleLogoError,
  } = useBrandLogoImage(showBrandLogo ? logoUrl : null);

  const shouldRenderImage = Boolean(showBrandLogo && logoUrl && !logoFailed);
  const sizeClasses =
    variant === 'hero'
      ? 'h-28 w-28 sm:h-32 sm:w-32 rounded-[28px]'
      : variant === 'card'
        ? 'h-20 w-20 rounded-2xl'
        : 'h-14 w-14 rounded-xl';

  return (
    <div className={cn('group relative mx-auto flex items-center justify-center select-none', className)}>
      {/* 1. Breathing Ambient Gold & Violet Halo */}
      {animated ? (
        <motion.div
          animate={{
            scale: [1, 1.14, 1],
            opacity: [0.3, 0.65, 0.3],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="pointer-events-none absolute -inset-3 rounded-[36px] bg-gradient-to-tr from-[#d4b37f]/30 via-[#a855f7]/25 to-[#d4b37f]/30 blur-2xl"
        />
      ) : (
        <div className="pointer-events-none absolute -inset-2 rounded-[34px] bg-[#d4b37f]/20 blur-xl" />
      )}

      {/* 2. Floating Animated Medallion Container */}
      <motion.div
        animate={
          animated
            ? {
                y: [-3, 3, -3],
                rotate: [-0.5, 0.5, -0.5],
              }
            : undefined
        }
        transition={
          animated
            ? {
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : undefined
        }
        whileHover={{ scale: 1.05, rotate: 0 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          'relative flex items-center justify-center overflow-hidden border border-[#d4b37f]/45 bg-gradient-to-b from-[#1e222a] via-[#111318] to-[#07080a] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_35px_rgba(212,179,127,0.25)] backdrop-blur-2xl cursor-pointer',
          sizeClasses,
        )}
      >
        {/* Top Glare Bevel */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent z-10" />

        {/* 3. Traveling Border Light Beam */}
        {animated && (
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="pointer-events-none absolute -inset-[150%] opacity-40"
            style={{
              background:
                'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 70deg, #d4b37f 100deg, transparent 130deg, transparent 250deg, #c084fc 280deg, transparent 310deg)',
            }}
          />
        )}

        {/* Inner Obsidian Shield Background to mask the conic beam */}
        <div className="absolute inset-[1px] rounded-[inherit] bg-gradient-to-b from-[#1c2028] via-[#101217] to-[#08090c] z-0" />

        {/* 4. Diagonal Glass Shimmer Sheen */}
        {animated && (
          <motion.div
            animate={{
              x: ['-140%', '260%'],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              repeatDelay: 2.5,
              ease: 'easeInOut',
            }}
            className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent z-10"
          />
        )}

        {/* 5. Brand Logo Image */}
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          {shouldRenderImage ? (
            <img
              ref={logoRef}
              src={logoUrl ?? undefined}
              alt={appName || 'Samurai Service'}
              className={cn(
                'h-full w-full rounded-[20px] object-contain transition-opacity duration-300',
                logoLoaded ? 'opacity-100' : 'opacity-0',
              )}
              onLoad={markLogoLoaded}
              onError={handleLogoError}
            />
          ) : (
            <img
              src="/samurai_original_medallion.png"
              alt={appName || 'Samurai Service'}
              className="h-full w-full rounded-[20px] object-contain p-1"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
