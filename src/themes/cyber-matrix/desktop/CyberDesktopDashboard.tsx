import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  CreditCard,
  Download,
  Laptop,
  Plus,
  QrCode,
  Server,
  Settings,
  ShieldCheck,
  Smartphone,
  Upload,
  Zap,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { subscriptionApi } from '@/api/subscription';
import { useAuthStore } from '@/store/auth';
import { useThemeEngine } from '@/themes/core/ThemeEngineContext';
import { CyberParticleCanvas } from '../components/CyberParticleCanvas';
import { CyberFloatingDock } from '../components/CyberFloatingDock';
import { DynamicThemeBackground } from '@/themes/core/DynamicThemeBackground';
import { cn } from '@/lib/utils';

interface ServerNode {
  id: string;
  country: string;
  flag: string;
  city: string;
  protocol: string;
  ping: number;
  load: number;
  status: 'online' | 'optimal';
}

const SERVER_NODES: ServerNode[] = [
  {
    id: 'se-01',
    country: 'Швеция',
    flag: '🇸🇪',
    city: 'Стокгольм',
    protocol: 'VLESS XTLS-Reality',
    ping: 14,
    load: 18,
    status: 'optimal',
  },
  {
    id: 'nl-02',
    country: 'Нидерланды',
    flag: '🇳🇱',
    city: 'Амстердам',
    protocol: 'Hysteria 2 (UDP)',
    ping: 19,
    load: 29,
    status: 'online',
  },
  {
    id: 'de-01',
    country: 'Германия',
    flag: '🇩🇪',
    city: 'Франкфурт',
    protocol: 'VLESS Vision',
    ping: 23,
    load: 22,
    status: 'optimal',
  },
  {
    id: 'pl-01',
    country: 'Польша',
    flag: '🇵🇱',
    city: 'Варшава',
    protocol: 'Shadowsocks-2022',
    ping: 21,
    load: 15,
    status: 'optimal',
  },
  {
    id: 'fi-01',
    country: 'Финляндия',
    flag: '🇫🇮',
    city: 'Хельсинки',
    protocol: 'Trojan-gRPC',
    ping: 16,
    load: 12,
    status: 'optimal',
  },
];

export const CyberDesktopDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { config, toggleStudio } = useThemeEngine();
  const [selectedNode, setSelectedNode] = useState<string>('se-01');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('VLESS Reality');
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [vpnConnected, setVpnConnected] = useState(true);

  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
  });

  const subscription = subData?.subscription;
  const daysLeft = subscription?.days_left ?? 30;
  const trafficUsedGb = subscription?.traffic_used_gb ?? 14.8;
  const trafficLimitGb = subscription?.traffic_limit_gb || 100;
  const trafficPercent = Math.min(100, Math.round((trafficUsedGb / trafficLimitGb) * 100));

  const accent = config.accentColor || '#00ff66';
  const brandName = config.customBrandName || 'DOTDNA CYBER';
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const subAny = subscription as any;
  const subscriptionUrl =
    subAny?.subscription_url ||
    subAny?.url ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/api/sub/${subAny?.id || 'demo'}`
      : 'https://samuraiservice.org/sub/connect');

  const handleCopyKey = () => {
    if (subscriptionUrl) {
      navigator.clipboard.writeText(subscriptionUrl);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handle1ClickHapp = () => {
    if (subscriptionUrl) {
      const cryptedUrl = `happ://add/crypt3#${btoa(subscriptionUrl)}`;
      window.location.href = cryptedUrl;
    }
  };

  const activeNode = SERVER_NODES.find((n) => n.id === selectedNode) || SERVER_NODES[0];

  return (
    <div className="relative min-h-[100dvh] pb-28 text-[#f5f5f7] selection:bg-emerald-500/30 selection:text-white">
      {/* Dynamic Background with Live Blur & Dimming */}
      <DynamicThemeBackground />

      {/* Kinetic Particle Swarm Canvas */}
      <CyberParticleCanvas />

      {/* 1. Top Navbar Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#050806]/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          {/* Left Brand with Live Cluster Status */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 focus:outline-none"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-black/60 shadow-lg transition-transform hover:scale-105"
                style={{
                  borderColor: `${accent}60`,
                  boxShadow: `0 0 15px ${config.accentGlowColor || 'rgba(0,255,102,0.3)'}`,
                }}
              >
                {config.customLogoUrl ? (
                  <img src={config.customLogoUrl} alt="" className="h-6 w-6 object-contain" />
                ) : (
                  <ShieldCheck className="h-5 w-5" style={{ color: accent }} />
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-widest text-white">{brandName}</span>
                  <span className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-400">
                    10 Gbps
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#8e9690]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  <span>EU Магистраль • 100% Онлайн</span>
                </div>
              </div>
            </button>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden items-center gap-6 md:flex">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-white transition-colors"
              style={{ color: accent }}
            >
              Обзор
            </button>
            <button
              type="button"
              onClick={() => navigate('/connection')}
              className="text-xs font-medium text-[#8e9690] transition-colors hover:text-white"
            >
              Подключение
            </button>
            <button
              type="button"
              onClick={() => navigate('/subscription')}
              className="text-xs font-medium text-[#8e9690] transition-colors hover:text-white"
            >
              Тарифы
            </button>
            <button
              type="button"
              onClick={() => navigate('/news')}
              className="text-xs font-medium text-[#8e9690] transition-colors hover:text-white"
            >
              База знаний
            </button>
            <button
              type="button"
              onClick={() => navigate('/support')}
              className="text-xs font-medium text-[#8e9690] transition-colors hover:text-white"
            >
              Поддержка 24/7
            </button>
          </nav>

          {/* Right User Bar */}
          <div className="flex items-center gap-3">
            {/* Balance Badge */}
            <button
              type="button"
              onClick={() => navigate('/top-up')}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-white/10"
            >
              <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
              <span>Баланс:</span>
              <span className="font-bold text-emerald-400">1 500 ₽</span>
              <span className="py-0.2 rounded-full bg-emerald-500/20 px-1.5 text-[10px] text-emerald-300">
                +
              </span>
            </button>

            {/* SuperAdmin Pill */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 transition-all hover:scale-105 hover:bg-amber-500/20"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                <span>Панель Admin</span>
              </button>
            )}

            {/* Theme Studio */}
            <button
              type="button"
              onClick={toggleStudio}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-white/10"
              style={{ borderColor: `${accent}40` }}
            >
              <Settings className="h-3.5 w-3.5" style={{ color: accent }} />
              <span>Студия тем</span>
            </button>

            {/* Profile Avatar */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-emerald-500/20 to-teal-900/30 text-xs font-bold text-white transition-transform hover:scale-105"
            >
              {user?.first_name ? user.first_name[0] : 'Е'}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Cockpit Container */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {/* Top Announcement Chip */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-950/20 px-4 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 animate-ping rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Высокоскоростная сеть v3.4
            </span>
            <span className="hidden text-xs text-[#a0aba2] sm:inline">
              • Все 5 европейских узлов доступны с минимальным пингом от 14 мс
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/connection')}
            className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
          >
            <span>Инструкция по настройке</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Section 1: Dual Command Center (Connection Cockpit + Node Selector) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column (7 cols): Connection Cockpit */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#080d09]/80 p-7 shadow-2xl backdrop-blur-2xl lg:col-span-7">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-3 w-3 rounded-full shadow-lg"
                    style={{
                      backgroundColor: vpnConnected ? accent : '#6b7280',
                      boxShadow: vpnConnected ? `0 0 12px ${accent}` : 'none',
                    }}
                  />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#8e9690]">
                    СТАТУС ПОДКЛЮЧЕНИЯ
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] font-bold text-[#c2cbc4]">
                    Осталось: <span className="text-emerald-400">{daysLeft} дн.</span>
                  </span>
                </div>
              </div>

              {/* Central Dynamic Big Card */}
              <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-black/40 p-6 text-center shadow-inner">
                {/* Large Interactive Power Button */}
                <button
                  type="button"
                  onClick={() => setVpnConnected(!vpnConnected)}
                  className="group relative flex h-24 w-24 items-center justify-center rounded-full transition-all hover:scale-105"
                  style={{
                    background: vpnConnected
                      ? `radial-gradient(circle, ${accent}25 0%, rgba(0,0,0,0.6) 70%)`
                      : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${vpnConnected ? accent : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: vpnConnected
                      ? `0 0 35px ${config.accentGlowColor || 'rgba(0,255,102,0.4)'}`
                      : 'none',
                  }}
                >
                  <ShieldCheck
                    className="h-10 w-10 transition-transform group-hover:scale-110"
                    style={{ color: vpnConnected ? accent : '#6b7280' }}
                  />
                </button>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {vpnConnected ? 'Защита Активна' : 'VPN Отключен'}
                </h2>
                <p className="mt-1.5 text-xs text-[#8e9690]">
                  {vpnConnected
                    ? `Туннель зашифрован через ${activeNode.flag} ${activeNode.city} (${selectedProtocol})`
                    : 'Нажмите для мгновенного включения безопасного туннеля'}
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
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md'
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
              {/* 1-Click Happ Import */}
              <button
                type="button"
                onClick={handle1ClickHapp}
                className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black text-black shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: accent }}
              >
                <Zap className="h-4 w-4" />
                <span>Импорт в Happ</span>
              </button>

              {/* Copy Key Button */}
              <button
                type="button"
                onClick={handleCopyKey}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 text-xs font-bold text-white transition-all hover:bg-white/10"
              >
                {copiedKey ? (
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

              {/* Show QR Code */}
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

          {/* Right Column (5 cols): Live Server Nodes Matrix */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#080d09]/80 p-7 shadow-2xl backdrop-blur-2xl lg:col-span-5">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                    Европейские Узлы (5 Нод)
                  </h3>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  10 Gbps Порты
                </span>
              </div>

              {/* Server Nodes List */}
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
                          ? 'border-emerald-500/60 bg-emerald-950/30 shadow-lg'
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
                        <div className="flex items-center justify-end gap-1 font-mono text-xs font-bold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>{node.ping} ms</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full bg-emerald-400"
                              style={{ width: `${node.load}%` }}
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

            {/* Bottom Status Info */}
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-3 text-[11px] text-[#8e9690]">
              <span>Текущий маршрут: 🇸🇪 Стокгольм</span>
              <span className="font-bold text-emerald-400">Прямой туннель • 0% потерь</span>
            </div>
          </div>
        </div>

        {/* Section 2: Dense Bento Grid (Telemetry + Connected Devices + Smart Split-Tunnel) */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Traffic & Bandwidth Telemetry */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#080d09]/80 p-6 shadow-xl backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  Трафик и Скорость
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                  Безлимит 10G
                </span>
              </div>

              {/* Segmented Progress */}
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
                      backgroundColor: accent,
                      boxShadow: `0 0 10px ${accent}`,
                    }}
                  />
                </div>
              </div>

              {/* Speed Telemetry Specs */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#8e9690]">
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Скачивание</span>
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">880 Мбит/с</div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#8e9690]">
                    <Upload className="h-3.5 w-3.5 text-teal-400" />
                    <span>Отдача</span>
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">450 Мбит/с</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/subscription')}
              className="mt-6 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs font-semibold text-white transition-all hover:bg-white/10"
            >
              <span>Продлить или изменить тариф</span>
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            </button>
          </div>

          {/* Card 2: Connected Devices Hub */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#080d09]/80 p-6 shadow-xl backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  Устройства (2 из 5)
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  3 свободных слота
                </span>
              </div>

              {/* Device List */}
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
                  <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
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
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/connection')}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 py-3 text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-500/15"
            >
              <Plus className="h-4 w-4" />
              <span>Подключить новое устройство</span>
            </button>
          </div>

          {/* Card 3: Smart Split-Tunneling & Anti-DPI */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#080d09]/80 p-6 shadow-xl backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8e9690]">
                  Умная Маршрутизация
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Anti-DPI v3
                </span>
              </div>

              {/* Route Rules */}
              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🇷🇺</span>
                    <div>
                      <div className="text-xs font-bold text-white">Госуслуги, Банки, Яндекс</div>
                      <div className="text-[10px] text-[#8e9690]">Напрямую без VPN</div>
                    </div>
                  </div>
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
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
                  <span className="rounded-md bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300">
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
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
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
      </main>

      {/* QR Code & Direct Connect Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-2xl">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d140e] p-6 text-center shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: accent }}
              >
                Подключение по QR-коду
              </span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-xs text-[#8e9690] hover:text-white"
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
                className="flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold text-black shadow-lg"
                style={{ backgroundColor: accent }}
              >
                <span>Открыть в Happ</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={handleCopyKey}
                className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-2 text-xs font-medium text-white hover:bg-white/10"
              >
                {copiedKey ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Ключ скопирован!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" style={{ color: accent }} />
                    <span>Скопировать ключ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Command Dock */}
      <CyberFloatingDock />
    </div>
  );
};
