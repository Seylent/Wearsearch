/**
 * Filter Panel Component
 * Side panel with filters for products page
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Types
import type { Category } from '@/services/categoryService';
import type { Brand } from '@/services/brandService';

interface FilterPanelProps {
  categories: Category[];
  brands: Brand[];
  currentFilters: {
    category?: string | null;
    brand?: string | null;
    color?: string | null;
    gender?: string | null;
    minPrice?: number;
    maxPrice?: number;
    store?: string | null;
  };
  onFilterChange: (filters: Record<string, string | number | undefined>) => void;
}

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

// Filter Section Component
const FilterSection: React.FC<FilterSectionProps> = ({ 
  title, 
  isExpanded, 
  onToggle, 
  children 
}) => {
  return (
    <div className="border-b border-zinc-800 pb-4 mb-4 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-2 text-sm font-medium text-white hover:text-gray-300"
        aria-expanded={isExpanded}
      >
        {title}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  brands,
  currentFilters,
  onFilterChange
}) => {
  const { t } = useTranslation();

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    color: false,
    gender: false,
    price: false,
    store: false,
  });

  // Toggle section expansion
  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Filter handlers
  const handleCategoryChange = useCallback((categorySlug: string) => {
    onFilterChange({
      category: categorySlug === currentFilters.category ? undefined : categorySlug
    });
  }, [currentFilters.category, onFilterChange]);

  const handleBrandChange = useCallback((brandSlug: string) => {
    onFilterChange({
      brand: brandSlug === currentFilters.brand ? undefined : brandSlug
    });
  }, [currentFilters.brand, onFilterChange]);

  const handleColorChange = useCallback((color: string) => {
    onFilterChange({
      color: color === currentFilters.color ? undefined : color
    });
  }, [currentFilters.color, onFilterChange]);

  const handleGenderChange = useCallback((gender: string) => {
    onFilterChange({
      gender: gender === currentFilters.gender ? undefined : gender
    });
  }, [currentFilters.gender, onFilterChange]);

  const handlePriceChange = useCallback((minPrice: string, maxPrice: string) => {
    onFilterChange({
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }, [onFilterChange]);

  const clearFilter = useCallback((filterKey: string) => {
    onFilterChange({ [filterKey]: undefined });
  }, [onFilterChange]);

  // Predefined options
  const colors = [
    'Black', 'White', 'Gray', 'Brown', 'Beige', 'Navy', 'Blue', 
    'Green', 'Red', 'Pink', 'Purple', 'Yellow', 'Orange'
  ];

  const genders = [
    { value: 'men', label: t('filters.gender.men', 'Men') },
    { value: 'women', label: t('filters.gender.women', 'Women') },
    { value: 'unisex', label: t('filters.gender.unisex', 'Unisex') },
  ];

  // Active filters count
  const activeFiltersCount = Object.values(currentFilters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Active Filters Header */}
      {activeFiltersCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">
              {t('filters.activeFilters', 'Active Filters')} ({activeFiltersCount})
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onFilterChange({})}
              className="text-xs text-gray-400 hover:text-white"
            >
              {t('filters.clearAll', 'Clear All')}
            </Button>
          </div>
          
          {/* Active Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {currentFilters.category && (
              <Badge variant="secondary" className="text-xs bg-zinc-800 text-white border-zinc-700">
                {categories.find(c => c.slug === currentFilters.category)?.name || currentFilters.category}
                <button 
                  onClick={() => clearFilter('category')}
                  className="ml-1 hover:text-gray-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {currentFilters.brand && (
              <Badge variant="secondary" className="text-xs bg-zinc-800 text-white border-zinc-700">
                {brands.find(b => b.slug === currentFilters.brand)?.name || currentFilters.brand}
                <button 
                  onClick={() => clearFilter('brand')}
                  className="ml-1 hover:text-gray-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {currentFilters.color && (
              <Badge variant="secondary" className="text-xs bg-zinc-800 text-white border-zinc-700">
                {currentFilters.color}
                <button 
                  onClick={() => clearFilter('color')}
                  className="ml-1 hover:text-gray-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {currentFilters.gender && (
              <Badge variant="secondary" className="text-xs bg-zinc-800 text-white border-zinc-700">
                {genders.find(g => g.value === currentFilters.gender)?.label || currentFilters.gender}
                <button 
                  onClick={() => clearFilter('gender')}
                  className="ml-1 hover:text-gray-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {Boolean(currentFilters.minPrice || currentFilters.maxPrice) && (
              <Badge variant="secondary" className="text-xs bg-zinc-800 text-white border-zinc-700">
                ${currentFilters.minPrice || 0} - ${currentFilters.maxPrice || '∞'}
                <button 
                  onClick={() => onFilterChange({ minPrice: undefined, maxPrice: undefined })}
                  className="ml-1 hover:text-gray-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <FilterSection
        title={t('filters.category', 'Category')}
        isExpanded={expandedSections.category}
        onToggle={() => toggleSection('category')}
      >
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={currentFilters.category === category.slug}
                onCheckedChange={() => handleCategoryChange(category.slug)}
              />
              <Label 
                htmlFor={`category-${category.id}`}
                className="text-sm text-white cursor-pointer flex-1"
              >
                {category.name}
                {Boolean(category.productCount) && (
                  <span className="text-xs text-gray-400 ml-1">
                    ({category.productCount})
                  </span>
                )}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Brand Filter */}
      <FilterSection
        title={t('filters.brand', 'Brand')}
        isExpanded={expandedSections.brand}
        onToggle={() => toggleSection('brand')}
      >
        <div className="space-y-2">
          {brands.slice(0, 10).map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={currentFilters.brand === brand.slug}
                onCheckedChange={() => handleBrandChange(brand.slug)}
              />
              <Label 
                htmlFor={`brand-${brand.id}`}
                className="text-sm text-white cursor-pointer flex-1"
              >
                {brand.name}
                {Boolean(brand.productCount) && (
                  <span className="text-xs text-gray-400 ml-1">
                    ({brand.productCount})
                  </span>
                )}
              </Label>
            </div>
          ))}
          
          {brands.length > 10 && (
            <Button variant="ghost" size="sm" className="text-xs">
              {t('filters.showMore', 'Show More')}
            </Button>
          )}
        </div>
      </FilterSection>

      {/* Color Filter */}
      <FilterSection
        title={t('filters.color', 'Color')}
        isExpanded={expandedSections.color}
        onToggle={() => toggleSection('color')}
      >
        <div className="grid grid-cols-2 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`
                flex items-center space-x-2 p-2 rounded-md border text-left text-sm text-white
                ${currentFilters.color === color 
                  ? 'border-white bg-zinc-800' 
                  : 'border-zinc-700 hover:border-zinc-600'
                }
              `}
            >
              <div 
                className="w-4 h-4 rounded-full border border-zinc-600"
                style={{ backgroundColor: color.toLowerCase() }}
              />
              <span>{color}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Gender Filter */}
      <FilterSection
        title={t('filters.gender', 'Gender')}
        isExpanded={expandedSections.gender}
        onToggle={() => toggleSection('gender')}
      >
        <div className="space-y-2">
          {genders.map((gender) => (
            <div key={gender.value} className="flex items-center space-x-2">
              <Checkbox
                id={`gender-${gender.value}`}
                checked={currentFilters.gender === gender.value}
                onCheckedChange={() => handleGenderChange(gender.value)}
              />
              <Label 
                htmlFor={`gender-${gender.value}`}
                className="text-sm text-white cursor-pointer"
              >
                {gender.label}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Price Filter */}
      <FilterSection
        title={t('filters.price', 'Price Range')}
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder={t('filters.minPrice', 'Min')}
              value={currentFilters.minPrice || ''}
              onChange={(e) => handlePriceChange(e.target.value, String(currentFilters.maxPrice || ''))}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder={t('filters.maxPrice', 'Max')}
              value={currentFilters.maxPrice || ''}
              onChange={(e) => handlePriceChange(String(currentFilters.minPrice || ''), e.target.value)}
              className="text-sm"
            />
          </div>
          
          {/* Quick Price Ranges */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Under $25', min: 0, max: 25 },
              { label: '$25-50', min: 25, max: 50 },
              { label: '$50-100', min: 50, max: 100 },
              { label: 'Over $100', min: 100, max: undefined },
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => handlePriceChange(String(range.min), range.max ? String(range.max) : '')}
                className="text-xs p-2 border border-zinc-700 rounded-md hover:border-zinc-600 text-white"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>
    </div>
  );
};

export default FilterPanel;