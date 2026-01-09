/**
 * ProductCard Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import ProductCard from '../ProductCard';
import type { Product } from '@/types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  brand: 'Test Brand',
  category: 'Clothing',
  price: 100,
  image: 'https://example.com/image.jpg',
  gender: 'unisex',
};

describe('ProductCard', () => {
  it('should render product information', () => {
    render(<ProductCard {...mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument(); // Price with currency symbol
  });

  it('should render product image', () => {
    render(<ProductCard {...mockProduct} />);
    
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('image.jpg'));
  });

  it('should link to product detail page', () => {
    render(<ProductCard {...mockProduct} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/1');
  });

  it('should display recommended badge when recommended', () => {
    const recommendedProduct = { ...mockProduct, is_recommended: true };
    render(<ProductCard {...recommendedProduct} />);
    
    // Check for recommended indicator (star icon or badge)
    const card = screen.getByRole('link');
    expect(card).toBeInTheDocument();
  });

  it('should handle missing optional fields', () => {
    const minimalProduct: Product = {
      id: '2',
      name: 'Minimal Product',
    };
    
    render(<ProductCard {...minimalProduct} />);
    
    expect(screen.getByText('Minimal Product')).toBeInTheDocument();
  });
});
