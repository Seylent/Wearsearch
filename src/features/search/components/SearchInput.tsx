/**
 * Search Input Component (Pure UI)
 * Reusable search input with clear functionality
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = React.memo(
  ({ value, onChange, onClose, onSubmit, onClear, inputRef, placeholder }) => {
    const { t } = useTranslation();

    return (
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-5 border-b border-border">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && value.trim()) {
                  onSubmit();
                }
              }}
              placeholder={
                placeholder || t('search.placeholder', 'Search for products, stores, or brands...')
              }
              className="w-full h-12 sm:h-14 pl-12 pr-14 sm:pr-16 bg-muted/70 border border-border rounded-full text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all"
              aria-label={t('aria.searchInput')}
              role="searchbox"
              aria-autocomplete="list"
            />
            {value.length > 0 && (
              <button
                onClick={onClear}
                className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t('search.clear', 'Clear search')}
              >
                {t('search.clearShort', 'Clear')}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors flex items-center justify-center"
            aria-label={t('aria.closeSearch')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
