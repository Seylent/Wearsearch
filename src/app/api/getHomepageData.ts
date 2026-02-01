/**
 * Server-side data fetching for Homepage
 */
import type { Product } from '@/types';
import type { Banner } from '@/types/banner';
import { fetchBackendJson } from '@/lib/backendFetch';
import { getServerLanguage } from '@/utils/languageStorage';
import { logError, logInfo, logWarn } from '@/services/logger';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getRecord = (value: unknown, key: string): Record<string, unknown> | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
};

const getArray = (value: unknown, key: string): unknown[] | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return Array.isArray(nested) ? nested : undefined;
};

const toNumber = (value: unknown, fallback: number = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

// Extended SEO interface for homepage
interface ExtendedSEOData {
  title?: string;
  meta_title?: string;
  description?: string;
  meta_description?: string;
  canonical_url?: string;
  canonicalUrl?: string;
  h1_title?: string;
  content_text?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface HomepageAPIResponse {
  featuredProducts: Product[];
  newProducts: Product[];
  popularProducts: Product[];
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    productCount: number;
  }>;
  banners: Banner[];
  seoData: ExtendedSEOData | null;
  stats: {
    totalProducts: number;
    totalBrands: number;
    totalCategories: number;
  };
}

export async function getHomepageData(): Promise<HomepageAPIResponse> {
  try {
    const lang = await getServerLanguage();

    // Try BFF endpoint first (single request for all data)
    try {
      const bff = await fetchBackendJson<unknown>(`/pages/home?lang=${encodeURIComponent(lang)}`, {
        next: { revalidate: 1800 },
      });

      if (bff) {
        const response = isRecord(bff) ? bff.data : undefined;
        logInfo('BFF homepage data received', {
          component: 'getHomepageData',
          action: 'BFF_SUCCESS',
        });

        // BFF returns: { success: true, data: { products, brands, statistics, banners } }
        const data = getRecord(response, 'data') ?? (isRecord(response) ? response : undefined);
        const products = (getArray(data, 'products') ?? []) as Product[];
        const categories = (getArray(data, 'categories') ??
          []) as HomepageAPIResponse['categories'];
        let banners = (getArray(data, 'banners') ?? []) as Banner[];
        const stats = getRecord(data, 'statistics') ?? getRecord(data, 'stats') ?? {};

        if (!Array.isArray(banners) || banners.length === 0) {
          const bannersRes = await fetchBackendJson<unknown>(`/banners`, {
            next: { revalidate: 600 },
          });
          const bannersPayload = isRecord(bannersRes) ? bannersRes.data : undefined;
          const fetchedBanners = (getArray(getRecord(bannersPayload, 'data'), 'banners') ??
            getArray(bannersPayload, 'banners') ??
            getArray(bannersPayload, 'items') ??
            (Array.isArray(bannersPayload) ? bannersPayload : [])) as Banner[];
          banners = fetchedBanners;
        }

        if (process.env.NODE_ENV === 'development') {
          logInfo(`Products loaded: ${products.length}`, {
            component: 'getHomepageData',
            action: 'BFF_PRODUCTS',
          });
          logInfo(`Banners loaded: ${banners.length}`, {
            component: 'getHomepageData',
            action: 'BFF_BANNERS',
          });
        }

        // Fetch SEO data separately
        let seoData: ExtendedSEOData | null = null;
        try {
          const seoRes = await fetchBackendJson<unknown>(
            `/seo/home/home?lang=${encodeURIComponent(lang)}`,
            {
              next: { revalidate: 86400 },
            }
          );
          if (seoRes) {
            const seoResponse = isRecord(seoRes) ? seoRes.data : undefined;
            seoData = (getRecord(seoResponse, 'item') ?? seoResponse) as ExtendedSEOData | null;
            logInfo(`SEO data loaded: ${seoData?.h1_title || 'No title'}`, {
              component: 'getHomepageData',
              action: 'SEO_LOADED',
            });
          }
        } catch {
          logWarn('SEO data not available', {
            component: 'getHomepageData',
            action: 'SEO_MISSING',
          });
        }

        return {
          featuredProducts: products.slice(0, 8),
          newProducts: products.slice(0, 8),
          popularProducts: products.slice(0, 8),
          categories,
          banners,
          seoData,
          stats: {
            totalProducts: toNumber(stats.total_products, 0),
            totalBrands: toNumber(stats.total_brands, 0),
            totalCategories: toNumber(stats.total_categories, 0),
          },
        };
      }
    } catch {
      if (process.env.NODE_ENV === 'development') {
        logWarn('BFF endpoint not available, falling back to individual calls', {
          component: 'getHomepageData',
          action: 'BFF_FALLBACK',
        });
      }
    }

    // Fallback: Parallel requests for better performance
    const [productsRes, categoriesRes, statsRes, bannersRes] = await Promise.all([
      fetchBackendJson<unknown>(
        `/products/popular-saved?limit=12&lang=${encodeURIComponent(lang)}`,
        {
          next: { revalidate: 3600 },
        }
      ),
      fetchBackendJson<unknown>(`/categories?limit=12&lang=${encodeURIComponent(lang)}`, {
        next: { revalidate: 7200 },
      }),
      fetchBackendJson<unknown>(`/statistics`, { next: { revalidate: 3600 } }),
      fetchBackendJson<unknown>(`/banners`, { next: { revalidate: 600 } }),
    ]);

    // Process results with fallbacks
    const productsPayload = isRecord(productsRes) ? productsRes.data : undefined;
    const products: Product[] = (getArray(productsPayload, 'items') ??
      getArray(productsPayload, 'products') ??
      getArray(getRecord(productsPayload, 'data'), 'products') ??
      (Array.isArray(productsPayload) ? productsPayload : [])) as Product[];

    logInfo(`Products loaded: ${products.length}`, {
      component: 'getHomepageData',
      action: 'FALLBACK_PRODUCTS',
    });

    const categoriesPayload = isRecord(categoriesRes) ? categoriesRes.data : undefined;
    const categories = (getArray(categoriesPayload, 'categories') ??
      getArray(getRecord(categoriesPayload, 'data'), 'categories') ??
      getArray(categoriesPayload, 'items') ??
      (Array.isArray(categoriesPayload) ? categoriesPayload : [])) as Array<{
      id: string;
      name: string;
      slug: string;
      imageUrl?: string;
      productCount: number;
    }>;

    const statsPayload = isRecord(statsRes) ? statsRes.data : undefined;
    const stats = (getRecord(statsPayload, 'stats') ??
      (isRecord(statsPayload) ? statsPayload : undefined) ?? {
        totalProducts: 0,
        totalBrands: 0,
        totalCategories: 0,
      }) as {
      totalProducts: number;
      totalBrands: number;
      totalCategories: number;
    };

    const bannersPayload = isRecord(bannersRes) ? bannersRes.data : undefined;
    const banners = (getArray(getRecord(bannersPayload, 'data'), 'banners') ??
      getArray(bannersPayload, 'banners') ??
      getArray(bannersPayload, 'items') ??
      (Array.isArray(bannersPayload) ? bannersPayload : [])) as Banner[];

    // If no products loaded, log warning
    if (products.length === 0) {
      logWarn('No products loaded from API. Check backend connection.', {
        component: 'getHomepageData',
        action: 'NO_PRODUCTS',
      });
    }

    return {
      featuredProducts: products.slice(0, 8),
      newProducts: products.slice(0, 8),
      popularProducts: products.slice(0, 8),
      categories,
      banners,
      seoData: null,
      stats,
    };
  } catch (error) {
    logError('Error fetching homepage data', {
      component: 'getHomepageData',
      action: 'FETCH_ERROR',
      metadata: { error },
    });

    // Return empty data as fallback
    return {
      featuredProducts: [],
      newProducts: [],
      popularProducts: [],
      categories: [],
      banners: [],
      seoData: null,
      stats: {
        totalProducts: 0,
        totalBrands: 0,
        totalCategories: 0,
      },
    };
  }
}

/**
 * Fallback data for development/testing
 */
export function getMockHomepageData(): HomepageAPIResponse {
  return {
    featuredProducts: [],
    newProducts: [],
    popularProducts: [],
    categories: [
      { id: '1', name: 'Clothing', slug: 'clothing', productCount: 150 },
      { id: '2', name: 'Shoes', slug: 'shoes', productCount: 89 },
      { id: '3', name: 'Accessories', slug: 'accessories', productCount: 45 },
    ],
    banners: [],
    seoData: {
      title: 'WearSearch - Find Your Perfect Style',
      description:
        'Discover the latest fashion trends and products from top brands. ' +
        'Shop clothing, shoes, and accessories with fast shipping.',
      keywords: 'fashion, clothing, shoes, accessories, style',
      canonicalUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com',
      ogTitle: 'WearSearch - Find Your Perfect Style',
      ogDescription: 'Discover the latest fashion trends and products from top brands.',
      ogImage: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/images/og-homepage.jpg`,
    },
    stats: {
      totalProducts: 0,
      totalBrands: 0,
      totalCategories: 3,
    },
  };
}
