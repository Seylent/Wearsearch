/**
 * SearchDropdown View Component (Pure UI)
 * No business logic - only receives props and renders UI
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import { convertS3UrlToHttps } from '@/lib/utils';
import { getCategoryTranslation } from '@/utils/translations';
import type { SearchResult } from '../hooks/useProductSearch';

interface SearchDropdownViewProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  showNoResults: boolean;
  onClose: () => void;
  onResultClick: (productId: string) => void;
  onViewAll: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export const SearchDropdownView: React.FC<SearchDropdownViewProps> = ({
  query,
  onQueryChange,
  results,
  isLoading,
  showNoResults,
  onClose,
  onResultClick,
  onViewAll,
  inputRef,
  dropdownRef,
}) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24">
      <div 
        ref={dropdownRef}
        className="w-full max-w-2xl mx-4 bg-black/95 border border-white/20 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.2)] overflow-hidden"
      >
        {/* Search Input */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  onViewAll();
                }
              }}
              placeholder="Search for products, brands, or categories..."
              className="w-full h-14 pl-12 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 focus:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading && query.length >= 2 && (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="mt-4 text-white/60">Searching...</p>
            </div>
          )}

          {showNoResults && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Search className="w-8 h-8 text-white/40" />
              </div>
              <p className="text-white/60">No products found for "{query}"</p>
              <p className="text-white/40 text-sm mt-2">Try a different search term</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className="divide-y divide-white/5">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => onResultClick(result.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left group"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 border border-white/10">
                      {result.image ? (
                        <img
                          src={convertS3UrlToHttps(result.image)}
                          alt={result.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Search className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white group-hover:text-white/90 transition-colors truncate">
                        {result.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-white/50">
                        {result.category && (
                          <span className="truncate">{getCategoryTranslation(result.category)}</span>
                        )}
                        {result.brand && result.category && (
                          <span>•</span>
                        )}
                        {result.brand && (
                          <span className="truncate">{result.brand}</span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    {result.price && (
                      <div className="text-white font-medium flex-shrink-0">
                        ${result.price}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* View All Button */}
              {query.trim() && (
                <div className="p-4 border-t border-white/10">
                  <button
                    onClick={onViewAll}
                    className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 rounded-xl text-white font-medium transition-colors"
                  >
                    View All Results for "{query}"
                  </button>
                </div>
              )}
            </>
          )}

          {!isLoading && query.length < 2 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p className="text-white/60">Start typing to search products...</p>
              <p className="text-white/40 text-sm mt-2">Search by name, brand, or category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
