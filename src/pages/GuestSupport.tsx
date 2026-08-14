import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Headphones, LockKeyhole, MessageCircle, Plus, Send, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router';
import { guestSupportApi, type GuestSupportIdentity } from '../api/tickets';
import { useBranding } from '@/hooks/useBranding';
import { useBrandLogoImage } from '@/hooks/useBrandLogoImage';
import { ultimaPaneSurfaceStyle, ultimaSurfaceStyle } from '@/features/ultima/surfaces';

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
  return (
    value.response?.data?.detail ||
    'Не удалось отправить сообщение. Проверьте соединение и попробуйте еще раз.'
  );
}

const surfaceStyle: CSSProperties = ultimaSurfaceStyle;
const paneStyle: CSSProperties = ultimaPaneSurfaceStyle;

export default function GuestSupport() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { appName, logoLetter, hasCustomLogo, logoUrl } = useBranding();
  const brandLogo = useBrandLogoImage(hasCustomLogo ? logoUrl : null);
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
          // The next valid event will refresh the conversation.
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
    <main
      className="ultima-shell min-h-[100dvh] overflow-y-auto px-4 py-4 text-white sm:px-6 sm:py-6"
      data-testid="guest-support-page"
    >
      <div className="ultima-shell-aura" />
      <div className="relative z-[1] mx-auto flex min-h-[calc(100dvh-2rem)] max-w-5xl flex-col sm:min-h-[calc(100dvh-3rem)]">
        <header className="mb-4 flex min-h-12 items-center justify-between border-b border-white/[0.08] pb-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.04] text-white/75 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Вернуться ко входу"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 items-center gap-3 px-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.10] bg-white/[0.05]">
              {hasCustomLogo && logoUrl && !brandLogo.hasError ? (
                <img
                  src={logoUrl}
                  alt=""
                  className="h-full w-full object-contain p-1.5 transition-opacity duration-200"
                  style={{ opacity: brandLogo.isLoaded ? 1 : 0 }}
                  onLoad={brandLogo.handleLoad}
                  onError={brandLogo.handleError}
                />
              ) : (
                <span className="text-sm font-semibold text-white/90">{logoLetter}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold sm:text-base">{appName}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/50">
                {identity ? (
                  <>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-[#d4b37f]' : 'bg-amber-400'}`}
                    />
                    {live ? 'Онлайн' : 'Подключение'}
                  </>
                ) : (
                  'Поддержка без регистрации'
                )}
              </div>
            </div>
          </div>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl border"
            style={{
              borderColor: 'color-mix(in srgb, var(--ultima-color-primary) 30%, transparent)',
              background: 'color-mix(in srgb, var(--ultima-color-primary) 12%, transparent)',
              color: 'color-mix(in srgb, var(--ultima-color-primary) 72%, white)',
            }}
          >
            <Headphones className="h-5 w-5" />
          </div>
        </header>

        {!identity ? (
          <section className="mx-auto grid w-full max-w-4xl flex-1 content-center gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:gap-8">
            <div className="self-center py-3 lg:py-0">
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border"
                style={{
                  borderColor: 'color-mix(in srgb, var(--ultima-color-primary) 34%, transparent)',
                  background: 'color-mix(in srgb, var(--ultima-color-primary) 14%, transparent)',
                  color: 'color-mix(in srgb, var(--ultima-color-primary) 74%, white)',
                }}
              >
                <MessageCircle className="h-6 w-6" />
              </div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
                Онлайн-поддержка
              </p>
              <h1 className="mt-2 max-w-md text-3xl font-semibold leading-[1.08] sm:text-4xl">
                Опишите вопрос, ответ появится здесь
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/55">
                Регистрация не нужна. Диалог сохранится на этом устройстве и обновится без
                перезагрузки страницы.
              </p>
              <div className="text-white/42 mt-5 flex items-center gap-2 text-xs">
                <LockKeyhole className="h-4 w-4" />
                Доступ к переписке защищен отдельным ключом
              </div>
            </div>

            <form
              className="space-y-4 rounded-[24px] border p-4 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-5 lg:rounded-lg"
              style={surfaceStyle}
              onSubmit={(event) => {
                event.preventDefault();
                setError('');
                createMutation.mutate();
              }}
            >
              <GuestField label="Как к вам обращаться">
                <input
                  className="guest-support-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={120}
                  required
                />
              </GuestField>
              <GuestField label="Почта или Telegram" hint="необязательно">
                <input
                  className="guest-support-input"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  maxLength={255}
                  placeholder="name@example.com или @username"
                />
              </GuestField>
              <GuestField label="Тема">
                <input
                  className="guest-support-input"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  minLength={3}
                  maxLength={255}
                  required
                />
              </GuestField>
              <GuestField label="Сообщение">
                <textarea
                  className="guest-support-input min-h-32 resize-none py-3"
                  value={initialMessage}
                  onChange={(event) => setInitialMessage(event.target.value)}
                  minLength={10}
                  maxLength={4000}
                  placeholder="Опишите проблему и что уже пробовали сделать"
                  required
                />
              </GuestField>
              {error ? (
                <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </p>
              ) : null}
              <button
                className="ultima-btn-pill ultima-btn-primary flex h-12 w-full items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
                disabled={createMutation.isPending}
              >
                <Send className="h-4 w-4" />
                {createMutation.isPending ? 'Создаем диалог…' : 'Начать чат'}
              </button>
            </form>
          </section>
        ) : (
          <section
            className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-[24px] border shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl lg:rounded-lg"
            style={surfaceStyle}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <div className="truncate font-semibold">{ticket?.title || 'Загружаем диалог…'}</div>
                <div className="mt-0.5 text-xs text-white/40">Обращение #{identity.ticketId}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-xs text-white/50">
                <Wifi className="h-3.5 w-3.5" /> Онлайн
              </div>
            </div>

            <div
              className="ultima-scrollbar min-h-80 flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5"
              style={paneStyle}
            >
              {ticketQuery.isLoading ? (
                <div className="text-center text-sm text-white/45">Загружаем переписку…</div>
              ) : null}
              {ticketQuery.error && !ticketQuery.isLoading ? (
                <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200">
                  {errorText(ticketQuery.error)}
                </div>
              ) : null}
              {ticket?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_from_admin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl border px-3.5 py-2.5 ${message.is_from_admin ? 'border-white/[0.08] bg-white/[0.055] text-white' : 'border-transparent text-[color:var(--ultima-color-primary-text)]'}`}
                    style={
                      message.is_from_admin
                        ? undefined
                        : { background: 'var(--ultima-color-primary)' }
                    }
                  >
                    <div
                      className={`mb-1 text-[11px] font-medium ${message.is_from_admin ? 'text-[color:color-mix(in_srgb,var(--ultima-color-primary)_70%,white)]' : 'opacity-65'}`}
                    >
                      {message.is_from_admin ? 'Поддержка' : 'Вы'}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-5">{message.message_text}</p>
                    <div
                      className={`mt-1 text-right text-[10px] ${message.is_from_admin ? 'text-white/35' : 'opacity-55'}`}
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
              <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] p-4">
                <span className="text-sm text-white/50">Диалог завершен поддержкой</span>
                <button
                  type="button"
                  onClick={startNewConversation}
                  className="ultima-btn-pill ultima-btn-primary flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Новое обращение
                </button>
              </div>
            ) : ticket?.is_reply_blocked ? (
              <div className="border-t border-white/[0.08] p-4 text-center text-sm text-white/50">
                Ответы в этом обращении временно недоступны
              </div>
            ) : (
              <form
                className="border-t border-white/[0.08] p-3 sm:p-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (reply.trim()) replyMutation.mutate();
                }}
              >
                {error ? <p className="mb-2 text-sm text-red-200">{error}</p> : null}
                <div className="flex items-end gap-2">
                  <textarea
                    className="guest-support-input max-h-36 min-h-11 flex-1 resize-none py-3"
                    rows={1}
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
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
                    className="ultima-btn-pill ultima-btn-primary flex h-11 w-11 shrink-0 items-center justify-center disabled:opacity-50"
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

function GuestField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-white/65">
        {label} {hint ? <span className="text-white/35">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
