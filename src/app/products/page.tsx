import { Suspense } from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { generateSearchMetadata } from '@/lib/seo/metadata-utils';
import { shouldIndexPage } from '@/lib/seo/helpers';
import { fetchBackendJson } from '@/lib/backendFetch';
import { JsonLd, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getServerLanguage } from '@/utils/languageStorage';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getRecord = (value: unknown, key: string): Record<string, unknown> | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
};

const toOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

// Components
import { ProductsContent } from '@/components/ProductsContent';

// Динамічний metadata залежно від фільтрів
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const params = new URLSearchParams();

  // Конвертуємо searchParams в URLSearchParams
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.set(key, value);
      }
    }
  });

  const shouldIndex = shouldIndexPage('/products', params);
  const categoryType = typeof searchParams.type === 'string' ? searchParams.type : undefined;

  // Якщо це SEO сторінка категорії - отримуємо дані з API
  if (shouldIndex && categoryType) {
    try {
      const lang = await getServerLanguage();
      let res = await fetchBackendJson<unknown>(
        `/pages/products?type=${encodeURIComponent(categoryType)}&lang=${encodeURIComponent(lang)}`,
        { next: { revalidate: 3600 } }
      );

      if (!res) {
        res = await fetchBackendJson<unknown>(`/categories/${categoryType}?lang=${lang}`, {
          next: { revalidate: 3600 },
        });
      }

      if (res) {
        const data = isRecord(res) ? res.data : undefined;
        const category =
          getRecord(data, 'category') ??
          getRecord(getRecord(data, 'data'), 'category') ??
          getRecord(data, 'item') ??
          data ??
          {};
        const categoryName =
          toOptionalString(isRecord(category) ? category.name : undefined) ?? 'Категорія';
        const categorySeoTitle = toOptionalString(
          isRecord(category) ? category.seo_title : undefined
        );
        const categorySeoDescription = toOptionalString(
          isRecord(category) ? category.seo_description : undefined
        );
        const categoryDescription = toOptionalString(
          isRecord(category) ? category.description : undefined
        );
        const canonicalUrl = toOptionalString(
          isRecord(category) ? category.canonical_url : undefined
        );

        return {
          title: categorySeoTitle || `${categoryName} | Wearsearch`,
          description: categorySeoDescription || categoryDescription,
          alternates: {
            canonical: canonicalUrl,
          },
          robots: {
            index: true,
            follow: true,
          },
          openGraph: {
            title: categorySeoTitle || categoryName,
            description: categorySeoDescription || categoryDescription,
            type: 'website',
          },
        };
      }
    } catch (error) {
      console.error('Error fetching category metadata:', error);
    }
  }

  // Для фільтрованих сторінок - noindex
  return generateSearchMetadata();
}

// Server Component
export default async function ProductsPage() {
  const nonce = (await headers()).get('x-nonce') || undefined;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      }
    >
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: 'Головна', url: process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com' },
          {
            name: 'Товари',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com'}/products`,
          },
        ])}
        nonce={nonce}
      />
      <ProductsContent />
    </Suspense>
  );
}
