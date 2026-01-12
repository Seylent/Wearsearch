'use client';

import ProductDetail from '@/pages/ProductDetail';

// Note: revalidate and generateStaticParams cannot be used in client components
// For SSR/ISR features, this page should be converted to Server Component

export default function ProductDetailPage({ params: _params }: { params: { id: string } }) {
  return <ProductDetail />;
}
