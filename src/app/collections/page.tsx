import type { Metadata } from 'next';
import Link from 'next/link';
import {
  JsonLd,
  generateBreadcrumbSchema,
  generateItemListSchema,
} from '@/lib/seo/structured-data';
import { getServerLanguage } from '@/utils/languageStorage';
import { COLLECTION_SLUGS, getCollectionConfig } from '@/constants/collections';

const copy: Record<
  'uk' | 'en',
  { title: string; description: string; intro: string; seoTitle: string; seoBody: string[] }
> = {
  uk: {
    title: 'Колекції',
    description: 'Популярні добірки для трендових запитів і базового гардеробу.',
    intro: 'Перегляньте колекції, щоб швидко знайти потрібну категорію стилю.',
    seoTitle: 'Про колекції Wearsearch',
    seoBody: [
      'Колекції допомагають швидко перейти до популярних типів одягу та аксесуарів. Ми об’єднуємо товари з різних магазинів, щоб ви могли порівняти ціни й знайти найкращу пропозицію.',
      'Використовуйте колекції для швидкого старту: худі, кросівки, куртки, штани та аксесуари з актуальних дропів.',
    ],
  },
  en: {
    title: 'Collections',
    description: 'Popular edits for trending searches and everyday essentials.',
    intro: 'Browse curated collections to find the right style faster.',
    seoTitle: 'About Wearsearch collections',
    seoBody: [
      'Collections help you jump straight into popular edits across categories. We aggregate items from multiple stores so you can compare prices and discover the best offer.',
      'Use collections as a fast starting point: hoodies, sneakers, jackets, pants, and accessories from the latest drops.',
    ],
  },
};

const genderLinks: Record<
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

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLanguage();
  const locale = lang === 'en' ? 'en' : 'uk';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
  const meta = copy[locale];

  return {
    title: `${meta.title} | Wearsearch`,
    description: meta.description,
    alternates: {
      canonical: `${siteUrl}/collections`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      url: `${siteUrl}/collections`,
      siteName: 'Wearsearch',
      images: [`${siteUrl}/og-image.svg`],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [`${siteUrl}/og-image.svg`],
    },
    robots: { index: true, follow: true },
    other: {
      'content-language': locale,
    },
  };
}

export default async function CollectionsPage() {
  const lang = await getServerLanguage();
  const locale = lang === 'en' ? 'en' : 'uk';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
  const meta = copy[locale];

  const items = COLLECTION_SLUGS.map(slug => {
    const config = getCollectionConfig(slug);
    const title = config?.title[locale] ?? config?.title.en ?? slug;
    return {
      slug,
      title,
      description: config?.description[locale] ?? config?.description.en ?? '',
    };
  });

  const genderSection = genderLinks[locale];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: meta.title, url: `${siteUrl}/collections` },
  ]);

  const itemListSchema = generateItemListSchema(
    items.map(item => ({ name: item.title, url: `${siteUrl}/collections/${item.slug}` })),
    { name: meta.title, description: meta.description }
  );

  return (
    <div className="min-h-screen text-foreground">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{meta.title}</h1>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl">{meta.intro}</p>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <Link
              key={item.slug}
              href={`/collections/${item.slug}`}
              className="group rounded-3xl border border-foreground/10 p-6 sm:p-8 bg-muted/60 hover:bg-muted transition"
            >
              <div className="text-lg sm:text-xl font-semibold text-foreground">{item.title}</div>
              {item.description && (
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              )}
              <div className="mt-4 text-sm text-foreground inline-flex items-center gap-2">
                {locale === 'uk' ? 'Переглянути' : 'Browse'}
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-semibold">{genderSection.title}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {genderSection.items.map((item: { slug: string; label: string }) => (
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-semibold">{meta.seoTitle}</h2>
        <div className="mt-3 space-y-3 text-sm text-muted-foreground max-w-3xl">
          {meta.seoBody.map(text => (
            <p key={text}>{text}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
