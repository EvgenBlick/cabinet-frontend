import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';

export const CyberSecurityHelixWidget: React.FC = () => {
  const { config } = useThemeEngine();
  const accent = config.accentColor || '#00ff66';

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#080d0a]/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/20">
      {/* Ambient Glow */}
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full opacity-25 blur-3xl"
        style={{ backgroundColor: accent }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg border bg-black/50"
            style={{ borderColor: `${accent}40` }}
          >
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: accent }} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Крипто-защита трафика
            </h3>
            <span className="text-[10px] text-[#718076]">TLS 1.3 + ChaCha20 Poly1305</span>
          </div>
        </div>

        <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[9px] text-white/80">
          ZERO-LOGS
        </span>
      </div>

      {/* 3D Revolving Gyroscope / Helix Centerpiece */}
      <div className="relative my-6 flex h-36 items-center justify-center">
        {/* Outer Ring */}
        <div
          className="absolute h-28 w-28 animate-[spin_12s_linear_infinite] rounded-full border-2 border-dashed opacity-40"
          style={{ borderColor: accent }}
        />
        {/* Middle Ring */}
        <div
          className="absolute h-20 w-20 animate-[spin_8s_linear_infinite_reverse] rounded-full border border-white/20"
          style={{ borderTopColor: accent, borderBottomColor: accent }}
        />
        {/* Inner Glowing Core */}
        <div
          className="relative flex h-14 w-14 items-center justify-center rounded-full border bg-[#0a120d] shadow-2xl transition-transform hover:scale-110"
          style={{
            borderColor: accent,
            boxShadow: `0 0 25px ${config.accentGlowColor}`,
          }}
        >
          <Lock className="h-6 w-6" style={{ color: accent }} />
        </div>

        {/* Orbiting Satellite Data Dots */}
        <div className="absolute h-32 w-32 animate-[spin_6s_linear_infinite]">
          <span
            className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full shadow-lg"
            style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
          />
        </div>
      </div>

      {/* Bottom Status Metrics */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/5 bg-black/40 p-3 text-center">
        <div>
          <div className="text-[10px] text-[#718076]">Шифрование</div>
          <div className="font-mono text-xs font-bold text-white">256-bit AES/GCM</div>
        </div>
        <div className="border-l border-white/5">
          <div className="text-[10px] text-[#718076]">Обход ТСПУ</div>
          <div className="text-xs font-bold text-emerald-400">Активен (100%)</div>
        </div>
      </div>
    </div>
  );
};
