/**
 * Sort Dropdown - Server Component Version
 */

'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SortDropdownProps {
  currentSort?: string;
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'price-asc', label: 'Price Low to High' },
  { value: 'price-desc', label: 'Price High to Low' },
];

export default function SortDropdown({ currentSort = 'newest' }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    if (value && value !== 'newest') {
      newParams.set('sort', value);
    } else {
      newParams.delete('sort');
    }
    
    // Reset to first page when sort changes
    newParams.delete('page');
    
    router.push(`/products?${newParams.toString()}`);
  };

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-full sm:w-56 bg-zinc-800 border-2 border-zinc-700 text-white rounded-lg hover:border-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600 transition-all">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent className="bg-zinc-800 border-2 border-zinc-700 rounded-lg">
        {sortOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-gray-900 hover:bg-blue-50 focus:bg-blue-100 cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}