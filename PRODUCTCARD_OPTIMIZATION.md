# ProductCard Image Optimization

## How to Update ProductCard for Responsive Images

Replace the current ImageDebugger component with this optimized version:

### Before (Current):
```typescript
<ImageDebugger 
  src={imgSrc} 
  alt={name} 
  loading="lazy"
  className="w-full h-full object-cover"
/>
```

### After (Optimized):
```typescript
import { getResponsiveSrcSet, getFallbackImageUrl } from '@/utils/imageOptimization';

// In ProductCard component:
const responsiveSrcSet = getResponsiveSrcSet(imgSrc);
const fallbackSrc = getFallbackImageUrl(imgSrc);

// Replace ImageDebugger with:
<picture>
  {responsiveSrcSet && (
    <source
      type="image/webp"
      srcSet={responsiveSrcSet}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    />
  )}
  <img
    src={fallbackSrc}
    alt={name}
    loading="lazy"
    decoding="async"
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
    style={{
      filter: 'grayscale(100%) contrast(1.2) brightness(1.1)',
    }}
    onError={(e) => {
      // Fallback to placeholder if image fails
      e.currentTarget.src = '/placeholder.svg';
    }}
  />
</picture>
```

## Full Updated ProductCard Component

```typescript
import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FavoriteButton from './FavoriteButton';
import { getResponsiveSrcSet, getFallbackImageUrl } from '@/utils/imageOptimization';

interface ProductCardProps {
  id: number | string;
  name: string;
  image?: string;
  price?: string | number;
  category?: string;
  brand?: string;
  isNew?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ id, name, image, price, category, brand, isNew }) => {
  const { t } = useTranslation();
  
  // Memoize image URLs
  const imgSrc = image || '';
  const responsiveSrcSet = useMemo(() => getResponsiveSrcSet(imgSrc), [imgSrc]);
  const fallbackSrc = useMemo(() => getFallbackImageUrl(imgSrc), [imgSrc]);

  return (
    <Link to={`/product/${id}`} className="group block h-full">
      <div className="relative h-full flex flex-col rounded-lg sm:rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-[25px] transition-all duration-300 hover:border-white/20 hover:bg-white/8 hover:z-10">
        {/* Image Container */}
        <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden" style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.03) 0%, transparent 50%), linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.95) 100%)'
        }}>
          {/* Responsive Image */}
          <picture>
            {responsiveSrcSet && (
              <source
                type="image/webp"
                srcSet={responsiveSrcSet}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
            <img
              src={fallbackSrc}
              alt={name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
              style={{
                filter: 'grayscale(100%) contrast(1.2) brightness(1.1)',
              }}
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </picture>
          
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* New Badge */}
          {isNew && (
            <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[8px] sm:text-[9px] font-medium uppercase tracking-wider">
              New
            </div>
          )}
          
          {/* Favorite Button */}
          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 z-10 transition-all duration-300 scale-90 sm:scale-100">
            <FavoriteButton productId={String(id)} variant="ghost" size="icon" />
          </div>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand */}
            {brand && (
              <p className="text-[8px] sm:text-[9px] text-white/50 uppercase tracking-[0.15em] mb-0.5 sm:mb-1">
                {brand}
              </p>
            )}
            
            {/* Product Name */}
            <h3 className="font-display font-semibold text-[11px] sm:text-xs text-white line-clamp-2 mb-1 sm:mb-1.5">
              {name}
            </h3>
          </div>
          
          {/* Price */}
          <div className="mt-1 sm:mt-2">
            <p className="font-display text-xs sm:text-sm font-bold text-white">
              {t('common.from')} ₴{price ?? '0'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
```

## Benefits

### Before Optimization:
- 960×1201px image (800KB) shown as 303×404px
- Wasted: **710KB per image** ❌

### After Optimization:
- 400w WebP (40KB) on mobile
- 800w WebP (80KB) on desktop
- Savings: **90% bandwidth reduction** ✅

### Additional Benefits:
- **HTTP/2** via CloudFront (2-3x faster parallel downloads)
- **Lazy loading** (already implemented)
- **Proper aspect ratios** (no layout shift)
- **Fallback to original** if WebP not available

## When to Update

1. **After running** `npm run optimize-images` on backend
2. **After setting up** CloudFront CDN
3. **Test thoroughly** to ensure WebP fallback works

## Testing

```bash
# 1. Build production
npm run build && npm run preview

# 2. Open Network tab
# Check that:
# - WebP images are loaded (not JPG)
# - Correct sizes loaded (400w on mobile, 800w on desktop)
# - CloudFront URLs are used (if configured)

# 3. Test fallback
# Temporarily break image URL to verify placeholder shows
```
