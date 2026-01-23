import { Suspense } from 'react';
import { Metadata } from 'next';
import ProductDetail from '@/components/ProductDetail';
import { generateProductMetadata } from '@/lib/seo/metadata-utils';
import { fetchBackendJson } from '@/lib/backendFetch';
import { generateBreadcrumbStructuredData, generateProductStructuredData } from '@/hooks/useSEO';

// Types
interface PageProps {
  params: {
    id: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const res = await fetchBackendJson<any>(`/products/${params.id}`, {
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

    const payload = res.data;
    const product =
      payload?.product || payload?.item || payload?.data?.product || payload?.data?.item || payload;

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
      product.canonical_url ||
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com'}/products/${params.id}`;

    const metadata = generateProductMetadata(product.name, product.brand, {
      description: product.seo_description || product.description,
      imageUrl: product.image_url,
      price: product.price,
      currency: product.currency || 'UAH',
      canonicalUrl,
      keywords:
        product.keywords && Array.isArray(product.keywords) && product.keywords.length > 0
          ? product.keywords
          : [
              product.brand,
              product.name,
              product.category,
              'ціна',
              'порівняння',
              'купити онлайн',
            ].filter(Boolean),
    });

    return {
      ...metadata,
      title: product.seo_title || metadata.title,
      openGraph: {
        ...metadata.openGraph,
        title: product.seo_title || metadata.openGraph?.title,
        description: product.seo_description || metadata.openGraph?.description,
        ...(canonicalUrl ? { url: canonicalUrl } : {}),
        ...(product.price
          ? {
              price: {
                amount: String(product.price),
                currency: product.currency || 'UAH',
              },
            }
          : {}),
      },
      twitter: {
        ...metadata.twitter,
        title: product.seo_title || metadata.twitter?.title,
        description: product.seo_description || metadata.twitter?.description,
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
    const res = await fetchBackendJson<any>(`/products/${params.id}`, {
      next: { revalidate: 3600 },
    });
    const payload = res?.data;
    const product =
      payload?.product || payload?.item || payload?.data?.product || payload?.data?.item || payload;

    if (product) {
      structuredData = generateProductStructuredData({
        id: String(product.id ?? params.id),
        name: String(product.name ?? ''),
        description: product.seo_description || product.description,
        image_url: product.image_url,
        price: product.price,
        currency: product.currency || 'UAH',
        brand: product.brand,
        category: product.category || product.type,
      });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
      breadcrumbData = generateBreadcrumbStructuredData(
        [
          { name: 'Wearsearch', url: siteUrl },
          { name: 'Products', url: `${siteUrl}/products` },
          product.type
            ? { name: String(product.type), url: `${siteUrl}/products?type=${product.type}` }
            : null,
          { name: String(product.name ?? 'Product'), url: `${siteUrl}/products/${params.id}` },
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
