import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StoresContent from '@/components/pages/StoresContent';
import { fetchBackendJson } from '@/lib/backendFetch';
import {
  JsonLd,
  generateBreadcrumbStructuredData,
  generateStoreStructuredData,
} from '@/lib/seo/structured-data';

export const revalidate = 3600;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getRecord = (value: unknown, key: string): Record<string, unknown> | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
};

const toOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

interface StorePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';

  try {
    const res = await fetchBackendJson<unknown>(`/stores/${id}`, {
      next: { revalidate: 3600 },
    });

    if (!res) {
      return {
        title: 'Магазин | Wearsearch',
        description: 'Перегляд магазину та його товарів.',
        robots: { index: false, follow: true },
      };
    }

    const payload = isRecord(res) ? res.data : undefined;
    const store =
      getRecord(payload, 'store') ??
      getRecord(getRecord(payload, 'data'), 'store') ??
      getRecord(payload, 'item') ??
      payload;

    if (!store) {
      return {
        title: 'Магазин | Wearsearch',
        description: 'Перегляд магазину та його товарів.',
        robots: { index: false, follow: true },
      };
    }

    const storeName = toOptionalString(isRecord(store) ? store.name : undefined) || 'Магазин';
    const storeDescription =
      toOptionalString(isRecord(store) ? store.seo_description : undefined) ||
      toOptionalString(isRecord(store) ? store.description : undefined) ||
      `Товари та бренди магазину ${storeName} на Wearsearch.`;
    const storeLogoUrl = toOptionalString(isRecord(store) ? store.logo_url : undefined);
    const storeSeoTitle = toOptionalString(isRecord(store) ? store.seo_title : undefined);
    const canonicalUrl =
      toOptionalString(isRecord(store) ? store.canonical_url : undefined) ||
      `${siteUrl}/stores/${id}`;

    return {
      title: storeSeoTitle || `${storeName} | Wearsearch`,
      description: storeDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: storeSeoTitle || storeName,
        description: storeDescription,
        images: storeLogoUrl ? [storeLogoUrl] : [`${siteUrl}/og-image.svg`],
        type: 'website',
        siteName: 'Wearsearch',
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: storeSeoTitle || storeName,
        description: storeDescription,
        images: storeLogoUrl ? [storeLogoUrl] : [`${siteUrl}/og-image.svg`],
      },
      robots: { index: true, follow: true },
    };
  } catch (error) {
    console.error('Error generating store metadata:', error);
    return {
      title: 'Магазин | Wearsearch',
      description: 'Перегляд магазину та його товарів.',
      robots: { index: false, follow: true },
    };
  }
}

export default async function StoreDetailPage({ params }: StorePageProps) {
  const { id } = await params;
  let storeStructuredData: Record<string, unknown> | null = null;
  let breadcrumbData: Record<string, unknown> | null = null;

  if (!id) {
    notFound();
  }

  try {
    const res = await fetchBackendJson<unknown>(`/stores/${id}`, {
      next: { revalidate: 3600 },
    });

    if (res) {
      const payload = isRecord(res) ? res.data : undefined;
      const store =
        getRecord(payload, 'store') ??
        getRecord(getRecord(payload, 'data'), 'store') ??
        getRecord(payload, 'item') ??
        payload;

      if (store) {
        const storeName = toOptionalString(isRecord(store) ? store.name : undefined) || 'Магазин';
        const storeDescription =
          toOptionalString(isRecord(store) ? store.seo_description : undefined) ||
          toOptionalString(isRecord(store) ? store.description : undefined);
        const storeLogoUrl = toOptionalString(isRecord(store) ? store.logo_url : undefined);
        const storeWebsiteUrl = toOptionalString(isRecord(store) ? store.website_url : undefined);
        const storeContactEmail = toOptionalString(
          isRecord(store) ? store.contact_email : undefined
        );
        const storeContactPhone = toOptionalString(
          isRecord(store) ? store.contact_phone : undefined
        );
        const storeCountry = toOptionalString(isRecord(store) ? store.country : undefined);
        const storeInstagram = toOptionalString(isRecord(store) ? store.instagram_url : undefined);
        const storeTelegram = toOptionalString(isRecord(store) ? store.telegram_url : undefined);
        const canonicalUrl =
          toOptionalString(isRecord(store) ? store.canonical_url : undefined) ||
          `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com'}/stores/${id}`;

        storeStructuredData = generateStoreStructuredData({
          name: storeName,
          description: storeDescription,
          logo_url: storeLogoUrl,
          url: canonicalUrl,
          website_url: storeWebsiteUrl,
          contact_email: storeContactEmail,
          contact_phone: storeContactPhone,
          country: storeCountry,
          sameAs: [storeInstagram, storeTelegram].filter(Boolean) as string[],
        });

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
        breadcrumbData = generateBreadcrumbStructuredData([
          { name: 'Wearsearch', url: siteUrl },
          { name: 'Магазини', url: `${siteUrl}/stores` },
          { name: storeName, url: canonicalUrl },
        ]);
      }
    }
  } catch (error) {
    console.error('Error generating store structured data:', error);
  }

  return (
    <>
      {storeStructuredData ? <JsonLd data={storeStructuredData} /> : null}
      {breadcrumbData ? <JsonLd data={breadcrumbData} /> : null}
      <StoresContent storeId={id} />
    </>
  );
}
