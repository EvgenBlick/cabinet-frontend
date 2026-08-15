import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight,
  FileText,
  Headphones,
  HelpCircle,
  MessageSquare,
  Plus,
  Smartphone,
  Wrench,
  X,
} from 'lucide-react';
import { infoApi } from '@/api/info';
import { ticketsApi } from '@/api/tickets';
import { UltimaBottomNav } from '@/components/ultima/UltimaBottomNav';
import { UltimaDesktopNavbar } from '@/components/ultima/desktop/UltimaDesktopNavbar';
import { usePlatform } from '@/platform';
import type { SupportConfig } from '@/types';

export function UltimaSupport() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openLink } = usePlatform();

  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  // 1. Support Config Query
  const { data: supportConfig } = useQuery<SupportConfig>({
    queryKey: ['support-config'],
    queryFn: infoApi.getSupportConfig,
    staleTime: 60000,
  });

  // 2. Tickets Query
  const { data: ticketsData } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsApi.getTickets({ per_page: 50 }),
    staleTime: 15000,
  });

  // Mutations
  const createTicketMutation = useMutation({
    mutationFn: () => ticketsApi.createTicket(ticketSubject, ticketMessage),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setShowCreateModal(false);
      setTicketSubject('');
      setTicketMessage('');
    },
  });

  const isTicketsEnabled =
    supportConfig?.support_type === 'tickets' || supportConfig?.support_type === 'both' || true;
  const supportUsername = supportConfig?.support_username || 'samuraiservice_bot';
  const cleanUsername = supportUsername.replace(/^@/, '');
  const telegramSupportUrl = `https://t.me/${cleanUsername}`;

  const openTelegramSupport = () => {
    openLink(telegramSupportUrl);
  };

  const tickets = ticketsData?.items || [];
  const activeTickets = tickets.filter((t) => t.status !== 'closed');
  const archiveTickets = tickets.filter((t) => t.status === 'closed');
  const currentTicketList = activeTab === 'active' ? activeTickets : archiveTickets;

  return (
    <div className="min-h-screen bg-[#07080a] text-white">
      {/* Desktop Frosted Glass Navbar */}
      <div className="hidden lg:block">
        <UltimaDesktopNavbar
          onBuySubscription={() => navigate('/subscription')}
          onOpenSupport={() => navigate('/support')}
        />
      </div>

      <div className="mx-auto max-w-[540px] px-3 pb-36 pt-4 lg:max-w-7xl lg:px-8 lg:py-8">
        {/* 1. Header & Title */}
        <div className="mb-6 px-1">
          <h1 className="text-[26px] font-bold text-[#f5f5f7] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] lg:text-3xl">
            Поддержка
          </h1>
          <p className="mt-1 text-[13px] font-medium text-[#8e929b] lg:text-sm">
            Связь со специалистом и ответы на частые вопросы
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Direct Support Hero Card + Quick Navigation (5 cols on lg) */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {/* Direct Support Hero Card */}
            <div
              className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#b89358]/40 bg-gradient-to-br from-[#d4b37f]/20 to-black/60 text-[#d4b37f] shadow-inner">
                  <Headphones className="h-6 w-6 stroke-[1.8]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-[#f5f5f7]">Служба поддержки</h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#8e929b]">
                    Помощь с подключением устройств, настройкой протоколов и выбором локаций в
                    Telegram.
                  </p>
                </div>
              </div>

              {/* Gold CTA Action Button */}
              <button
                type="button"
                onClick={openTelegramSupport}
                className="mt-5 flex min-h-[50px] w-full items-center justify-center gap-2.5 rounded-2xl border border-[#b89358]/60 px-5 py-3 shadow-[0_8px_24px_rgba(212,179,127,0.3),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all hover:brightness-110 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #d4b37f 0%, #b89358 100%)',
                }}
              >
                <MessageSquare className="h-4 w-4 text-[#0a0c0f]" strokeWidth={2.2} />
                <span className="text-sm font-bold tracking-wide text-[#0a0c0f]">
                  Написать в Telegram @{cleanUsername}
                </span>
              </button>
            </div>

            {/* Quick Self-Help Navigation Grid */}
            <div
              className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
              }}
            >
              <div>
                <h2 className="text-base font-bold text-[#f5f5f7]">Разделы помощи</h2>
                <p className="mt-0.5 text-xs text-[#8e929b]">Быстрый переход к руководствам</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {/* Tile 1: FAQ & Info */}
                <button
                  type="button"
                  onClick={() => navigate('/ultima/news')}
                  className="flex flex-col items-start rounded-2xl border border-white/[0.08] bg-black/30 p-4 text-left transition-all hover:border-[#b89358]/40 hover:bg-black/50 active:scale-95"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4b37f]/15 text-[#d4b37f]">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <p className="mt-2.5 text-xs font-bold text-[#f5f5f7]">База знаний</p>
                  <p className="mt-0.5 text-[10px] text-[#8e929b]">Ответы на вопросы</p>
                </button>

                {/* Tile 2: Connection Setup */}
                <button
                  type="button"
                  onClick={() => navigate('/connection')}
                  className="flex flex-col items-start rounded-2xl border border-white/[0.08] bg-black/30 p-4 text-left transition-all hover:border-[#b89358]/40 hover:bg-black/50 active:scale-95"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4b37f]/15 text-[#d4b37f]">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <p className="mt-2.5 text-xs font-bold text-[#f5f5f7]">Инструкция</p>
                  <p className="mt-0.5 text-[10px] text-[#8e929b]">Пошаговый сетап</p>
                </button>

                {/* Tile 3: Devices */}
                <button
                  type="button"
                  onClick={() => navigate('/devices')}
                  className="flex flex-col items-start rounded-2xl border border-white/[0.08] bg-black/30 p-4 text-left transition-all hover:border-[#b89358]/40 hover:bg-black/50 active:scale-95"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4b37f]/15 text-[#d4b37f]">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <p className="mt-2.5 text-xs font-bold text-[#f5f5f7]">Устройства</p>
                  <p className="mt-0.5 text-[10px] text-[#8e929b]">Управление слотами</p>
                </button>

                {/* Tile 4: Rules */}
                <button
                  type="button"
                  onClick={() => navigate('/rules')}
                  className="flex flex-col items-start rounded-2xl border border-white/[0.08] bg-black/30 p-4 text-left transition-all hover:border-[#b89358]/40 hover:bg-black/50 active:scale-95"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4b37f]/15 text-[#d4b37f]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <p className="mt-2.5 text-xs font-bold text-[#f5f5f7]">Правила</p>
                  <p className="mt-0.5 text-[10px] text-[#8e929b]">Оферта и условия</p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Tickets System (7 cols on lg) */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {/* 4. Tickets System (if enabled) */}
            {isTicketsEnabled && (
              <div
                className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#f5f5f7]">Ваши тикеты</h2>
                    <p className="mt-0.5 text-xs text-[#8e929b]">История обращений в поддержку</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-1.5 rounded-full border border-[#b89358]/40 bg-black/60 px-3.5 py-1.5 text-xs font-bold text-[#d4b37f] shadow-sm backdrop-blur-md transition-all hover:border-[#b89358]/80"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Создать тикет</span>
                  </button>
                </div>

                {/* Tabs */}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                      activeTab === 'active'
                        ? 'border border-[#b89358]/50 bg-[#b89358]/20 text-[#d4b37f]'
                        : 'border border-white/[0.08] bg-black/30 text-[#8e929b]'
                    }`}
                  >
                    Активные ({activeTickets.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('archive')}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                      activeTab === 'archive'
                        ? 'border border-[#b89358]/50 bg-[#b89358]/20 text-[#d4b37f]'
                        : 'border border-white/[0.08] bg-black/30 text-[#8e929b]'
                    }`}
                  >
                    Архив ({archiveTickets.length})
                  </button>
                </div>

                {/* List */}
                <div className="mt-4 flex flex-col divide-y divide-white/[0.07]">
                  {currentTicketList.length === 0 ? (
                    <p className="py-8 text-center text-xs text-[#8e929b]">
                      {activeTab === 'active'
                        ? 'У вас нет активных тикетов'
                        : 'В архиве нет обращений'}
                    </p>
                  ) : (
                    currentTicketList.map((ticket) => (
                      <button
                        key={ticket.id}
                        type="button"
                        onClick={() => navigate('/support')}
                        className="flex items-center justify-between py-3.5 text-left transition-colors hover:bg-white/[0.02]"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-xs font-bold text-[#f5f5f7]">
                              {ticket.title}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                ticket.status === 'open'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-white/10 text-white/70'
                              }`}
                            >
                              {ticket.status === 'open' ? 'ОТКРЫТ' : 'ЗАКРЫТ'}
                            </span>
                          </div>
                          {ticket.last_message && (
                            <p className="mt-1 truncate text-[11px] text-[#8e929b]">
                              {ticket.last_message.message_text}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#8e929b]" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div
              className="relative w-full max-w-[500px] overflow-hidden rounded-[26px] border border-[#5a5040]/40 p-6 shadow-2xl"
              style={{
                background: 'linear-gradient(180deg, #181b22 0%, #0e1014 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#f5f5f7]">Новое обращение</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-[#8e929b] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8e929b]">
                    Тема
                  </label>
                  <input
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Опишите кратко суть вопроса..."
                    className="mt-1 w-full rounded-xl border border-white/[0.1] bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#d4b37f]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8e929b]">
                    Сообщение
                  </label>
                  <textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Подробно расскажите, что произошло..."
                    rows={4}
                    className="mt-1 w-full rounded-xl border border-white/[0.1] bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#d4b37f]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => createTicketMutation.mutate()}
                  disabled={
                    !ticketSubject.trim() || !ticketMessage.trim() || createTicketMutation.isPending
                  }
                  className="mt-2 flex min-h-[46px] w-full items-center justify-center rounded-xl border border-[#b89358]/60 bg-gradient-to-r from-[#d4b37f] to-[#b89358] text-xs font-bold text-[#0a0c0f] shadow-md transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {createTicketMutation.isPending ? 'Отправка...' : 'Отправить тикет'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation Dock */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 lg:hidden">
        <div className="pointer-events-auto mx-auto max-w-[540px]">
          <UltimaBottomNav active="support" />
        </div>
      </div>
    </div>
  );
}
