import { Suspense } from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers';

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
  const nonce = (await headers()).get('x-nonce') || undefined;
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
          <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/80">Loading homepage...</p>
            </div>
          </div>
        }
      >
        <JsonLd data={itemListData} nonce={nonce} />
        <HomeContent
          featuredProducts={homepageData.featuredProducts}
          newProducts={homepageData.newProducts}
          popularProducts={homepageData.popularProducts}
          categories={homepageData.categories}
          banners={homepageData.banners}
          seoData={homepageData.seoData}
          stats={homepageData.stats}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error in HomePage:', error);

    // Error fallback
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to WearSearch</h1>
          <p className="text-white/80 mb-6">Something went wrong loading the homepage.</p>
          <a
            href="/products"
            className="bg-white text-black px-6 py-2 rounded-lg transition-colors hover:bg-gray-100"
          >
            Browse Products
          </a>
        </div>
      </div>
    );
  }
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour
