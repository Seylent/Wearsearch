/**
 * Backend fetch helpers (server-side)
 *
 * Problem this solves:
 * - The codebase mixes `/api/*` and `/api/v1/*` in many server components.
 * - Different endpoints return different envelope shapes.
 * - Some environments expose only one of the two prefixes.
 *
 * This helper provides:
 * - A single backend origin
 * - A safe fetch that tries `/api/v1` first, then falls back to `/api`
 */

import { getApiUrl } from '@/config/api.config';

export const getBackendOrigin = (): string => {
  return getApiUrl();
};

type FetchBackendOptions = {
  preferV1?: boolean;
};

const joinUrl = (origin: string, path: string): string => {
  const o = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${o}${p}`;
};

/**
 * Fetch JSON from backend. `apiPath` is the path AFTER the `/api` prefix.
 * Example: apiPath="/products?limit=20"
 */
export async function fetchBackendJson<T = unknown>(
  apiPath: string,
  init?: RequestInit,
  options: FetchBackendOptions = {}
): Promise<{ data: T; url: string; status: number } | null> {
  const origin = getBackendOrigin();
  if (!origin) return null;
  const preferV1 = options.preferV1 ?? true;

  const candidates = preferV1
    ? [joinUrl(origin, `/api/v1${apiPath}`), joinUrl(origin, `/api${apiPath}`)]
    : [joinUrl(origin, `/api${apiPath}`), joinUrl(origin, `/api/v1${apiPath}`)];

  let lastStatus = 0;
  for (const url of candidates) {
    try {
      const res = await fetch(url, init);
      lastStatus = res.status;
      if (!res.ok) {
        // Only fall back on 404/405 (route mismatch). For other errors return null.
        if (res.status === 404 || res.status === 405) continue;
        return null;
      }

      const data = (await res.json()) as T;
      return { data, url, status: res.status };
    } catch {
      // network error: try next candidate
      continue;
    }
  }

  void lastStatus;
  return null;
}
