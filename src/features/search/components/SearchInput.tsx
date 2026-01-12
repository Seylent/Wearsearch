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
  inputRef: React.RefObject<HTMLInputElement>;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = React.memo(({
  value,
  onChange,
  onClose,
  onSubmit,
  inputRef,
  placeholder
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 border-b border-white/10">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) {
              onSubmit();
            }
          }}
          placeholder={placeholder || t('search.placeholder', 'Search for products, stores, or brands...')}
          className="w-full h-14 pl-12 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 focus:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
          aria-label={t('aria.searchInput')}
          role="searchbox"
          aria-autocomplete="list"
        />
        <button
          onClick={onClose}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          aria-label={t('aria.closeSearch')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

SearchInput.displayName = 'SearchInput';