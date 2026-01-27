/**
 * Server-side data fetching for Homepage
 */
import type { Product } from '@/types';
import type { Banner } from '@/types/banner';
import { fetchBackendJson } from '@/lib/backendFetch';

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
    // Try BFF endpoint first (single request for all data)
    try {
      const bff = await fetchBackendJson<any>(`/pages/home`, {
        next: { revalidate: 1800 },
      });

      if (bff) {
        const response = bff.data;
        console.log('✅ BFF homepage data received');

        // BFF returns: { success: true, data: { products, brands, statistics, banners } }
        const data = response.data || response;
        const products = data.products || [];
        const categories = data.categories || [];
        let banners = data.banners || [];
        const stats = data.statistics || data.stats || {};

        if (!Array.isArray(banners) || banners.length === 0) {
          const bannersRes = await fetchBackendJson<any>(`/banners`, {
            next: { revalidate: 600 },
          });
          const bannersPayload = bannersRes?.data;
          const fetchedBanners = (
            bannersPayload?.data?.banners && Array.isArray(bannersPayload.data.banners)
              ? bannersPayload.data.banners
              : bannersPayload?.banners && Array.isArray(bannersPayload.banners)
                ? bannersPayload.banners
                : bannersPayload?.items && Array.isArray(bannersPayload.items)
                  ? bannersPayload.items
                  : Array.isArray(bannersPayload)
                    ? bannersPayload
                    : []
          ) as Banner[];
          banners = fetchedBanners;
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('📦 Products loaded:', products.length);
          console.log('🎨 Banners loaded:', banners.length);
        }

        // Fetch SEO data separately
        let seoData: ExtendedSEOData | null = null;
        try {
          const seoRes = await fetchBackendJson<any>(`/seo/home/home`, {
            next: { revalidate: 86400 },
          });
          if (seoRes) {
            const seoResponse = seoRes.data;
            seoData = seoResponse.item || seoResponse;
            console.log('📝 SEO data loaded:', seoData?.h1_title || 'No title');
          }
        } catch (_seoError: unknown) {
          console.log('⚠️ SEO data not available');
        }

        return {
          featuredProducts: products.slice(0, 8),
          newProducts: products.slice(0, 8),
          popularProducts: products.slice(0, 8),
          categories,
          banners,
          seoData,
          stats: {
            totalProducts: stats.total_products || 0,
            totalBrands: stats.total_brands || 0,
            totalCategories: stats.total_categories || 0,
          },
        };
      }
    } catch (_bffError) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ BFF endpoint not available, falling back to individual calls');
      }
    }

    // Fallback: Parallel requests for better performance
    const [productsRes, categoriesRes, statsRes, bannersRes] = await Promise.all([
      fetchBackendJson<any>(`/products/popular?limit=12`, { next: { revalidate: 3600 } }),
      fetchBackendJson<any>(`/categories?limit=12`, { next: { revalidate: 7200 } }),
      fetchBackendJson<any>(`/statistics`, { next: { revalidate: 3600 } }),
      fetchBackendJson<any>(`/banners`, { next: { revalidate: 600 } }),
    ]);

    // Process results with fallbacks
    const productsPayload = productsRes?.data;
    const products: Product[] = (productsPayload?.products ||
      productsPayload?.data?.products ||
      productsPayload?.items ||
      productsPayload ||
      []) as Product[];

    console.log('✅ Products loaded:', products.length);

    const categoriesPayload = categoriesRes?.data;
    const categories = (categoriesPayload?.categories ||
      categoriesPayload?.data?.categories ||
      categoriesPayload?.items ||
      categoriesPayload ||
      []) as Array<{
      id: string;
      name: string;
      slug: string;
      imageUrl?: string;
      productCount: number;
    }>;

    const statsPayload = statsRes?.data;
    const stats = (statsPayload?.stats ||
      statsPayload || { totalProducts: 0, totalBrands: 0, totalCategories: 0 }) as {
      totalProducts: number;
      totalBrands: number;
      totalCategories: number;
    };

    const bannersPayload = bannersRes?.data;
    const banners = (
      bannersPayload?.data?.banners && Array.isArray(bannersPayload.data.banners)
        ? bannersPayload.data.banners
        : bannersPayload?.banners && Array.isArray(bannersPayload.banners)
          ? bannersPayload.banners
          : bannersPayload?.items && Array.isArray(bannersPayload.items)
            ? bannersPayload.items
            : Array.isArray(bannersPayload)
              ? bannersPayload
              : []
    ) as Banner[];

    // If no products loaded, log warning
    if (products.length === 0) {
      console.warn('⚠️ No products loaded from API. Check backend connection.');
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
    console.error('Error fetching homepage data:', error);

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
