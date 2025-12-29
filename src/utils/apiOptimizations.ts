/**
 * API Request Batching and Caching Utilities
 * Reduces redundant API calls and improves performance
 */

import { api } from './api';
import { logError } from '@/services/logger';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get data from cache if valid
 */
export const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[Cache HIT] ${key}`);
    return cached.data as T;
  }
  console.log(`[Cache MISS] ${key}`);
  return null;
};

/**
 * Set data in cache
 */
export const setCachedData = (key: string, data: any): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Clear cache for a specific key or all cache
 */
export const clearCache = (key?: string): void => {
  if (key) {
    cache.delete(key);
    console.log(`[Cache CLEAR] ${key}`);
  } else {
    cache.clear();
    console.log('[Cache CLEAR] All cache cleared');
  }
};

/**
 * Batch multiple API requests and execute them in parallel
 */
export const batchRequests = async <T extends Record<string, any>>(
  requests: Record<keyof T, () => Promise<any>>
): Promise<T> => {
  console.log(`[Batch Request] Starting ${Object.keys(requests).length} parallel requests`);
  const startTime = performance.now();

  const entries = Object.entries(requests);
  const promises = entries.map(([key, fn]) => 
    fn().then(result => ({ key, result })).catch(error => ({ key, error }))
  );

  const results = await Promise.allSettled(promises);
  const data = {} as T;

  results.forEach((result, index) => {
    const key = entries[index][0];
    if (result.status === 'fulfilled') {
      const { result: apiResult, error } = result.value;
      if (error) {
        logError(error, { component: 'batchRequest', action: key });
        data[key as keyof T] = null;
      } else {
        data[key as keyof T] = apiResult;
      }
    } else {
      logError(result.reason, { component: 'batchRequest', action: `FAILED_${key}` });
      data[key as keyof T] = null;
    }
  });

  const endTime = performance.now();
  console.log(`[Batch Request] Completed in ${(endTime - startTime).toFixed(2)}ms`);

  return data;
};

/**
 * Fetch with caching
 */
export const fetchWithCache = async <T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_DURATION
): Promise<T> => {
  // Check cache first
  const cached = getCachedData<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();
  setCachedData(cacheKey, data);

  return data;
};

/**
 * Debounce function for search/filter inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Throttle function for scroll/resize events
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Prefetch data for better UX
 */
export const prefetchData = async (
  endpoint: string,
  cacheKey?: string
): Promise<void> => {
  const key = cacheKey || endpoint;
  
  // Don't prefetch if already cached
  if (getCachedData(key)) {
    console.log(`[Prefetch] Already cached: ${key}`);
    return;
  }

  try {
    console.log(`[Prefetch] Loading: ${endpoint}`);
    const response = await api.get(endpoint);
    setCachedData(key, response.data);
    console.log(`[Prefetch] Cached: ${key}`);
  } catch (error) {
    logError(error as Error, { component: 'prefetch', action: endpoint });
  }
};
