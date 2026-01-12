/**
 * Resource Hints and Preloading Configuration
 * Optimizes critical resource loading
 */

'use client';

import { useEffect, useRef } from 'react';

// Global flag to prevent multiple initializations
let globalPrefetchInitialized = false;

export function useResourceHints() {
  const hasRun = useRef(false);

  useEffect(() => {
    // Run only once per app lifecycle
    if (hasRun.current || globalPrefetchInitialized) return;
    hasRun.current = true;
    globalPrefetchInitialized = true;

    // Prefetch next page on hover (тільки один раз)
    const prefetchLinks = () => {
      document.querySelectorAll('a[href^="/"]').forEach((link) => {
        link.addEventListener('mouseenter', function(this: HTMLAnchorElement) {
          const href = this.getAttribute('href');
          if (!href || document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
          
          const prefetch = document.createElement('link');
          prefetch.rel = 'prefetch';
          prefetch.href = href;
          document.head.appendChild(prefetch);
        }, { once: true, passive: true });
      });
    };

    // Run after delay to not block initial render
    const timeoutId = setTimeout(prefetchLinks, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []); // Порожній масив залежностей - виконується тільки один раз
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'low') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = src;
  link.as = 'image';
  if (priority === 'high') {
    link.setAttribute('fetchpriority', 'high');
  }
  document.head.appendChild(link);
}

/**
 * Prefetch next page data
 */
export function prefetchPage(url: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}
