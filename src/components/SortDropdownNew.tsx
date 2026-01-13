/**
 * Sort Dropdown - Server Component Version
 */

'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SortDropdownProps {
  currentSort?: string;
}

const sortOptions = [
  { value: 'newest', key: 'sort.newest' },
  { value: 'oldest', key: 'sort.oldest' },
  { value: 'name-asc', key: 'sort.nameAsc' },
  { value: 'name-desc', key: 'sort.nameDesc' },
  { value: 'price-asc', key: 'sort.priceAsc' },
  { value: 'price-desc', key: 'sort.priceDesc' },
];

export default function SortDropdown({ currentSort = 'newest' }: Readonly<SortDropdownProps>) {
  const { t } = useTranslation();
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
        <SelectValue placeholder={t('products.sortBy', 'Sort by...')} />
      </SelectTrigger>
      <SelectContent className="bg-zinc-800 border-2 border-zinc-700 rounded-lg">
        {sortOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-gray-900 hover:bg-blue-50 focus:bg-blue-100 cursor-pointer"
          >
            {t(option.key, option.key)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}