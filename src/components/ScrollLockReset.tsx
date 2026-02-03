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
      const isLocked =
        document.body.style.overflow === 'hidden' ||
        document.body.style.touchAction === 'none' ||
        html.style.overflow === 'hidden' ||
        html.style.touchAction === 'none';

      if (!isLocked) return;

      const activeLock = document.querySelector('[data-scroll-lock-root]');
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
    window.addEventListener('pointerdown', tryReset);
    window.addEventListener('wheel', tryReset, { passive: true });
    window.addEventListener('keydown', tryReset);
    window.addEventListener('click', tryReset);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('touchstart', tryReset);
      window.removeEventListener('touchmove', tryReset);
      window.removeEventListener('pointerdown', tryReset);
      window.removeEventListener('wheel', tryReset);
      window.removeEventListener('keydown', tryReset);
      window.removeEventListener('click', tryReset);
    };
  }, []);

  return null;
};
