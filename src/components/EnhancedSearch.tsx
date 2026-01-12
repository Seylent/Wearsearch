'use client';

/**
 * Enhanced Search Component
 * Search with autocomplete, history, and popular queries
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Search, X, History, TrendingUp, ArrowRight, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface EnhancedSearchProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  showInline?: boolean;
  autoFocus?: boolean;
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  className,
  placeholder,
  onSearch,
  showInline = false,
  autoFocus = false,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const { history, popularQueries, addToHistory, removeFromHistory, clearHistory, getSuggestions } =
    useSearchHistory();

  const debouncedQuery = useDebounce(query, 150);
  const suggestions = getSuggestions(debouncedQuery);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      addToHistory(trimmed);
      setIsOpen(false);
      setQuery('');

      if (onSearch) {
        onSearch(trimmed);
      } else {
        router.push(`/products?search=${encodeURIComponent(trimmed)}`);
      }
    },
    [addToHistory, router, onSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSearch(suggestions[selectedIndex]);
        } else {
          handleSearch(query);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    },
    [suggestions, selectedIndex, query, handleSearch]
  );

  const handleFocus = useCallback(() => {
    setIsOpen(true);
    setSelectedIndex(-1);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  const isHistoryItem = (item: string) => history.some((h) => h.query === item);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('search.placeholder', 'Search products, brands...')}
          autoFocus={autoFocus}
          className="pl-10 pr-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            aria-label={t('search.clear', 'Clear search')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (suggestions.length > 0 || history.length > 0 || popularQueries.length > 0) && (
        <div
          className={cn(
            'absolute z-50 w-full mt-2 py-2 rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl',
            showInline ? 'relative mt-2' : 'absolute'
          )}
        >
          {/* Recent searches */}
          {history.length > 0 && !query && (
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                  {t('search.recentSearches', 'Recent Searches')}
                </span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  {t('search.clearHistory', 'Clear')}
                </button>
              </div>
              {history.slice(0, 5).map((item, index) => (
                <SuggestionItem
                  key={`history-${item.query}`}
                  query={item.query}
                  isHistory={true}
                  isSelected={selectedIndex === index}
                  onSelect={() => handleSearch(item.query)}
                  onRemove={() => removeFromHistory(item.query)}
                />
              ))}
            </div>
          )}

          {/* Search suggestions */}
          {query && suggestions.length > 0 && (
            <div className="px-3 py-2">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block px-2">
                {t('search.suggestions', 'Suggestions')}
              </span>
              {suggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={`suggestion-${suggestion}`}
                  query={suggestion}
                  isHistory={isHistoryItem(suggestion)}
                  isSelected={selectedIndex === index}
                  onSelect={() => handleSearch(suggestion)}
                  onRemove={
                    isHistoryItem(suggestion) ? () => removeFromHistory(suggestion) : undefined
                  }
                  highlight={query}
                />
              ))}
            </div>
          )}

          {/* Popular searches */}
          {!query && popularQueries.length > 0 && (
            <div className="px-3 py-2 border-t border-white/5">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block px-2">
                {t('search.popular', 'Popular')}
              </span>
              <div className="flex flex-wrap gap-2 px-2">
                {popularQueries.slice(0, 6).map((query) => (
                  <button
                    key={`popular-${query}`}
                    onClick={() => handleSearch(query)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <TrendingUp className="w-3 h-3" />
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search action */}
          {query && (
            <div className="px-3 pt-2 border-t border-white/5">
              <button
                onClick={() => handleSearch(query)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white/80 hover:bg-white/5 transition-colors"
              >
                <span>
                  {t('search.searchFor', 'Search for')} "<span className="font-medium">{query}</span>"
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface SuggestionItemProps {
  query: string;
  isHistory?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  highlight?: string;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({
  query,
  isHistory,
  isSelected,
  onSelect,
  onRemove,
  highlight,
}) => {
  const { t } = useTranslation();

  // Highlight matching text
  const renderHighlighted = () => {
    if (!highlight) return query;

    const index = query.toLowerCase().indexOf(highlight.toLowerCase());
    if (index === -1) return query;

    return (
      <>
        {query.slice(0, index)}
        <span className="font-semibold text-white">{query.slice(index, index + highlight.length)}</span>
        {query.slice(index + highlight.length)}
      </>
    );
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors group',
        isSelected ? 'bg-white/10' : 'hover:bg-white/5'
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        {isHistory ? (
          <History className="w-4 h-4 text-white/40" />
        ) : (
          <Search className="w-4 h-4 text-white/40" />
        )}
        <span className="text-white/80">{renderHighlighted()}</span>
      </div>

      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-opacity"
          aria-label={t('search.removeFromHistory', 'Remove from history')}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default EnhancedSearch;
