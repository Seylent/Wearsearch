/**
 * Related Products Component
 * Displays similar products based on category, brand, and price
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { useRelatedProducts } from '@/hooks/useApi';
import { convertS3UrlToHttps } from '@/lib/utils';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const getString = (value: Record<string, unknown>, key: string): string | undefined =>
  typeof value[key] === 'string' ? value[key] : undefined;

const getIdString = (value: Record<string, unknown>): string | undefined => {
  const id = value.id;
  return typeof id === 'string' ? id : typeof id === 'number' ? String(id) : undefined;
};

interface RelatedProductsProps {
  productId: string;
  products?: unknown[];
  total?: number;
  className?: string;
}

export const RelatedProducts = memo(({ productId, products, total, className = '' }: RelatedProductsProps) => {
  const { t } = useTranslation();

  const hasProvidedProducts = Array.isArray(products);
  const { data, isLoading, error: _error } = useRelatedProducts(productId);

  const resolvedProducts: unknown[] = hasProvidedProducts ? (products ?? []) : (Array.isArray(data) ? data : []);
  const resolvedTotal = typeof total === 'number' ? total : resolvedProducts.length;
  
  // Don't show section if no products or still loading
  if (!hasProvidedProducts && isLoading) {
    return (
      <div className={`animate-fade-in ${className}`}>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl font-bold">{t('productDetail.similarProducts')}</h2>
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
  if (!resolvedProducts || resolvedProducts.length === 0) {
    return null;
  }
  
  return (
    <div className={`animate-fade-in ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-display text-2xl font-bold">{t('productDetail.similarProducts')}</h2>
        <span className="text-sm text-muted-foreground ml-2">
          ({resolvedTotal} {resolvedTotal === 1 ? t('productDetail.product') : t('productDetail.products')})
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {resolvedProducts
          .filter(isRecord)
          .flatMap((product) => {
            const id = getIdString(product);
            if (!id) return [];

            const image = getString(product, 'image') ?? getString(product, 'image_url') ?? '/placeholder.svg';
            const title = getString(product, 'title') ?? getString(product, 'name') ?? '';
            const brand = getString(product, 'brand');
            const price = product.price;
            const priceText = typeof price === 'number' || typeof price === 'string' ? String(price) : undefined;

            return [
              <Link
                key={id}
                to={`/product/${id}`}
                className="group block"
              >
                <div className="relative rounded-2xl overflow-hidden bg-muted aspect-square mb-3 transition-transform md:group-hover:scale-105">
                  <img
                    src={convertS3UrlToHttps(image)}
                    alt={title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm line-clamp-2 md:group-hover:text-primary transition-colors">
                    {title}
                  </p>
                  {brand && (
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {brand}
                    </p>
                  )}
                  {priceText && (
                    <p className="text-sm font-semibold">
                      ₴{priceText}
                    </p>
                  )}
                </div>
              </Link>,
            ];
          })}
      </div>
    </div>
  );
});

RelatedProducts.displayName = 'RelatedProducts';

export default RelatedProducts;
