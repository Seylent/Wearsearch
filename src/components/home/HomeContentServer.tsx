import HomeContentClient from './HomeContentClient';
import type { Product } from '@/types';

interface SEOData {
  title?: string;
  meta_title?: string;
  description?: string;
  meta_description?: string;
  h1_title?: string;
  content_text?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

interface HomeContentProps {
  featuredProducts: Product[];
  newProducts: Product[];
  popularProducts: Product[];
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    productCount: number;
  }>;
  seoData: SEOData | null;
  stats: {
    totalProducts: number;
    totalBrands: number;
    totalCategories: number;
  };
}

// SERVER COMPONENT - Passes data to client component
export default function HomeContent({
  featuredProducts,
  popularProducts,
  seoData,
  categories,
}: Readonly<HomeContentProps>) {
  return (
    <HomeContentClient
      initialProducts={featuredProducts}
      initialPopularProducts={popularProducts}
      seoData={seoData}
      categories={categories}
    />
  );
}
