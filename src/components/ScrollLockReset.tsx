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
    const tryReset = (event?: Event) => {
      const html = document.documentElement;
      const activeLock = Array.from(
        document.querySelectorAll('[data-scroll-lock-root], [aria-modal="true"], [role="dialog"]')
      ).find(node => {
        const element = node as HTMLElement;
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        if (style.opacity === '0' || style.pointerEvents === 'none') return false;
        if (element.getAttribute('aria-hidden') === 'true') return false;
        if (style.position === 'static') return false;
        return element.getClientRects().length > 0;
      });

      if (activeLock && event && event.target instanceof Node) {
        if ((activeLock as HTMLElement).contains(event.target)) {
          return;
        }
      }

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

      if (!isLocked) {
        resetBodyScroll();
        html.style.overflow = '';
        html.style.touchAction = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        return;
      }

      if (!activeLock) {
        resetBodyScroll();
        html.style.overflow = '';
        html.style.touchAction = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }
    };

    const scheduleReset = (event?: Event) => {
      window.setTimeout(() => tryReset(event), 0);
    };

    const scheduleObserverReset = () => {
      window.requestAnimationFrame(() => tryReset());
    };

    const observer = new MutationObserver(scheduleObserverReset);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    const intervalId = window.setInterval(tryReset, 800);

    window.addEventListener('touchstart', scheduleReset, { passive: true });
    window.addEventListener('touchmove', tryReset, { passive: true });
    window.addEventListener('touchend', tryReset, { passive: true });
    window.addEventListener('pointerdown', scheduleReset);
    window.addEventListener('wheel', tryReset, { passive: true });
    window.addEventListener('scroll', tryReset, { passive: true });
    window.addEventListener('keydown', scheduleReset);
    window.addEventListener('click', scheduleReset);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      window.removeEventListener('touchstart', scheduleReset);
      window.removeEventListener('touchmove', tryReset);
      window.removeEventListener('touchend', tryReset);
      window.removeEventListener('pointerdown', scheduleReset);
      window.removeEventListener('wheel', tryReset);
      window.removeEventListener('scroll', tryReset);
      window.removeEventListener('keydown', scheduleReset);
      window.removeEventListener('click', scheduleReset);
    };
  }, []);

  return null;
};
