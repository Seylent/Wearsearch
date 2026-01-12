/**
 * Resource Hints Initializer
 * Runs once to set up prefetch on hover
 */

'use client';

import { useEffect } from 'react';

export function ResourceHintsInitializer() {
  useEffect(() => {
    // Run after initial render is complete
    const timeoutId = setTimeout(() => {
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
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []); // Empty array - runs only once

  return null; // This component doesn't render anything
}
