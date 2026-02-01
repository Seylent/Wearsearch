'use client';

import dynamic from 'next/dynamic';

const NavigationProgress = dynamic(() => import('@/components/NavigationProgress'), {
  ssr: false,
  loading: () => null,
});

const OfflineBanner = dynamic(
  () => import('@/components/OfflineBanner').then(mod => mod.OfflineBanner),
  {
    ssr: false,
    loading: () => null,
  }
);

export const ClientOnlyOverlays = () => (
  <>
    <NavigationProgress />
    <OfflineBanner />
  </>
);
