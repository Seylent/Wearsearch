/**
 * Product Grid Component
 * Displays products in a responsive grid layout
 */

'use client';

import React from 'react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4 | 6;
  gap?: 'small' | 'medium' | 'large';
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  columns = 4,
  gap = 'medium',
  className = ''
}) => {
  // Grid class mapping
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
  }[columns];

  // Gap class mapping
  const gapClass = {
    small: 'gap-3',
    medium: 'gap-4 md:gap-6',
    large: 'gap-6 md:gap-8'
  }[gap];

  return (
    <div 
      className={`grid ${gridClass} ${gapClass} ${className}`}
      role="grid"
      aria-label={`Product grid with ${products.length} items`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          image={product.image_url || product.image || ''}
          price={product.price}
          minPrice={product.minPrice}
          maxPrice={product.maxPrice}
          storeCount={product.storeCount}
          category={product.category}
          brand={product.brand}
          isNew={product.isNew}
        />
      ))}
    </div>
  );
};

export default ProductGrid;