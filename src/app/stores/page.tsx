import { Suspense } from 'react';
import { Metadata } from 'next';
import StoresContent from '@/components/pages/StoresContent';
import {
  JsonLd,
  generateBreadcrumbSchema,
  generateItemListSchema,
} from '@/lib/seo/structured-data';

// SEO метадані для сторінки магазинів
export const metadata: Metadata = {
  title: 'Магазини та бренди - Wearsearch | Знайдіть кращі ціни',
  description:
    'Перегляньте всі магазини та бренди на Wearsearch. Порівнюйте ціни, знаходьте найкращі пропозиції від популярних українських та міжнародних брендів.',
  keywords: [
    'магазини України',
    'бренди одягу',
    'порівняння магазинів',
    'інтернет магазини',
    'модні бренди',
    'магазини взуття',
    'аксесуари',
    'найкращі ціни',
  ],
  openGraph: {
    title: 'Магазини та бренди - Wearsearch',
    description: 'Знайдіть найкращі магазини та бренди. Порівнюйте ціни та економте на покупках.',
    type: 'website',
    url: '/stores',
    images: [
      {
        url: '/images/stores-og.svg',
        width: 1200,
        height: 630,
        alt: 'Магазини та бренди на Wearsearch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Магазини та бренди - Wearsearch',
    description: 'Найкращі магазини та бренди в одному місці. Порівнюйте ціни!',
    images: ['/images/stores-og.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/stores',
    languages: {
      uk: '/stores',
      en: '/en/stores',
    },
  },
};

export const revalidate = 3600;

export default async function StoresPage() {
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
            name: 'Магазини',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com'}/stores`,
          },
        ])}
      />
      <JsonLd
        data={generateItemListSchema([], {
          name: 'Магазини',
          description: 'Список магазинів на Wearsearch',
        })}
      />
      <StoresContent />
    </Suspense>
  );
}
