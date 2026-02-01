/**
 * Приклад SEO-оптимізованої сторінки категорії
 * Демонструє правильну структуру H1-H3, metadata та SEO-тексти
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  JsonLd,
  generateBreadcrumbSchema,
  generateItemListSchema,
} from '@/lib/seo/structured-data';
import { SEOTextSection } from '@/components/seo/SEOTextSection';
import { fetchBackendJson } from '@/lib/backendFetch';
import { getServerLanguage } from '@/utils/languageStorage';

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

const toOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

// Генерація metadata для SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = params;

  try {
    const lang = await getServerLanguage();
    const res = await fetchBackendJson<unknown>(`/categories/${slug}?lang=${lang}`, {
      next: { revalidate: 3600 },
    });

    if (!res) {
      return {
        title: 'Категорія не знайдена | Wearsearch',
        description: 'Ця категорія не знайдена',
        robots: { index: false, follow: true },
      };
    }

    const data = isRecord(res) ? res.data : undefined;
    const category =
      getRecord(data, 'category') ?? getRecord(getRecord(data, 'data'), 'category') ?? data ?? {};
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
    const categoryName =
      toOptionalString(isRecord(category) ? category.name : undefined) ?? 'Категорія';
    const categorySeoTitle = toOptionalString(isRecord(category) ? category.seo_title : undefined);
    const categorySeoDescription = toOptionalString(
      isRecord(category) ? category.seo_description : undefined
    );
    const categoryDescription = toOptionalString(
      isRecord(category) ? category.description : undefined
    );
    const categoryImageUrl = toOptionalString(isRecord(category) ? category.image_url : undefined);
    const canonicalUrl =
      toOptionalString(isRecord(category) ? category.canonical_url : undefined) ||
      `${siteUrl}/categories/${slug}`;

    // Використовуємо SEO дані з бекенду
    return {
      title: categorySeoTitle || `${categoryName} | Wearsearch`,
      description: categorySeoDescription || categoryDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: categorySeoTitle || categoryName,
        description: categorySeoDescription || categoryDescription,
        images: categoryImageUrl ? [categoryImageUrl] : [],
        type: 'website',
        siteName: 'Wearsearch',
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: categorySeoTitle || categoryName,
        description: categorySeoDescription || categoryDescription,
        images: categoryImageUrl ? [categoryImageUrl] : [],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('Error generating category metadata:', error);
    return {
      title: 'Категорія | Wearsearch',
      description: 'Категорія товарів',
      robots: { index: false, follow: true },
    };
  }
}

// Основний компонент сторінки
export default async function CategoryPage({ params }: Readonly<CategoryPageProps>) {
  const { slug } = params;

  try {
    const lang = await getServerLanguage();
    // Отримуємо дані категорії
    const categoryRes = await fetchBackendJson<unknown>(`/categories/${slug}?lang=${lang}`, {
      next: { revalidate: 3600 },
    });

    if (!categoryRes) {
      // Backend unavailable (network/5xx). Render a non-crashing fallback.
      return (
        <div className="min-h-screen bg-black text-white pt-24 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Категорія тимчасово недоступна</h1>
            <p className="text-gray-300">Спробуйте оновити сторінку пізніше.</p>
          </div>
        </div>
      );
    }

    const categoryData = isRecord(categoryRes) ? categoryRes.data : undefined;
    const category =
      getRecord(categoryData, 'category') ??
      getRecord(getRecord(categoryData, 'data'), 'category') ??
      categoryData ??
      {};
    const categoryName =
      toOptionalString(isRecord(category) ? category.name : undefined) ?? 'Категорія';
    const categoryDescription = toOptionalString(
      isRecord(category) ? category.description : undefined
    );
    const categorySeoText = toOptionalString(isRecord(category) ? category.seo_text : undefined);
    const categorySeoKeywords =
      isRecord(category) && Array.isArray(category.seo_keywords)
        ? (category.seo_keywords as string[])
        : [];

    // Отримуємо товари категорії
    const productsRes = await fetchBackendJson<unknown>(`/products?category=${slug}&limit=20`, {
      next: { revalidate: 1800 },
    });

    const productsPayload = isRecord(productsRes) ? productsRes.data : undefined;
    const products =
      (getArray(productsPayload, 'products') ??
        getArray(getRecord(productsPayload, 'data'), 'products') ??
        getArray(productsPayload, 'items') ??
        (Array.isArray(productsPayload) ? productsPayload : [])) ||
      [];

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';

    // Structured Data для хлібних крихт
    const breadcrumbData = generateBreadcrumbSchema([
      { name: 'Головна', url: siteUrl },
      { name: 'Категорії', url: `${siteUrl}/categories` },
      { name: categoryName, url: `${siteUrl}/categories/${slug}` },
    ]);

    const itemListData = generateItemListSchema(
      products
        .slice(0, 20)
        .map((item: { id: string; name?: string; canonical_url?: string; slug?: string }) => ({
          name: item.name || 'Product',
          url: item.canonical_url || `${siteUrl}/products/${item.slug || item.id}`,
        })),
      {
        name: toOptionalString(isRecord(category) ? category.seo_title : undefined) || categoryName,
        description:
          toOptionalString(isRecord(category) ? category.seo_description : undefined) ||
          toOptionalString(isRecord(category) ? category.description : undefined),
      }
    );

    return (
      <>
        {/* JSON-LD для хлібних крихт */}
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
                    <a href="/categories" className="hover:text-white transition-colors">
                      Категорії
                    </a>
                  </li>
                  <li>/</li>
                  <li className="text-white">{categoryName}</li>
                </ol>
              </nav>

              {/* H1 - один на сторінку */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{categoryName}</h1>

              {categoryDescription && (
                <p className="text-xl text-gray-300 max-w-3xl">{categoryDescription}</p>
              )}
            </div>
          </section>

          {/* H2 - Порівняння цін */}
          <section className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">
                Порівняння цін на {categoryName.toLowerCase()}
              </h2>

              {/* Тут буде компонент з товарами */}
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
                      brand?: string;
                      price: number;
                    }) => (
                      <div key={product.id} className="bg-zinc-900 rounded-lg p-4">
                        {/* Карточка товару */}
                        <a href={`/products/${product.id}`} className="block">
                          <Image
                            src={product.image_url || '/placeholder.jpg'}
                            alt={product.name}
                            width={384}
                            height={192}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          <p className="text-gray-400 text-sm mb-2">{product.brand}</p>
                          <p className="text-xl font-bold">{product.price} ₴</p>
                        </a>
                      </div>
                    )
                  )}
                </div>
              </Suspense>
            </div>
          </section>

          {/* H2 - Популярні моделі (якщо є) */}
          {products.length > 0 && (
            <section className="py-8 px-4">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-6">
                  Популярні моделі {categoryName.toLowerCase()}
                </h2>

                {/* Підкатегорії як H3 */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Для чоловіків</h3>
                    {/* Список товарів */}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Для жінок</h3>
                    {/* Список товарів */}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SEO-текст ПІД списком товарів (згідно ТЗ) */}
          {categorySeoText && (
            <SEOTextSection
              title={`Все про ${categoryName.toLowerCase()}`}
              content={categorySeoText}
              keywords={categorySeoKeywords}
            />
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error('Error loading category:', error);
    notFound();
  }
}

// Генерація статичних параметрів для популярних категорій
export async function generateStaticParams() {
  try {
    const res = await fetchBackendJson<unknown>(`/categories?lang=uk`, {
      next: { revalidate: 86400 },
    });
    if (!res) return [];

    const payload = isRecord(res) ? res.data : undefined;

    const list: Array<{ slug: string }> = Array.isArray(payload)
      ? payload
      : Array.isArray(getArray(payload, 'categories'))
        ? (getArray(payload, 'categories') as Array<{ slug: string }>)
        : Array.isArray(getArray(payload, 'data'))
          ? (getArray(payload, 'data') as Array<{ slug: string }>)
          : Array.isArray(getArray(payload, 'items'))
            ? (getArray(payload, 'items') as Array<{ slug: string }>)
            : [];

    return list
      .filter(c => typeof c?.slug === 'string' && c.slug.trim() !== '')
      .map(category => ({
        slug: category.slug,
      }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
