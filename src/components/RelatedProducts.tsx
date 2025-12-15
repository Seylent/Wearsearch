/**
 * Related Products Component
 * Displays similar products based on category, brand, and price
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useRelatedProducts } from '@/hooks/useApi';
import { convertS3UrlToHttps } from '@/lib/utils';

interface RelatedProductsProps {
  productId: string;
  className?: string;
}

export function RelatedProducts({ productId, className = '' }: RelatedProductsProps) {
  const { data, isLoading, error } = useRelatedProducts(productId);
  
  // Debug logging
  console.log('🔍 RelatedProducts component rendered:', {
    productId,
    isLoading,
    hasData: !!data,
    productsCount: data?.products?.length || 0,
    error
  });
  
  // Don't show section if no products or still loading
  if (isLoading) {
    return (
      <div className={`animate-fade-in ${className}`}>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl font-bold">Similar Products</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-2xl mb-3" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Hide section if no related products
  if (!data?.products || data.products.length === 0) {
    return null;
  }
  
  return (
    <div className={`animate-fade-in ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-display text-2xl font-bold">Similar Products</h2>
        <span className="text-sm text-muted-foreground ml-2">
          ({data.total} {data.total === 1 ? 'product' : 'products'})
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {data.products.map((product: any) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group block"
          >
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-square mb-3 transition-transform group-hover:scale-105">
              <img
                src={convertS3UrlToHttps(product.image || product.image_url || '/placeholder.svg')}
                alt={product.title || product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {product.title || product.name}
              </p>
              {product.brand && (
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {product.brand}
                </p>
              )}
              {product.price && (
                <p className="text-sm font-semibold">
                  ₴{product.price}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
