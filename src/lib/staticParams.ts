/**
 * Static Params Generation
 * Functions for generateStaticParams in Next.js pages
 */

import { fetchBackendJson } from '@/lib/backendFetch';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getArray = (value: unknown, key: string): unknown[] | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return Array.isArray(nested) ? nested : undefined;
};

/**
 * Fetch popular products for static generation
 * This runs at build time only
 */
export async function getPopularProductIds(limit = 50): Promise<string[]> {
  try {
    const res = await fetchBackendJson<unknown>(`/products?limit=${limit}&sort=popular`, {
      next: { revalidate: 86400 },
    });
    if (!res) {
      console.warn('[Static Params] Failed to fetch popular products');
      return [];
    }

    const data = isRecord(res) ? res.data : undefined;
    const products =
      getArray(data, 'data') ??
      getArray(data, 'items') ??
      getArray(data, 'products') ??
      (Array.isArray(data) ? data : []);

    return products
      .map((p: { id?: string | number }) => p?.id?.toString())
      .filter((id: string | undefined): id is string => Boolean(id && id !== 'undefined'));
  } catch (error) {
    console.error('[Static Params] Error fetching popular products:', error);
    return [];
  }
}

/**
 * Fetch popular stores for static generation
 */
export async function getPopularStoreIds(limit = 30): Promise<string[]> {
  try {
    const res = await fetchBackendJson<unknown>(
      `/stores?limit=${limit}`,
      { next: { revalidate: 86400 } },
      { preferV1: false }
    );
    if (!res) {
      console.warn('[Static Params] Failed to fetch stores');
      return [];
    }

    const data = isRecord(res) ? res.data : undefined;
    const stores =
      getArray(data, 'data') ??
      getArray(data, 'items') ??
      getArray(data, 'stores') ??
      (Array.isArray(data) ? data : []);

    return stores
      .map((s: { id?: string | number }) => s?.id?.toString())
      .filter((id: string | undefined): id is string => Boolean(id && id !== 'undefined'));
  } catch (error) {
    console.error('[Static Params] Error fetching stores:', error);
    return [];
  }
}
