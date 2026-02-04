import { Suspense } from 'react';
import AboutContent from '@/components/pages/AboutContent';

export const revalidate = 86400;

export default function AboutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth"></div>
        </div>
      }
    >
      <AboutContent />
    </Suspense>
  );
}
