import { useEffect, useState } from 'react';
import { uploadService, type UploadResponse } from '@/services/uploadService';

type CacheEntry = {
  url: string;
  expiresAt?: number;
  fetchedAt: number;
};

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<UploadResponse>>();
const refreshBufferMs = 30000;

const normalizeExpiry = (response: UploadResponse): number | undefined => {
  if (typeof response.expiresAt === 'number') return response.expiresAt;
  if (typeof response.expiresIn === 'number') {
    return Date.now() + response.expiresIn * 1000;
  }
  return undefined;
};

const getCached = (key: string): CacheEntry | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (!entry.expiresAt) return entry;
  if (Date.now() < entry.expiresAt - 1000) return entry;
  return null;
};

const setCached = (key: string, response: UploadResponse) => {
  cache.set(key, {
    url: response.url,
    expiresAt: normalizeExpiry(response),
    fetchedAt: Date.now(),
  });
};

const fetchPresigned = (key: string) => {
  const existing = inflight.get(key);
  if (existing) return existing;

  const request = uploadService
    .getImageUrl(key)
    .then(result => {
      setCached(key, result);
      return result;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
};

const isDirectUrl = (value: string) =>
  value.startsWith('http://') ||
  value.startsWith('https://') ||
  value.startsWith('/') ||
  value.startsWith('data:') ||
  value.startsWith('blob:');

export const usePresignedImage = (source?: string) => {
  const [resolvedUrl, setResolvedUrl] = useState(() =>
    source && isDirectUrl(source) ? source : ''
  );

  useEffect(() => {
    let isActive = true;
    let refreshTimeout: number | null = null;

    const scheduleRefresh = (expiresAt?: number) => {
      if (!expiresAt) return;
      const ttl = expiresAt - Date.now();
      if (ttl <= 0) return;
      const refreshIn = Math.max(ttl - refreshBufferMs, 1000);
      refreshTimeout = window.setTimeout(() => {
        resolveUrl();
      }, refreshIn);
    };

    const resolveUrl = async () => {
      if (!source) {
        if (isActive) setResolvedUrl('');
        return;
      }

      if (isDirectUrl(source)) {
        if (isActive) setResolvedUrl(source);
        return;
      }

      const cached = getCached(source);
      if (cached) {
        if (isActive) setResolvedUrl(cached.url);
        scheduleRefresh(cached.expiresAt);
        return;
      }

      try {
        const result = await fetchPresigned(source);
        if (!isActive) return;
        setResolvedUrl(result.url);
        scheduleRefresh(normalizeExpiry(result));
      } catch {
        if (isActive) setResolvedUrl('');
      }
    };

    resolveUrl();

    return () => {
      isActive = false;
      if (refreshTimeout) {
        window.clearTimeout(refreshTimeout);
      }
    };
  }, [source]);

  return resolvedUrl;
};

export const usePresignedImages = (sources: string[]) => {
  const [resolvedUrls, setResolvedUrls] = useState<string[]>([]);

  useEffect(() => {
    let isActive = true;
    let refreshTimeout: number | null = null;

    const resolveAll = async () => {
      if (!sources.length) {
        if (isActive) setResolvedUrls([]);
        return;
      }

      const refreshTimes: number[] = [];
      const resolved = await Promise.all(
        sources.map(async source => {
          if (!source) return '';
          if (isDirectUrl(source)) return source;

          const cached = getCached(source);
          if (cached) {
            if (cached.expiresAt) refreshTimes.push(cached.expiresAt - Date.now());
            return cached.url;
          }

          try {
            const result = await fetchPresigned(source);
            const expiresAt = normalizeExpiry(result);
            if (expiresAt) refreshTimes.push(expiresAt - Date.now());
            return result.url;
          } catch {
            return '';
          }
        })
      );

      if (!isActive) return;
      setResolvedUrls(resolved);

      const nextRefresh = refreshTimes.length > 0 ? Math.min(...refreshTimes) : null;
      if (nextRefresh && nextRefresh > 0) {
        const refreshIn = Math.max(nextRefresh - refreshBufferMs, 1000);
        refreshTimeout = window.setTimeout(resolveAll, refreshIn);
      }
    };

    resolveAll();

    return () => {
      isActive = false;
      if (refreshTimeout) {
        window.clearTimeout(refreshTimeout);
      }
    };
  }, [sources]);

  return resolvedUrls;
};
