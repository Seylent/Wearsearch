/**
 * Приклад SEO-оптимізованої сторінки бренду
 * Аналогічна структура до категорій
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  JsonLd,
  generateBreadcrumbSchema,
  generateItemListSchema,
} from '@/lib/seo/structured-data';
import { SEOTextSection } from '@/components/seo/SEOTextSection';
import { fetchBackendJson } from '@/lib/backendFetch';

interface BrandPageProps {
  params: {
    slug: string;
  };
}

// Генерація metadata для SEO
export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = params;

  try {
    const lang = 'uk';
    const res = await fetchBackendJson<any>(`/brands/${slug}?lang=${lang}`, {
      next: { revalidate: 3600 },
    });

    if (!res) {
      return {
        title: 'Бренд не знайдено | Wearsearch',
        description: 'Цей бренд не знайдено',
        robots: { index: false, follow: true },
      };
    }

    const data = res.data;
    const brand = data.brand || data.data?.brand || data;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
    const canonicalUrl = brand.canonical_url || `${siteUrl}/brands/${slug}`;

    return {
      title: brand.seo_title || `${brand.name} | Wearsearch`,
      description: brand.seo_description || brand.description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: brand.seo_title || brand.name,
        description: brand.seo_description || brand.description,
        images: brand.logo_url ? [brand.logo_url] : [],
        type: 'website',
        siteName: 'Wearsearch',
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: brand.seo_title || brand.name,
        description: brand.seo_description || brand.description,
        images: brand.logo_url ? [brand.logo_url] : [],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('Error generating brand metadata:', error);
    return {
      title: 'Бренд | Wearsearch',
      description: 'Інформація про бренд',
      robots: { index: false, follow: true },
    };
  }
}

// Основний компонент сторінки
export default async function BrandPage({ params }: Readonly<BrandPageProps>) {
  const { slug } = params;

  try {
    // Отримуємо дані бренду
    const brandRes = await fetchBackendJson<any>(`/brands/${slug}?lang=uk`, {
      next: { revalidate: 3600 },
    });

    if (!brandRes) {
      // Backend unavailable (network/5xx). Render a non-crashing fallback.
      return (
        <div className="min-h-screen bg-black text-white pt-24 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Бренд тимчасово недоступний</h1>
            <p className="text-gray-300">Спробуйте оновити сторінку пізніше.</p>
          </div>
        </div>
      );
    }

    const brandData = brandRes.data;
    const brand = brandData.brand || brandData.data?.brand || brandData;

    // Отримуємо товари бренду
    const productsRes = await fetchBackendJson<any>(`/products?brand=${slug}&limit=20`, {
      next: { revalidate: 1800 },
    });

    const productsPayload = productsRes?.data;
    const products = Array.isArray(productsPayload)
      ? productsPayload
      : productsPayload?.products ||
        productsPayload?.data?.products ||
        productsPayload?.items ||
        [];

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';

    // Structured Data для хлібних крихт
    const breadcrumbData = generateBreadcrumbSchema([
      { name: 'Головна', url: siteUrl },
      { name: 'Бренди', url: `${siteUrl}/brands` },
      { name: brand.name, url: `${siteUrl}/brands/${slug}` },
    ]);

    const itemListData = generateItemListSchema(
      products
        .slice(0, 20)
        .map((item: { id: string; name?: string; canonical_url?: string; slug?: string }) => ({
          name: item.name || 'Product',
          url: item.canonical_url || `${siteUrl}/products/${item.slug || item.id}`,
        })),
      {
        name: brand.seo_title || brand.name,
        description: brand.seo_description || brand.description,
      }
    );

    return (
      <>
        <JsonLd data={breadcrumbData} />
        <JsonLd data={itemListData} />

        <div className="min-h-screen bg-black text-white">
          {/* Hero секція з H1 */}
          <section className="pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
              {/* Хлібні крихти */}
              <nav className="mb-6 text-sm" aria-label="Навігація">
                <ol className="flex items-center space-x-2 text-gray-400">
                  <li>
                    <a href="/" className="hover:text-white transition-colors">
                      Головна
                    </a>
                  </li>
                  <li>/</li>
                  <li>
                    <a href="/brands" className="hover:text-white transition-colors">
                      Бренди
                    </a>
                  </li>
                  <li>/</li>
                  <li className="text-white">{brand.name}</li>
                </ol>
              </nav>

              {/* H1 */}
              <div className="flex items-center gap-6 mb-4">
                {brand.logo_url && (
                  <img
                    src={brand.logo_url}
                    alt={`${brand.name} logo`}
                    className="w-20 h-20 object-contain bg-white rounded-lg p-2"
                  />
                )}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">{brand.name}</h1>
              </div>

              {brand.description && (
                <p className="text-xl text-gray-300 max-w-3xl">{brand.description}</p>
              )}
            </div>
          </section>

          {/* H2 - Каталог продукції */}
          <section className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Вся продукція {brand.name}</h2>

              <Suspense
                fallback={
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map(
                    (product: {
                      id: string;
                      image_url?: string;
                      name: string;
                      category?: string;
                      price: number;
                    }) => (
                      <div key={product.id} className="bg-zinc-900 rounded-lg p-4">
                        <a href={`/products/${product.id}`} className="block">
                          <img
                            src={product.image_url || '/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          <p className="text-gray-400 text-sm mb-2">{product.category}</p>
                          <p className="text-xl font-bold">{product.price} ₴</p>
                        </a>
                      </div>
                    )
                  )}
                </div>
              </Suspense>
            </div>
          </section>

          {/* SEO-текст */}
          {brand.seo_text ? (
            <SEOTextSection
              title={`Чому варто обрати ${brand.name}`}
              content={brand.seo_text}
              keywords={
                brand.seo_keywords || [
                  `${brand.name} Україна`,
                  `${brand.name} офіційний`,
                  `${brand.name} ціна`,
                  `купити ${brand.name}`,
                ]
              }
            />
          ) : (
            <SEOTextSection
              title={`Чому варто обрати ${brand.name}`}
              content={`
                <p class="mb-4">
                  <strong>${brand.name}</strong> — це один з найпопулярніших брендів у світі моди та спорту.
                  Продукція ${brand.name} поєднує в собі високу якість, інноваційні технології та стильний дизайн.
                </p>
                <p class="mb-4">
                  На Wearsearch ви можете знайти всю продукцію ${brand.name} та порівняти ціни від різних магазинів.
                  Це допоможе вам знайти найвигіднішу пропозицію та заощадити гроші.
                </p>
                <p>
                  Використовуйте фільтри для швидкого пошуку потрібної моделі, розміру або кольору.
                  Всі ціни актуальні та оновлюються в режимі реального часу.
                </p>
              `}
              keywords={[
                `${brand.name} Україна`,
                `${brand.name} офіційний`,
                `${brand.name} ціна`,
                `купити ${brand.name}`,
              ]}
            />
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error('Error loading brand:', error);
    notFound();
  }
}

// Генерація статичних параметрів для популярних брендів
export async function generateStaticParams() {
  try {
    const res = await fetchBackendJson<any>(`/brands?lang=uk`, { next: { revalidate: 86400 } });
    if (!res) return [];

    const payload = res.data;

    const list: Array<{ id: number | string }> = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.brands)
          ? payload.brands
          : Array.isArray(payload?.items)
            ? payload.items
            : [];

    // Використовуємо id бренду як slug (згідно структури API)
    return list.map(brand => ({
      slug: String(brand.id),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
