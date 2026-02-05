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
import { PresignedImage } from '@/components/common/PresignedImage';
import { getServerLanguage } from '@/utils/languageStorage';

export const revalidate = 3600;

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

const isDirectUrl = (value: string) =>
  value.startsWith('http://') ||
  value.startsWith('https://') ||
  value.startsWith('/') ||
  value.startsWith('data:') ||
  value.startsWith('blob:');

const resolvePresignedUrl = async (value?: string): Promise<string | undefined> => {
  if (!value) return undefined;
  if (isDirectUrl(value)) return value;

  const result = await fetchBackendJson<unknown>(`/upload/image/${encodeURIComponent(value)}`, {
    next: { revalidate: 300 },
  });
  if (!result || !result.data) return undefined;

  if (isRecord(result.data) && typeof result.data.url === 'string') {
    return result.data.url;
  }

  if (
    isRecord(result.data) &&
    isRecord(result.data.data) &&
    typeof result.data.data.url === 'string'
  ) {
    return result.data.data.url;
  }

  return undefined;
};

interface BrandPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Генерація metadata для SEO
export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const lang = await getServerLanguage();
    const res = await fetchBackendJson<unknown>(`/brands/${slug}?lang=${lang}`, {
      next: { revalidate: 3600 },
    });

    if (!res) {
      return {
        title: 'Бренд не знайдено | Wearsearch',
        description: 'Цей бренд не знайдено',
        robots: { index: false, follow: true },
      };
    }

    const data = isRecord(res) ? res.data : undefined;
    const brand =
      getRecord(data, 'brand') ?? getRecord(getRecord(data, 'data'), 'brand') ?? data ?? {};
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
    const brandName = toOptionalString(isRecord(brand) ? brand.name : undefined) ?? 'Brand';
    const brandSeoTitle = toOptionalString(isRecord(brand) ? brand.seo_title : undefined);
    const brandSeoDescription = toOptionalString(
      isRecord(brand) ? brand.seo_description : undefined
    );
    const brandDescription = toOptionalString(isRecord(brand) ? brand.description : undefined);
    const brandLogoUrl = await resolvePresignedUrl(
      toOptionalString(isRecord(brand) ? brand.logo_url : undefined)
    );
    const canonicalUrl =
      toOptionalString(isRecord(brand) ? brand.canonical_url : undefined) ||
      `${siteUrl}/brands/${slug}`;

    return {
      title: brandSeoTitle || `${brandName} | Wearsearch`,
      description: brandSeoDescription || brandDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: brandSeoTitle || brandName,
        description: brandSeoDescription || brandDescription,
        images: brandLogoUrl ? [brandLogoUrl] : [`${siteUrl}/og-image.svg`],
        type: 'website',
        siteName: 'Wearsearch',
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: brandSeoTitle || brandName,
        description: brandSeoDescription || brandDescription,
        images: brandLogoUrl ? [brandLogoUrl] : [`${siteUrl}/og-image.svg`],
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
  const { slug } = await params;

  try {
    // Отримуємо дані бренду
    const brandRes = await fetchBackendJson<unknown>(`/brands/${slug}?lang=uk`, {
      next: { revalidate: 3600 },
    });

    if (!brandRes) {
      // Backend unavailable (network/5xx). Render a non-crashing fallback.
      return (
        <div className="min-h-screen text-foreground pt-24 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Бренд тимчасово недоступний</h1>
            <p className="text-muted-foreground">Спробуйте оновити сторінку пізніше.</p>
          </div>
        </div>
      );
    }

    const brandData = isRecord(brandRes) ? brandRes.data : undefined;
    const brand =
      getRecord(brandData, 'brand') ??
      getRecord(getRecord(brandData, 'data'), 'brand') ??
      brandData ??
      {};
    const brandName = toOptionalString(isRecord(brand) ? brand.name : undefined) ?? 'Brand';
    const brandDescription = toOptionalString(isRecord(brand) ? brand.description : undefined);
    const brandLogoUrl = toOptionalString(isRecord(brand) ? brand.logo_url : undefined);
    const brandSeoText = toOptionalString(isRecord(brand) ? brand.seo_text : undefined);
    const brandSeoKeywords =
      isRecord(brand) && Array.isArray(brand.seo_keywords)
        ? (brand.seo_keywords as string[])
        : undefined;

    // Отримуємо товари бренду
    const productsRes = await fetchBackendJson<unknown>(`/products?brand=${slug}&limit=20`, {
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
      { name: 'Бренди', url: `${siteUrl}/brands` },
      {
        name: toOptionalString(isRecord(brand) ? brand.name : undefined) || 'Brand',
        url: `${siteUrl}/brands/${slug}`,
      },
    ]);

    const itemListData = generateItemListSchema(
      products
        .slice(0, 20)
        .map((item: { id: string; name?: string; canonical_url?: string; slug?: string }) => ({
          name: item.name || 'Product',
          url: item.canonical_url || `${siteUrl}/products/${item.slug || item.id}`,
        })),
      {
        name:
          toOptionalString(isRecord(brand) ? brand.seo_title : undefined) ||
          toOptionalString(isRecord(brand) ? brand.name : undefined) ||
          'Brand',
        description:
          toOptionalString(isRecord(brand) ? brand.seo_description : undefined) ||
          toOptionalString(isRecord(brand) ? brand.description : undefined),
      }
    );

    return (
      <>
        <JsonLd data={breadcrumbData} />
        <JsonLd data={itemListData} />

        <div className="min-h-screen text-foreground">
          {/* Hero секція з H1 */}
          <section className="pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
              {/* Хлібні крихти */}
              <nav className="mb-6 text-sm" aria-label="Навігація">
                <ol className="flex items-center space-x-2 text-muted-foreground">
                  <li>
                    <a href="/" className="hover:text-foreground transition-colors">
                      Головна
                    </a>
                  </li>
                  <li>/</li>
                  <li>
                    <a href="/brands" className="hover:text-foreground transition-colors">
                      Бренди
                    </a>
                  </li>
                  <li>/</li>
                  <li className="text-foreground">{brandName}</li>
                </ol>
              </nav>

              {/* H1 */}
              <div className="flex items-center gap-6 mb-4">
                {brandLogoUrl && (
                  <PresignedImage
                    src={brandLogoUrl}
                    alt={`${brandName} logo`}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-contain bg-white rounded-lg p-2"
                  />
                )}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">{brandName}</h1>
              </div>

              {brandDescription && (
                <p className="text-xl text-muted-foreground max-w-3xl">{brandDescription}</p>
              )}
            </div>
          </section>

          {/* H2 - Каталог продукції */}
          <section className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Вся продукція {brandName}</h2>

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
                          <PresignedImage
                            src={product.image_url || '/placeholder.jpg'}
                            alt={product.name}
                            width={384}
                            height={192}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{product.category}</p>
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
          {brandSeoText ? (
            <SEOTextSection
              title={`Чому варто обрати ${brandName}`}
              content={brandSeoText}
              keywords={
                brandSeoKeywords || [
                  `${brandName} Україна`,
                  `${brandName} офіційний`,
                  `${brandName} ціна`,
                  `купити ${brandName}`,
                ]
              }
            />
          ) : (
            <SEOTextSection
              title={`Чому варто обрати ${brandName}`}
              content={`
                <p class="mb-4">
                  <strong>${brandName}</strong> — це один з найпопулярніших брендів у світі моди та спорту.
                  Продукція ${brandName} поєднує в собі високу якість, інноваційні технології та стильний дизайн.
                </p>
                <p class="mb-4">
                  На Wearsearch ви можете знайти всю продукцію ${brandName} та порівняти ціни від різних магазинів.
                  Це допоможе вам знайти найвигіднішу пропозицію та заощадити гроші.
                </p>
                <p>
                  Використовуйте фільтри для швидкого пошуку потрібної моделі, розміру або кольору.
                  Всі ціни актуальні та оновлюються в режимі реального часу.
                </p>
              `}
              keywords={[
                `${brandName} Україна`,
                `${brandName} офіційний`,
                `${brandName} ціна`,
                `купити ${brandName}`,
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
    const res = await fetchBackendJson<unknown>(`/brands?lang=uk`, { next: { revalidate: 86400 } });
    if (!res) return [];

    const payload = isRecord(res) ? res.data : undefined;

    const list: Array<{ id: number | string }> = Array.isArray(payload)
      ? payload
      : Array.isArray(getArray(payload, 'data'))
        ? (getArray(payload, 'data') as Array<{ id: number | string }>)
        : Array.isArray(getArray(payload, 'brands'))
          ? (getArray(payload, 'brands') as Array<{ id: number | string }>)
          : Array.isArray(getArray(payload, 'items'))
            ? (getArray(payload, 'items') as Array<{ id: number | string }>)
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
