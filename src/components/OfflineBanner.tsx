'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-yellow-600 text-white px-4 py-3 text-center text-sm font-medium shadow-lg animate-slide-down">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>No internet connection. Some features may be unavailable.</span>
      </div>
    </div>
  );
};
