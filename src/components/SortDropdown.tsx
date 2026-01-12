/**
 * Sort Dropdown Component
 * Dropdown for sorting products
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

// UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
  className?: string;
  placeholder?: string;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  options,
  className = '',
  placeholder
}) => {
  const { t } = useTranslation();

  const defaultPlaceholder = placeholder || t('products.sort.placeholder', 'Sort by');

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger 
        className={`w-[180px] h-10 bg-white border-gray-200 ${className}`}
        aria-label={t('products.sort.label', 'Sort products')}
      >
        <SelectValue placeholder={defaultPlaceholder} />
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className="cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SortDropdown;