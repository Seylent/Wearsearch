import { Suspense } from 'react';
import { Metadata } from 'next';

// Components
import { ProductsContent } from '@/components/ProductsContent';

// Metadata
export const metadata: Metadata = {
  title: 'Products - WearSearch',
  description: 'Discover our complete collection of products. Filter by brand, category, color, and more.',
  openGraph: {
    title: 'Products - WearSearch',
    description: 'Discover our complete collection of products. Filter by brand, category, color, and more.',
    type: 'website',
  },
};

// Server Component
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}

// Generate static params if needed
export function generateStaticParams() {
  return [
    { searchParams: {} }, // Default page
  ];
}
