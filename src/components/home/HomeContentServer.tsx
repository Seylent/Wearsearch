import HomeContentClient from './HomeContentClient';
import type { Product } from '@/types';
import type { Banner } from '@/types/banner';

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
  banners?: Banner[];
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
  banners = [],
  seoData,
  categories,
}: Readonly<HomeContentProps>) {
  return (
    <HomeContentClient
      initialProducts={featuredProducts}
      initialPopularProducts={popularProducts}
      banners={banners}
      seoData={seoData}
      categories={categories}
    />
  );
}
