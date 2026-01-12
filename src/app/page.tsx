'use client';

import { HomeContent } from '@/components/pages/HomeContent';
import { useHomepageData } from '@/hooks/useAggregatedData';

// Note: revalidate cannot be used in client components
// This would need to be moved to layout.tsx or converted to Server Component

export default function HomePage() {
  const { data, isLoading } = useHomepageData('UAH');
  const homeData = data as { products?: any[]; seoData?: any } | undefined;

  return (
    <HomeContent 
      products={(homeData?.products || []) as any} 
      seoData={(homeData?.seoData || null) as any}
      isLoading={isLoading}
    />
  );
}
