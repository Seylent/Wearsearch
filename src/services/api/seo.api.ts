/**
 * SEO API Service
 * Handles dynamic SEO data fetching from backend
 */

import api from '../api';
import i18n from '@/i18n';

export interface SEOData {
  meta_title: string;
  meta_description: string;
  canonical_url?: string;
  h1_title?: string;
  content_text?: string;
  keywords?: string;
}

export interface SEOResponse {
  success: boolean;
  item: SEOData;
}

/**
 * Get current language for API requests
 */
const getCurrentLanguage = (): string => {
  return i18n.language || 'en';
};

/**
 * SEO API methods
 */
export const seoApi = {
  /**
   * Get SEO data for homepage
   */
  getHomeSEO: async (): Promise<SEOData> => {
    try {
      const lang = getCurrentLanguage();
      const response = await api.get<SEOResponse>('/seo/home/home', {
        params: { lang }
      });
      return response.data.item;
    } catch (error) {
      console.error('[SEO API] Failed to fetch home SEO:', error);
      // Return default SEO if API fails
      return {
        meta_title: 'Wearsearch - Discover Exceptional Fashion',
        meta_description: 'Discover and shop the latest fashion trends. Find clothing, footwear, and accessories from top stores with worldwide shipping.',
        h1_title: 'Discover Exceptional Fashion',
      };
    }
  },

  /**
   * Get SEO data for category page
   */
  getCategorySEO: async (categorySlug: string): Promise<SEOData> => {
    try {
      const lang = getCurrentLanguage();
      const response = await api.get<SEOResponse>(`/seo/category/${categorySlug}`, {
        params: { lang }
      });
      return response.data.item;
    } catch (error) {
      console.error(`[SEO API] Failed to fetch category SEO for ${categorySlug}:`, error);
      // Return default SEO if API fails
      return {
        meta_title: `${categorySlug} - Wearsearch`,
        meta_description: `Browse our collection of ${categorySlug}. Find the perfect items for your style.`,
      };
    }
  },

  /**
   * Get SEO data for color page
   */
  getColorSEO: async (colorSlug: string): Promise<SEOData> => {
    try {
      const lang = getCurrentLanguage();
      const response = await api.get<SEOResponse>(`/seo/color/${colorSlug}`, {
        params: { lang }
      });
      return response.data.item;
    } catch (error) {
      console.error(`[SEO API] Failed to fetch color SEO for ${colorSlug}:`, error);
      // Return default SEO if API fails
      return {
        meta_title: `${colorSlug} Products - Wearsearch`,
        meta_description: `Shop ${colorSlug} fashion items. Browse our curated collection of ${colorSlug} clothing and accessories.`,
      };
    }
  },

  /**
   * Get SEO data for product page
   */
  getProductSEO: async (productId: string): Promise<SEOData> => {
    try {
      const lang = getCurrentLanguage();
      const response = await api.get<SEOResponse>(`/seo/product/${productId}`, {
        params: { lang }
      });
      return response.data.item;
    } catch (error) {
      console.error(`[SEO API] Failed to fetch product SEO for ${productId}:`, error);
      // Return default SEO if API fails
      return {
        meta_title: 'Product - Wearsearch',
        meta_description: 'View product details, pricing, and availability from multiple stores.',
      };
    }
  },

  /**
   * Get SEO data for store page
   */
  getStoreSEO: async (storeId: string): Promise<SEOData> => {
    try {
      const lang = getCurrentLanguage();
      const response = await api.get<SEOResponse>(`/seo/store/${storeId}`, {
        params: { lang }
      });
      return response.data.item;
    } catch (error) {
      console.error(`[SEO API] Failed to fetch store SEO for ${storeId}:`, error);
      // Return default SEO if API fails
      return {
        meta_title: 'Store - Wearsearch',
        meta_description: 'Browse products from this store and discover their collection.',
      };
    }
  },

  /**
   * Get SEO data for brand page
   */
  getBrandSEO: async (brandId: string): Promise<SEOData> => {
    try {
      const lang = getCurrentLanguage();
      const response = await api.get<SEOResponse>(`/seo/brand/${brandId}`, {
        params: { lang }
      });
      return response.data.item;
    } catch (error) {
      console.error(`[SEO API] Failed to fetch brand SEO for ${brandId}:`, error);
      // Return default SEO if API fails
      return {
        meta_title: 'Brand - Wearsearch',
        meta_description: 'Discover products from this brand and explore their collection.',
      };
    }
  },
};
