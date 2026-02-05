/**
 * Dynamic Imports for Heavy Components
 * Reduces initial bundle size by lazy loading heavy libraries
 */

import dynamic from 'next/dynamic';

// Loading component
function PageLoader({ message = 'Loading...' }: Readonly<{ message?: string }>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center animate-in fade-in-0 duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-sm text-zinc-400">{message}</p>
      </div>
    </div>
  );
}

// Placeholder favorites component
const FavoritesComponent = () => (
  <div className="min-h-screen text-foreground flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Favorites</h1>
      <p className="text-gray-400">Your favorite products will appear here.</p>
      <p className="text-gray-500 text-sm mt-2">
        This feature will be implemented with user authentication.
      </p>
    </div>
  </div>
);

export const DynamicFavorites = dynamic(() => Promise.resolve(FavoritesComponent), {
  loading: () => <PageLoader message="Loading Favorites..." />,
  ssr: false,
});

// Search components - heavy with autocomplete
export const DynamicEnhancedSearch = dynamic(() => import('@/components/EnhancedSearch'), {
  loading: () => <PageLoader message="Loading Search..." />,
  ssr: false, // Search is interactive only
});

// Admin components - lazy loaded to reduce initial bundle
export const DynamicAdminContent = dynamic(() => import('@/components/AdminContent'), {
  loading: () => <PageLoader message="Loading Admin Panel..." />,
  ssr: false, // Admin is client-side only
});

export const DynamicAddProductForm = dynamic(() => import('@/components/admin/AddProductForm'), {
  loading: () => <PageLoader message="Loading Product Form..." />,
  ssr: false,
});

export const DynamicStoreManagement = dynamic(() => import('@/components/admin/StoreManagement'), {
  loading: () => <PageLoader message="Loading Store Management..." />,
  ssr: false,
});

export const DynamicStoreOwnerManagement = dynamic(
  () => import('@/components/admin/StoreOwnerManagement'),
  {
    loading: () => <PageLoader message="Loading Owner Management..." />,
    ssr: false,
  }
);

export const DynamicProductList = dynamic(() => import('@/components/admin/ProductList'), {
  loading: () => <PageLoader message="Loading Products..." />,
  ssr: false,
});
