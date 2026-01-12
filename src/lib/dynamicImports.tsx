/**
 * Dynamic Imports for Heavy Components
 * Reduces initial bundle size by lazy loading heavy libraries
 */

import dynamic from 'next/dynamic';

// Loading component
function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center animate-in fade-in-0 duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-sm text-zinc-400">{message}</p>
      </div>
    </div>
  );
}

// Heavy admin components - load only when needed
export const DynamicAdmin = dynamic<Record<string, never>>(
  () => import('@/pages/Admin'),
  {
    loading: () => <PageLoader message="Loading Admin Panel..." />,
    ssr: false, // Admin is client-side only
  }
);

// User profile components
export const DynamicProfile = dynamic<Record<string, never>>(
  () => import('@/pages/Profile'),
  {
    loading: () => <PageLoader />,
    ssr: false,
  }
);

export const DynamicFavorites = dynamic<Record<string, never>>(
  () => import('@/pages/Favorites'),
  {
    loading: () => <PageLoader message="Loading Favorites..." />,
    ssr: false,
  }
);
