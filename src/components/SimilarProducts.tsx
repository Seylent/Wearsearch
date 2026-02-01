/**
 * Similar Products Component
 * Shows products similar to the current one
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSimilarProducts } from '@/hooks/useRecommendations';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface SimilarProductsProps {
  productId: string | number;
  limit?: number;
  className?: string;
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({ productId, limit = 6, className }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrencyConversion();
  const { similarProducts, isLoading } = useSimilarProducts(productId, limit);

  // Show loading state
  if (isLoading) {
    return (
      <section className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-white/60" />
          <h2 className="font-display text-lg font-semibold text-white">
            {t('products.similarProducts', 'Similar Products')}
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-white/40" />
        </div>
      </section>
    );
  }

  // Don't show if no similar products
  if (similarProducts.length === 0) {
    return null;
  }

  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-white/60" />
        <h2 className="font-display text-lg font-semibold text-white">
          {t('products.similarProducts', 'Similar Products')}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {similarProducts.map(product => {
          const imageUrl = product.image || product.image_url || '/placeholder.png';

          return (
            <Link key={product.id} href={`/product/${product.id}`} className="group block">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 transition-all group-hover:border-white/30">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />

                {/* Similarity score */}
                {product.similarityScore && product.similarityScore > 0.7 && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-blue-500/80 backdrop-blur-sm">
                    <span className="text-[10px] text-white font-medium">
                      {Math.round(product.similarityScore * 100)}%
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 space-y-1">
                <h3 className="text-xs font-medium text-white line-clamp-1 group-hover:text-white/80">
                  {product.name}
                </h3>
                <span className="text-sm font-semibold text-white">
                  {formatPrice(Number(product.price) || 0)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SimilarProducts;
