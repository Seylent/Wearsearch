'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { resetBodyScroll } from '@/lib/scrollLock';

export const ScrollLockReset = () => {
  const pathname = usePathname();

  useEffect(() => {
    resetBodyScroll();
  }, [pathname]);

  useEffect(() => {
    const tryReset = () => {
      const html = document.documentElement;
      const bodyStyle = window.getComputedStyle(document.body);
      const htmlStyle = window.getComputedStyle(html);
      const isLocked =
        bodyStyle.overflowY === 'hidden' ||
        bodyStyle.overflow === 'hidden' ||
        bodyStyle.touchAction === 'none' ||
        bodyStyle.position === 'fixed' ||
        htmlStyle.overflowY === 'hidden' ||
        htmlStyle.overflow === 'hidden' ||
        htmlStyle.touchAction === 'none' ||
        htmlStyle.position === 'fixed';

      if (!isLocked) return;

      const activeLock = Array.from(document.querySelectorAll('[data-scroll-lock-root]')).find(
        node => {
          const element = node as HTMLElement;
          const style = window.getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          return element.getClientRects().length > 0;
        }
      );
      if (!activeLock) {
        resetBodyScroll();
        html.style.overflow = '';
        html.style.touchAction = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }
    };

    const intervalId = window.setInterval(tryReset, 800);

    window.addEventListener('touchstart', tryReset, { passive: true });
    window.addEventListener('touchmove', tryReset, { passive: true });
    window.addEventListener('touchend', tryReset, { passive: true });
    window.addEventListener('pointerdown', tryReset);
    window.addEventListener('wheel', tryReset, { passive: true });
    window.addEventListener('scroll', tryReset, { passive: true });
    window.addEventListener('keydown', tryReset);
    window.addEventListener('click', tryReset);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('touchstart', tryReset);
      window.removeEventListener('touchmove', tryReset);
      window.removeEventListener('touchend', tryReset);
      window.removeEventListener('pointerdown', tryReset);
      window.removeEventListener('wheel', tryReset);
      window.removeEventListener('scroll', tryReset);
      window.removeEventListener('keydown', tryReset);
      window.removeEventListener('click', tryReset);
    };
  }, []);

  return null;
};
