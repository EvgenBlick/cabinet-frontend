import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Newspaper,
  Radio,
  Send,
  Shield,
} from 'lucide-react';
import { newsApi } from '@/api/news';
import { infoApi } from '@/api/info';
import { UltimaBottomNav } from '@/components/ultima/UltimaBottomNav';
import { usePlatform } from '@/platform';

export default function UltimaNews() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { openLink } = usePlatform();
  const [activeCategory, setActiveCategory] = useState<'all' | 'news' | 'faq' | 'rules'>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  // 1. News Query
  const { data: newsData } = useQuery({
    queryKey: ['news', 1, 20],
    queryFn: () => newsApi.getNews({ limit: 20, offset: 0 }),
    staleTime: 60000,
  });

  // 2. FAQ Query
  const { data: faqPages } = useQuery({
    queryKey: ['faq-pages'],
    queryFn: infoApi.getFaqPages,
    staleTime: 60000,
  });

  const newsItems = newsData?.items || [];

  const defaultFaqItems = [
    {
      id: 1,
      title: 'Как подключить новое устройство?',
      content:
        'Откройте раздел «Подключить устройство» на главном экране. Отсканируйте персональный QR-код в приложении Happ, v2rayNG или Streisand, либо скопируйте ссылку подписки.',
    },
    {
      id: 2,
      title: 'Какие технологии и протоколы используются?',
      content:
        'Стек VLESS + XTLS-Vision + Reality с маскировкой трафика под доверенные TLS-серверы и балансировкой нагрузки.',
    },
    {
      id: 3,
      title: 'Как продлить тариф или пополнить баланс?',
      content:
        'Пополните баланс в разделе «Профиль» через СБП, банковскую карту или криптовалюту и выберите подходящий период подписки.',
    },
    {
      id: 4,
      title: 'Что делать, если пропал интернет?',
      content:
        'Откройте приложение вашего VPN-клиента и нажмите «Обновить подписку» (Update Subscription), чтобы актуализировать рабочие адреса серверов.',
    },
  ];

  const displayFaqList = faqPages && faqPages.length > 0 ? faqPages : defaultFaqItems;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat(i18n.language, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const handleOpenTelegramChannel = () => {
    openLink('https://t.me/samuraiservice');
  };

  return (
    <div className="min-h-screen px-3 pb-36 pt-3 text-white">
      <div className="mx-auto flex max-w-[540px] flex-col gap-3.5">
        {/* 1. Header */}
        <div className="px-1">
          <h1 className="text-[26px] font-bold text-[#f5f5f7] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            Новости и обновления
          </h1>
          <p className="mt-0.5 text-[13px] font-medium text-[#8e929b]">
            Анонсы, технические изменения и документация сервиса
          </p>
        </div>

        {/* 2. Official Telegram Channel Hero */}
        <div
          className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
          style={{
            background:
              'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#b89358]/40 bg-[#d4b37f]/15 text-[#d4b37f]">
                <Radio className="h-5 w-5 stroke-[1.8]" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-[#f5f5f7]">Канал в Telegram</h2>
                <p className="mt-0.5 text-[11px] text-[#8e929b]">
                  Оперативные новости и анонсы новых локаций
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full border border-[#b89358]/40 bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-[#d4b37f]">
              LIVE
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenTelegramChannel}
            className="mt-4 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[#b89358]/60 bg-gradient-to-r from-[#d4b37f] to-[#b89358] px-4 py-2.5 text-[13px] font-bold text-[#0a0c0f] shadow-md transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
            <span>Перейти в Telegram-канал</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </button>
        </div>

        {/* 3. Category Filter Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Все' },
            { id: 'news', label: 'Новости' },
            { id: 'faq', label: 'База знаний' },
            { id: 'rules', label: 'Документы' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id as any)}
              className={`rounded-full px-4 py-2 text-[12px] font-bold transition-all ${
                activeCategory === tab.id
                  ? 'border border-[#b89358]/60 bg-gradient-to-r from-[#d4b37f] to-[#b89358] text-[#0a0c0f] shadow-sm'
                  : 'border border-white/[0.08] bg-black/40 text-[#8e929b] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4. News Feed List */}
        {(activeCategory === 'all' || activeCategory === 'news') && (
          <div
            className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
            style={{
              background:
                'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-[#d4b37f]" />
                <h2 className="text-[15px] font-bold text-[#f5f5f7]">Лента публикаций</h2>
              </div>
              <span className="text-[11px] text-[#8e929b]">{newsItems.length}</span>
            </div>

            <div className="mt-4 flex flex-col divide-y divide-white/[0.07]">
              {newsItems.length === 0 ? (
                <div className="py-6 text-center text-[12px] text-[#8e929b]">
                  <p className="font-semibold text-[#f5f5f7]">Публикаций пока нет</p>
                  <p className="mt-1 text-[11px]">Свежие релизы появятся здесь</p>
                </div>
              ) : (
                newsItems.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full border border-[#b89358]/35 bg-black/60 px-2.5 py-0.5 text-[9px] font-bold uppercase text-[#d4b37f]">
                        {item.category || 'ОБНОВЛЕНИЕ'}
                      </span>
                      <span className="text-[11px] text-[#8e929b]">
                        {formatDate(item.published_at || '')}
                      </span>
                    </div>
                    <h3 className="mt-2 text-[15px] font-bold leading-snug text-[#f5f5f7]">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#8e929b]">
                        {item.excerpt}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. FAQ Accordion */}
        {(activeCategory === 'all' || activeCategory === 'faq') && (
          <div
            className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
            style={{
              background:
                'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
            }}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#d4b37f]" />
              <h2 className="text-[15px] font-bold text-[#f5f5f7]">Частые вопросы</h2>
            </div>

            <div className="mt-4 flex flex-col divide-y divide-white/[0.07]">
              {displayFaqList.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div key={faq.id} className="py-3.5 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="flex w-full items-center justify-between gap-3 text-left transition-colors hover:text-[#d4b37f]"
                    >
                      <span className="text-[13px] font-semibold text-[#f5f5f7]">{faq.title}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#8e929b] transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-[#d4b37f]' : ''
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="mt-2 border-t border-white/[0.05] pt-2 text-[12px] leading-relaxed text-[#9ea4ad]">
                        {faq.content.replace(/<[^>]*>?/gm, '')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Legal & Terms Links */}
        {(activeCategory === 'all' || activeCategory === 'rules') && (
          <div
            className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
            style={{
              background:
                'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
            }}
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#d4b37f]" />
              <h2 className="text-[15px] font-bold text-[#f5f5f7]">Документы и соглашения</h2>
            </div>

            <div className="mt-3 flex flex-col divide-y divide-white/[0.07]">
              <button
                type="button"
                onClick={() => navigate('/rules')}
                className="flex items-center justify-between py-3 text-left transition-colors hover:text-[#d4b37f]"
              >
                <span className="text-[13px] font-medium text-[#f5f5f7]">Правила сервиса</span>
                <ChevronRight className="h-4 w-4 text-[#8e929b]" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/privacy')}
                className="flex items-center justify-between py-3 text-left transition-colors hover:text-[#d4b37f]"
              >
                <span className="text-[13px] font-medium text-[#f5f5f7]">
                  Политика конфиденциальности
                </span>
                <ChevronRight className="h-4 w-4 text-[#8e929b]" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/offer')}
                className="flex items-center justify-between py-3 text-left transition-colors hover:text-[#d4b37f]"
              >
                <span className="text-[13px] font-medium text-[#f5f5f7]">Публичная оферта</span>
                <ChevronRight className="h-4 w-4 text-[#8e929b]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. Fixed Bottom Navigation Dock */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 lg:hidden">
        <div className="pointer-events-auto mx-auto max-w-[540px]">
          <UltimaBottomNav active="news" />
        </div>
      </div>
    </div>
  );
}
