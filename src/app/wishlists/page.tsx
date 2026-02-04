import { Suspense } from 'react';
import WishlistsContent from '@/components/pages/WishlistsContent';

export default function WishlistsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth"></div>
        </div>
      }
    >
      <WishlistsContent />
    </Suspense>
  );
}
