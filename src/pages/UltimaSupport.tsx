import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight,
  FileText,
  Headphones,
  HelpCircle,
  MessageSquare,
  Plus,
  Send,
  Smartphone,
  Wrench,
  X,
  Paperclip,
  Loader2,
  Download,
} from 'lucide-react';
import { infoApi } from '@/api/info';
import { ticketsApi } from '@/api/tickets';
import { useWebSocket } from '@/hooks/useWebSocket';
import { UltimaBottomNav } from '@/components/ultima/UltimaBottomNav';
import { UltimaDesktopNavbar } from '@/components/ultima/desktop/UltimaDesktopNavbar';
import { usePlatform } from '@/platform';
import type { SupportConfig } from '@/types';

interface MediaAttachmentState {
  file: File;
  preview: string;
  uploading: boolean;
  fileId?: string;
  error?: string;
}

export function UltimaSupport() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openLink } = usePlatform();

  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Attachments state
  const [createAttachment, setCreateAttachment] = useState<MediaAttachmentState | null>(null);
  const [replyAttachment, setReplyAttachment] = useState<MediaAttachmentState | null>(null);

  const createFileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket for Realtime Tickets
  useWebSocket({
    onMessage: (message) => {
      if (!message.type.startsWith('ticket.')) return;
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
      if (message.ticket_id) {
        void queryClient.invalidateQueries({ queryKey: ['ticket', message.ticket_id] });
      }
    },
  });

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

  // 3. Active Ticket Detail Query
  const { data: activeTicket, isLoading: isActiveTicketLoading } = useQuery({
    queryKey: ['ticket', selectedTicketId],
    queryFn: () => (selectedTicketId ? ticketsApi.getTicket(selectedTicketId) : null),
    enabled: !!selectedTicketId,
  });

  // Auto-scroll on new messages in chat
  useEffect(() => {
    if (selectedTicketId && activeTicket?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicketId, activeTicket?.messages]);

  // Handle file selection & upload
  const handleFileProcess = useCallback(async (file: File, isReply: boolean) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Размер файла не должен превышать 10 МБ');
      return;
    }

    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : '';

    const newAttachment: MediaAttachmentState = {
      file,
      preview: previewUrl,
      uploading: true,
    };

    if (isReply) {
      setReplyAttachment(newAttachment);
    } else {
      setCreateAttachment(newAttachment);
    }

    try {
      const res = await ticketsApi.uploadMedia(file, isImage ? 'photo' : 'document');
      if (isReply) {
        setReplyAttachment((prev) =>
          prev ? { ...prev, uploading: false, fileId: res.file_id } : null,
        );
      } else {
        setCreateAttachment((prev) =>
          prev ? { ...prev, uploading: false, fileId: res.file_id } : null,
        );
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Ошибка загрузки';
      if (isReply) {
        setReplyAttachment((prev) =>
          prev ? { ...prev, uploading: false, error: errorMsg } : null,
        );
      } else {
        setCreateAttachment((prev) =>
          prev ? { ...prev, uploading: false, error: errorMsg } : null,
        );
      }
    }
  }, []);

  // Handle clipboard paste (Ctrl+V)
  const handlePaste = useCallback(
    (e: React.ClipboardEvent, isReply: boolean) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            void handleFileProcess(file, isReply);
            break;
          }
        }
      }
    },
    [handleFileProcess],
  );

  // Mutations
  const createTicketMutation = useMutation({
    mutationFn: () =>
      ticketsApi.createTicket(
        ticketSubject.trim(),
        ticketMessage.trim(),
        createAttachment?.fileId
          ? {
              media_type: createAttachment.file.type.startsWith('image/') ? 'photo' : 'document',
              media_file_id: createAttachment.fileId,
            }
          : undefined,
      ),
    onSuccess: (newTicket) => {
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setShowCreateModal(false);
      setTicketSubject('');
      setTicketMessage('');
      setCreateAttachment(null);
      if (newTicket?.id) {
        setSelectedTicketId(newTicket.id);
      }
    },
  });

  const replyMutation = useMutation({
    mutationFn: () =>
      ticketsApi.addMessage(
        selectedTicketId!,
        replyText.trim(),
        replyAttachment?.fileId
          ? {
              media_type: replyAttachment.file.type.startsWith('image/') ? 'photo' : 'document',
              media_file_id: replyAttachment.fileId,
            }
          : undefined,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ticket', selectedTicketId] });
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setReplyText('');
      setReplyAttachment(null);
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
                        onClick={() => setSelectedTicketId(ticket.id)}
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

        {/* Ticket Chat Dialog Modal */}
        {selectedTicketId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md">
            <div
              className="relative flex h-[85vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[26px] border border-[#5a5040]/40 shadow-2xl"
              style={{
                background: 'linear-gradient(180deg, #16181e 0%, #0d0f13 100%)',
              }}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-[#f5f5f7]">
                      {activeTicket?.title || `Тикет #${selectedTicketId}`}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        activeTicket?.status === 'closed'
                          ? 'bg-white/10 text-white/70'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {activeTicket?.status === 'closed' ? 'ЗАКРЫТ' : 'ОТКРЫТ'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#8e929b]">
                    Реалтайм-диалог со специалистом
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTicketId(null);
                    setReplyText('');
                    setReplyAttachment(null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-[#8e929b] transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages Scrollable Area */}
              <div className="scrollbar-thin scrollbar-thumb-[#b89358]/30 flex-1 space-y-3 overflow-y-auto p-4">
                {isActiveTicketLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#d4b37f] border-t-transparent" />
                  </div>
                ) : activeTicket?.messages && activeTicket.messages.length > 0 ? (
                  activeTicket.messages.map((msg) => {
                    const hasMedia = msg.has_media && msg.media_file_id;
                    const mediaUrl = msg.media_file_id
                      ? ticketsApi.getMediaUrl(msg.media_file_id)
                      : '';
                    const isPhoto = msg.media_type === 'photo' || !msg.media_type;

                    return (
                      <div
                        key={msg.id}
                        className={`flex max-w-[85%] flex-col rounded-2xl p-3.5 ${
                          msg.is_from_admin
                            ? 'self-start border border-[#d4b37f]/25 bg-gradient-to-br from-[#d4b37f]/10 to-transparent text-[#f5f5f7]'
                            : 'ml-auto self-end border border-white/[0.08] bg-white/[0.04] text-white'
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-4 text-[10px]">
                          <span
                            className={`font-bold ${
                              msg.is_from_admin ? 'text-[#d4b37f]' : 'text-[#8e929b]'
                            }`}
                          >
                            {msg.is_from_admin ? 'Служба заботы' : 'Вы'}
                          </span>
                          <span className="text-[#8e929b]">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {msg.message_text && (
                          <p className="whitespace-pre-wrap text-xs leading-relaxed text-[#e2e4e9]">
                            {msg.message_text}
                          </p>
                        )}

                        {/* Image / Attachment Render */}
                        {hasMedia && (
                          <div className="mt-2">
                            {isPhoto ? (
                              <div
                                onClick={() => setLightboxImage(mediaUrl)}
                                className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/[0.1] bg-black/40 transition-transform hover:scale-[1.01]"
                              >
                                <img
                                  src={mediaUrl}
                                  alt={msg.media_caption || 'Скриншот'}
                                  className="max-h-56 w-auto max-w-full rounded-xl object-contain"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                  <span className="rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white shadow">
                                    Нажмите для увеличения
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <a
                                href={mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2 text-xs text-[#d4b37f] transition-colors hover:bg-black/60"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>{msg.media_caption || `Вложение (${msg.media_type})`}</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="py-12 text-center text-xs text-[#8e929b]">Нет сообщений</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Staged Reply Attachment Preview */}
              {replyAttachment && (
                <div className="flex items-center justify-between border-t border-white/[0.08] bg-black/60 px-4 py-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    {replyAttachment.preview ? (
                      <img
                        src={replyAttachment.preview}
                        alt="Preview"
                        className="h-10 w-10 rounded-lg border border-[#d4b37f]/40 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                        <Paperclip className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">
                        {replyAttachment.file.name}
                      </p>
                      <p className="text-[10px] text-[#8e929b]">
                        {replyAttachment.uploading ? (
                          <span className="flex items-center gap-1 text-amber-300">
                            <Loader2 className="h-3 w-3 animate-spin" /> Загрузка вложения...
                          </span>
                        ) : replyAttachment.error ? (
                          <span className="text-red-400">{replyAttachment.error}</span>
                        ) : (
                          <span className="text-emerald-400">Вложение готово к отправке</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyAttachment(null)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Chat Footer / Input Form */}
              {activeTicket?.status !== 'closed' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (
                      (!replyText.trim() && !replyAttachment?.fileId) ||
                      replyMutation.isPending ||
                      replyAttachment?.uploading
                    )
                      return;
                    replyMutation.mutate();
                  }}
                  className="border-t border-white/[0.08] bg-black/40 p-3"
                >
                  <input
                    type="file"
                    ref={replyFileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleFileProcess(file, true);
                    }}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                  />
                  <div className="flex items-end gap-2">
                    {/* Attachment button */}
                    <button
                      type="button"
                      onClick={() => replyFileInputRef.current?.click()}
                      title="Прикрепить скриншот или файл (или нажмите Ctrl+V)"
                      className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-[#d4b37f] transition-all hover:bg-white/[0.1] active:scale-95"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>

                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onPaste={(e) => handlePaste(e, true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (
                            (replyText.trim() || replyAttachment?.fileId) &&
                            !replyMutation.isPending &&
                            !replyAttachment?.uploading
                          ) {
                            replyMutation.mutate();
                          }
                        }
                      }}
                      placeholder="Напишите ответ (или вставьте скриншот Ctrl+V)..."
                      rows={2}
                      className="flex-1 resize-none rounded-xl border border-white/[0.1] bg-black/50 p-2.5 text-xs text-white outline-none transition-colors focus:border-[#d4b37f]"
                    />

                    <button
                      type="submit"
                      disabled={
                        (!replyText.trim() && !replyAttachment?.fileId) ||
                        replyMutation.isPending ||
                        replyAttachment?.uploading
                      }
                      className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-[#b89358]/60 bg-gradient-to-r from-[#d4b37f] to-[#b89358] text-[#0a0c0f] shadow-md transition-all hover:brightness-110 disabled:opacity-40"
                    >
                      {replyMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#0a0c0f]" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="border-t border-white/[0.08] bg-black/40 p-3 text-center text-xs text-[#8e929b]">
                  Обращение закрыто. Для новых вопросов создайте новый тикет.
                </div>
              )}
            </div>
          </div>
        )}

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
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateAttachment(null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-[#8e929b] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <input
                  type="file"
                  ref={createFileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFileProcess(file, false);
                  }}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                />

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
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8e929b]">
                      Сообщение
                    </label>
                    <button
                      type="button"
                      onClick={() => createFileInputRef.current?.click()}
                      className="flex items-center gap-1 text-[11px] font-medium text-[#d4b37f] hover:underline"
                    >
                      <Paperclip className="h-3 w-3" />
                      <span>Прикрепить скриншот</span>
                    </button>
                  </div>
                  <textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    onPaste={(e) => handlePaste(e, false)}
                    placeholder="Подробно расскажите, что произошло (можно вставить скриншот Ctrl+V)..."
                    rows={4}
                    className="mt-1 w-full rounded-xl border border-white/[0.1] bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#d4b37f]"
                  />
                </div>

                {/* Staged Create Attachment Preview */}
                {createAttachment && (
                  <div className="flex items-center justify-between rounded-xl border border-white/[0.1] bg-black/40 p-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {createAttachment.preview ? (
                        <img
                          src={createAttachment.preview}
                          alt="Preview"
                          className="h-10 w-10 rounded-lg border border-[#d4b37f]/40 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                          <Paperclip className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-white">
                          {createAttachment.file.name}
                        </p>
                        <p className="text-[10px]">
                          {createAttachment.uploading ? (
                            <span className="flex items-center gap-1 text-amber-300">
                              <Loader2 className="h-3 w-3 animate-spin" /> Загрузка вложения...
                            </span>
                          ) : createAttachment.error ? (
                            <span className="text-red-400">{createAttachment.error}</span>
                          ) : (
                            <span className="text-emerald-400">Скриншот прикреплен</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreateAttachment(null)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => createTicketMutation.mutate()}
                  disabled={
                    !ticketSubject.trim() ||
                    !ticketMessage.trim() ||
                    createTicketMutation.isPending ||
                    createAttachment?.uploading
                  }
                  className="mt-2 flex min-h-[46px] w-full items-center justify-center rounded-xl border border-[#b89358]/60 bg-gradient-to-r from-[#d4b37f] to-[#b89358] text-xs font-bold text-[#0a0c0f] shadow-md transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {createTicketMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Отправка...
                    </span>
                  ) : (
                    'Отправить тикет'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox High-Res Image Viewer Modal */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Увеличенный скриншот"
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-[90vw] rounded-2xl border border-white/20 object-contain shadow-2xl"
            />
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
