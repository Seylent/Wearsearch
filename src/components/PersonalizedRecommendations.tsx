/**
 * Personalized Recommendations Component
 * Shows product recommendations based on user behavior
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Sparkles, TrendingUp, Heart, Eye, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { usePresignedImages } from '@/hooks/usePresignedImage';
import { PresignedImage } from '@/components/common/PresignedImage';

interface PersonalizedRecommendationsProps {
  limit?: number;
  className?: string;
}

const reasonIcons = {
  based_on_favorites: Heart,
  based_on_views: Eye,
  trending: TrendingUp,
  similar_users: Sparkles,
};

const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  limit = 8,
  className,
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrencyConversion();
  const { recommendations, isLoading, isEnabled } = useRecommendations(limit);
  const isLoggedIn = useIsAuthenticated();
  const resolvedImages = usePresignedImages(
    recommendations.map(product => product.image || product.image_url || '')
  );

  // Don't show for non-authenticated users
  if (!isLoggedIn) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <section className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="font-display text-lg font-semibold text-white">
            {t('recommendations.title', 'Recommended for You')}
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-white/40" />
        </div>
      </section>
    );
  }

  // Don't show if no recommendations
  if (!isEnabled || recommendations.length === 0) {
    return null;
  }

  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h2 className="font-display text-lg font-semibold text-white">
          {t('recommendations.title', 'Recommended for You')}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {recommendations.map((product, index) => {
          // Skip products without valid id
          if (!product.id && product.id !== 0) return null;

          const ReasonIcon = product.reason ? reasonIcons[product.reason] : Sparkles;
          const imageUrl = resolvedImages[index] || product.image || product.image_url || '';

          return (
            <Link
              key={product.id || `rec-${index}`}
              href={`/product/${product.id}`}
              className="group block"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 transition-all group-hover:border-white/30">
                <PresignedImage
                  src={imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />

                {/* Reason badge */}
                {product.reason && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-purple-500/80 backdrop-blur-sm flex items-center gap-1">
                    <ReasonIcon className="w-3 h-3 text-white" />
                    <span className="text-[10px] text-white font-medium">
                      {t(`recommendations.reason.${product.reason}`, product.reason)}
                    </span>
                  </div>
                )}

                {/* Score indicator */}
                {product.score && product.score > 0.8 && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-green-500/80 backdrop-blur-sm">
                    <span className="text-[10px] text-white font-medium">
                      {Math.round(product.score * 100)}% match
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 space-y-1">
                <h3 className="text-sm font-medium text-white line-clamp-1 group-hover:text-white/80">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {formatPrice(Number(product.price) || 0)}
                  </span>
                  {product.brand && <span className="text-xs text-white/40">{product.brand}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default PersonalizedRecommendations;
