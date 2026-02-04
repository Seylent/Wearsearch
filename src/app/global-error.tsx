'use client';

/**
 * Global Error Boundary
 * Catches errors that occur during rendering, in event handlers, or in async code
 * This is a last resort error boundary for the entire application
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { logError } from '@/services/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, { component: 'GlobalError', action: 'GLOBAL_ERROR' });
  }, [error]);

  const handleReset = () => {
    try {
      reset();
    } catch (e) {
      logError(e as Error, { component: 'GlobalError', action: 'RESET_FAILED' });
    }
  };

  return (
    <html
      lang={typeof document !== 'undefined' ? document.documentElement.lang : 'uk'}
      suppressHydrationWarning
    >
      <body className="bg-white text-foreground">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center space-y-5">
            <div className="text-7xl font-bold text-foreground/10">500</div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Критична помилка</h1>
              <p className="text-muted-foreground text-base">
                Щось пішло серйозно не так. Спробуйте перезавантажити сторінку.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium"
              >
                Спробувати знову
              </button>
              <Link
                href="/"
                className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium"
              >
                На головну
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
