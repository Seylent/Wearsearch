/**
 * Server-side data fetching for Homepage
 */
import type { Product } from '@/types';

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
  seoData: ExtendedSEOData | null;
  stats: {
    totalProducts: number;
    totalBrands: number;
    totalCategories: number;
  };
}

export async function getHomepageData(): Promise<HomepageAPIResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Parallel requests for better performance
    const [featuredRes, newRes, popularRes, categoriesRes, seoRes, statsRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/v1/products?featured=true&limit=8`, {
        next: { revalidate: 3600 }, // 1 hour cache
      }),
      fetch(`${baseUrl}/api/v1/products?sort=newest&limit=8`, {
        next: { revalidate: 1800 }, // 30 min cache
      }),
      fetch(`${baseUrl}/api/v1/products?sort=popular&limit=8`, {
        next: { revalidate: 3600 }, // 1 hour cache
      }),
      fetch(`${baseUrl}/api/v1/categories?limit=12`, {
        next: { revalidate: 7200 }, // 2 hour cache
      }),
      fetch(`${baseUrl}/api/v1/seo/homepage`, {
        next: { revalidate: 86400 }, // 24 hour cache
      }),
      fetch(`${baseUrl}/api/v1/stats`, {
        next: { revalidate: 3600 }, // 1 hour cache
      }),
    ]);

    // Process results with fallbacks
    const featuredProducts = featuredRes.status === 'fulfilled' && featuredRes.value.ok
      ? (await featuredRes.value.json())?.data?.items || []
      : [];
      
    const newProducts = newRes.status === 'fulfilled' && newRes.value.ok
      ? (await newRes.value.json())?.data?.items || []
      : [];
      
    const popularProducts = popularRes.status === 'fulfilled' && popularRes.value.ok
      ? (await popularRes.value.json())?.data?.items || []
      : [];
      
    const categories = categoriesRes.status === 'fulfilled' && categoriesRes.value.ok
      ? (await categoriesRes.value.json())?.data?.items || []
      : [];
      
    const seoData = seoRes.status === 'fulfilled' && seoRes.value.ok
      ? (await seoRes.value.json())?.data || null
      : null;
      
    const stats = statsRes.status === 'fulfilled' && statsRes.value.ok
      ? (await statsRes.value.json())?.data || { totalProducts: 0, totalBrands: 0, totalCategories: 0 }
      : { totalProducts: 0, totalBrands: 0, totalCategories: 0 };

    return {
      featuredProducts,
      newProducts,
      popularProducts,
      categories,
      seoData,
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
    seoData: {
      title: 'WearSearch - Find Your Perfect Style',
      description: 'Discover the latest fashion trends and products from top brands. ' + 
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