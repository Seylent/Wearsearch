import { Suspense } from 'react';
import { Metadata } from 'next';
import ProductDetail from '@/components/ProductDetail';
import { generateProductMetadata } from '@/lib/seo/metadata-utils';
import { fetchBackendJson } from '@/lib/backendFetch';
import { generateBreadcrumbStructuredData, generateProductStructuredData } from '@/hooks/useSEO';
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

const toOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

// Types
interface PageProps {
  params: {
    id: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const lang = await getServerLanguage();
    const res = await fetchBackendJson<unknown>(`/products/${params.id}?lang=${lang}`, {
      next: { revalidate: 3600 },
    });

    if (!res) {
      return {
        title: 'Товар | Wearsearch',
        description: 'Перегляд товару та порівняння цін.',
        robots: {
          index: true,
          follow: true,
        },
      };
    }

    const payload = isRecord(res) ? res.data : undefined;
    const product =
      getRecord(payload, 'product') ??
      getRecord(payload, 'item') ??
      getRecord(getRecord(payload, 'data'), 'product') ??
      getRecord(getRecord(payload, 'data'), 'item') ??
      payload;

    if (!product) {
      return {
        title: 'Товар | Wearsearch',
        description: 'Перегляд товару та порівняння цін.',
        robots: {
          index: true,
          follow: true,
        },
      };
    }

    const canonicalUrl =
      toOptionalString(isRecord(product) ? product.canonical_url : undefined) ||
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com'}/products/${params.id}`;

    const productName = toOptionalString(isRecord(product) ? product.name : undefined) ?? 'Product';
    const productBrand = toOptionalString(isRecord(product) ? product.brand : undefined) ?? '';
    const productDescription =
      toOptionalString(isRecord(product) ? product.seo_description : undefined) ||
      toOptionalString(isRecord(product) ? product.description : undefined);
    const productImageUrl = toOptionalString(isRecord(product) ? product.image_url : undefined);
    const productPrice = toOptionalNumber(isRecord(product) ? product.price : undefined);
    const productCurrency =
      toOptionalString(isRecord(product) ? product.currency : undefined) || 'UAH';
    const productCategory =
      toOptionalString(isRecord(product) ? product.category : undefined) ||
      toOptionalString(isRecord(product) ? product.type : undefined);
    const productKeywords =
      isRecord(product) && Array.isArray(product.keywords) && product.keywords.length > 0
        ? product.keywords
            .map(item => (typeof item === 'string' ? item : ''))
            .filter((value): value is string => value.length > 0)
        : [
            productBrand,
            productName,
            productCategory,
            'ціна',
            'порівняння',
            'купити онлайн',
          ].filter(Boolean);

    const productPriceString =
      typeof productPrice === 'number' && Number.isFinite(productPrice)
        ? String(productPrice)
        : undefined;

    const metadata = generateProductMetadata(productName, productBrand, {
      description: productDescription,
      imageUrl: productImageUrl,
      price: productPriceString,
      currency: productCurrency,
      canonicalUrl,
      keywords: productKeywords,
    });

    return {
      ...metadata,
      title: toOptionalString(isRecord(product) ? product.seo_title : undefined) || metadata.title,
      openGraph: {
        ...metadata.openGraph,
        title:
          toOptionalString(isRecord(product) ? product.seo_title : undefined) ||
          metadata.openGraph?.title,
        description: productDescription || metadata.openGraph?.description,
        ...(canonicalUrl ? { url: canonicalUrl } : {}),
        ...(typeof productPrice === 'number'
          ? {
              price: {
                amount: String(productPrice),
                currency: productCurrency,
              },
            }
          : {}),
      },
      twitter: {
        ...metadata.twitter,
        title:
          toOptionalString(isRecord(product) ? product.seo_title : undefined) ||
          metadata.twitter?.title,
        description: productDescription || metadata.twitter?.description,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Товар | Wearsearch',
      description: 'Інформація про товар',
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}

// Server Component for product details
export default async function ProductDetailPage({ params }: PageProps) {
  let structuredData: Record<string, unknown> | null = null;
  let breadcrumbData: Record<string, unknown> | null = null;

  try {
    const lang = await getServerLanguage();
    const res = await fetchBackendJson<unknown>(`/products/${params.id}?lang=${lang}`, {
      next: { revalidate: 3600 },
    });
    const payload = isRecord(res) ? res.data : undefined;
    const product =
      getRecord(payload, 'product') ??
      getRecord(payload, 'item') ??
      getRecord(getRecord(payload, 'data'), 'product') ??
      getRecord(getRecord(payload, 'data'), 'item') ??
      payload;

    if (product) {
      structuredData = generateProductStructuredData({
        id: String(isRecord(product) ? (product.id ?? params.id) : params.id),
        name: String(isRecord(product) ? (product.name ?? '') : ''),
        description:
          toOptionalString(isRecord(product) ? product.seo_description : undefined) ||
          toOptionalString(isRecord(product) ? product.description : undefined),
        image_url: toOptionalString(isRecord(product) ? product.image_url : undefined),
        price: toOptionalNumber(isRecord(product) ? product.price : undefined),
        currency: toOptionalString(isRecord(product) ? product.currency : undefined) || 'UAH',
        brand: toOptionalString(isRecord(product) ? product.brand : undefined),
        category:
          toOptionalString(isRecord(product) ? product.category : undefined) ||
          toOptionalString(isRecord(product) ? product.type : undefined),
      });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
      breadcrumbData = generateBreadcrumbStructuredData(
        [
          { name: 'Wearsearch', url: siteUrl },
          { name: 'Products', url: `${siteUrl}/products` },
          toOptionalString(isRecord(product) ? product.type : undefined)
            ? {
                name: String(toOptionalString(isRecord(product) ? product.type : undefined)),
                url: `${siteUrl}/products?type=${toOptionalString(isRecord(product) ? product.type : undefined)}`,
              }
            : null,
          {
            name: String(
              toOptionalString(isRecord(product) ? product.name : undefined) ?? 'Product'
            ),
            url: `${siteUrl}/products/${params.id}`,
          },
        ].filter(Boolean) as Array<{ name: string; url: string }>
      );
    }
  } catch (error) {
    console.error('Error fetching product for structured data:', error);
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      }
    >
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
      )}
      <ProductDetail />
    </Suspense>
  );
}
