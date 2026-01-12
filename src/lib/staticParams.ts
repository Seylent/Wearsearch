/**
 * Static Params Generation
 * Functions for generateStaticParams in Next.js pages
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetch popular products for static generation
 * This runs at build time only
 */
export async function getPopularProductIds(limit = 50): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/api/v1/products?limit=${limit}&sort=popular`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      console.warn('[Static Params] Failed to fetch popular products:', response.status);
      return [];
    }
    
    const data = await response.json();
    const products = data?.data || data?.items || [];
    
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
    const response = await fetch(`${API_URL}/api/v1/stores?limit=${limit}`, {
      next: { revalidate: 86400 }
    });
    
    if (!response.ok) {
      console.warn('[Static Params] Failed to fetch stores:', response.status);
      return [];
    }
    
    const data = await response.json();
    const stores = data?.data || data?.items || [];
    
    return stores
      .map((s: { id?: string | number }) => s?.id?.toString())
      .filter((id: string | undefined): id is string => Boolean(id && id !== 'undefined'));
  } catch (error) {
    console.error('[Static Params] Error fetching stores:', error);
    return [];
  }
}
