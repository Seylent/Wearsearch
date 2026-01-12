/**
 * Simple in-memory cache for static data
 * Helps reduce API calls for frequently accessed data
 */

class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(keyPattern?: string) {
    if (keyPattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(keyPattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== null && (Date.now() - entry.timestamp <= entry.ttl);
  }
}

export const apiCache = new SimpleCache();

// Helper function to create cache keys
export const createCacheKey = (endpoint: string, params?: Record<string, any>) => {
  const paramString = params ? `?${new URLSearchParams(params).toString()}` : '';
  return `${endpoint}${paramString}`;
};