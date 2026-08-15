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

import { UltimaDesktopNavbar } from '@/components/ultima/desktop/UltimaDesktopNavbar';

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
      title: 'Как обеспечивается защита и скорость?',
      content:
        'Используются современные выделенные европейские серверы с пропускной способностью 10 Гбит/с, защитой от блокировок и полным отсутствием логов.',
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
    <div className="min-h-screen bg-[#07080a] text-white">
      {/* Desktop Frosted Glass Navbar */}
      <div className="hidden lg:block">
        <UltimaDesktopNavbar
          onBuySubscription={() => navigate('/subscription')}
          onOpenSupport={() => navigate('/support')}
        />
      </div>

      <div className="mx-auto max-w-[540px] px-3 pb-36 pt-4 lg:max-w-7xl lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-6 px-1">
          <h1 className="text-[26px] font-bold text-[#f5f5f7] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] lg:text-3xl">
            Новости и обновления
          </h1>
          <p className="mt-1 text-[13px] font-medium text-[#8e929b] lg:text-sm">
            Анонсы, технические изменения и документация сервиса
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Official Telegram Channel & Category Pills (4 cols on lg) */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            {/* Official Telegram Channel Hero */}
            <div
              className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
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
                    <h2 className="text-base font-bold text-[#f5f5f7]">Канал в Telegram</h2>
                    <p className="mt-0.5 text-xs text-[#8e929b]">
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
                className="mt-5 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[#b89358]/60 bg-gradient-to-r from-[#d4b37f] to-[#b89358] px-4 py-2.5 text-xs font-bold text-[#0a0c0f] shadow-md transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                <span>Перейти в Telegram-канал</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {[
                { id: 'all', label: 'Все разделы' },
                { id: 'news', label: 'Новости' },
                { id: 'faq', label: 'База знаний (FAQ)' },
                { id: 'rules', label: 'Документы и оферта' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id as 'all' | 'news' | 'faq' | 'rules')}
                  className={`rounded-2xl px-5 py-3 text-left text-xs font-bold transition-all ${
                    activeCategory === tab.id
                      ? 'border border-[#b89358]/60 bg-gradient-to-r from-[#d4b37f] to-[#b89358] text-[#0a0c0f] shadow-sm'
                      : 'border border-[#5a5040]/30 bg-[#121418] text-[#8e929b] hover:border-[#b89358]/40 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Feed and Content (8 cols on lg) */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* 4. News Feed List */}
            {(activeCategory === 'all' || activeCategory === 'news') && (
              <div
                className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-[#d4b37f]" />
                    <h2 className="text-base font-bold text-[#f5f5f7]">Лента публикаций</h2>
                  </div>
                  <span className="text-xs text-[#8e929b]">{newsItems.length}</span>
                </div>

                <div className="mt-4 flex flex-col divide-y divide-white/[0.07]">
                  {newsItems.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#8e929b]">
                      <p className="font-semibold text-[#f5f5f7]">Публикаций пока нет</p>
                      <p className="mt-1 text-[11px]">Свежие релизы появятся здесь</p>
                    </div>
                  ) : (
                    newsItems.map((item) => (
                      <article key={item.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-[#d4b37f]">
                            {item.published_at ? formatDate(item.published_at) : 'Недавно'}
                          </span>
                        </div>
                        <h3 className="mt-1.5 text-sm font-bold text-[#f5f5f7]">{item.title}</h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#c2c5cc]">
                          {item.excerpt}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 5. Interactive FAQ Section */}
            {(activeCategory === 'all' || activeCategory === 'faq') && (
              <div
                className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
                }}
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-[#d4b37f]" />
                  <h2 className="text-base font-bold text-[#f5f5f7]">
                    База знаний и частые вопросы
                  </h2>
                </div>

                <div className="mt-4 flex flex-col divide-y divide-white/[0.07]">
                  {displayFaqList.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div key={faq.id} className="py-3.5 first:pt-0 last:pb-0">
                        <button
                          type="button"
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="flex w-full items-center justify-between text-left transition-colors hover:text-[#d4b37f]"
                        >
                          <span className="text-xs font-semibold text-[#f5f5f7]">{faq.title}</span>
                          <ChevronDown
                            className={`h-4 w-4 text-[#8e929b] transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-[#d4b37f]' : ''
                            }`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="mt-2.5 rounded-xl border border-white/[0.06] bg-black/40 p-3.5 text-xs leading-relaxed text-[#c2c5cc]">
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
                className="relative overflow-hidden rounded-[26px] border border-[#5a5040]/35 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(22, 25, 30, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#d4b37f]" />
                  <h2 className="text-base font-bold text-[#f5f5f7]">Документы и соглашения</h2>
                </div>

                <div className="mt-3 flex flex-col divide-y divide-white/[0.07]">
                  <button
                    type="button"
                    onClick={() => navigate('/rules')}
                    className="flex items-center justify-between py-3 text-left transition-colors hover:text-[#d4b37f]"
                  >
                    <span className="text-xs font-medium text-[#f5f5f7]">Правила сервиса</span>
                    <ChevronRight className="h-4 w-4 text-[#8e929b]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/privacy')}
                    className="flex items-center justify-between py-3 text-left transition-colors hover:text-[#d4b37f]"
                  >
                    <span className="text-xs font-medium text-[#f5f5f7]">
                      Политика конфиденциальности
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#8e929b]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/offer')}
                    className="flex items-center justify-between py-3 text-left transition-colors hover:text-[#d4b37f]"
                  >
                    <span className="text-xs font-medium text-[#f5f5f7]">Публичная оферта</span>
                    <ChevronRight className="h-4 w-4 text-[#8e929b]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
