import { Suspense } from 'react';
import { Metadata } from 'next';
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
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const storeIdParam = typeof searchParams.store_id === 'string' ? searchParams.store_id : null;
  const pageParam = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const initialPage = asNumber(pageParam, 1);
  let initialPageData: Record<string, unknown> | undefined;

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
    if (typeof searchParams.q === 'string' && searchParams.q.trim()) {
      params.set('search', searchParams.q.trim());
    }
    appendMany('type', searchParams.type);
    appendMany('color', searchParams.color);
    appendMany('gender', searchParams.gender);
    appendMany('material', searchParams.material || searchParams.material_id);
    appendMany('technology', searchParams.technology || searchParams.technology_id);
    appendMany('size', searchParams.size || searchParams.size_id);
    if (typeof searchParams.brand === 'string' && searchParams.brand.trim()) {
      params.set('brandId', searchParams.brand.trim());
    }
    if (typeof searchParams.price_min === 'string' && searchParams.price_min.trim()) {
      params.set('minPrice', searchParams.price_min.trim());
    }
    if (typeof searchParams.price_max === 'string' && searchParams.price_max.trim()) {
      params.set('maxPrice', searchParams.price_max.trim());
    }
    if (typeof searchParams.sort === 'string' && searchParams.sort.trim()) {
      params.set('sort', searchParams.sort.trim());
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
          { name: 'Головна', url: process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com' },
          {
            name: 'Товари',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com'}/products`,
          },
        ])}
      />
      <ProductsContent
        initialPageData={initialPageData}
        initialPage={initialPage}
        initialCurrency="UAH"
      />
    </Suspense>
  );
}
