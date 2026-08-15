import React from 'react';
import { Activity, Globe } from 'lucide-react';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';

interface ServerNode {
  country: string;
  flag: string;
  city: string;
  ping: number;
  status: 'online' | 'optimal';
  protocol: string;
}

const DEFAULT_NODES: ServerNode[] = [
  {
    country: 'Швеция',
    flag: '🇸🇪',
    city: 'Стокгольм',
    ping: 14,
    status: 'optimal',
    protocol: 'VLESS TLS 1.3',
  },
  {
    country: 'Нидерланды',
    flag: '🇳🇱',
    city: 'Амстердам',
    ping: 18,
    status: 'optimal',
    protocol: 'Hysteria 2',
  },
  {
    country: 'Польша',
    flag: '🇵🇱',
    city: 'Варшава',
    ping: 22,
    status: 'online',
    protocol: 'VLESS + XHTTP',
  },
];

export const CyberServerNodesWidget: React.FC = () => {
  const { config } = useThemeEngine();
  const accent = config.accentColor || '#00ff66';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080d0a]/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/20">
      {/* Ambient Corner Glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: accent }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg border bg-black/50"
            style={{ borderColor: `${accent}40` }}
          >
            <Activity className="h-3.5 w-3.5" style={{ color: accent }} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Европейская матрица нод
            </h3>
            <span className="text-[10px] text-[#718076]">10 Gbps Выделенные каналы</span>
          </div>
        </div>

        <span
          className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ backgroundColor: accent }}
          />
          100% Онлайн
        </span>
      </div>

      {/* 3D Isometric Board Grid Simulation */}
      <div className="relative my-4 flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-[#050806]/90">
        {/* Isometric Circuit lines */}
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#00ff66_1px,transparent_1px),linear-gradient(to_bottom,#00ff66_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Pulsing Central Hub Node */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-[#0d1610] shadow-lg transition-transform hover:scale-105"
              style={{ borderColor: accent, boxShadow: `0 0 20px ${config.accentGlowColor}` }}
            >
              <Globe className="h-5 w-5" style={{ color: accent }} />
            </div>
            <span className="mt-1 font-mono text-[10px] text-emerald-400">EU-BACKBONE</span>
          </div>

          <div className="flex h-0.5 w-12 items-center bg-gradient-to-r from-emerald-500/80 to-transparent">
            <span
              className="h-1.5 w-1.5 animate-ping rounded-full"
              style={{ backgroundColor: accent }}
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-center">
            <div className="text-[11px] font-bold text-white">Direct Zero-Loss</div>
            <div className="text-[9px] text-[#718076]">Anti-DPI Bypass v3</div>
          </div>
        </div>
      </div>

      {/* Nodes List with real Pings */}
      <div className="space-y-2">
        {DEFAULT_NODES.map((node) => (
          <div
            key={node.city}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition-colors hover:bg-white/[0.05]"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">{node.flag}</span>
              <div>
                <div className="text-xs font-semibold text-white">{node.city}</div>
                <div className="text-[10px] text-[#718076]">{node.protocol}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-xs font-bold text-emerald-400">{node.ping} ms</div>
              <div className="text-[9px] text-[#8e9690]">мин. задержка</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
