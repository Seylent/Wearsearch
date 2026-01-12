import { Suspense } from 'react';
import { Metadata } from 'next';

// Data fetching
import { getHomepageData } from './api/getHomepageData';

// Components
import HomeContent from '@/components/HomePageContentNew';

// Metadata
export const metadata: Metadata = {
  title: 'WearSearch - Find Your Perfect Style',
  description: 'Discover the latest fashion trends and products from top brands. Shop clothing, shoes, and accessories with fast shipping.',
  openGraph: {
    title: 'WearSearch - Find Your Perfect Style',
    description: 'Discover the latest fashion trends and products from top brands.',
    type: 'website',
  },
};

// Server Component with proper data fetching
export default async function HomePage() {
  try {
    // Fetch data on the server
    const homepageData = await getHomepageData();
    
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/80">Loading homepage...</p>
          </div>
        </div>
      }>
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
