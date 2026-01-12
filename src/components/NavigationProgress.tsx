'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 z-50 animate-pulse"
      style={{
        animation: 'slideRight 0.3s ease-in-out',
      }}
    />
  );
}
