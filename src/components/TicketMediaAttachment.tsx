import { useEffect, useState } from 'react';
import { Download, Loader2, RefreshCw } from 'lucide-react';
import { ticketsApi } from '@/api/tickets';
import { useAuthStore } from '@/store/auth';

export function TicketMediaAttachment({ fileId, mediaType, caption, onOpen }: {
  fileId: string; mediaType?: string | null; caption?: string | null; onOpen?: (url: string) => void;
}) {
  const userId = useAuthStore((state) => state.user?.id);
  const [retry, setRetry] = useState(0);
  const identity = `${userId ?? 'guest'}:${fileId}:${retry}`;
  const [asset, setAsset] = useState<{ identity: string; url: string | null; error: string | null } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;
    setAsset(null);
    void ticketsApi.downloadMedia(fileId, controller.signal).then((blob) => {
      if (controller.signal.aborted) return;
      if (!blob.size || blob.type.includes('text/html') || blob.type.includes('application/json')) throw new Error('Invalid media response');
      objectUrl = URL.createObjectURL(blob);
      setAsset({ identity, url: objectUrl, error: null });
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      const status = (error as { response?: { status?: number } })?.response?.status;
      setAsset({ identity, url: null, error: status === 403 ? 'Нет доступа к вложению.' : status === 404 ? 'Вложение не найдено.' : 'Не удалось загрузить вложение.' });
    });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [fileId, identity]);
  const current = asset?.identity === identity ? asset : null;
  if (!current) return <div role="status" className="flex min-h-16 items-center gap-2 text-[14px]"><Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />Загрузка вложения</div>;
  if (current.error) return <div className="space-y-2 text-[14px]"><p role="status">{current.error}</p><button type="button" onClick={() => setRetry(retry + 1)} className="cabinet-glass-control flex min-h-11 items-center gap-2 rounded-xl px-3"><RefreshCw aria-hidden="true" className="h-4 w-4" />Повторить</button></div>;
  const url = current.url!;
  const photo = mediaType === 'photo' || !mediaType;
  if (photo) {
    const image = <img src={url} alt={caption || 'Вложение к обращению'} className="max-h-56 max-w-full rounded-xl object-contain" loading="lazy"
      onError={() => setAsset({ identity, url: null, error: 'Не удалось показать изображение.' })} />;
    return onOpen ? <button type="button" aria-label="Увеличить изображение" onClick={() => onOpen(url)} className="block overflow-hidden rounded-xl border border-white/10 bg-black/10 text-left">{image}</button> : image;
  }
  if (mediaType === 'video') return <video src={url} controls preload="metadata" className="max-h-64 max-w-full rounded-xl" aria-label={caption || 'Видео к обращению'} />;
  return <a href={url} download="attachment" className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-[14px]"><Download aria-hidden="true" className="h-4 w-4" />{caption || 'Скачать вложение'}</a>;
}
