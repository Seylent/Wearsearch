/**
 * Optimized Image Component with Priority Support
 * Provides better image loading performance with next/image
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  fill = false,
  sizes,
  quality = 75,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fallback placeholder
  const placeholderSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23222" width="400" height="400"/%3E%3C/svg%3E';

  if (error || !src) {
    return (
      <div className={`${className} bg-zinc-900 flex items-center justify-center`}>
        <svg className="w-12 h-12 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onLoad: () => setIsLoading(false),
    onError: () => setError(true),
    quality,
    priority,
    placeholder: 'blur' as const,
    blurDataURL: placeholderSrc,
    ...(fill ? { fill: true, sizes: sizes || '100vw' } : { width: width || 400, height: height || 400 }),
  };

  return <Image {...imageProps} />;
}
