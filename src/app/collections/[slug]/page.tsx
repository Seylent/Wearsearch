import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductsContent } from '@/components/ProductsContent';
import { generateSearchMetadata } from '@/lib/seo/metadata-utils';
import {
  JsonLd,
  generateBreadcrumbSchema,
  generateItemListSchema,
} from '@/lib/seo/structured-data';
import { getServerLanguage } from '@/utils/languageStorage';
import { fetchBackendJson } from '@/lib/backendFetch';
import { COLLECTION_SLUGS, getCollectionConfig } from '@/constants/collections';
import Link from 'next/link';

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

const normalizeCanonicalUrl = (siteUrl: string, value?: string): string | undefined => {
  if (!value) return undefined;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return `${siteUrl}${value}`;
  return undefined;
};

const faqCopy: Record<'uk' | 'en', Array<{ q: string; a: string }>> = {
  uk: [
    {
      q: 'Як знайти потрібну річ у колекції?',
      a: 'Використовуйте фільтри за розміром, кольором та ціною, щоб швидко звузити вибір.',
    },
    {
      q: 'Чи є нові надходження?',
      a: 'Колекції оновлюються регулярно, тому ви побачите найсвіжіші дропи у списку.',
    },
  ],
  en: [
    {
      q: 'How can I find the right item?',
      a: 'Use filters by size, color, and price to narrow down your selection.',
    },
    {
      q: 'Do you update collections often?',
      a: 'Collections are refreshed regularly with the newest drops and releases.',
    },
  ],
};

const genderCopy: Record<
  'uk' | 'en',
  { title: string; items: Array<{ slug: string; label: string }> }
> = {
  uk: {
    title: 'Добірки за статтю',
    items: [
      { slug: 'women', label: 'Жінки' },
      { slug: 'men', label: 'Чоловіки' },
      { slug: 'unisex', label: 'Унісекс' },
    ],
  },
  en: {
    title: 'Shop by gender',
    items: [
      { slug: 'women', label: 'Women' },
      { slug: 'men', label: 'Men' },
      { slug: 'unisex', label: 'Unisex' },
    ],
  },
};

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return COLLECTION_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = getCollectionConfig(slug);
  if (!config) return generateSearchMetadata();

  const lang = await getServerLanguage();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
  const title = config.title[lang] ?? config.title.en;
  const description = config.description[lang] ?? config.description.en;

  return {
    title: `${title} | Wearsearch`,
    description,
    alternates: {
      canonical: `${siteUrl}/collections/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${siteUrl}/collections/${slug}`,
      siteName: 'Wearsearch',
      images: [`${siteUrl}/og-image.svg`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/og-image.svg`],
    },
    robots: { index: true, follow: true },
    other: {
      'content-language': lang,
    },
  };
}

export default async function CollectionPage({ params }: Readonly<CollectionPageProps>) {
  const { slug } = await params;
  const config = getCollectionConfig(slug);
  if (!config) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
  const lang = await getServerLanguage();
  const title = config.title[lang] ?? config.title.en;
  const intro = config.intro[lang] ?? config.intro.en;
  const faqItems = faqCopy[lang] ?? faqCopy.en;
  const genderSection = genderCopy[lang] ?? genderCopy.en;

  const productsRes = await fetchBackendJson<unknown>(
    `/pages/products?type=${encodeURIComponent(config.type)}&limit=12&lang=${encodeURIComponent(
      lang
    )}`,
    { next: { revalidate: 1800 } }
  );

  const productsPayload = isRecord(productsRes) ? productsRes.data : undefined;
  const productsData = getRecord(productsPayload, 'data') ?? productsPayload;
  const products =
    (getArray(productsData, 'items') ??
      getArray(productsPayload, 'items') ??
      getArray(productsData, 'products') ??
      getArray(productsPayload, 'products') ??
      (Array.isArray(productsPayload) ? productsPayload : [])) ||
    [];

  const itemListData = generateItemListSchema(
    products
      .slice(0, 12)
      .map((item: { id?: string; name?: string; canonical_url?: string; slug?: string }) => {
        const canonicalUrl = normalizeCanonicalUrl(siteUrl, toOptionalString(item.canonical_url));
        const fallbackUrl = `${siteUrl}/products/${item.slug || item.id || ''}`;
        return {
          name: item.name || 'Product',
          url: canonicalUrl || fallbackUrl,
        };
      }),
    {
      name: title,
      description: config.description[lang] ?? config.description.en,
    }
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Collections', url: `${siteUrl}/collections` },
    { name: title, url: `${siteUrl}/collections/${slug}` },
  ]);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="min-h-screen text-foreground">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListData} />
      <JsonLd data={faqSchema} />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl">{intro}</p>
      </section>
      <Suspense fallback={null}>
        <ProductsContent />
      </Suspense>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-semibold">{genderSection.title}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {genderSection.items.map(item => (
            <Link
              key={item.slug}
              href={`/gender/${item.slug}`}
              className="rounded-2xl border border-foreground/10 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40 transition"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {faqItems.map(item => (
            <div key={item.q} className="rounded-2xl border border-foreground/10 p-4">
              <h3 className="font-semibold text-base">{item.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
