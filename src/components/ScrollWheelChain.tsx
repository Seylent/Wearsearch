'use client';

import { useEffect } from 'react';

const isVisible = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  if (style.opacity === '0' || style.pointerEvents === 'none') return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  return element.getClientRects().length > 0;
};

const findScrollableY = (element: HTMLElement | null) => {
  let current: HTMLElement | null = element;
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const canScrollY =
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      current.scrollHeight > current.clientHeight;
    if (canScrollY) return current;
    current = current.parentElement;
  }
  return null;
};

const findScrollableX = (element: HTMLElement | null) => {
  let current: HTMLElement | null = element;
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const canScrollX =
      (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
      current.scrollWidth > current.clientWidth;
    if (canScrollX) return current;
    current = current.parentElement;
  }
  return null;
};

export const ScrollWheelChain = () => {
  useEffect(() => {
    // Apply to all desktop devices
    const isDesktop = window.innerWidth >= 768;
    if (!isDesktop) return;

    const isModalActive = () => {
      const modal = document.querySelector<HTMLElement>('[aria-modal="true"], [role="dialog"]');
      return Boolean(modal && isVisible(modal));
    };

    const unlockIfStuck = (startY: number, deltaY: number) => {
      if (isModalActive()) return;
      if (window.scrollY !== startY) return;
      const html = document.documentElement;
      const body = document.body;
      html.style.overflow = '';
      html.style.overflowY = 'auto';
      html.style.touchAction = 'auto';
      body.style.overflow = '';
      body.style.overflowY = 'auto';
      body.style.touchAction = 'auto';
      window.scrollBy({ top: deltaY, left: 0, behavior: 'auto' });
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.defaultPrevented) return;

      // Only handle vertical scroll
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      if (isModalActive()) return;

      const target = event.target instanceof Element ? (event.target as HTMLElement) : null;
      if (!target) return;

      // Check if we're inside a vertically scrollable container
      const verticalScroll = findScrollableY(target);
      if (verticalScroll) return;

      // Check if we're inside a horizontally scrollable container
      const horizontalScroll = findScrollableX(target);

      // If we're in a horizontal scroll container on desktop, force page scroll
      if (horizontalScroll && window.innerWidth >= 768) {
        event.preventDefault();
        const startY = window.scrollY;
        window.scrollBy({ top: event.deltaY, left: 0, behavior: 'auto' });
        window.requestAnimationFrame(() => unlockIfStuck(startY, event.deltaY));
        return;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    // Also handle resize to update isDesktop state
    const handleResize = () => {
      if (window.innerWidth < 768) {
        window.removeEventListener('wheel', handleWheel, { capture: true });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return null;
};
