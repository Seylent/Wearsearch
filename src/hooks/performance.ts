/**
 * Performance Hooks
 * Export all performance-related hooks
 */

export { useIntersectionObserver, useLazyLoad } from './useIntersectionObserver';
export { usePassiveEvent, usePassiveScroll, usePassiveTouch } from './usePassiveEvent';
export { 
  useAnimationFrame, 
  useRAFThrottle, 
  useSmoothScroll,
  useRefreshRate 
} from './useAnimationFrame';
export { 
  useDisplayCapabilities,
  useAdaptiveFPS,
  usePerformanceClass,
  usePerformanceSettings,
  useFPSMonitor 
} from './useHighRefreshRate';

export type { DisplayCapabilities, PerformanceClass } from './useHighRefreshRate';
