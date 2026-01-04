import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import * as PopoverPrimitive from "@radix-ui/react-popover";

interface ComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  items: Array<{ value: string; label: string }>;
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
  items,
  className,
  searchValue,
  onSearchChange,
  emptyMessage = "No items found",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [internalSearch, setInternalSearch] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  
  const search = searchValue !== undefined ? searchValue : internalSearch;
  const setSearch = onSearchChange || setInternalSearch;

  const selectedItem = items.find((item) => item.value === value);

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  React.useEffect(() => {
    if (!open) return;
    // Defer to ensure the input exists after portal mount
    const id = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
    return () => {
      window.clearTimeout(id);
    };
  }, [open]);

  return (
    <div className="relative">
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
          >
            <span className={cn("truncate", !selectedItem && "text-white/40")}>
              {selectedItem ? selectedItem.label : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-white/50" />
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className="z-[9999] w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popper-available-width)] rounded-2xl border border-white/20 bg-zinc-900 p-0 shadow-[0_8px_32px_rgba(0,0,0,0.8)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            align="start"
            side="bottom"
            sideOffset={8}
            avoidCollisions={true}
            collisionPadding={12}
            collisionBoundary={typeof window !== 'undefined' ? document.body : undefined}
            sticky="always"
            hideWhenDetached
            updatePositionStrategy="always"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
          <div className="flex flex-col max-h-[min(40vh,var(--radix-popper-available-height))]">
            <div className="p-2 border-b border-white/10">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="overflow-y-auto p-1">
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
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
    </div>
  );
}
