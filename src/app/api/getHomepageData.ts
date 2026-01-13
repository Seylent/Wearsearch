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
    // Use backend URL from env or fallback to localhost backend
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    console.log('📡 Fetching homepage data from:', baseUrl);
    
    // Try BFF endpoint first (single request for all data)
    try {
      const bffRes = await fetch(`${baseUrl}/api/pages/home`, {
        next: { revalidate: 1800 }, // 30 min cache
      });
      
      if (bffRes.ok) {
        const response = await bffRes.json();
        console.log('✅ BFF homepage data received');
        
        // BFF returns: { success: true, data: { products, brands, statistics } }
        const data = response.data || response;
        const products = data.products || [];
        const categories = data.categories || [];
        const stats = data.statistics || data.stats || {};
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📦 Products loaded:', products.length);
        }
        
        // Fetch SEO data separately
        let seoData = null;
        try {
          const seoRes = await fetch(`${baseUrl}/api/v1/seo/home/home`, {
            next: { revalidate: 86400 }, // 24 hour cache
          });
          if (seoRes.ok) {
            const seoResponse = await seoRes.json();
            seoData = seoResponse.item || seoResponse;
            console.log('📝 SEO data loaded:', seoData?.h1_title || 'No title');
          }
        } catch (_seoError) {
          console.log('⚠️ SEO data not available');
        }
        
        return {
          featuredProducts: products.slice(0, 8),
          newProducts: products.slice(0, 8),
          popularProducts: products.slice(0, 8),
          categories,
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
    const [productsRes, categoriesRes, statsRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/products/popular?limit=12`, {
        next: { revalidate: 3600 }, // 1 hour cache
      }),
      fetch(`${baseUrl}/api/categories?limit=12`, {
        next: { revalidate: 7200 }, // 2 hour cache
      }),
      fetch(`${baseUrl}/api/statistics`, {
        next: { revalidate: 3600 }, // 1 hour cache
      }),
    ]);

    // Process results with fallbacks
    let products: Product[] = [];
    if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
      const data = await productsRes.value.json();
      // Backend може віддавати: { success: true, products: [...] } або { products: [...] }
      products = data.products || data || [];
    }
    
    console.log('✅ Products loaded:', products.length);
      
    let categories: any[] = [];
    if (categoriesRes.status === 'fulfilled' && categoriesRes.value.ok) {
      const data = await categoriesRes.value.json();
      // Backend може віддавати: { success: true, categories: [...] } або просто масив
      categories = data.categories || data || [];
    }
      
    let stats = { totalProducts: 0, totalBrands: 0, totalCategories: 0 };
    if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
      const data = await statsRes.value.json();
      stats = data.stats || data || stats;
    }

    // If no products loaded, log warning
    if (products.length === 0) {
      console.warn('⚠️ No products loaded from API. Check backend connection.');
      console.warn('   Backend URL:', baseUrl);
      console.warn('   Try: http://localhost:3001/api/pages/home');
    }

    return {
      featuredProducts: products.slice(0, 8),
      newProducts: products.slice(0, 8),
      popularProducts: products.slice(0, 8),
      categories,
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