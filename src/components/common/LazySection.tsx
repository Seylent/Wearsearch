/**
 * Lazy Section Component
 * Renders children only when section enters viewport
 * Useful for heavy components like charts, maps, etc.
 */

'use client';

import { useRef, type ReactNode } from 'react';
import { useLazyLoad } from '@/hooks/useIntersectionObserver';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  minHeight?: string;
}

export function LazySection({
  children,
  fallback,
  rootMargin = '300px',
  threshold = 0.01,
  className = '',
  minHeight = '200px',
}: LazySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useLazyLoad(sectionRef, {
    rootMargin,
    threshold,
    freezeOnceVisible: true,
  });

  return (
    <div
      ref={sectionRef}
      className={className}
      style={{
        minHeight: isVisible ? 'auto' : minHeight,
        contain: 'layout style paint',
      }}
    >
      {isVisible ? children : (fallback || <LazyFallback minHeight={minHeight} />)}
    </div>
  );
}

function LazyFallback({ minHeight }: { minHeight: string }) {
  return (
    <div 
      className="animate-pulse bg-white/5 rounded-xl border border-white/10"
      style={{ minHeight }}
    />
  );
}
