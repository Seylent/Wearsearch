/**
 * Product Pagination Hook
 * Manages pagination logic for product lists
 */

import { useState, useMemo, useEffect } from 'react';
import type { Product } from '@/types';

export interface PaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

export const useProductPagination = (
  products: Product[],
  options: PaginationOptions = {}
) => {
  const { itemsPerPage = 24, initialPage = 1 } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // Reset to page 1 when products change
  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [products, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return {
    currentPage,
    totalPages,
    totalProducts,
    paginatedProducts,
    goToPage,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    setCurrentPage,
  };
};
