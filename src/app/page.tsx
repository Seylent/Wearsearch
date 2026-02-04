import { Suspense } from 'react';
import { Metadata } from 'next';

// Data fetching
import { getHomepageData } from './api/getHomepageData';

// Components
import HomeContent from '@/components/home/HomeContentServer';

// SEO utilities
import { generateHomeMetadata } from '@/lib/seo/metadata-utils';
import { JsonLd, generateItemListSchema } from '@/lib/seo/structured-data';

// Metadata
export const metadata: Metadata = generateHomeMetadata();

// Server Component with proper data fetching
export default async function HomePage() {
  try {
    // Fetch data on the server
    const homepageData = await getHomepageData();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
    const itemListData = generateItemListSchema(
      (homepageData.popularProducts || []).slice(0, 20).map(item => {
        const product = item as {
          id: string;
          name?: string;
          canonical_url?: string;
          slug?: string;
        };
        return {
          name: product.name || 'Product',
          url: product.canonical_url || `${siteUrl}/products/${product.slug || product.id}`,
        };
      }),
      {
        name: 'Популярні товари',
        description: 'Популярні товари на Wearsearch',
      }
    );

    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-foreground">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth mx-auto mb-4"></div>
              <p className="text-muted-foreground">Завантаження головної...</p>
            </div>
          </div>
        }
      >
        <JsonLd data={itemListData} />
        <HomeContent
          featuredProducts={homepageData.featuredProducts}
          newProducts={homepageData.newProducts}
          popularProducts={homepageData.popularProducts}
          categories={homepageData.categories}
          seoData={homepageData.seoData}
          stats={homepageData.stats}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error in HomePage:', error);

    // Error fallback
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Ласкаво просимо до Wearsearch</h1>
          <p className="text-muted-foreground mb-6">
            Виникла помилка під час завантаження головної.
          </p>
          <a
            href="/products"
            className="inline-flex w-full sm:w-auto items-center justify-center px-6 sm:px-8 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-full bg-white text-black transition-colors hover:bg-gray-100 font-black"
          >
            Переглянути товари
          </a>
        </div>
      </div>
    );
  }
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour
