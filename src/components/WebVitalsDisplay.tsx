/**
 * Web Vitals Display Component
 * Shows real-time Core Web Vitals metrics in development
 */

import { useState, useEffect } from 'react';
import { getWebVitalsSnapshot } from '@/utils/webVitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export const WebVitalsDisplay = () => {
  const [vitals, setVitals] = useState<Record<string, VitalMetric>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    // Fetch vitals every 2 seconds
    const interval = setInterval(async () => {
      const snapshot = await getWebVitalsSnapshot();
      setVitals(snapshot);
    }, 2000);

    // Initial fetch
    getWebVitalsSnapshot().then(setVitals);

    return () => clearInterval(interval);
  }, []);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null;
  if (!isVisible && Object.keys(vitals).length === 0) return null;

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-400';
      case 'needs-improvement': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRatingEmoji = (rating: string) => {
    switch (rating) {
      case 'good': return '✅';
      case 'needs-improvement': return '⚠️';
      case 'poor': return '❌';
      default: return '❓';
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black/90 text-white px-3 py-2 rounded-lg text-xs font-mono hover:bg-black/95 transition-colors border border-white/20"
        title="Toggle Web Vitals"
      >
        📊 Vitals
      </button>

      {isVisible && (
        <div className="mt-2 bg-black/90 text-white p-4 rounded-lg text-xs font-mono border border-white/20 space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
            <span className="font-bold">Core Web Vitals</span>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          {Object.values(vitals).map((vital) => (
            <div key={vital.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{getRatingEmoji(vital.rating)}</span>
                <span className="text-white/80">{vital.name}:</span>
              </div>
              <span className={getRatingColor(vital.rating)}>
                {formatValue(vital.name, vital.value)}
              </span>
            </div>
          ))}

          <div className="pt-2 mt-2 border-t border-white/20 text-[10px] text-white/40">
            <div>✅ Good | ⚠️ Needs Work | ❌ Poor</div>
          </div>
        </div>
      )}
    </div>
  );
};
