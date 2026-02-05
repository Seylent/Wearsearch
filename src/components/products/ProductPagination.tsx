/**
 * Memoized Product Pagination Component
 */
'use client';

import { memo, useCallback } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
}

export const ProductPagination = memo(function ProductPagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}: ProductPaginationProps) {
  const handlePageClick = useCallback(
    (e: React.MouseEvent, page: number) => {
      e.preventDefault();
      onPageChange(page);
    },
    [onPageChange]
  );

  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex justify-center sticky bottom-6 z-20">
      <div className="bg-background/90 backdrop-blur-xl border border-foreground/10 rounded-full px-2 py-1 shadow-2xl">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e: React.MouseEvent) => handlePageClick(e, currentPage - 1)}
                className={hasPrev ? 'cursor-pointer' : 'pointer-events-none opacity-50'}
              />
            </PaginationItem>

            {totalPages > 7 ? (
              <>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === 1}
                    onClick={(e: React.MouseEvent) => handlePageClick(e, 1)}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {currentPage > 4 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {Array.from({ length: 3 }, (_, i) => {
                  const p = currentPage - 1 + i;
                  if (p > 1 && p < totalPages) {
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === p}
                          onClick={(e: React.MouseEvent) => handlePageClick(e, p)}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                {currentPage < totalPages - 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === totalPages}
                    onClick={(e: React.MouseEvent) => handlePageClick(e, totalPages)}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            ) : (
              Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e: React.MouseEvent) => handlePageClick(e, i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e: React.MouseEvent) => handlePageClick(e, currentPage + 1)}
                className={hasNext ? 'cursor-pointer' : 'pointer-events-none opacity-50'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
});

export default ProductPagination;
