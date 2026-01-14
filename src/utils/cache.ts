/**
 * Simple in-memory cache for static data
 * 
 * 📝 WHY CUSTOM CACHE INSTEAD OF NEXT.JS BUILT-IN?
 * Next.js fetch cache works for API routes, but this cache is for:
 * - Client-side data that doesn't come from fetch()
 * - Complex objects that need in-memory storage
 * - Data that needs different TTL logic than Next.js revalidate
 * - Legacy compatibility during migration from SPA to SSR
 * 
 * 👀 TODO: Consider migrating to React Query cache or Next.js 15 cache APIs
 */

// 🔥 CLIENT-ONLY MODULE - DO NOT IMPORT ON SERVER
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  console.warn('cache.ts is client-only module, avoid server imports');
}

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private readonly cache = new Map<string, CacheEntry>();

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  }

  get<T = unknown>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(keyPattern?: string): void {
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
export const createCacheKey = (endpoint: string, params?: Record<string, unknown>): string => {
  const paramString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return `${endpoint}${paramString}`;
};