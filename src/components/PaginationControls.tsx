/**
 * Pagination Controls Component
 * Navigation controls for paginated results
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  maxVisible?: number;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
  className = '',
  showFirstLast = true,
  maxVisible = 7
}) => {
  const { t } = useTranslation();

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);
    
    // Adjust if we're at the beginning or end
    if (currentPage <= half) {
      end = Math.min(totalPages, maxVisible);
    }
    if (currentPage + half >= totalPages) {
      start = Math.max(1, totalPages - maxVisible + 1);
    }
    
    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('ellipsis-start');
      }
    }
    
    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center justify-center ${className}`}
      aria-label={t('pagination.navigation', 'Pagination navigation')}
    >
      <Pagination>
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (hasPrev) onPageChange(currentPage - 1);
              }}
              className={hasPrev ? 'cursor-pointer' : 'pointer-events-none opacity-50'}
              aria-disabled={!hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t('pagination.previous', 'Previous')}
              </span>
            </PaginationPrevious>
          </PaginationItem>

          {/* First Page (if show first/last enabled) */}
          {showFirstLast && currentPage > 3 && totalPages > 5 && (
            <>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(1);
                  }}
                  className="cursor-pointer"
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {currentPage > 4 && (
                <PaginationItem>
                  <PaginationEllipsis>
                    <MoreHorizontal className="h-4 w-4" />
                  </PaginationEllipsis>
                </PaginationItem>
              )}
            </>
          )}

          {/* Visible Page Numbers */}
          {visiblePages.map((page, index) => (
            <PaginationItem key={`${page}-${index}`}>
              {typeof page === 'string' ? (
                <PaginationEllipsis>
                  <MoreHorizontal className="h-4 w-4" />
                </PaginationEllipsis>
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Last Page (if show first/last enabled) */}
          {showFirstLast && currentPage < totalPages - 2 && totalPages > 5 && (
            <>
              {currentPage < totalPages - 3 && (
                <PaginationItem>
                  <PaginationEllipsis>
                    <MoreHorizontal className="h-4 w-4" />
                  </PaginationEllipsis>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(totalPages);
                  }}
                  className="cursor-pointer"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (hasNext) onPageChange(currentPage + 1);
              }}
              className={hasNext ? 'cursor-pointer' : 'pointer-events-none opacity-50'}
              aria-disabled={!hasNext}
            >
              <span className="hidden sm:inline">
                {t('pagination.next', 'Next')}
              </span>
              <ChevronRight className="h-4 w-4" />
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Page Info */}
      <div className="ml-4 text-sm text-gray-600 hidden md:block">
        {t('pagination.info', 'Page {{current}} of {{total}}', {
          current: currentPage,
          total: totalPages
        })}
      </div>
    </nav>
  );
};

// Simple pagination for mobile/minimal usage
export const SimplePaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}> = ({ currentPage, totalPages, hasNext, hasPrev, onPageChange, className = '' }) => {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('pagination.previous', 'Previous')}
      </Button>
      
      <span className="text-sm text-gray-600">
        {t('pagination.info', 'Page {{current}} of {{total}}', {
          current: currentPage,
          total: totalPages
        })}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="flex items-center gap-2"
      >
        {t('pagination.next', 'Next')}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PaginationControls;