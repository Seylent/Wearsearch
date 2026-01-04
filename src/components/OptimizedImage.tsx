import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  sizes?: string;
  priority?: boolean; // For above-the-fold images
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallback,
  sizes,
  priority = false,
  className = '',
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const computed = useMemo(() => {
    const isRemote = /^(https?:)?\/\//i.test(src);
    const hasKnownExt = /\.(avif|webp|png|jpe?g)(\?.*)?$/i.test(src);

    // If remote (or unknown extension), do not guess alternate formats/sizes.
    // This avoids extra network requests for URLs that don't exist.
    if (isRemote || !hasKnownExt) {
      return {
        useSources: false,
        avifSrc: src,
        webpSrc: src,
      };
    }

    const avifSrc = src.replace(/\.(jpg|jpeg|png|webp)(\?.*)?$/i, '.avif$2');
    const webpSrc = src.replace(/\.(jpg|jpeg|png|avif)(\?.*)?$/i, '.webp$2');
    return {
      useSources: true,
      avifSrc,
      webpSrc,
    };
  }, [src]);

  const fallbackSrc = error ? (fallback || src) : src;

  // Generate responsive srcset for local, pre-generated assets (e.g. foo-600w.webp)
  const generateSrcSet = (imageSrc: string) => {
    const [pathPart, queryPart] = imageSrc.split('?');
    const base = pathPart.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
    const ext = pathPart.match(/\.(jpg|jpeg|png|webp|avif)$/i)?.[0] || '.webp';
    const q = queryPart ? `?${queryPart}` : '';

    return [
      `${base}-300w${ext}${q} 300w`,
      `${base}-600w${ext}${q} 600w`,
      `${base}-900w${ext}${q} 900w`,
      `${base}-1200w${ext}${q} 1200w`,
    ].join(', ');
  };

  return (
    <picture>
      {computed.useSources && (
        <>
          {/* AVIF first for best compression when supported */}
          <source
            srcSet={generateSrcSet(computed.avifSrc)}
            sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
            type="image/avif"
          />
          <source
            srcSet={generateSrcSet(computed.webpSrc)}
            sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
            type="image/webp"
          />
        </>
      )}

      {/* Fallback to original format */}
      <img
        src={fallbackSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true); // Show fallback
        }}
        {...props}
      />
    </picture>
  );
};
