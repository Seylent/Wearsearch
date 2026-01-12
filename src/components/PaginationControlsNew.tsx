/**
 * Pagination Controls - Server Component Version
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  searchParams
}: Readonly<PaginationControlsProps>) {
  const router = useRouter();

  const navigateToPage = (page: number) => {
    const newParams = new URLSearchParams();
    
    // Preserve all existing search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        newParams.set(key, value);
      }
    });
    
    if (page > 1) {
      newParams.set('page', page.toString());
    }
    
    router.push(`/products?${newParams.toString()}`);
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2">
      <Pagination className="justify-center">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => navigateToPage(currentPage - 1)}
              className={`${
                currentPage === 1
                  ? 'pointer-events-none opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-zinc-800'
              } rounded-lg transition-colors text-white`}
            />
          </PaginationItem>

          {visiblePages.map((page, index) => (
            <PaginationItem key={page === '...' ? `ellipsis-${index}` : `page-${page}`}>
              {page === '...' ? (
                <PaginationEllipsis className="text-gray-400" />
              ) : (
                <PaginationLink
                  onClick={() => navigateToPage(page as number)}
                  isActive={currentPage === page}
                  className={`${
                    currentPage === page
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                  } cursor-pointer rounded-lg transition-all`}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => navigateToPage(currentPage + 1)}
              className={`${
                currentPage === totalPages
                  ? 'pointer-events-none opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-zinc-800'
              } rounded-lg transition-colors text-white`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}