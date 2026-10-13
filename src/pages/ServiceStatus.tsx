import { useNavigate } from 'react-router';
import { Activity } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { VpnDiagnostics } from '@/components/connection/VpnDiagnostics';
import { UltimaBottomNav } from '@/components/ultima/UltimaBottomNav';
import { UltimaDesktopSectionLayout } from '@/components/ultima/desktop/UltimaDesktopSectionLayout';
export default function ServiceStatus(){
 const navigate=useNavigate(),desktop=useMediaQuery('(min-width:1024px)');
 const body=<div className="max-w-2xl space-y-4"><VpnDiagnostics onSupport={context=>navigate('/support',{state:{vpnDiagnostics:context}})} />
 <p className="text-sm leading-relaxed text-white/65">Проверка показывает связь панели управления с узлами. Ограничения отдельных сетей и работа VPN на вашем устройстве могут отличаться. Данные обновляются раз в минуту; при недоступности проверки статус остаётся неизвестным.</p></div>;
 if(desktop)return <UltimaDesktopSectionLayout title="Состояние сервиса" subtitle="Текущая доступность узлов и диагностика подключения" icon={<Activity />} bottomNav={<UltimaBottomNav active="support" />}>{body}</UltimaDesktopSectionLayout>;
 return <div className="ultima-shell"><div className="ultima-shell-inner ultima-shell-mobile-docked"><div className="ultima-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto"><header><h1 className="text-3xl font-semibold">Состояние сервиса</h1><p className="mt-2 text-sm text-white/65">Доступность узлов и диагностика подключения</p></header>{body}</div></div></div>;
}
