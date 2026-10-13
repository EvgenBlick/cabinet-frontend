import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type NotificationSettings } from '@/api/notifications';
import { useAuthStore } from '@/store/auth';
import { Switch } from '@/components/primitives/Switch';
const categories = [
 ['ticket_reply_enabled','Ответы поддержки','Новые сообщения в ваших обращениях'],
 ['news_enabled','Новости сервиса','Обновления и важные объявления'],
 ['subscription_expiry_enabled','Окончание подписки','Напоминание о продлении'],
 ['traffic_warning_enabled','Расход трафика','Предупреждение при приближении к лимиту'],
] as const;
export default function NotificationCategorySettings() {
 const userId=useAuthStore(s=>s.user?.id);const client=useQueryClient();
 const {data,isError,isPending}=useQuery({queryKey:['notification-settings',userId],queryFn:notificationsApi.getSettings,enabled:!!userId,staleTime:60000});
 const [saving,setSaving]=useState(false),[error,setError]=useState('');
 async function update(key:keyof NotificationSettings,value:boolean|number){
  const owner=userId;if(!owner||saving)return;setSaving(true);setError('');
  try{const next=await notificationsApi.updateSettings({[key]:value});client.setQueryData(['notification-settings',owner],next)}
  catch{setError('Не удалось сохранить настройку. Попробуйте ещё раз.')}finally{setSaving(false)}
 }
 if(!userId)return null;
 return <section className="cabinet-content-card border p-5" aria-labelledby="notification-categories-title">
  <h2 id="notification-categories-title" className="text-base font-semibold">Какие уведомления получать</h2>
  <p className="mt-1 text-sm leading-relaxed text-white/70">Настройки сохраняются в аккаунте. Уведомления сайта требуют разрешения браузера.</p>
  {isError?<p role="alert" className="mt-3 text-sm">Не удалось загрузить настройки.</p>:null}
  <div className="mt-3 divide-y divide-white/10">{categories.map(([key,label,description])=><div key={key} className="flex min-h-16 items-center justify-between gap-4 py-3">
   <div className="min-w-0"><label htmlFor={`notify-${key}`} className="text-sm font-medium">{label}</label><p className="mt-1 text-sm text-white/60">{description}{key==='subscription_expiry_enabled'&&data?` · за ${data.subscription_expiry_days} дн.`:key==='traffic_warning_enabled'&&data?` · от ${data.traffic_warning_percent}%`:''}</p></div>
   <Switch id={`notify-${key}`} aria-label={label} checked={data?.[key]!==false} disabled={!data||saving||isPending} onCheckedChange={value=>void update(key,value)} />
  </div>)}</div>
  {data?<div className="mt-3 grid gap-3 sm:grid-cols-2">
   <label className="text-sm">Напомнить за <select aria-label="За сколько дней напомнить" className="cabinet-glass-control ml-2 rounded-xl border p-2" value={data.subscription_expiry_days} disabled={saving} onChange={e=>void update('subscription_expiry_days',Number(e.target.value))}>{[...new Set([1,3,7,14,data.subscription_expiry_days])].sort((a,b)=>a-b).map(n=><option key={n} value={n}>{n} дн.</option>)}</select></label>
   <label className="text-sm">Предупредить при <select aria-label="Порог расхода трафика" className="cabinet-glass-control ml-2 rounded-xl border p-2" value={data.traffic_warning_percent} disabled={saving} onChange={e=>void update('traffic_warning_percent',Number(e.target.value))}>{[...new Set([50,75,80,90,95,data.traffic_warning_percent])].sort((a,b)=>a-b).map(n=><option key={n} value={n}>{n}%</option>)}</select></label>
  </div>:null}
  {saving?<p role="status" className="mt-2 text-sm">Сохраняем…</p>:null}{error?<p role="alert" className="mt-2 text-sm">{error}</p>:null}
 </section>;
}

