import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  Download,
  Laptop,
  Plus,
  QrCode,
  Server,
  ShieldCheck,
  Smartphone,
  Upload,
  Zap,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Subscription } from '@/types';
import { useBranding } from '@/hooks/useBranding';
import { useFreshTheme } from '@/hooks/useFreshTheme';
import { FreshDesktopNavbar } from './FreshDesktopNavbar';
import { DynamicThemeBackground } from '@/themes/core/DynamicThemeBackground';
import { cn } from '@/lib/utils';

export interface FreshDesktopDashboardProps {
  subscription: Subscription | null;
  connectedDevicesCount: number;
  daysLeft: number | null;
  onBuySubscription: () => void;
  onOpenConnection: () => void;
  onOpenSupport: () => void;
}

interface ServerNode {
  id: string;
  country: string;
  flag: string;
  city: string;
  protocol: string;
  ping: number;
  load: number;
}

const SERVER_NODES: ServerNode[] = [
  {
    id: 'se-01',
    country: 'Швеция',
    flag: '🇸🇪',
    city: 'Стокгольм',
    protocol: 'VLESS Reality (Vision)',
    ping: 14,
    load: 18,
  },
  {
    id: 'nl-02',
    country: 'Нидерланды',
    flag: '🇳🇱',
    city: 'Амстердам',
    protocol: 'Hysteria 2 (UDP)',
    ping: 19,
    load: 29,
  },
  {
    id: 'de-01',
    country: 'Германия',
    flag: '🇩🇪',
    city: 'Франкфурт',
    protocol: 'VLESS XTLS-Reality',
    ping: 23,
    load: 22,
  },
  {
    id: 'pl-01',
    country: 'Польша',
    flag: '🇵🇱',
    city: 'Варшава',
    protocol: 'Shadowsocks-2022',
    ping: 21,
    load: 15,
  },
  {
    id: 'fi-01',
    country: 'Финляндия',
    flag: '🇫🇮',
    city: 'Хельсинки',
    protocol: 'Trojan-gRPC',
    ping: 16,
    load: 12,
  },
];

export function FreshDesktopDashboard({
  subscription,
  connectedDevicesCount: _connectedDevicesCount,
  daysLeft: initialDaysLeft,
  onBuySubscription,
  onOpenConnection: _onOpenConnection,
  onOpenSupport,
}: FreshDesktopDashboardProps) {
  const navigate = useNavigate();
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string>('se-01');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('VLESS Reality');
  const [vpnActive, setVpnActive] = useState<boolean>(true);

  const { appName } = useBranding();
  const { config } = useFreshTheme();

  const daysLeft = initialDaysLeft ?? subscription?.days_left ?? 30;
  const trafficUsedGb = subscription?.traffic_used_gb ?? 14.8;
  const trafficLimitGb = subscription?.traffic_limit_gb || 100;
  const trafficPercent = Math.min(100, Math.round((trafficUsedGb / trafficLimitGb) * 100));

  const subAny = subscription as any;
  const subscriptionUrl =
    subAny?.subscription_url ||
    subAny?.url ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/api/sub/${subAny?.id || 'demo'}`
      : 'https://samuraiservice.org/sub/connect');

  const handleCopyLink = () => {
    if (subscriptionUrl) {
      navigator.clipboard.writeText(subscriptionUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handle1ClickHapp = () => {
    if (subscriptionUrl) {
      const cryptedUrl = `happ://add/crypt3#${btoa(subscriptionUrl)}`;
      window.location.href = cryptedUrl;
    }
  };

  const accentLime = config.accentColor || '#d7ff3b';
  const brandDisplay = appName || 'VERDANT';
  const activeNode = SERVER_NODES.find((n) => n.id === selectedNode) || SERVER_NODES[0];

  return (
    <div className="relative min-h-screen font-sans text-[#f5f5f7] selection:bg-[#d7ff3b]/30 selection:text-white">
      {/* Dynamic Background with Live Blur & Dimming */}
      <DynamicThemeBackground />

      {/* 1. Floating Island Navbar */}
      <FreshDesktopNavbar onBuySubscription={onBuySubscription} onOpenSupport={onOpenSupport} />

      {/* 2. Main Hero Cockpit */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6">
        {/* Top Release Pill Badge */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="fresh-release-badge group mb-6 inline-flex items-center gap-2.5 rounded-full p-1 pr-4 text-xs transition-all hover:border-white/20"
          >
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-black"
              style={{ backgroundColor: accentLime }}
            >
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-black" />
              <span>10 Gbps</span>
            </span>
            <span className="text-[13px] font-medium text-[#c8d0ca]">
              {config.releaseBadgeText || `${brandDisplay} • Высокоскоростной европейский туннель`}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-[#8a948c] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Section 1: Main Command Cockpit + European Node Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column (7 cols): Interactive Power Card */}
          <div className="fresh-bento-card relative flex flex-col justify-between p-7 shadow-2xl backdrop-blur-2xl lg:col-span-7">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-3 w-3 rounded-full shadow-lg"
                    style={{
                      backgroundColor: vpnActive ? accentLime : '#6b7280',
                      boxShadow: vpnActive ? `0 0 12px ${accentLime}` : 'none',
                    }}
                  />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#8e9690]">
                    СТАТУС ПОДКЛЮЧЕНИЯ
                  </span>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] font-bold text-[#c2cbc4]">
                  Осталось: <span style={{ color: accentLime }}>{daysLeft} дн.</span>
                </span>
              </div>

              {/* Glowing Interactive Power Medallion */}
              <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-black/40 p-6 text-center shadow-inner">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full blur-2xl transition-all"
                    style={{
                      background: vpnActive
                        ? `radial-gradient(circle, ${config.accentGlowColor || 'rgba(215, 255, 59, 0.6)'} 0%, transparent 70%)`
                        : 'transparent',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setVpnActive(!vpnActive)}
                    className="group relative z-10 flex h-24 w-24 items-center justify-center rounded-full transition-transform hover:scale-105"
                    style={{
                      background: vpnActive
                        ? `radial-gradient(circle, ${accentLime}30 0%, rgba(13,22,16,0.9) 70%)`
                        : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${vpnActive ? accentLime : 'rgba(255,255,255,0.1)'}`,
                      boxShadow: vpnActive
                        ? `0 0 35px ${config.accentGlowColor || 'rgba(215, 255, 59, 0.45)'}`
                        : 'none',
                    }}
                  >
                    <ShieldCheck
                      className="h-10 w-10 transition-transform group-hover:scale-110"
                      style={{ color: vpnActive ? accentLime : '#6b7280' }}
                    />
                  </button>
                </div>

                <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {vpnActive ? 'Безопасный доступ активен' : 'VPN Отключен'}
                </h2>
                <p className="mt-1.5 text-xs text-[#8e9690]">
                  {vpnActive
                    ? `Маршрутизация через ${activeNode.flag} ${activeNode.city} (${selectedProtocol})`
                    : 'Нажмите кнопку для мгновенного подключения'}
                </p>

                {/* Protocol Chips Selector */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {['VLESS Reality', 'Hysteria 2', 'Shadowsocks', 'Trojan'].map((proto) => (
                    <button
                      key={proto}
                      type="button"
                      onClick={() => setSelectedProtocol(proto)}
                      className={cn(
                        'rounded-xl border px-3 py-1.5 text-xs font-bold transition-all',
                        selectedProtocol === proto
                          ? 'border-[#d7ff3b] bg-[#d7ff3b]/15 text-[#d7ff3b] shadow-md'
                          : 'border-white/10 bg-white/[0.03] text-[#8e9690] hover:text-white',
                      )}
                    >
                      {proto}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <button
                type="button"
                onClick={handle1ClickHapp}
                className="fresh-glow-btn flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-black"
              >
                <Zap className="h-4 w-4" />
                <span>Импорт в Happ</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 text-xs font-bold text-white transition-all hover:bg-white/10"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-[#8e9690]" />
                    <span>Скопировать ключ</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 text-xs font-bold text-white transition-all hover:bg-white/10"
              >
                <QrCode className="h-4 w-4 text-[#8e9690]" />
                <span>QR-код</span>
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): European Node Matrix */}
          <div className="fresh-bento-card flex flex-col justify-between p-7 shadow-2xl backdrop-blur-2xl lg:col-span-5">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" style={{ color: accentLime }} />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                    Европейские Узлы (5 Нод)
                  </h3>
                </div>
                <span
                  className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold"
                  style={{
                    borderColor: `${accentLime}40`,
                    backgroundColor: `${accentLime}10`,
                    color: accentLime,
                  }}
                >
                  10 Gbps Порты
                </span>
              </div>

              {/* Server Node List */}
              <div className="mt-4 space-y-2.5">
                {SERVER_NODES.map((node) => {
                  const isSelected = node.id === selectedNode;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedNode(node.id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition-all',
                        isSelected
                          ? 'border-[#d7ff3b]/60 bg-[#0d1810] shadow-lg'
                          : 'border-white/[0.06] bg-black/30 hover:border-white/20 hover:bg-white/[0.03]',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{node.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{node.city}</span>
                            <span className="text-[11px] text-[#7a857c]">{node.country}</span>
                          </div>
                          <span className="font-mono text-[10px] text-[#8a948c]">
                            {node.protocol}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className="flex items-center justify-end gap-1 font-mono text-xs font-bold"
                          style={{ color: accentLime }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: accentLime }}
                          />
                          <span>{node.ping} ms</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full"
                              style={{ width: `${node.load}%`, backgroundColor: accentLime }}
                            />
                          </div>
                          <span className="text-[10px] text-[#7a857c]">{node.load}%</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-3 text-[11px] text-[#8e9690]">
              <span>Текущий узел: 🇸🇪 Стокгольм</span>
              <span className="font-bold" style={{ color: accentLime }}>
                Прямой туннель • 0% потерь
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: 3 Dense Glass Bento Cards */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Traffic & Bandwidth Telemetry */}
          <div className="fresh-bento-card flex flex-col justify-between p-6 shadow-xl backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  Трафик и Скорость
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold text-[#d7ff3b]">
                  Безлимит 10G
                </span>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white">{trafficUsedGb} ГБ</span>
                  <span className="text-xs text-[#8e9690]">из {trafficLimitGb} ГБ</span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${trafficPercent}%`,
                      backgroundColor: accentLime,
                      boxShadow: `0 0 10px ${accentLime}`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#8e9690]">
                    <Download className="h-3.5 w-3.5 text-[#d7ff3b]" />
                    <span>Скачивание</span>
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">880 Мбит/с</div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#8e9690]">
                    <Upload className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Отдача</span>
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">450 Мбит/с</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onBuySubscription}
              className="mt-6 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs font-semibold text-white transition-all hover:bg-white/10"
            >
              <span>Продлить тариф</span>
              <ArrowUpRight className="h-4 w-4 text-[#d7ff3b]" />
            </button>
          </div>

          {/* Card 2: Connected Devices Hub */}
          <div className="fresh-bento-card flex flex-col justify-between p-6 shadow-xl backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  Устройства (2 из 5)
                </span>
                <span className="rounded-full bg-[#d7ff3b]/10 px-2 py-0.5 text-[10px] font-bold text-[#d7ff3b]">
                  3 свободных слота
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">iPhone 16 Pro</div>
                      <div className="text-[10px] text-[#8e9690]">iOS 18 • Стокгольм</div>
                    </div>
                  </div>
                  <span
                    className="flex h-2 w-2 animate-pulse rounded-full"
                    style={{ backgroundColor: accentLime }}
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white">
                      <Laptop className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">MacBook Pro 16</div>
                      <div className="text-[10px] text-[#8e9690]">macOS Sequoia • Амстердам</div>
                    </div>
                  </div>
                  <span
                    className="flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: accentLime }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/connection')}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#d7ff3b]/40 bg-[#d7ff3b]/5 py-3 text-xs font-bold text-[#d7ff3b] transition-all hover:bg-[#d7ff3b]/15"
            >
              <Plus className="h-4 w-4" />
              <span>Подключить новое устройство</span>
            </button>
          </div>

          {/* Card 3: Smart Split-Tunneling & Anti-DPI */}
          <div className="fresh-bento-card flex flex-col justify-between p-6 shadow-xl backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  Умная Маршрутизация
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-[#d7ff3b]">
                  Anti-DPI v3
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🇷🇺</span>
                    <div>
                      <div className="text-xs font-bold text-white">Госуслуги, Банки, Яндекс</div>
                      <div className="text-[10px] text-[#8e9690]">Напрямую без VPN</div>
                    </div>
                  </div>
                  <span className="rounded-md bg-[#d7ff3b]/20 px-2 py-0.5 text-[10px] font-bold text-[#d7ff3b]">
                    Direct
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🎬</span>
                    <div>
                      <div className="text-xs font-bold text-white">YouTube 4K & Instagram</div>
                      <div className="text-[10px] text-[#8e9690]">Без замедлений и буферизации</div>
                    </div>
                  </div>
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    EU-Tunnel
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🤖</span>
                    <div>
                      <div className="text-xs font-bold text-white">OpenAI, Claude, Midjourney</div>
                      <div className="text-[10px] text-[#8e9690]">Без Cloudflare капчи</div>
                    </div>
                  </div>
                  <span className="rounded-md bg-[#d7ff3b]/20 px-2 py-0.5 text-[10px] font-bold text-[#d7ff3b]">
                    Clean IP
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-[11px] text-[#8e9690]">
              <span>Режим работы: Умный Сплит</span>
              <span className="text-white">Автоматически</span>
            </div>
          </div>
        </div>

        {/* 4. Footer Protocol Badges Bar */}
        <div className="mt-16 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#636d65]">
            ПОДДЕРЖИВАЕМЫЕ ПРОТОКОЛЫ И КЛИЕНТЫ
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-6 text-xs font-bold tracking-wider text-[#7a857c] sm:gap-12">
            <div className="flex items-center gap-2 transition-colors hover:text-white">
              <span className="text-[#d7ff3b]">⚡</span>
              <span>VLESS REALITY</span>
            </div>
            <div className="flex items-center gap-2 transition-colors hover:text-white">
              <span className="text-[#d7ff3b]">⚡</span>
              <span>HYSTERIA 2</span>
            </div>
            <div className="flex items-center gap-2 transition-colors hover:text-white">
              <span className="text-[#d7ff3b]">⚡</span>
              <span>HAPP CLIENT</span>
            </div>
            <div className="flex items-center gap-2 transition-colors hover:text-white">
              <span className="text-[#d7ff3b]">⚡</span>
              <span>INCY APP</span>
            </div>
            <div className="flex items-center gap-2 transition-colors hover:text-white">
              <span className="text-[#d7ff3b]">⚡</span>
              <span>SMART TV</span>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Quick Connect & QR Code Modal on Click */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-2xl">
          <div className="fresh-glass-pill relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: accentLime }}
              >
                Подключение устройства
              </span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-xs text-[#8e9690] hover:text-[#f5f5f7]"
              >
                ✕
              </button>
            </div>

            {/* QR Viewport */}
            <div className="mx-auto my-3 flex h-52 w-52 items-center justify-center rounded-2xl border border-white/10 bg-white p-3 shadow-inner">
              <QRCodeSVG value={subscriptionUrl} size={185} level="M" includeMargin={false} />
            </div>

            <p className="mt-3 text-xs text-[#8e9690]">
              Отсканируйте камерой в приложении Happ, v2rayNG или Streisand.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handle1ClickHapp}
                className="fresh-glow-btn flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold text-black"
              >
                <span>Открыть в Happ</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="fresh-secondary-btn flex items-center justify-center gap-2 rounded-full py-2 text-xs font-medium"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Ссылка скопирована!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" style={{ color: accentLime }} />
                    <span>Скопировать ключ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
