'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'cookiesAccepted';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const accepted = window.localStorage.getItem(STORAGE_KEY) === 'true';
    setIsVisible(!accepted);
  }, []);

  const acceptCookies = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, 'true');
    window.dispatchEvent(new Event('wearsearch:cookies-accepted'));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="mx-auto max-w-4xl rounded-lg border border-border bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            We use cookies for analytics and to improve the service. By clicking "Accept", you agree
            to our cookie use.
          </div>
          <Button onClick={acceptCookies} className="shrink-0">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};
