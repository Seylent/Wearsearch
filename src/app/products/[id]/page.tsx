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
  try {
    // Fetch product data server-side
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${API_URL}/api/products/${params.id}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      return {
        title: 'Product Not Found - WearSearch',
        description: 'This product could not be found',
      };
    }

    const product = await response.json();
    
    return {
      title: `${product.name} - ${product.brand || 'WearSearch'}`,
      description: product.description || `Shop ${product.name} from ${product.brand}. Available now at WearSearch.`,
      openGraph: {
        title: `${product.name} - ${product.brand || 'WearSearch'}`,
        description: product.description || `Shop ${product.name} from ${product.brand}`,
        images: product.image_url ? [product.image_url] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} - ${product.brand || 'WearSearch'}`,
        description: product.description || `Shop ${product.name}`,
        images: product.image_url ? [product.image_url] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product - WearSearch',
      description: 'Product details and information',
    };
  }
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
