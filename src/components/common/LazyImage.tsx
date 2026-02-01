/**
 * Lazy Image Component with Intersection Observer
 * Loads images only when they're about to enter viewport
 */

'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  threshold?: number;
  rootMargin?: string;
  placeholder?: string;
}

export function LazyImage({
  src,
  alt,
  threshold = 0.01,
  rootMargin = '200px',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23222" width="400" height="400"/%3E%3C/svg%3E',
  className = '',
  width,
  height,
  loading,
  ...props
}: LazyImageProps) {
  const imgRef = useRef<HTMLSpanElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const getSize = (value: string | number | undefined, fallback: number): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
  };

  const widthValue = getSize(width, 400);
  const heightValue = getSize(height, 400);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return (
    <span ref={imgRef} style={{ display: 'inline-block', width: widthValue, height: heightValue }}>
      <Image
        src={isInView ? src : placeholder}
        alt={alt}
        width={widthValue}
        height={heightValue}
        loading={loading ?? 'lazy'}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </span>
  );
}
