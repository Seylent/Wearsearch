/**
 * Mobile Filter Bottom Sheet
 * Optimized for mobile touch interactions
 * Replaces desktop filter modal on mobile devices
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  title = 'Filters',
  children,
  className,
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40',
          'animate-in fade-in-0 duration-300',
          !open && 'animate-out fade-out-0 duration-200'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'max-h-[85vh] overflow-hidden',
          'rounded-t-3xl border-t border-border',
          'bg-background shadow-2xl',
          'animate-in slide-in-from-bottom duration-300',
          !open && 'animate-out slide-out-to-bottom duration-200',
          className
        )}
        data-scroll-lock-root
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="bottom-sheet-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className={cn(
              'rounded-full p-2 hover:bg-muted transition-colors',
              'touch-manipulation min-h-[44px] min-w-[44px]',
              'flex items-center justify-center'
            )}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-120px)] overscroll-contain">
          <div className="p-6">{children}</div>
        </div>

        {/* Footer Actions (Optional) */}
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex gap-3">
          <Button
            variant="pillOutline"
            size="pill"
            className="flex-1 min-h-[44px]"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button variant="pill" size="pill" className="flex-1 min-h-[44px]" onClick={onClose}>
            Apply
          </Button>
        </div>
      </div>
    </>
  );
};

// Hook for managing bottom sheet state
export const useBottomSheet = (initialOpen = false) => {
  const [open, setOpen] = React.useState(initialOpen);

  const openSheet = React.useCallback(() => setOpen(true), []);
  const closeSheet = React.useCallback(() => setOpen(false), []);
  const toggleSheet = React.useCallback(() => setOpen(prev => !prev), []);

  return { open, openSheet, closeSheet, toggleSheet };
};
