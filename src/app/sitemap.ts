import type { MetadataRoute } from 'next';
import { fetchBackendJson } from '@/lib/backendFetch';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getArray = (value: unknown, key: string): unknown[] | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return Array.isArray(nested) ? nested : undefined;
};

const getRecord = (value: unknown, key: string): Record<string, unknown> | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
};

const toOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

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
      const res = await fetchBackendJson<unknown>(`/categories?lang=uk`, {
        next: { revalidate: 3600 },
      });
      const payload = isRecord(res) ? res.data : undefined;
      const categoriesArray =
        getArray(payload, 'categories') ??
        getArray(payload, 'data') ??
        (Array.isArray(payload) ? payload : []);
      categories = categoriesArray.map(category => {
        const record = isRecord(category) ? category : {};
        const slug = toOptionalString(record.slug) || '';
        const canonicalUrl = toOptionalString(record.canonical_url);
        const updatedAt = toOptionalString(record.updated_at);
        return {
          url: canonicalUrl || `${SITE_URL}/products?type=${slug}`,
          lastModified: updatedAt ? new Date(updatedAt) : currentDate,
          changeFrequency: 'daily' as const,
          priority: 0.8,
        };
      });
    } catch (error) {
      console.error('Error fetching categories for sitemap:', error);
    }

    // Отримуємо бренди
    let brands: MetadataRoute.Sitemap = [];
    try {
      const res = await fetchBackendJson<unknown>(`/brands?lang=uk`, {
        next: { revalidate: 3600 },
      });
      const payload = isRecord(res) ? res.data : undefined;
      const brandsArray =
        getArray(payload, 'data') ??
        getArray(payload, 'brands') ??
        (Array.isArray(payload) ? payload : []);
      brands = brandsArray.map(brand => {
        const record = isRecord(brand) ? brand : {};
        const slug = toOptionalString(record.slug);
        const id = toOptionalString(record.id);
        const canonicalUrl = toOptionalString(record.canonical_url);
        const updatedAt = toOptionalString(record.updated_at);
        return {
          url: canonicalUrl || `${SITE_URL}/brands/${slug || id || ''}`,
          lastModified: updatedAt ? new Date(updatedAt) : currentDate,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        };
      });
    } catch (error) {
      console.error('Error fetching brands for sitemap:', error);
    }

    // Отримуємо популярні продукти (для SEO)
    let products: MetadataRoute.Sitemap = [];
    try {
      const res = await fetchBackendJson<unknown>(`/products/popular-saved?limit=100&lang=uk`, {
        next: { revalidate: 3600 },
      });
      const payload = isRecord(res) ? res.data : undefined;
      const productsArray =
        getArray(payload, 'items') ??
        getArray(payload, 'products') ??
        getArray(getRecord(payload, 'data'), 'products') ??
        (Array.isArray(payload) ? payload : []);
      products = productsArray.map(product => {
        const record = isRecord(product) ? product : {};
        const slug = toOptionalString(record.slug);
        const id = toOptionalString(record.id);
        const canonicalUrl = toOptionalString(record.canonical_url);
        const updatedAt = toOptionalString(record.updated_at);
        return {
          url: canonicalUrl || `${SITE_URL}/products/${slug || id || ''}`,
          lastModified: updatedAt ? new Date(updatedAt) : currentDate,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      });
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
