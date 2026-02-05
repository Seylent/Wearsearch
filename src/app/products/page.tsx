import { Suspense } from 'react';
import { Metadata } from 'next';
import { generateSearchMetadata } from '@/lib/seo/metadata-utils';
import { shouldIndexPage } from '@/lib/seo/helpers';
import { fetchBackendJson } from '@/lib/backendFetch';
import {
  JsonLd,
  generateBreadcrumbSchema,
  generateItemListSchema,
} from '@/lib/seo/structured-data';
import { getServerLanguage } from '@/utils/languageStorage';
import type { Banner } from '@/types/banner';

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

const asNumber = (value: unknown, fallback: number): number => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const normalizeCanonicalUrl = (siteUrl: string, value?: string): string | undefined => {
  if (!value) return undefined;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return `${siteUrl}${value}`;
  return undefined;
};

// Components
import { ProductsContent } from '@/components/ProductsContent';

export const revalidate = 120;

// Динамічний metadata залежно від фільтрів
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const searchParamsData = await searchParams;
  const params = new URLSearchParams();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';

  // Конвертуємо searchParams в URLSearchParams
  Object.entries(searchParamsData).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.set(key, value);
      }
    }
  });

  const shouldIndex = shouldIndexPage('/products', params);
  const categoryType =
    typeof searchParamsData.type === 'string' ? searchParamsData.type : undefined;

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
        const canonicalUrl =
          toOptionalString(isRecord(category) ? category.canonical_url : undefined) ||
          `${siteUrl}/products?type=${encodeURIComponent(categoryType)}`;

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
            url: canonicalUrl,
            images: [`${siteUrl}/og-image.svg`],
          },
          twitter: {
            card: 'summary_large_image',
            title: categorySeoTitle || categoryName,
            description: categorySeoDescription || categoryDescription,
            images: [`${siteUrl}/og-image.svg`],
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
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParamsData = await searchParams;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
  const storeIdParam =
    typeof searchParamsData.store_id === 'string' ? searchParamsData.store_id : null;
  const pageParam = Array.isArray(searchParamsData.page)
    ? searchParamsData.page[0]
    : searchParamsData.page;
  const initialPage = asNumber(pageParam, 1);
  let initialPageData: Record<string, unknown> | undefined;
  let banners: Banner[] = [];

  const bannersRes = await fetchBackendJson<unknown>(`/banners`, {
    next: { revalidate: 600 },
  });
  if (bannersRes) {
    const bannersPayload = isRecord(bannersRes) ? bannersRes.data : undefined;
    banners = (getArray(getRecord(bannersPayload, 'data'), 'banners') ??
      getArray(bannersPayload, 'banners') ??
      getArray(bannersPayload, 'items') ??
      (Array.isArray(bannersPayload) ? bannersPayload : [])) as Banner[];
  }

  if (!storeIdParam) {
    const params = new URLSearchParams();
    const appendMany = (key: string, value?: string | string[]) => {
      if (!value) return;
      if (Array.isArray(value)) {
        for (const v of value) {
          if (String(v).trim()) params.append(key, String(v));
        }
        return;
      }
      if (String(value).trim()) params.append(key, String(value));
    };

    params.set('page', String(initialPage));
    params.set('limit', '24');
    if (typeof searchParamsData.q === 'string' && searchParamsData.q.trim()) {
      params.set('search', searchParamsData.q.trim());
    }
    appendMany('type', searchParamsData.type);
    appendMany('color', searchParamsData.color);
    appendMany('gender', searchParamsData.gender);
    appendMany('material', searchParamsData.material || searchParamsData.material_id);
    appendMany('technology', searchParamsData.technology || searchParamsData.technology_id);
    appendMany('size', searchParamsData.size || searchParamsData.size_id);
    if (typeof searchParamsData.brand === 'string' && searchParamsData.brand.trim()) {
      params.set('brandId', searchParamsData.brand.trim());
    }
    if (typeof searchParamsData.price_min === 'string' && searchParamsData.price_min.trim()) {
      params.set('minPrice', searchParamsData.price_min.trim());
    }
    if (typeof searchParamsData.price_max === 'string' && searchParamsData.price_max.trim()) {
      params.set('maxPrice', searchParamsData.price_max.trim());
    }
    if (typeof searchParamsData.sort === 'string' && searchParamsData.sort.trim()) {
      params.set('sort', searchParamsData.sort.trim());
    }
    params.set('currency', 'UAH');

    const res = await fetchBackendJson<unknown>(`/pages/products?${params.toString()}`, {
      next: { revalidate: 120 },
    });

    if (res) {
      const body = isRecord(res) ? res.data : undefined;
      const data = getRecord(body, 'data') ?? (isRecord(body) ? body : undefined);
      const items = (getArray(data, 'items') ?? []) as unknown[];
      const meta = getRecord(data, 'meta') ?? {};
      const facets = getRecord(data, 'facets') ?? {};
      const currency = getRecord(data, 'currency');
      const seo = getRecord(data, 'seo') ?? getRecord(data, 'seo_data') ?? getRecord(meta, 'seo');

      const page = asNumber(meta.page, initialPage);
      const limit = asNumber(meta.limit, 24);
      const totalItems = asNumber(meta.totalItems, items.length);
      const totalPages = asNumber(
        meta.totalPages,
        Math.max(1, Math.ceil(totalItems / Math.max(1, limit)))
      );
      const hasNext = typeof meta.hasNext === 'boolean' ? meta.hasNext : page < totalPages;
      const hasPrev = typeof meta.hasPrev === 'boolean' ? meta.hasPrev : page > 1;

      const pagination = {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext,
        hasPrev,
      };

      const facetsBrands = (facets as Record<string, unknown>)?.brands;
      const brands = Array.isArray(facetsBrands) ? facetsBrands : [];

      initialPageData = { products: items, brands, pagination, facets, currency, seo };
    }
  }

  const productsForSchema = Array.isArray(initialPageData?.products)
    ? (initialPageData.products as Array<{
        id?: string;
        name?: string;
        canonical_url?: string;
        slug?: string;
      }>)
    : [];

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth"></div>
        </div>
      }
    >
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: 'Головна', url: siteUrl },
          {
            name: 'Товари',
            url: `${siteUrl}/products`,
          },
        ])}
      />
      {productsForSchema.length > 0 && (
        <JsonLd
          data={generateItemListSchema(
            productsForSchema.slice(0, 20).map(item => {
              const canonicalUrl = normalizeCanonicalUrl(
                siteUrl,
                toOptionalString(item.canonical_url)
              );
              const fallbackUrl = `${siteUrl}/products/${item.slug || item.id || ''}`;
              return {
                name: item.name || 'Product',
                url: canonicalUrl || fallbackUrl,
              };
            }),
            {
              name: 'Products',
              description: 'Browse products on Wearsearch',
            }
          )}
        />
      )}
      <ProductsContent
        initialPageData={initialPageData}
        initialPage={initialPage}
        initialCurrency="UAH"
        banners={banners}
      />
    </Suspense>
  );
}
