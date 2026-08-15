import { useState } from 'react';
import { Headphones, Send, X } from 'lucide-react';
import { useFreshThemeContext } from '../FreshThemeContext';

export function FreshSupportModal() {
  const { activeModal, closeModal, config } = useFreshThemeContext();
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (activeModal !== 'support') return null;

  const accentLime = config.accentColor || '#d7ff3b';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setTicketSubject('');
      setTicketMessage('');
      closeModal();
    }, 2000);
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-2xl duration-200">
      <div className="fresh-bento-card relative w-full max-w-lg rounded-3xl p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl border bg-[#0d1610]"
              style={{ borderColor: `${accentLime}40` }}
            >
              <Headphones className="h-4 w-4" style={{ color: accentLime }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Служба поддержки 24/7</h3>
              <p className="text-[11px] text-[#8e9690]">Мы всегда готовы помочь с настройкой</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm text-[#8e9690] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Telegram Direct Support Box */}
        <div className="my-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#229ED9]/20 text-[#229ED9]">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Telegram бот поддержки</div>
                <div className="text-xs text-[#8e9690]">Быстрый ответ специалиста за 2 минуты</div>
              </div>
            </div>
            <a
              href="https://t.me/support"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105"
              style={{ backgroundColor: accentLime }}
            >
              Написать →
            </a>
          </div>
        </div>

        {/* Create Ticket Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-[#8e9690]">Тема обращения:</label>
            <input
              type="text"
              placeholder="Например: Помощь с подключением на iPhone"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-[#52575e] focus:border-[#d7ff3b] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#8e9690]">Сообщение:</label>
            <textarea
              rows={3}
              placeholder="Опишите возникший вопрос или проблему..."
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-[#52575e] focus:border-[#d7ff3b] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="fresh-glow-btn flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold text-black"
          >
            <span>{sentSuccess ? 'Обращение отправлено!' : 'Отправить тикет'}</span>
            <span>→</span>
          </button>
        </form>
      </div>
    </div>
  );
}
