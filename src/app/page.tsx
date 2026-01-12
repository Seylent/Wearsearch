'use client';

import { HomeContent } from '@/components/pages/HomeContent';
import { useHomepageData } from '@/hooks/useAggregatedData';
import type { Product } from '@/services/productService';
import type { SEOData } from '@/services/api/seo.api';

// Note: revalidate cannot be used in client components
// This would need to be moved to layout.tsx or converted to Server Component

interface HomePageData {
  products?: Product[];
  seoData?: SEOData;
}

export default function HomePage() {
  const { data, isLoading } = useHomepageData('UAH');
  const homeData = (data as HomePageData) || {};

  return (
    <HomeContent 
      products={homeData.products || []} 
      seoData={homeData.seoData || null}
      isLoading={isLoading}
    />
  );
}
