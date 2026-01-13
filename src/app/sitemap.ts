import type { MetadataRoute } from 'next';

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
      priority: 1.0,
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    // Отримуємо категорії
    let categories: MetadataRoute.Sitemap = [];
    try {
      const categoriesResponse = await fetch(`${API_URL}/api/categories?lang=uk`, {
        next: { revalidate: 3600 }
      });
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        // Бекенд віддає { success: true, categories: [...] }
        const categoriesArray = categoriesData.categories || categoriesData;
        categories = (Array.isArray(categoriesArray) ? categoriesArray : []).map((category: any) => ({
          url: category.canonical_url || `${SITE_URL}/products?type=${category.slug}`,
          lastModified: category.updated_at ? new Date(category.updated_at) : currentDate,
          changeFrequency: 'daily' as const,
          priority: 0.8,
        }));
      }
    } catch (error) {
      console.error('Error fetching categories for sitemap:', error);
    }

    // Отримуємо бренди
    let brands: MetadataRoute.Sitemap = [];
    try {
      const brandsResponse = await fetch(`${API_URL}/api/brands?lang=uk`, {
        next: { revalidate: 3600 }
      });
      
      if (brandsResponse.ok) {
        const brandsData = await brandsResponse.json();
        // Бекенд віддає { success: true, count: 10, data: [...] }
        const brandsArray = brandsData.data || brandsData;
        brands = (Array.isArray(brandsArray) ? brandsArray : []).map((brand: any) => ({
          url: brand.canonical_url || `${SITE_URL}/brands/${brand.slug || brand.id}`,
          lastModified: brand.updated_at ? new Date(brand.updated_at) : currentDate,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
      }
    } catch (error) {
      console.error('Error fetching brands for sitemap:', error);
    }

    // Отримуємо популярні продукти (для SEO)
    let products: MetadataRoute.Sitemap = [];
    try {
      const productsResponse = await fetch(`${API_URL}/api/products/popular?limit=100&lang=uk`, {
        next: { revalidate: 3600 }
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        // Бекенд віддає { success: true, products: [...] }
        const productsArray = productsData.products || productsData;
        products = (Array.isArray(productsArray) ? productsArray : []).map((product: any) => ({
          url: product.canonical_url || `${SITE_URL}/products/${product.slug || product.id}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : currentDate,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
      }
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
