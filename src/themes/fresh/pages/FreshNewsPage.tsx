import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useFreshThemeContext } from '../FreshThemeContext';
import { FreshNavbar } from '../components/FreshNavbar';

const FAQ_ITEMS = [
  {
    id: 1,
    question: 'Как подключить новое устройство к подписке?',
    answer:
      'Откройте раздел «Подключение», выберите вашу операционную систему (iOS, Android, Windows, Mac), скачайте рекомендуемое приложение Happ и нажмите кнопку «Импортировать в 1 клик» или отсканируйте QR-код.',
  },
  {
    id: 2,
    question: 'Сколько устройств можно использовать одновременно?',
    answer:
      'Базовая подписка включает до 5 активных устройств одновременно (смартфоны, планшеты, ПК, Smart TV) без ограничения скорости на каждом из них.',
  },
  {
    id: 3,
    question: 'Как работает защита от блокировок и умная маршрутизация?',
    answer:
      'Трафик маскируется под доверенные защищенные TLS-соединения с европейскими серверами в Стокгольме, Амстердаме и Варшаве. Ваши действия полностью изолированы и не сохраняются в логах (Zero-Logs политика).',
  },
  {
    id: 4,
    question: 'Что делать, если скорость упала или сервер перестал отвечать?',
    answer:
      'Откройте приложение Happ и потяните список серверов вниз для обновления (или нажмите «Обновить подписку»). Сервера обновятся автоматически.',
  },
  {
    id: 5,
    question: 'Как продлить подписку или настроить автопродление?',
    answer:
      'Пополните баланс в разделе «Тарифы» через СБП, банковскую карту или криптовалюту и нажмите «Выбрать тариф». Подписка продлится моментально.',
  },
];

export function FreshNewsPage() {
  const { config } = useFreshThemeContext();
  const [openFaq, setOpenFaq] = useState<number | null>(1);
  const accentLime = config.accentColor || '#d7ff3b';

  return (
    <div className="fresh-backdrop-container min-h-screen font-sans text-[#f5f5f7] selection:bg-[#d7ff3b]/30 selection:text-white">
      <FreshNavbar />

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0d1610]/80 px-4 py-1.5 text-xs text-[#8e9690]">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: accentLime, boxShadow: `0 0 8px ${accentLime}` }}
            />
            <span className="font-semibold text-white">База знаний и новости</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Часто задаваемые вопросы
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-[#9ca59e]">
            Ответы на популярные вопросы о подключении, настройке и безопасности.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-12 space-y-3.5">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openFaq === item.id;
            return (
              <div key={item.id} className="fresh-bento-card overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : item.id)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-xl border bg-[#0d1610]"
                      style={{ borderColor: isOpen ? `${accentLime}60` : 'rgba(255,255,255,0.08)' }}
                    >
                      <HelpCircle
                        className="h-4 w-4"
                        style={{ color: isOpen ? accentLime : '#8e9690' }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white">{item.question}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-[#8e9690] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="animate-in fade-in border-t border-white/10 px-5 pb-5 pt-3 text-xs leading-relaxed text-[#c8d0ca] duration-200">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
