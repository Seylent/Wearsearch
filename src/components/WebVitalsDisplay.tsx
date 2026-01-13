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
  // Disabled - not needed in production or development
  return null;
};
