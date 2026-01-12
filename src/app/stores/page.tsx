import { Suspense } from 'react';
import StoresContent from '@/components/pages/StoresContent';

export default function StoresPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <StoresContent />
    </Suspense>
  );
}
