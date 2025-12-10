import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallback,
  className = '',
  ...props
}) => {
  // Convert image path to WebP if not already
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const fallbackSrc = fallback || src;

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={fallbackSrc}
        alt={alt}
        loading="lazy"
        className={className}
        {...props}
      />
    </picture>
  );
};
