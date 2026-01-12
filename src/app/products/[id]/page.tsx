import { Suspense } from 'react';
import { Metadata } from 'next';
import ProductDetail from '@/components/ProductDetail';

// Types
interface PageProps {
  params: {
    id: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // TODO: Fetch product data for metadata
  return {
    title: `Product ${params.id} - WearSearch`,
    description: 'Product details and information',
  };
}

// Server Component for product details
export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <ProductDetail />
    </Suspense>
  );
}
