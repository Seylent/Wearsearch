import type { MetadataRoute } from 'next';
import { fetchBackendJson } from '@/lib/backendFetch';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';

/**
 * Генерує sitemap згідно SEO-ТЗ
 * Використовує дані з бекенду (GET /api/v1/sitemap.xml не потрібен, робимо самі)
 * Містить ТІЛЬКИ: головна, категорії, бренди, популярні продукти
 * НЕ містить: search, фільтри, технічні сторінки
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();
  
  // Базові статичні сторінки
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contacts`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    // Отримуємо категорії
    let categories: MetadataRoute.Sitemap = [];
    try {
      const res = await fetchBackendJson<any>(`/categories?lang=uk`, { next: { revalidate: 3600 } });
      const payload = res?.data;
      const categoriesArray = payload?.categories || payload?.data || payload;
      categories = (Array.isArray(categoriesArray) ? categoriesArray : []).map((category: { canonical_url?: string; slug: string; updated_at?: string }) => ({
        url: category.canonical_url || `${SITE_URL}/products?type=${category.slug}`,
        lastModified: category.updated_at ? new Date(category.updated_at) : currentDate,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
    } catch (error) {
      console.error('Error fetching categories for sitemap:', error);
    }

    // Отримуємо бренди
    let brands: MetadataRoute.Sitemap = [];
    try {
      const res = await fetchBackendJson<any>(`/brands?lang=uk`, { next: { revalidate: 3600 } });
      const payload = res?.data;
      const brandsArray = payload?.data || payload?.brands || payload;
      brands = (Array.isArray(brandsArray) ? brandsArray : []).map((brand: { canonical_url?: string; slug?: string; id: string; updated_at?: string }) => ({
        url: brand.canonical_url || `${SITE_URL}/brands/${brand.slug || brand.id}`,
        lastModified: brand.updated_at ? new Date(brand.updated_at) : currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    } catch (error) {
      console.error('Error fetching brands for sitemap:', error);
    }

    // Отримуємо популярні продукти (для SEO)
    let products: MetadataRoute.Sitemap = [];
    try {
      const res = await fetchBackendJson<any>(`/products/popular?limit=100&lang=uk`, { next: { revalidate: 3600 } });
      const payload = res?.data;
      const productsArray = payload?.products || payload?.data?.products || payload;
      products = (Array.isArray(productsArray) ? productsArray : []).map((product: { canonical_url?: string; slug?: string; id: string; updated_at?: string }) => ({
        url: product.canonical_url || `${SITE_URL}/products/${product.slug || product.id}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    } catch (error) {
      console.error('Error fetching products for sitemap:', error);
    }

    // Об'єднуємо всі сторінки
    return [...staticPages, ...categories, ...brands, ...products];
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // У разі помилки повертаємо хоча б статичні сторінки
    return staticPages;
  }
}
