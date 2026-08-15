import { useState, useEffect } from 'react';

export function useDeviceViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet:
      typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1200 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1200 : true,
    isTelegramWebApp: false,
  });

  useEffect(() => {
    // Check if running inside Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    const isTg =
      Boolean(tg?.initData && tg.initData.length > 0) ||
      Boolean(window.location.hash.includes('tgWebAppData'));

    if (isTg && tg) {
      try {
        tg.ready();
        tg.expand();
        if (typeof tg.disableVerticalSwipes === 'function') {
          tg.disableVerticalSwipes();
        }
      } catch {
        // ignore
      }
    }

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setViewport({
        width: w,
        height: h,
        isMobile: w < 768,
        isTablet: w >= 768 && w < 1200,
        isDesktop: w >= 1200,
        isTelegramWebApp: isTg,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}
