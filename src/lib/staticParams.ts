/**
 * Static Params Generation
 * Functions for generateStaticParams in Next.js pages
 */

import { fetchBackendJson } from '@/lib/backendFetch';

/**
 * Fetch popular products for static generation
 * This runs at build time only
 */
export async function getPopularProductIds(limit = 50): Promise<string[]> {
  try {
    const res = await fetchBackendJson<any>(`/products?limit=${limit}&sort=popular`, { next: { revalidate: 86400 } });
    if (!res) {
      console.warn('[Static Params] Failed to fetch popular products');
      return [];
    }

    const data = res.data;
    const products = data?.data || data?.items || data?.products || data;
    
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
    const res = await fetchBackendJson<any>(`/stores?limit=${limit}`, { next: { revalidate: 86400 } }, { preferV1: false });
    if (!res) {
      console.warn('[Static Params] Failed to fetch stores');
      return [];
    }

    const data = res.data;
    const stores = data?.data || data?.items || data?.stores || data;
    
    return stores
      .map((s: { id?: string | number }) => s?.id?.toString())
      .filter((id: string | undefined): id is string => Boolean(id && id !== 'undefined'));
  } catch (error) {
    console.error('[Static Params] Error fetching stores:', error);
    return [];
  }
}
