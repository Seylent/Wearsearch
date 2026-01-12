import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  items?: Array<{ value: string; label: string }>; // Make optional
  className?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  emptyMessage?: string;
}

export function Combobox({
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  items = [], // Default to empty array
  className,
  searchValue,
  onSearchChange,
  emptyMessage = "No items found",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [internalSearch, setInternalSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  const search = searchValue !== undefined ? searchValue : internalSearch;
  const setSearch = onSearchChange || setInternalSearch;

  const selectedItem = (items || []).find((item) => item.value === value);

  const filteredItems = (items || []).filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [open]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Close on escape
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <span className={cn("truncate", !selectedItem && "text-white/40")}>
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 text-white/50 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown menu - positioned directly below trigger */}
      {open && (
        <div 
          className="absolute left-0 top-full mt-2 w-full z-[1100] rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-2xl p-0 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
        >
          {/* Search input */}
          <div className="p-2 border-b border-white/10">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Items list */}
          <div className="overflow-y-auto max-h-[60vh] p-1">
            {filteredItems.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-white/40">
                {emptyMessage}
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-9 pr-3 text-sm text-white/80 outline-none hover:bg-white/10 focus:bg-white/10 transition-colors",
                    value === item.value && "bg-white/10 text-white"
                  )}
                  onClick={() => {
                    onValueChange?.(item.value);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
                    {value === item.value && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
