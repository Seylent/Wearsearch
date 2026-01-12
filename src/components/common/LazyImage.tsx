/**
 * Lazy Image Component with Intersection Observer
 * Loads images only when they're about to enter viewport
 */

'use client';

import { useRef, useState, useEffect } from 'react';

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
  ...props
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

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
    <img
      ref={imgRef}
      src={isInView ? src : placeholder}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={() => setIsLoaded(true)}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}
