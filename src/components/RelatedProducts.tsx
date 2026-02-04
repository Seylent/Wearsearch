'use client';

/**
 * Related Products Component
 * Displays similar products based on category, brand, and price
 */

import { memo, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { useRelatedProducts } from '@/hooks/useApi';
import { convertS3UrlToHttps } from '@/lib/utils';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { useLazyLoad } from '@/hooks/useIntersectionObserver';
import { PresignedImage } from '@/components/common/PresignedImage';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getString = (value: Record<string, unknown>, key: string): string | undefined =>
  typeof value[key] === 'string' ? value[key] : undefined;

const getIdString = (value: Record<string, unknown>): string | undefined => {
  const id = value.id;
  if (typeof id === 'string') {
    return id;
  }
  if (typeof id === 'number') {
    return String(id);
  }
  return undefined;
};

interface RelatedProductsProps {
  productId: string;
  products?: unknown[];
  total?: number;
  className?: string;
}

export const RelatedProducts = memo(
  ({ productId, products, total, className = '' }: RelatedProductsProps) => {
    const { t } = useTranslation();
    const { formatPrice } = useCurrencyConversion();
    const sectionRef = useRef<HTMLDivElement>(null);
    const isVisible = useLazyLoad(sectionRef, { rootMargin: '400px', freezeOnceVisible: true });

    const hasProvidedProducts = Array.isArray(products);
    const { data, isLoading } = useRelatedProducts(productId);

    let resolvedProducts: unknown[];
    if (hasProvidedProducts) {
      resolvedProducts = products ?? [];
    } else {
      resolvedProducts = Array.isArray(data) ? data : [];
    }
    const resolvedTotal = typeof total === 'number' ? total : resolvedProducts.length;

    const imageSources = useMemo(
      () =>
        resolvedProducts.filter(isRecord).map(product => {
          const raw =
            getString(product, 'image') ?? getString(product, 'image_url') ?? '/placeholder.svg';
          return raw ? convertS3UrlToHttps(raw) : '';
        }),
      [resolvedProducts]
    );
    const resolvedImages = imageSources;

    // Don't show section if no products or still loading
    if (!hasProvidedProducts && isLoading) {
      return (
        <div className={`animate-fade-in ${className}`}>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-display text-2xl font-bold">
              {t('productDetail.similarProducts')}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={`related-skeleton-${i}`} className="animate-pulse">
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
      <div
        ref={sectionRef}
        className={`animate-fade-in ${className}`}
        style={{ minHeight: isVisible ? 'auto' : '300px' }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl font-bold">{t('productDetail.similarProducts')}</h2>
          <span className="text-sm text-muted-foreground ml-2">({resolvedTotal})</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {resolvedProducts.filter(isRecord).map((product, index) => {
            const id = getIdString(product);
            if (!id) return null;

            const image =
              getString(product, 'image') ?? getString(product, 'image_url') ?? '/placeholder.svg';
            const title = getString(product, 'title') ?? getString(product, 'name') ?? '';
            const brand = getString(product, 'brand');
            const price = product.price;
            const priceText =
              typeof price === 'number' || typeof price === 'string' ? String(price) : undefined;

            return (
              <Link key={id} href={`/product/${id}`} className="group block">
                <div className="relative rounded-2xl overflow-hidden bg-muted aspect-square mb-3 transition-transform md:group-hover:scale-105">
                  <PresignedImage
                    src={resolvedImages[index] || convertS3UrlToHttps(image)}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover"
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
                    <p className="text-sm font-semibold">{formatPrice(Number(priceText) || 0)}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }
);

RelatedProducts.displayName = 'RelatedProducts';

export default RelatedProducts;
