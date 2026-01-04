/**
 * Performance Optimization Examples
 * Practical examples of using performance hooks
 */

import { memo, useRef, useState } from 'react';
import { useLazyLoad } from '@/hooks/useIntersectionObserver';
import { usePassiveScroll } from '@/hooks/usePassiveEvent';
import { useSmoothScroll, useAnimationFrame } from '@/hooks/useAnimationFrame';
import type { Product } from '@/types';

// ============================================================================
// Example 1: Lazy Loading Heavy Component
// ============================================================================

const HeavyChart = memo(() => {
  // Expensive chart rendering
  return <div>Complex Chart Component</div>;
});

export const LazyChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const isVisible = useLazyLoad(chartRef, {
    rootMargin: '100px', // Start loading 100px before visible
    freezeOnceVisible: true // Don't unload once loaded
  });

  return (
    <div ref={chartRef} className="min-h-[400px] contain-layout">
      {isVisible ? (
        <HeavyChart />
      ) : (
        <div className="animate-pulse bg-muted/20 h-full" />
      )}
    </div>
  );
};

// ============================================================================
// Example 2: Optimized Product Grid
// ============================================================================

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const ProductCard = memo<ProductCardProps>(({ product, priority = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isLazyVisible = useLazyLoad(cardRef, {
    rootMargin: '200px'
  });
  const isVisible = priority || isLazyVisible;

  return (
    <div 
      ref={cardRef}
      className="contain-layout layer-promote"
      style={{
        minHeight: '400px', // Prevent layout shift
        contentVisibility: priority ? 'visible' : 'auto'
      }}
    >
      {isVisible ? (
        <>
          <img 
            src={product.image} 
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
          <h3>{product.name}</h3>
          <p>{product.price}</p>
        </>
      ) : (
        <div className="animate-pulse">
          <div className="bg-muted/20 h-64 mb-4" />
          <div className="bg-muted/20 h-4 mb-2" />
          <div className="bg-muted/20 h-4 w-20" />
        </div>
      )}
    </div>
  );
});

export const OptimizedProductGrid = ({ products }: { products: Product[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 optimize-list">
      {products.map((product, index) => (
        <ProductCard 
          key={product.id}
          product={product}
          priority={index < 6} // Above-the-fold items
        />
      ))}
    </div>
  );
};

// ============================================================================
// Example 3: Scroll to Top Button with Passive Events
// ============================================================================

export const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);
  const { scrollToTop } = useSmoothScroll();

  // Passive scroll listener with throttling
  usePassiveScroll((e) => {
    setVisible(window.scrollY > 300);
  }, 150); // Check every 150ms

  if (!visible) return null;

  return (
    <button
      onClick={() => scrollToTop(600)}
      className="fixed bottom-8 right-8 z-50 layer-promote"
      aria-label="Scroll to top"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
};

// ============================================================================
// Example 4: Smooth Navigation with RAF
// ============================================================================

export const SmoothNavigation = () => {
  const { scrollToElement } = useSmoothScroll();

  const handleNavigate = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    scrollToElement(element, 800, 80); // duration: 800ms, offset: 80px
  };

  return (
    <nav className="contain-layout">
      <button onClick={() => handleNavigate('products')}>
        Products
      </button>
      <button onClick={() => handleNavigate('about')}>
        About
      </button>
      <button onClick={() => handleNavigate('contact')}>
        Contact
      </button>
    </nav>
  );
};

// ============================================================================
// Example 5: Infinite Scroll with Intersection Observer
// ============================================================================

export const InfiniteScrollList = <T extends { id: string; content: React.ReactNode }>({
  items,
  onLoadMore,
  hasMore
}: {
  items: T[];
  onLoadMore: () => void;
  hasMore: boolean;
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  useLazyLoad(loadMoreRef, {
    rootMargin: '300px',
    onChange: (isIntersecting) => {
      if (isIntersecting && hasMore) {
        onLoadMore();
      }
    }
  });

  return (
    <div className="optimize-list">
      {items.map(item => (
        <div key={item.id} className="contain-layout">
          {item.content}
        </div>
      ))}
      
      {hasMore && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Example 6: Optimized Modal with Passive Events
// ============================================================================

export const OptimizedModal = ({ 
  isOpen, 
  onClose,
  children 
}: { 
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when modal is open
  usePassiveScroll((e) => {
    if (isOpen && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      e.preventDefault();
    }
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 layer-promote">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        ref={modalRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 contain-strict"
      >
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// Example 7: Performance Monitoring Component
// ============================================================================

export const PerformanceMonitor = () => {
  const [fps, setFps] = useState(60);
  const [renderTime, setRenderTime] = useState(0);

  useAnimationFrame((deltaTime) => {
    setFps(Math.round(1 / deltaTime));
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm font-mono">
      <div>FPS: {fps}</div>
      <div>Render: {renderTime.toFixed(2)}ms</div>
    </div>
  );
};

// ============================================================================
// Best Practices Summary
// ============================================================================

/*
1. Use memo() for expensive components
2. Add useLazyLoad() for off-screen content
3. Use usePassiveScroll() for scroll listeners
4. Add contain: layout paint CSS
5. Use useSmoothScroll() for navigation
6. Add loading="lazy" for images
7. Use content-visibility: auto for long lists
8. Set priority for above-the-fold content
9. Add minHeight to prevent layout shift
10. Use rootMargin for preloading
*/
