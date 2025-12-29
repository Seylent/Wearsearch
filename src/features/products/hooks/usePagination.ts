/**
 * Pagination Hook
 * Manages pagination state and calculations
 */

import { useState, useCallback, useMemo } from 'react';

interface UsePaginationProps {
  itemsPerPage?: number;
  totalItems: number;
}

export const usePagination = ({ itemsPerPage = 24, totalItems }: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Calculate page range for display
  const pageRange = useMemo(() => {
    const range: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // Always show first page
      range.push(1);

      if (currentPage > 3) {
        range.push('ellipsis');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      if (currentPage < totalPages - 2) {
        range.push('ellipsis');
      }

      // Always show last page
      if (totalPages > 1) {
        range.push(totalPages);
      }
    }

    return range;
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    pageRange,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage,
    nextPage,
    previousPage,
    resetPage,
    setCurrentPage,
  };
};
