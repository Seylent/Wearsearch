/**
 * Web Vitals Monitoring
 * Track Core Web Vitals (LCP, INP, CLS, FCP, TTFB) for performance monitoring
 *
 * Core Web Vitals:
 * - LCP (Largest Contentful Paint): Loading performance (< 2.5s good)
 * - INP (Interaction to Next Paint): Interactivity (< 200ms good) - replaces FID
 * - CLS (Cumulative Layout Shift): Visual stability (< 0.1 good)
 *
 * Additional metrics:
 * - FCP (First Contentful Paint): < 1.8s good
 * - TTFB (Time to First Byte): < 800ms good
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { logInfo } from '@/services/logger';

type GtagFn = (command: 'event', eventName: string, params: Record<string, unknown>) => void;

function hasGtag(win: Window): win is Window & { gtag: GtagFn } {
  return 'gtag' in win && typeof (win as Record<string, unknown>).gtag === 'function';
}

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * Determine rating based on metric thresholds
 */
function getMetricRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const { name, value } = metric;

  switch (name) {
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'INP':
      return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    default:
      return 'needs-improvement';
  }
}

/**
 * Format metric for console logging
 */
function formatMetric(metric: VitalMetric): string {
  const emoji =
    metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
  const formattedValue =
    metric.name === 'CLS' ? metric.value.toFixed(3) : `${Math.round(metric.value)}ms`;

  return `${emoji} ${metric.name}: ${formattedValue} (${metric.rating})`;
}

/**
 * Handle metric reporting
 */
function handleMetric(metric: Metric) {
  const vital: VitalMetric = {
    name: metric.name,
    value: metric.value,
    rating: getMetricRating(metric),
    delta: metric.delta,
    id: metric.id,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    logInfo(formatMetric(vital), {
      component: 'webVitals',
      action: 'METRIC',
      metadata: { vital },
    });
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    const sent = trySendToAnalytics(vital);
    if (!sent) {
      pendingVitals.push(vital);
      if (pendingVitals.length > 20) pendingVitals.shift();
    }
  }
}

/**
 * Send metrics to analytics service
 * Replace with your analytics implementation
 */
const pendingVitals: VitalMetric[] = [];

function trySendToAnalytics(metric: VitalMetric): boolean {
  if (typeof window === 'undefined') return false;

  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push({
      event: 'web_vital',
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating,
      metric_delta: metric.delta,
      metric_id: metric.id,
      page: window.location.pathname,
    });
    return true;
  }

  if (hasGtag(window)) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      metric_delta: Math.round(metric.delta),
      metric_id: metric.id,
      non_interaction: true,
    });
    return true;
  }

  return false;
}

export function flushPendingVitals(): void {
  if (pendingVitals.length === 0) return;

  const remaining: VitalMetric[] = [];
  for (const metric of pendingVitals) {
    if (!trySendToAnalytics(metric)) remaining.push(metric);
  }
  pendingVitals.length = 0;
  pendingVitals.push(...remaining);
}

/**
 * Initialize Web Vitals monitoring
 * Call this once in your app entry point
 */
export function initWebVitals() {
  // Track all Core Web Vitals
  onLCP(handleMetric);
  onINP(handleMetric);
  onCLS(handleMetric);

  // Track additional performance metrics
  onFCP(handleMetric);
  onTTFB(handleMetric);

  if (process.env.NODE_ENV === 'development') {
    logInfo('Web Vitals monitoring initialized', {
      component: 'webVitals',
      action: 'INIT',
    });
  }
}

/**
 * Get current Web Vitals snapshot
 * Useful for debugging or displaying in UI
 */
export async function getWebVitalsSnapshot(): Promise<Record<string, VitalMetric>> {
  const vitals: Record<string, VitalMetric> = {};

  const handleSnapshot = (metric: Metric) => {
    vitals[metric.name] = {
      name: metric.name,
      value: metric.value,
      rating: getMetricRating(metric),
      delta: metric.delta,
      id: metric.id,
    };
  };

  // Get current values
  onLCP(handleSnapshot);
  onINP(handleSnapshot);
  onCLS(handleSnapshot);
  onFCP(handleSnapshot);
  onTTFB(handleSnapshot);

  // Wait a bit for metrics to be collected
  await new Promise(resolve => setTimeout(resolve, 100));

  return vitals;
}

/**
 * Check if all vitals are "good"
 */
export async function areVitalsGood(): Promise<boolean> {
  const vitals = await getWebVitalsSnapshot();
  return Object.values(vitals).every(v => v.rating === 'good');
}
