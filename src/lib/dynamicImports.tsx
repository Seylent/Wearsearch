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
  <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
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
