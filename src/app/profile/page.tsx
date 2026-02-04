import { Suspense } from 'react';
import ProfileContent from '@/components/pages/ProfileContent';

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth"></div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
