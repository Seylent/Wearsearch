'use client';

/**
 * Global Error Boundary
 * Catches errors that occur during rendering, in event handlers, or in async code
 * This is a last resort error boundary for the entire application
 */

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('💥 Global Error:', error);

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry/LogRocket/etc
    }
  }, [error]);

  const handleReset = () => {
    try {
      reset();
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
  };

  return (
    <html
      lang={typeof document !== 'undefined' ? document.documentElement.lang : 'uk'}
      suppressHydrationWarning
    >
      <body className="bg-black text-white">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center space-y-5">
            <div className="text-7xl font-bold text-white/10">500</div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Критична помилка</h1>
              <p className="text-white/60 text-base">
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
                className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium"
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
