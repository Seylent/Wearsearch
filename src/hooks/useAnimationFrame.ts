/**
 * Request Animation Frame Hook
 * Для smooth animations та high-performance updates
 * Підтримує 60Hz, 120Hz, 144Hz+ дисплеї
 */

import { useEffect, useRef, useCallback, useState } from 'react';

const EMPTY_DEPS: ReadonlyArray<unknown> = [];

/**
 * Detect display refresh rate
 */
export function useRefreshRate() {
  const [refreshRate, setRefreshRate] = useState(60);

  useEffect(() => {
    let frameCount = 0;
    const lastTime = performance.now();
    let rafId: number;

    const detectRefreshRate = (currentTime: number) => {
      frameCount++;
      
      // Вимірюємо після 60 кадрів
      if (frameCount === 60) {
        const elapsed = currentTime - lastTime;
        const fps = Math.round((frameCount / elapsed) * 1000);
        setRefreshRate(fps);
        return;
      }

      if (frameCount < 60) {
        rafId = requestAnimationFrame(detectRefreshRate);
      }
    };

    rafId = requestAnimationFrame(detectRefreshRate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return refreshRate;
}

/**
 * Hook для виконання callback в RAF loop
 * Автоматично адаптується до refresh rate (60/120/144 FPS)
 */
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  deps: ReadonlyArray<unknown> = EMPTY_DEPS
) {
  const frame = useRef<number>();
  const last = useRef(performance.now());
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const animate = useCallback(() => {
    const now = performance.now();
    const deltaTime = (now - last.current) / 1000;
    
    callbackRef.current(deltaTime);
    
    last.current = now;
    frame.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    frame.current = requestAnimationFrame(animate);
    return () => {
      if (frame.current) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, [animate, deps]);
}

/**
 * Hook для throttled RAF updates
 * Підтримує adaptive FPS (60/120/144)
 */
export function useRAFThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  targetFPS: number = 60 // За замовчуванням 60, але працює до 240 FPS
): T {
  const rafId = useRef<number>();
  const lastTime = useRef<number>(0);
  const frameTime = 1000 / targetFPS;

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame((time) => {
        // RAF автоматично синхронізується з refresh rate
        if (time - lastTime.current >= frameTime) {
          callback(...args);
          lastTime.current = time;
        }
      });
    },
    [callback, frameTime]
  ) as T;

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * Hook для smooth scroll з RAF
 */
export function useSmoothScroll() {
  const scrollToTop = useCallback((duration: number = 800) => {
    const start = window.pageYOffset;
    const startTime = performance.now();

    const scroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeInOutCubic)
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, start * (1 - eased));

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  }, []);

  const scrollToElement = useCallback((
    element: HTMLElement | null,
    duration: number = 800,
    offset: number = 0
  ) => {
    if (!element) return;

    const start = window.pageYOffset;
    const target = element.getBoundingClientRect().top + start - offset;
    const distance = target - start;
    const startTime = performance.now();

    const scroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, start + distance * eased);

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  }, []);

  return { scrollToTop, scrollToElement };
}
