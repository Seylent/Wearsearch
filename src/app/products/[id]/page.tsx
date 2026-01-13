import { Suspense } from 'react';
import { Metadata } from 'next';
import ProductDetail from '@/components/ProductDetail';
import { generateProductMetadata } from '@/lib/seo/metadata-utils';

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
        title: 'Товар не знайдено | Wearsearch',
        description: 'Цей товар не знайдено. Спробуйте інший пошук.',
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const product = await response.json();
    
    // Використовуємо нову SEO-функцію
    return generateProductMetadata(
      product.name,
      product.brand,
      {
        description: product.description,
        imageUrl: product.image_url,
        price: product.price,
        currency: product.currency || 'UAH',
        keywords: [
          product.brand,
          product.name,
          product.category,
          'ціна',
          'порівняння',
          'купити онлайн',
        ].filter(Boolean),
      }
    );
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Товар | Wearsearch',
      description: 'Інформація про товар',
      robots: {
        index: false,
        follow: true,
      },
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
