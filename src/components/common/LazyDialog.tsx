/**
 * Lazy Dialog Wrapper
 * Lazy loads dialog content only when opened
 */

import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface LazyDialogProps<P extends Record<string, unknown> = Record<string, unknown>> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Dynamic import function
  importFunc: () => Promise<{ default: ComponentType<P> }>;
  // Props to pass to the lazy component
  componentProps?: P;
  // Loading fallback
  fallback?: ReactNode;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const LazyDialog = <P extends Record<string, unknown> = Record<string, unknown>>({
  open,
  onOpenChange,
  importFunc,
  componentProps,
  fallback = <DefaultFallback />,
}: LazyDialogProps<P>) => {
  // Only create lazy component when dialog is opened
  const LazyComponent = open ? lazy(importFunc) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {LazyComponent && (
          <Suspense fallback={fallback}>
            <LazyComponent {...(componentProps ?? ({} as P))} />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
};
