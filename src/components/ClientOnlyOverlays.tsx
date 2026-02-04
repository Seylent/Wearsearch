'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { ScrollLockReset } from '@/components/ScrollLockReset';
import { flushPendingVitals, initWebVitals } from '@/utils/webVitals';

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

export const ClientOnlyOverlays = () => {
  useEffect(() => {
    initWebVitals();
    const flush = () => flushPendingVitals();
    window.addEventListener('wearsearch:cookies-accepted', flush as EventListener);
    const timeoutId = window.setTimeout(() => flushPendingVitals(), 1500);
    return () => {
      window.removeEventListener('wearsearch:cookies-accepted', flush as EventListener);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <NavigationProgress />
      <OfflineBanner />
      <ScrollLockReset />
    </>
  );
};
