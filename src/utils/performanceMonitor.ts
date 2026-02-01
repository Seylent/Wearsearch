/**
 * Performance Monitoring Utility
 * Tracks and logs performance metrics for optimization
 *
 * 📝 WHY CUSTOM PERFORMANCE MONITORING?
 * While Next.js has built-in Web Vitals reporting, this utility provides:
 * - Custom thresholds specific to our app
 * - Detailed breakdown of resource sizes
 * - Integration with our logging system
 * - Real-time monitoring in development
 *
 * 👀 TODO: Consider migrating to Next.js 15 built-in monitoring or Vercel Analytics
 *
 * 🔥 CLIENT-ONLY MODULE - DO NOT IMPORT ON SERVER
 */

import { logInfo, logWarn } from '@/services/logger';

// Runtime guard
if (typeof window === 'undefined') {
  logWarn('performanceMonitor.ts is client-only, avoid server imports', {
    component: 'performanceMonitor',
    action: 'SERVER_IMPORT',
  });
}

// Performance thresholds
const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint - Good: <2.5s
  FCP: 1800, // First Contentful Paint - Good: <1.8s
  FID: 100, // First Input Delay - Good: <100ms
  CLS: 0.1, // Cumulative Layout Shift - Good: <0.1
  TTFB: 600, // Time to First Byte - Good: <600ms
};

interface PerformanceMetrics {
  lcp?: number;
  fcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  networkRequests?: number;
  jsSize?: number;
  cssSize?: number;
  imageSize?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observer: PerformanceObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  /**
   * Initialize Performance Observers
   */
  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as LargestContentfulPaint | undefined;
        this.metrics.lcp = lastEntry ? lastEntry.renderTime || lastEntry.loadTime : undefined;
        this.logMetric('LCP', this.metrics.lcp, THRESHOLDS.LCP);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {
      console.warn('LCP observer not supported');
    }

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.logMetric('FCP', this.metrics.fcp, THRESHOLDS.FCP);
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch {
      console.warn('FCP observer not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if ('processingStart' in entry && typeof entry.processingStart === 'number') {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.logMetric('FID', this.metrics.fid, THRESHOLDS.FID);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType !== 'layout-shift') continue;
          const layoutEntry = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
          if (!layoutEntry.hadRecentInput && typeof layoutEntry.value === 'number') {
            clsValue += layoutEntry.value;
            this.metrics.cls = clsValue;
          }
        }
        this.logMetric('CLS', this.metrics.cls, THRESHOLDS.CLS);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch {
      logWarn('CLS observer not supported', {
        component: 'performanceMonitor',
        action: 'CLS_UNSUPPORTED',
      });
    }
  }

  /**
   * Log metric with color coding
   */
  private logMetric(name: string, value: number, threshold: number) {
    const status = value <= threshold ? 'GOOD' : 'NEEDS_IMPROVEMENT';
    logInfo(`[Performance] ${name}: ${value.toFixed(2)}ms ${status}`, {
      component: 'performanceMonitor',
      action: 'METRIC',
      metadata: { name, value, threshold, status },
    });
  }

  /**
   * Get Time to First Byte (TTFB)
   */
  public getTTFB(): number {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
      this.logMetric('TTFB', this.metrics.ttfb, THRESHOLDS.TTFB);
      return this.metrics.ttfb;
    }
    return 0;
  }

  /**
   * Count network requests
   */
  public countNetworkRequests(): number {
    const resources = performance.getEntriesByType('resource');
    this.metrics.networkRequests = resources.length;

    const status = resources.length <= 60 ? '✅ GOOD' : '⚠️ TOO MANY';

    logInfo(`[Performance] Network Requests: ${resources.length} ${status} (Target: ≤60)`, {
      component: 'performanceMonitor',
      action: 'NETWORK_REQUESTS',
      metadata: { count: resources.length, status },
    });

    return resources.length;
  }

  /**
   * Calculate bundle sizes
   */
  public calculateBundleSizes(): void {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;

    resources.forEach(resource => {
      const size = resource.transferSize || 0;

      if (resource.name.endsWith('.js')) {
        jsSize += size;
      } else if (resource.name.endsWith('.css')) {
        cssSize += size;
      } else if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(resource.name)) {
        imageSize += size;
      }
    });

    this.metrics.jsSize = jsSize;
    this.metrics.cssSize = cssSize;
    this.metrics.imageSize = imageSize;

    const jsSizeKB = (jsSize / 1024).toFixed(2);
    const jsStatus = jsSize < 200 * 1024 ? '✅ GOOD' : '⚠️ TOO LARGE';

    logInfo(`[Performance] JavaScript: ${jsSizeKB} KB ${jsStatus} (Target: <200 KB)`, {
      component: 'performanceMonitor',
      action: 'BUNDLE_JS',
      metadata: { jsSize, jsStatus },
    });
    logInfo(`[Performance] CSS: ${(cssSize / 1024).toFixed(2)} KB`, {
      component: 'performanceMonitor',
      action: 'BUNDLE_CSS',
      metadata: { cssSize },
    });
    logInfo(`[Performance] Images: ${(imageSize / 1024).toFixed(2)} KB`, {
      component: 'performanceMonitor',
      action: 'BUNDLE_IMAGES',
      metadata: { imageSize },
    });
  }

  /**
   * Generate performance report
   */
  public generateReport(): PerformanceMetrics {
    this.getTTFB();
    this.countNetworkRequests();
    this.calculateBundleSizes();

    logInfo('Performance Report', {
      component: 'performanceMonitor',
      action: 'REPORT',
      metadata: { metrics: this.metrics },
    });

    return { ...this.metrics };
  }

  /**
   * Check if performance goals are met
   */
  public checkPerformanceGoals(): boolean {
    const goals = {
      networkRequests: (this.metrics.networkRequests || 0) <= 60,
      jsSize: (this.metrics.jsSize || 0) < 200 * 1024,
      lcp: (this.metrics.lcp || 0) < THRESHOLDS.LCP,
    };

    const allGoalsMet = Object.values(goals).every(Boolean);

    if (allGoalsMet) {
      logInfo('All performance goals met', {
        component: 'performanceMonitor',
        action: 'GOALS_OK',
      });
    } else {
      logWarn('Some performance goals not met', {
        component: 'performanceMonitor',
        action: 'GOALS_FAIL',
        metadata: { goals },
      });
    }

    return allGoalsMet;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-generate report after page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.generateReport();
      performanceMonitor.checkPerformanceGoals();
    }, 3000); // Wait 3s for all metrics to stabilize
  });
}
