import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Headphones, LockKeyhole, Send, ShieldCheck, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router';
import { guestSupportApi, type GuestSupportIdentity } from '../api/tickets';

const STORAGE_KEY = 'ultima-guest-support';

function readIdentity(): GuestSupportIdentity | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as GuestSupportIdentity;
    return parsed?.ticketId > 0 && parsed?.accessToken ? parsed : null;
  } catch {
    return null;
  }
}

function errorText(error: unknown): string {
  const value = error as { response?: { data?: { detail?: string } } };
  return value.response?.data?.detail || 'Не удалось отправить сообщение. Попробуйте ещё раз.';
}

export default function GuestSupport() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [identity, setIdentity] = useState<GuestSupportIdentity | null>(() => readIdentity());
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [title, setTitle] = useState('Нужна помощь');
  const [initialMessage, setInitialMessage] = useState('');
  const [reply, setReply] = useState('');
  const [live, setLive] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const queryKey = useMemo(
    () => ['guest-support', identity?.ticketId, identity?.accessToken],
    [identity],
  );
  const ticketQuery = useQuery({
    queryKey,
    queryFn: () => guestSupportApi.get(identity!),
    enabled: Boolean(identity),
    retry: false,
  });

  useEffect(() => {
    if (!ticketQuery.error) return;
    const status = (ticketQuery.error as { response?: { status?: number } }).response?.status;
    if (status === 401 || status === 404) {
      localStorage.removeItem(STORAGE_KEY);
      setIdentity(null);
    }
  }, [ticketQuery.error]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [ticketQuery.data?.messages.length]);

  const refreshConversation = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  useEffect(() => {
    if (!identity) return;
    const apiBaseUrl = new URL(import.meta.env.VITE_API_URL || '/', window.location.origin);
    const protocol = apiBaseUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiPath = apiBaseUrl.pathname.replace(/\/+$/, '');
    const url = `${protocol}//${apiBaseUrl.host}${apiPath}/cabinet/public/support/ws`;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    let socket: WebSocket | null = null;
    let reconnectAttempts = 0;

    const connect = () => {
      socket = new WebSocket(url, [
        'guest-support',
        String(identity.ticketId),
        identity.accessToken,
      ]);
      socket.onopen = () => {
        reconnectAttempts = 0;
        setLive(true);
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as { type?: string; ticket_id?: number };
          if (message.type === 'ticket.admin_reply' && message.ticket_id === identity.ticketId) {
            refreshConversation();
          }
        } catch {
          // Ignore malformed frames; the next valid event still refreshes the conversation.
        }
      };
      socket.onclose = (event) => {
        setLive(false);
        if (!stopped && event.code !== 1008) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts, 15000);
          reconnectAttempts += 1;
          reconnectTimer = setTimeout(connect, delay);
        }
      };
    };
    connect();
    const ping = setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'ping' }));
    }, 25000);
    return () => {
      stopped = true;
      clearInterval(ping);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close(1000);
    };
  }, [identity, refreshConversation]);

  const createMutation = useMutation({
    mutationFn: () =>
      guestSupportApi.create({
        name: name.trim(),
        contact: contact.trim(),
        title: title.trim(),
        message: initialMessage.trim(),
      }),
    onSuccess: ({ ticket, access_token }) => {
      const next = { ticketId: ticket.id, accessToken: access_token };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setIdentity(next);
      queryClient.setQueryData(['guest-support', ticket.id, access_token], ticket);
      setError('');
    },
    onError: (value) => setError(errorText(value)),
  });

  const replyMutation = useMutation({
    mutationFn: () => guestSupportApi.reply(identity!, reply.trim()),
    onSuccess: () => {
      setReply('');
      setError('');
      refreshConversation();
    },
    onError: (value) => setError(errorText(value)),
  });

  const ticket = ticketQuery.data;
  const startNewConversation = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIdentity(null);
    setReply('');
    setError('');
  };
  return (
    <main className="min-h-screen bg-dark-950 px-4 py-5 text-dark-100 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-4xl flex-col sm:min-h-[calc(100vh-4rem)]">
        <header className="mb-5 flex items-center justify-between border-b border-dark-800 pb-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-dark-700 text-dark-300 hover:bg-dark-800"
            aria-label="Вернуться ко входу"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="text-base font-semibold">Поддержка Ultimteam</div>
            <div className="mt-0.5 flex items-center justify-center gap-1.5 text-xs text-dark-400">
              {identity ? (
                <>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  />
                  {live ? 'Онлайн' : 'Подключение'}
                </>
              ) : (
                'Без регистрации'
              )}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/15 text-accent-400">
            <Headphones className="h-5 w-5" />
          </div>
        </header>

        {!identity ? (
          <section className="mx-auto grid w-full max-w-3xl flex-1 content-center gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="self-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500 text-dark-950">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-semibold leading-tight">Напишите нам прямо сейчас</h1>
              <p className="mt-3 text-sm leading-6 text-dark-400">
                Аккаунт не нужен. Диалог сохранится на этом устройстве, а ответ появится без
                обновления страницы.
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-dark-500">
                <LockKeyhole className="h-4 w-4" />
                Доступ к переписке защищён отдельным ключом
              </div>
            </div>

            <form
              className="space-y-4 rounded-lg border border-dark-700 bg-dark-900 p-5 shadow-xl"
              onSubmit={(event) => {
                event.preventDefault();
                setError('');
                createMutation.mutate();
              }}
            >
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-dark-300">
                  Как к вам обращаться
                </span>
                <input
                  className="input w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-dark-300">
                  Почта или Telegram <span className="text-dark-500">необязательно</span>
                </span>
                <input
                  className="input w-full"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  maxLength={255}
                  placeholder="name@example.com или @username"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-dark-300">Тема</span>
                <input
                  className="input w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  minLength={3}
                  maxLength={255}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-dark-300">Сообщение</span>
                <textarea
                  className="input min-h-32 w-full resize-none"
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  minLength={10}
                  maxLength={4000}
                  placeholder="Опишите проблему и что уже пробовали сделать"
                  required
                />
              </label>
              {error && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
              )}
              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent-500 font-semibold text-dark-950 hover:bg-accent-400 disabled:opacity-50"
                disabled={createMutation.isPending}
              >
                <Send className="h-4 w-4" />
                {createMutation.isPending ? 'Создаём диалог…' : 'Начать чат'}
              </button>
            </form>
          </section>
        ) : (
          <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden rounded-lg border border-dark-700 bg-dark-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-dark-800 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <div className="truncate font-semibold">{ticket?.title || 'Загрузка диалога…'}</div>
                <div className="mt-0.5 text-xs text-dark-500">Обращение #{identity.ticketId}</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-dark-400">
                <Wifi className="h-3.5 w-3.5" /> Сообщения сразу
              </div>
            </div>

            <div className="min-h-80 flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5">
              {ticketQuery.isLoading && (
                <div className="text-center text-sm text-dark-500">Загружаем переписку…</div>
              )}
              {ticketQuery.error && !ticketQuery.isLoading && (
                <div className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
                  {errorText(ticketQuery.error)}
                </div>
              )}
              {ticket?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_from_admin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[86%] rounded-lg px-3.5 py-2.5 ${message.is_from_admin ? 'bg-dark-800 text-dark-100' : 'bg-accent-500 text-dark-950'}`}
                  >
                    <div
                      className={`mb-1 text-[11px] font-medium ${message.is_from_admin ? 'text-accent-400' : 'text-dark-800/70'}`}
                    >
                      {message.is_from_admin ? 'Поддержка' : 'Вы'}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-5">{message.message_text}</p>
                    <div
                      className={`mt-1 text-right text-[10px] ${message.is_from_admin ? 'text-dark-500' : 'text-dark-800/60'}`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {ticket?.status === 'closed' ? (
              <div className="flex items-center justify-between gap-3 border-t border-dark-800 p-4">
                <span className="text-sm text-dark-400">Диалог завершён поддержкой</span>
                <button
                  type="button"
                  onClick={startNewConversation}
                  className="rounded-lg bg-accent-500 px-3 py-2 text-xs font-semibold text-dark-950"
                >
                  Новое обращение
                </button>
              </div>
            ) : ticket?.is_reply_blocked ? (
              <div className="border-t border-dark-800 p-4 text-center text-sm text-dark-400">
                Ответы в этом обращении временно недоступны
              </div>
            ) : (
              <form
                className="border-t border-dark-800 p-3 sm:p-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (reply.trim()) replyMutation.mutate();
                }}
              >
                {error && <p className="mb-2 text-sm text-red-300">{error}</p>}
                <div className="flex items-end gap-2">
                  <textarea
                    className="input max-h-36 min-h-11 flex-1 resize-none"
                    rows={1}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Сообщение поддержке"
                    maxLength={4000}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        if (reply.trim()) replyMutation.mutate();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-dark-950 disabled:opacity-50"
                    disabled={!reply.trim() || replyMutation.isPending}
                    aria-label="Отправить"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
