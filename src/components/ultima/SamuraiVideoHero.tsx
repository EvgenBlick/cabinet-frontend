import { useEffect, useRef, useState } from 'react';

interface SamuraiVideoHeroProps {
  onTap?: () => void;
  className?: string;
}

export function SamuraiVideoHero({ onTap, className = '' }: SamuraiVideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay may be restricted until interaction or fallback to canvas
      });
    }
  }, []);

  return (
    <div
      onClick={onTap}
      className={`group relative flex h-64 w-64 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95 ${className}`}
    >
      {/* Outer Polished Bronze Metal Ring with Inner Dark Backing */}
      <div
        className="absolute inset-0 overflow-hidden rounded-full border-[2.5px] border-[#c8aa76] shadow-[0_0_32px_rgba(184,147,88,0.3),inset_0_0_24px_rgba(0,0,0,0.98)]"
        style={{
          background: '#040506',
        }}
      >
        {/* Seamless Video Loop */}
        {!videoFailed && (
          <video
            ref={videoRef}
            src="/samurai_breathing.mp4"
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoFailed(true)}
            className={`h-full w-full object-cover transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Fallback / Instant Graphic Layer */}
        {(!videoLoaded || videoFailed) && (
          <div className="relative flex h-full w-full items-center justify-center">
            {/* Subtle Soft Drifting Smoke */}
            <div
              className="samurai-soft-smoke-1 pointer-events-none absolute -inset-8 rounded-full opacity-15 mix-blend-screen blur-md"
              style={{
                backgroundImage: 'url(/mystic_smoke.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* 3D Samurai Mask */}
            <div className="relative z-10 flex h-52 w-52 translate-y-[2px] items-center justify-center">
              <img
                src="/samurai_head_isolated.png"
                alt="Samurai Emblem"
                className="samurai-breathe h-44 w-44 object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.95)] filter transition-transform duration-300 group-hover:scale-105"
              />
              {/* Mouth Steam */}
              <div className="pointer-events-none absolute bottom-12 left-1/2 flex -translate-x-1/2 items-center justify-center">
                <div className="samurai-steam-1 absolute h-2.5 w-2.5 rounded-full bg-gradient-to-t from-white/30 via-amber-100/10 to-transparent blur-[1.5px]" />
                <div className="samurai-steam-2 absolute h-2.5 w-2.5 rounded-full bg-gradient-to-t from-white/30 via-amber-100/10 to-transparent blur-[1.5px]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
