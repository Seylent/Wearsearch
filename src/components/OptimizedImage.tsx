import React, { useState } from 'react';

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

  // Convert image path to WebP if not already
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const fallbackSrc = error ? (fallback || src) : src;

  // Generate responsive srcset for different screen sizes
  const generateSrcSet = (imageSrc: string) => {
    const base = imageSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const ext = imageSrc.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.webp';
    
    // Generate multiple sizes for responsive images
    return `
      ${base}-300w${ext} 300w,
      ${base}-600w${ext} 600w,
      ${base}-900w${ext} 900w,
      ${base}-1200w${ext} 1200w
    `.trim();
  };

  return (
    <picture>
      {/* WebP source for modern browsers */}
      <source 
        srcSet={generateSrcSet(webpSrc)} 
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        type="image/webp" 
      />
      
      {/* AVIF source for even better compression */}
      <source 
        srcSet={generateSrcSet(src.replace(/\.(jpg|jpeg|png)$/i, '.avif'))} 
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        type="image/avif" 
      />
      
      {/* Fallback to original format */}
      <img
        src={fallbackSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          console.error(`Failed to load image: ${src}`);
          setError(true);
          setLoaded(true); // Show fallback
        }}
        {...props}
      />
    </picture>
  );
};
