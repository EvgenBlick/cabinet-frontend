import { useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquarePlus, Send, X } from 'lucide-react';
import { ticketsApi } from '../../../api/tickets';
import type { AdminTicket, AdminTicketDetail } from '../../../api/admin';

interface AdminUserTicketsTabProps {
  userId: number;
  selectedTicketId: number | null;
  selectedTicket: AdminTicketDetail | null;
  ticketDetailLoading: boolean;
  actionLoading: boolean;
  onBackToTickets: () => void;
  onTicketStatusChange: (status: string) => void;
  formatDate: (date: string | null) => string;
  replyText: string;
  setReplyText: (value: string) => void;
  onTicketReply: () => void;
  replySending: boolean;
  conversationSending: boolean;
  onStartConversation: (message: string, title: string) => Promise<AdminTicketDetail | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  ticketsLoading: boolean;
  tickets: AdminTicket[];
  ticketsTotal: number;
  onOpenTicket: (ticketId: number) => void;
}

export function AdminUserTicketsTab({
  userId,
  selectedTicketId,
  selectedTicket,
  ticketDetailLoading,
  actionLoading,
  onBackToTickets,
  onTicketStatusChange,
  formatDate,
  replyText,
  setReplyText,
  onTicketReply,
  replySending,
  conversationSending,
  onStartConversation,
  messagesEndRef,
  ticketsLoading,
  tickets,
  ticketsTotal,
  onOpenTicket,
}: AdminUserTicketsTabProps) {
  const { t } = useTranslation();
  const [showComposer, setShowComposer] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('Сообщение от поддержки');
  const [conversationMessage, setConversationMessage] = useState('');

  const composer = (
    <div className="rounded-lg border border-accent-500/25 bg-accent-500/5 p-4">
      {!showComposer ? (
        <button
          type="button"
          onClick={() => setShowComposer(true)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/15 text-accent-400">
              <MessageSquarePlus className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-medium text-dark-100">Написать пользователю</span>
              <span className="mt-0.5 block text-xs text-dark-400">
                Начать личный онлайн-диалог из кабинета
              </span>
            </span>
          </span>
          <span className="rounded-lg bg-accent-500 px-3 py-2 text-xs font-semibold text-dark-950">
            Написать
          </span>
        </button>
      ) : (
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const created = await onStartConversation(conversationMessage, conversationTitle);
            if (created) {
              setConversationMessage('');
              setShowComposer(false);
            }
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-dark-100">Новое сообщение</div>
              <div className="text-xs text-dark-500">
                Пользователь #{userId} увидит его в кабинете и получит уведомление
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowComposer(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-dark-400 hover:bg-dark-800"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            className="input w-full"
            value={conversationTitle}
            onChange={(event) => setConversationTitle(event.target.value)}
            minLength={3}
            maxLength={255}
            placeholder="Тема диалога"
            required
          />
          <textarea
            className="input min-h-24 w-full resize-none"
            value={conversationMessage}
            onChange={(event) => setConversationMessage(event.target.value)}
            maxLength={4000}
            placeholder="Введите сообщение пользователю"
            required
          />
          <button
            type="submit"
            disabled={!conversationMessage.trim() || conversationSending}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 text-sm font-semibold text-dark-950 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {conversationSending ? 'Отправляем…' : 'Отправить и открыть чат'}
          </button>
        </form>
      )}
    </div>
  );

  if (selectedTicketId) {
    if (ticketDetailLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
        </div>
      );
    }

    if (!selectedTicket) {
      return null;
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToTickets}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dark-800 transition-colors hover:bg-dark-700"
          >
            <svg
              className="h-4 w-4 text-dark-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-dark-100">
              #{selectedTicket.id} {selectedTicket.title}
            </div>
            <div className="flex items-center gap-2 text-xs text-dark-500">
              <span
                className={`rounded-full border px-1.5 py-0.5 ${
                  {
                    open: 'border-blue-500/30 bg-blue-500/20 text-blue-400',
                    pending: 'border-warning-500/30 bg-warning-500/20 text-warning-400',
                    answered: 'border-success-500/30 bg-success-500/20 text-success-400',
                    closed: 'border-dark-500 bg-dark-600 text-dark-400',
                  }[selectedTicket.status] || 'border-dark-500 bg-dark-600 text-dark-400'
                }`}
              >
                {selectedTicket.status}
              </span>
              <span>{formatDate(selectedTicket.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['open', 'pending', 'answered', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => onTicketStatusChange(status)}
              disabled={selectedTicket.status === status || actionLoading}
              className={`rounded-lg border px-2.5 py-1 text-xs transition-all ${
                selectedTicket.status === status
                  ? 'border-accent-500/50 bg-accent-500/20 text-accent-400'
                  : 'border-dark-700/50 text-dark-400 hover:border-dark-600 hover:text-dark-200'
              } disabled:opacity-50`}
            >
              {t(`admin.tickets.status${status.charAt(0).toUpperCase() + status.slice(1)}`)}
            </button>
          ))}
        </div>

        <div className="scrollbar-hide max-h-[60vh] space-y-3 overflow-y-auto rounded-xl bg-dark-800/30 p-3">
          {selectedTicket.messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-xl p-3 ${
                message.is_from_admin
                  ? 'ml-6 border border-accent-500/20 bg-accent-500/10'
                  : 'mr-6 border border-dark-700/30 bg-dark-800/50'
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`text-xs font-medium ${
                    message.is_from_admin ? 'text-accent-400' : 'text-dark-400'
                  }`}
                >
                  {message.is_from_admin
                    ? t('admin.tickets.adminLabel')
                    : t('admin.tickets.userLabel')}
                </span>
                <span className="text-xs text-dark-500">{formatDate(message.created_at)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-dark-200">{message.message_text}</p>
              {message.has_media && message.media_file_id && (
                <div className="mt-2">
                  {message.media_type === 'photo' ? (
                    <img
                      src={ticketsApi.getMediaUrl(message.media_file_id)}
                      alt={message.media_caption || ''}
                      className="max-h-48 max-w-full rounded-lg"
                    />
                  ) : (
                    <a
                      href={ticketsApi.getMediaUrl(message.media_file_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-dark-700 px-2 py-1 text-xs text-dark-200 hover:bg-dark-600"
                    >
                      {message.media_caption || message.media_type}
                    </a>
                  )}
                  {message.media_caption && message.media_type === 'photo' && (
                    <p className="mt-1 text-xs text-dark-400">{message.media_caption}</p>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {selectedTicket.status !== 'closed' && (
          <div className="flex gap-2">
            <textarea
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              placeholder={t('admin.tickets.replyPlaceholder')}
              rows={2}
              className="input flex-1 resize-none"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  onTicketReply();
                }
              }}
            />
            <button
              onClick={onTicketReply}
              disabled={!replyText.trim() || replySending}
              className="shrink-0 self-end rounded-lg bg-accent-500 px-4 py-2 text-sm text-white transition-colors hover:bg-accent-600 disabled:opacity-50"
            >
              {replySending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (ticketsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="space-y-4">
        {composer}
        <div className="flex flex-col items-center justify-center rounded-lg bg-dark-800/50 py-10">
          <MessageSquarePlus className="mb-3 h-10 w-10 text-dark-600" />
          <p className="text-dark-400">Диалогов пока нет</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {composer}
      <div className="text-sm text-dark-400">
        {ticketsTotal} {t('admin.users.detail.ticketsCount')}
      </div>
      <div className="space-y-2">
        {tickets.map((ticket) => {
          const statusStyles: Record<string, string> = {
            open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            pending: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
            answered: 'bg-success-500/20 text-success-400 border-success-500/30',
            closed: 'bg-dark-600 text-dark-400 border-dark-500',
          };

          return (
            <button
              key={ticket.id}
              onClick={() => onOpenTicket(ticket.id)}
              className="w-full rounded-xl bg-dark-800/50 p-4 text-left transition-colors hover:bg-dark-700/50"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-dark-100">
                  #{ticket.id} {ticket.title}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs ${
                    statusStyles[ticket.status] || statusStyles.closed
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-dark-500">
                <span>{formatDate(ticket.created_at)}</span>
                <span>
                  {ticket.messages_count} {t('admin.users.detail.messagesCount')}
                </span>
              </div>
              {ticket.last_message && (
                <div className="mt-2 truncate text-sm text-dark-400">
                  {ticket.last_message.is_from_admin ? '> ' : ''}
                  {ticket.last_message.message_text}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
