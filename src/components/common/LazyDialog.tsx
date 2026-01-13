/**
 * Lazy Dialog Wrapper
 * Lazy loads dialog content only when opened
 */

import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';

interface LazyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Dynamic import function
  importFunc: () => Promise<{ default: ComponentType<any> }>;
  // Props to pass to the lazy component
  componentProps?: Record<string, any>;
  // Loading fallback
  fallback?: ReactNode;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const LazyDialog = ({
  open,
  onOpenChange,
  importFunc,
  componentProps = {},
  fallback = <DefaultFallback />,
}: LazyDialogProps) => {
  // Only create lazy component when dialog is opened
  const LazyComponent = open ? lazy(importFunc) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent>
        <DialogDescription className="sr-only">
          Loading content
        </DialogDescription>
        {LazyComponent && (
          <Suspense fallback={fallback}>
            <LazyComponent {...componentProps} />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
};
