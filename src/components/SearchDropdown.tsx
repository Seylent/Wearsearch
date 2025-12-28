import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useProducts } from "@/hooks/useApi";
import { convertS3UrlToHttps } from "@/lib/utils";
import { getCategoryTranslation } from "@/utils/translations";

interface SearchDropdownProps {
  onClose: () => void;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Fetch products ONCE - React Query will cache it
  const { data: productsData, isLoading: loading } = useProducts();

  useEffect(() => {
    inputRef.current?.focus();
    
    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    // Close on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const searchResults = useMemo(() => {
    if (debouncedQuery.trim().length < 2 || !productsData) return [];

    const products = productsData.products || productsData || [];
    const query = debouncedQuery.toLowerCase();

    return products.filter((product: any) =>
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [debouncedQuery, productsData]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  const handleViewAll = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  handleViewAll();
                }
              }}
              placeholder="Search for products, brands, or categories..."
              className="w-full h-14 pl-12 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 focus:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="mt-3 text-white/50 text-sm">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="p-2">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                      {product.image_url || product.image ? (
                        <img
                          src={convertS3UrlToHttps(product.image_url || product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Search className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="font-semibold text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {product.brand && (
                          <span className="text-xs text-white/50">{product.brand}</span>
                        )}
                        {product.type && (
                          <>
                            {product.brand && <span className="text-white/30">•</span>}
                            <span className="text-xs text-white/50">{getCategoryTranslation(product.type)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    {product.price && (
                      <div className="text-right">
                        <p className="font-bold text-white">₴{product.price}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* View All Results */}
              {searchQuery.trim() && (
                <div className="p-4 border-t border-white/10">
                  <button
                    onClick={handleViewAll}
                    className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-xl text-white font-medium transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    View all results for "{searchQuery}"
                  </button>
                </div>
              )}
            </>
          ) : debouncedQuery.trim().length >= 2 ? (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p className="text-white/50 mb-2">No products found</p>
              <p className="text-sm text-white/30">Try different keywords</p>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p className="text-white/50 mb-2">Start typing to search</p>
              <p className="text-sm text-white/30">Search for products, brands, or categories</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
