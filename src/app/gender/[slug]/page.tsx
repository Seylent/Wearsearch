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
import Link from 'next/link';
import { COLLECTION_SLUGS, getCollectionConfig } from '@/constants/collections';

const VALID_GENDERS = new Set(['men', 'women', 'unisex']);

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

const seoCopy: Record<
  'uk' | 'en',
  Record<
    string,
    { title: string; description: string; intro: string; seoTitle: string; seoBody: string[] }
  >
> = {
  uk: {
    men: {
      title: 'Чоловічий одяг',
      description: 'Добірка чоловічого одягу, essentials та нових колекцій від топ-брендів.',
      intro: 'Досліджуйте чоловічий одяг, взуття та аксесуари з добірки найкращих магазинів.',
      seoTitle: 'Про чоловічу добірку',
      seoBody: [
        'Чоловіча добірка об’єднує базові та сезонні речі з різних магазинів, щоб ви могли швидко порівнювати ціни та знаходити актуальні новинки.',
        'Використовуйте фільтри за розміром, брендом і ціною, щоб зібрати власну капсулу на кожен день або під конкретну подію.',
      ],
    },
    women: {
      title: 'Жіночий одяг',
      description: 'Жіночий одяг, сезонні добірки та бестселери від топ-брендів.',
      intro: 'Відкрийте жіночі новинки, трендові речі та добірки від перевірених магазинів.',
      seoTitle: 'Про жіночу добірку',
      seoBody: [
        'Жіноча добірка охоплює базові та трендові речі з актуальних колекцій. Ми зібрали пропозиції з різних магазинів, щоб ви могли швидко порівнювати ціни.',
        'Додавайте улюблені позиції, комбінуйте образи та використовуйте фільтри для точного підбору.',
      ],
    },
    unisex: {
      title: 'Унісекс одяг',
      description: 'Унісекс базові речі з універсальними силуетами та комфортною посадкою.',
      intro: 'Перегляньте унісекс добірки для щоденного стилю та сучасних образів.',
      seoTitle: 'Про унісекс добірку',
      seoBody: [
        'Унісекс добірка зібрана для тих, хто цінує універсальні силуети, базові кольори та комфортні матеріали.',
        'Порівнюйте пропозиції різних магазинів, щоб знайти найкращу ціну на потрібну модель.',
      ],
    },
  },
  en: {
    men: {
      title: "Men's clothing",
      description: "Discover men's clothing, essentials, and new drops across top brands.",
      intro:
        "Explore the latest men's apparel, footwear, and accessories curated from leading stores.",
      seoTitle: 'About the men’s edit',
      seoBody: [
        'The men’s edit brings together essentials and seasonal pieces from multiple stores so you can compare prices and spot new arrivals quickly.',
        'Use filters by size, brand, and price to build a versatile wardrobe for everyday looks or special occasions.',
      ],
    },
    women: {
      title: "Women's clothing",
      description: "Shop women's clothing, seasonal edits, and best sellers across top brands.",
      intro:
        "Discover women's fashion picks, trending essentials, and fresh releases from curated stores.",
      seoTitle: 'About the women’s edit',
      seoBody: [
        'The women’s edit gathers essentials and trend-forward pieces from current collections, making it easy to compare offers in one place.',
        'Save favorites and use filters to narrow down by style, size, and price.',
      ],
    },
    unisex: {
      title: 'Unisex clothing',
      description: 'Explore unisex essentials with inclusive fits and versatile styles.',
      intro:
        'Browse unisex staples and modern silhouettes designed for everyday comfort and style.',
      seoTitle: 'About the unisex edit',
      seoBody: [
        'The unisex edit focuses on versatile silhouettes, neutral palettes, and comfortable fabrics designed to work across styles.',
        'Compare offers across stores to find the best value for your next essential piece.',
      ],
    },
  },
};

const faqCopy: Record<'uk' | 'en', Record<string, Array<{ q: string; a: string }>>> = {
  uk: {
    men: [
      {
        q: 'Які бренди доступні в чоловічій добірці?',
        a: 'Ми збираємо чоловічі колекції від локальних та міжнародних брендів з актуальними новинками.',
      },
      {
        q: 'Чи є фільтри за розміром і кольором?',
        a: 'Так, ви можете швидко відфільтрувати товари за розміром, кольором, матеріалом і ціною.',
      },
    ],
    women: [
      {
        q: 'Що входить у жіночу добірку?',
        a: 'Одяг, взуття та аксесуари від перевірених магазинів з регулярними оновленнями колекцій.',
      },
      {
        q: 'Чи можна шукати по бренду?',
        a: 'Так, доступний пошук та фільтр за брендом, щоб швидко знайти потрібний стиль.',
      },
    ],
    unisex: [
      {
        q: 'Що таке унісекс у Wearsearch?',
        a: 'Це універсальні моделі з нейтральними силуетами, які підходять для різних стилів.',
      },
      {
        q: 'Як обрати розмір?',
        a: 'Використовуйте фільтр розміру та переглядайте описи конкретних моделей.',
      },
    ],
  },
  en: {
    men: [
      {
        q: 'Which brands are featured in men’s edits?',
        a: 'We curate men’s collections from local and global brands with fresh seasonal drops.',
      },
      {
        q: 'Can I filter by size or color?',
        a: 'Yes, use filters for size, color, materials, and price to refine your search.',
      },
    ],
    women: [
      {
        q: 'What’s included in the women’s selection?',
        a: 'Apparel, footwear, and accessories from trusted stores with frequently updated drops.',
      },
      {
        q: 'Can I search by brand?',
        a: 'Yes, brand filters help you find the exact style you want.',
      },
    ],
    unisex: [
      {
        q: 'What does unisex mean on Wearsearch?',
        a: 'It’s a neutral-fit selection designed for everyday versatility and comfort.',
      },
      {
        q: 'How do I pick the right size?',
        a: 'Use the size filter and review the product details before purchase.',
      },
    ],
  },
};

interface GenderPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: GenderPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!VALID_GENDERS.has(slug)) return generateSearchMetadata();

  const lang = await getServerLanguage();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
  const copy = seoCopy[lang]?.[slug] ?? seoCopy.en[slug];

  return {
    title: `${copy.title} | Wearsearch`,
    description: copy.description,
    alternates: {
      canonical: `${siteUrl}/gender/${slug}`,
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      type: 'website',
      url: `${siteUrl}/gender/${slug}`,
      siteName: 'Wearsearch',
      images: [`${siteUrl}/og-image.svg`],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [`${siteUrl}/og-image.svg`],
    },
    robots: { index: true, follow: true },
    other: {
      'content-language': lang,
    },
  };
}

export async function generateStaticParams() {
  return ['men', 'women', 'unisex'].map(slug => ({ slug }));
}

export default async function GenderPage({ params }: Readonly<GenderPageProps>) {
  const { slug } = await params;
  if (!VALID_GENDERS.has(slug)) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
  const lang = await getServerLanguage();
  const copy = seoCopy[lang]?.[slug] ?? seoCopy.en[slug];
  const faqItems = faqCopy[lang]?.[slug] ?? faqCopy.en[slug];
  const locale = lang === 'en' ? 'en' : 'uk';
  const collectionLinks = COLLECTION_SLUGS.map(collectionSlug => {
    const config = getCollectionConfig(collectionSlug);
    return {
      slug: collectionSlug,
      title: config?.title[locale] ?? config?.title.en ?? collectionSlug,
    };
  });

  const [categoriesRes, brandsRes, productsRes] = await Promise.all([
    fetchBackendJson<unknown>(`/categories?lang=${encodeURIComponent(lang)}`, {
      next: { revalidate: 3600 },
    }),
    fetchBackendJson<unknown>(`/brands?lang=${encodeURIComponent(lang)}`, {
      next: { revalidate: 3600 },
    }),
    fetchBackendJson<unknown>(
      `/pages/products?gender=${encodeURIComponent(slug)}&limit=12&lang=${encodeURIComponent(
        lang
      )}`,
      { next: { revalidate: 1800 } }
    ),
  ]);

  const categoriesPayload = isRecord(categoriesRes) ? categoriesRes.data : undefined;
  const categoriesArray =
    (getArray(categoriesPayload, 'categories') ??
      getArray(categoriesPayload, 'data') ??
      (Array.isArray(categoriesPayload) ? categoriesPayload : [])) ||
    [];

  const brandsPayload = isRecord(brandsRes) ? brandsRes.data : undefined;
  const brandsArray =
    (getArray(brandsPayload, 'brands') ??
      getArray(brandsPayload, 'data') ??
      (Array.isArray(brandsPayload) ? brandsPayload : [])) ||
    [];

  const productsPayload = isRecord(productsRes) ? productsRes.data : undefined;
  const productsData = getRecord(productsPayload, 'data') ?? productsPayload;
  const products =
    (getArray(productsData, 'items') ??
      getArray(productsPayload, 'items') ??
      getArray(productsData, 'products') ??
      getArray(productsPayload, 'products') ??
      (Array.isArray(productsPayload) ? productsPayload : [])) ||
    [];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: copy.title, url: `${siteUrl}/gender/${slug}` },
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
      name: copy.title,
      description: copy.description,
    }
  );

  return (
    <div className="min-h-screen text-foreground">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListData} />
      <JsonLd data={faqSchema} />
      <Suspense fallback={null}>
        <ProductsContent />
      </Suspense>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-semibold">{copy.seoTitle}</h2>
        <div className="mt-3 space-y-3 text-sm text-muted-foreground max-w-3xl">
          {copy.seoBody.map(text => (
            <p key={text}>{text}</p>
          ))}
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">
              {lang === 'uk' ? 'Популярні категорії' : 'Top categories'}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {categoriesArray
                .slice(0, 6)
                .map(
                  (category: {
                    slug?: string;
                    name?: string;
                    canonical_url?: string;
                    id?: string;
                  }) => {
                    const name = category.name || category.slug || 'Category';
                    const canonicalUrl = normalizeCanonicalUrl(
                      siteUrl,
                      toOptionalString(category.canonical_url)
                    );
                    const href =
                      canonicalUrl || `/categories/${category.slug || category.id || ''}`;
                    return (
                      <Link
                        key={name}
                        href={href}
                        className="rounded-2xl border border-foreground/10 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40 transition"
                      >
                        {name}
                      </Link>
                    );
                  }
                )}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">
              {lang === 'uk' ? 'Популярні бренди' : 'Top brands'}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {brandsArray
                .slice(0, 6)
                .map(
                  (brand: {
                    slug?: string;
                    name?: string;
                    canonical_url?: string;
                    id?: string;
                  }) => {
                    const name = brand.name || brand.slug || 'Brand';
                    const canonicalUrl = normalizeCanonicalUrl(
                      siteUrl,
                      toOptionalString(brand.canonical_url)
                    );
                    const href = canonicalUrl || `/brands/${brand.slug || brand.id || ''}`;
                    return (
                      <Link
                        key={name}
                        href={href}
                        className="rounded-2xl border border-foreground/10 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40 transition"
                      >
                        {name}
                      </Link>
                    );
                  }
                )}
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <h2 className="text-2xl font-semibold">
          {lang === 'uk' ? 'Популярні колекції' : 'Popular collections'}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collectionLinks.map(link => (
            <Link
              key={link.slug}
              href={`/collections/${link.slug}`}
              className="rounded-2xl border border-foreground/10 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40 transition"
            >
              {link.title}
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
