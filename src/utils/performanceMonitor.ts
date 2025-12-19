/**
 * Performance Monitoring Utility
 * Tracks and logs performance metrics for optimization
 */

// Performance thresholds
const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint - Good: <2.5s
  FCP: 1800, // First Contentful Paint - Good: <1.8s
  FID: 100,  // First Input Delay - Good: <100ms
  CLS: 0.1,  // Cumulative Layout Shift - Good: <0.1
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
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        this.logMetric('LCP', this.metrics.lcp, THRESHOLDS.LCP);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.logMetric('FCP', this.metrics.fcp, THRESHOLDS.FCP);
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP observer not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.logMetric('FID', this.metrics.fid, THRESHOLDS.FID);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cls = clsValue;
          }
        }
        this.logMetric('CLS', this.metrics.cls, THRESHOLDS.CLS);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observer not supported');
    }
  }

  /**
   * Log metric with color coding
   */
  private logMetric(name: string, value: number, threshold: number) {
    const status = value <= threshold ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT';
    const color = value <= threshold ? 'color: green' : 'color: orange';
    console.log(
      `%c[Performance] ${name}: ${value.toFixed(2)}ms ${status}`,
      color
    );
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
    const color = resources.length <= 60 ? 'color: green' : 'color: red';
    
    console.log(
      `%c[Performance] Network Requests: ${resources.length} ${status} (Target: ≤60)`,
      color
    );
    
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

    resources.forEach((resource) => {
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
    const jsColor = jsSize < 200 * 1024 ? 'color: green' : 'color: red';

    console.log(`%c[Performance] JavaScript: ${jsSizeKB} KB ${jsStatus} (Target: <200 KB)`, jsColor);
    console.log(`[Performance] CSS: ${(cssSize / 1024).toFixed(2)} KB`);
    console.log(`[Performance] Images: ${(imageSize / 1024).toFixed(2)} KB`);
  }

  /**
   * Generate performance report
   */
  public generateReport(): PerformanceMetrics {
    this.getTTFB();
    this.countNetworkRequests();
    this.calculateBundleSizes();

    console.group('📊 Performance Report');
    console.table(this.metrics);
    console.groupEnd();

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
      console.log('%c✅ All performance goals met!', 'color: green; font-weight: bold');
    } else {
      console.log('%c⚠️ Some performance goals not met', 'color: orange; font-weight: bold');
      console.table(goals);
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
