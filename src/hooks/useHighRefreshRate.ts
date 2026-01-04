/**
 * High Refresh Rate Utilities
 * Підтримка 120Hz, 144Hz, 240Hz дисплеїв
 */

import { useEffect, useState } from 'react';

/**
 * Визначення можливостей дисплея
 */
export interface DisplayCapabilities {
  refreshRate: number;
  supportsHighRefreshRate: boolean;
  recommendedFPS: number;
}

/**
 * Hook для визначення refresh rate дисплея
 */
export function useDisplayCapabilities(): DisplayCapabilities {
  const [capabilities, setCapabilities] = useState<DisplayCapabilities>({
    refreshRate: 60,
    supportsHighRefreshRate: false,
    recommendedFPS: 60,
  });

  useEffect(() => {
    let frameCount = 0;
    let startTime = performance.now();
    let rafId: number;
    const samples: number[] = [];

    const measureRefreshRate = (currentTime: number) => {
      frameCount++;

      // Збираємо 120 семплів для точності
      if (frameCount <= 120) {
        if (frameCount > 1) {
          const delta = currentTime - startTime;
          samples.push(1000 / delta);
        }
        startTime = currentTime;
        rafId = requestAnimationFrame(measureRefreshRate);
      } else {
        // Обчислюємо медіану FPS
        samples.sort((a, b) => a - b);
        const median = samples[Math.floor(samples.length / 2)];
        
        let detectedRate = 60;
        if (median > 115) detectedRate = 120;
        else if (median > 138) detectedRate = 144;
        else if (median > 200) detectedRate = 240;

        setCapabilities({
          refreshRate: detectedRate,
          supportsHighRefreshRate: detectedRate > 60,
          recommendedFPS: detectedRate,
        });
      }
    };

    rafId = requestAnimationFrame(measureRefreshRate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return capabilities;
}

/**
 * Adaptive FPS target based on device
 */
export function useAdaptiveFPS() {
  const { refreshRate, supportsHighRefreshRate } = useDisplayCapabilities();
  const [targetFPS, setTargetFPS] = useState(60);

  useEffect(() => {
    // Для мобільних - обмежуємо до 60 FPS (економія батареї)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
      setTargetFPS(60);
    } else {
      // Для десктопа - використовуємо повний refresh rate
      setTargetFPS(refreshRate);
    }
  }, [refreshRate]);

  return {
    targetFPS,
    refreshRate,
    supportsHighRefreshRate,
    isHighPerformanceMode: !(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)),
  };
}

/**
 * Performance class based on device capabilities
 */
export type PerformanceClass = 'low' | 'medium' | 'high' | 'ultra';

export function usePerformanceClass(): PerformanceClass {
  const [perfClass, setPerfClass] = useState<PerformanceClass>('medium');
  const { refreshRate } = useDisplayCapabilities();

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const memory =
      (performance as Performance & { memory?: { jsHeapSizeLimit?: number } }).memory?.jsHeapSizeLimit || 0;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    let score = 0;

    // CPU cores
    if (cores >= 8) score += 3;
    else if (cores >= 4) score += 2;
    else score += 1;

    // Memory
    if (memory > 4000000000) score += 3; // 4GB+
    else if (memory > 2000000000) score += 2; // 2GB+
    else score += 1;

    // Refresh rate
    if (refreshRate >= 144) score += 3;
    else if (refreshRate >= 120) score += 2;
    else score += 1;

    // Mobile penalty
    if (isMobile) score -= 2;

    // Classify
    if (score >= 8) setPerfClass('ultra');
    else if (score >= 6) setPerfClass('high');
    else if (score >= 4) setPerfClass('medium');
    else setPerfClass('low');
  }, [refreshRate]);

  return perfClass;
}

/**
 * Settings recommendations based on device
 */
export function usePerformanceSettings() {
  const perfClass = usePerformanceClass();
  const { targetFPS, supportsHighRefreshRate } = useAdaptiveFPS();

  const settings = {
    low: {
      enableBlur: false,
      enableShadows: false,
      enableAnimations: false,
      imageQuality: 'low',
      maxParticles: 10,
      targetFPS: 30,
    },
    medium: {
      enableBlur: true,
      enableShadows: false,
      enableAnimations: true,
      imageQuality: 'medium',
      maxParticles: 25,
      targetFPS: 60,
    },
    high: {
      enableBlur: true,
      enableShadows: true,
      enableAnimations: true,
      imageQuality: 'high',
      maxParticles: 50,
      targetFPS: supportsHighRefreshRate ? 120 : 60,
    },
    ultra: {
      enableBlur: true,
      enableShadows: true,
      enableAnimations: true,
      imageQuality: 'ultra',
      maxParticles: 100,
      targetFPS: targetFPS,
    },
  };

  return {
    ...settings[perfClass],
    performanceClass: perfClass,
    deviceRefreshRate: targetFPS,
  };
}

/**
 * FPS Monitor Component Data
 */
export function useFPSMonitor() {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.67);
  const { refreshRate } = useDisplayCapabilities();

  useEffect(() => {
    let frames = 0;
    let lastTime = performance.now();
    let rafId: number;

    const measure = (currentTime: number) => {
      frames++;
      const delta = currentTime - lastTime;

      // Оновлюємо кожні 500ms
      if (delta >= 500) {
        const currentFPS = Math.round((frames / delta) * 1000);
        setFps(currentFPS);
        setFrameTime(delta / frames);
        frames = 0;
        lastTime = currentTime;
      }

      rafId = requestAnimationFrame(measure);
    };

    rafId = requestAnimationFrame(measure);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return {
    fps,
    frameTime,
    refreshRate,
    isOptimal: fps >= refreshRate * 0.95, // 95% від refresh rate
  };
}
