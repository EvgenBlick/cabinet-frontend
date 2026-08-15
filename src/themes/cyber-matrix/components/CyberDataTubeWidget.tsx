import React from 'react';
import { Cpu, KeyRound, Shield, Wifi } from 'lucide-react';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';

export const CyberDataTubeWidget: React.FC = () => {
  const { config } = useThemeEngine();
  const accent = config.accentColor || '#00ff66';

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#080d0a]/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg border bg-black/50"
            style={{ borderColor: `${accent}40` }}
          >
            <Cpu className="h-3.5 w-3.5" style={{ color: accent }} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Поток инкапсуляции
            </h3>
            <span className="text-[10px] text-[#718076]">Hysteria 2 / VLESS Engine</span>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-emerald-400">0.0 ms дроп</span>
      </div>

      {/* Kinetic Data Tube Graphic */}
      <div className="relative my-4 flex h-28 items-center justify-around overflow-hidden rounded-2xl border border-white/5 bg-[#050906]/90 px-4">
        {/* Glowing vertical particle streams */}
        <div className="absolute inset-y-0 left-1/4 w-0.5 animate-pulse bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent" />
        <div className="absolute inset-y-0 right-1/4 w-0.5 animate-pulse bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent delay-300" />

        {/* Floating Icons */}
        <div className="flex animate-bounce flex-col items-center gap-1">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl border bg-black/80 shadow-lg"
            style={{ borderColor: `${accent}60` }}
          >
            <KeyRound className="h-4 w-4" style={{ color: accent }} />
          </div>
          <span className="font-mono text-[9px] text-[#8e9690]">KeyGen</span>
        </div>

        <div className="h-10 w-px bg-white/10" />

        <div className="flex animate-bounce flex-col items-center gap-1 delay-150">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-black/90 shadow-xl"
            style={{ borderColor: accent, boxShadow: `0 0 15px ${config.accentGlowColor}` }}
          >
            <Shield className="h-5 w-5" style={{ color: accent }} />
          </div>
          <span className="font-mono text-[9px] text-emerald-400">Tunnel</span>
        </div>

        <div className="h-10 w-px bg-white/10" />

        <div className="flex animate-bounce flex-col items-center gap-1 delay-300">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl border bg-black/80 shadow-lg"
            style={{ borderColor: `${accent}60` }}
          >
            <Wifi className="h-4 w-4" style={{ color: accent }} />
          </div>
          <span className="font-mono text-[9px] text-[#8e9690]">Route</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-[#8e9690]">
        <span>
          Прямой туннель: <strong className="text-white">Швеция • 10 Gbps</strong>
        </span>
        <span className="font-semibold text-emerald-400">Безлимитный канал</span>
      </div>
    </div>
  );
};
