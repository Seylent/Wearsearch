'use client';

/**
 * Global Error Boundary
 * Catches errors that occur during rendering, in event handlers, or in async code
 * This is a last resort error boundary for the entire application
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

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
    // Clear any problematic state
    try {
      // Clear React Query cache
      const queryClient = (globalThis as any).__REACT_QUERY_CLIENT__;
      if (queryClient) {
        queryClient.clear();
      }
      
      // Clear localStorage entries that might cause issues
      const keysToPreserve = ['wearsearch.auth', 'i18nextLng', 'wearsearch_currency'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToPreserve.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
    
    // Attempt recovery
    reset();
  };

  const handleGoHome = () => {
    // Force navigation to home
    window.location.href = '/';
  };

  return (
    <html lang="uk">
      <body className="bg-black text-white">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center space-y-8">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            {/* Title & Description */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold">Критична помилка</h1>
              <p className="text-white/60 text-lg">
                Щось пішло серйозно не так. Спробуйте перезавантажити сторінку або повернутися на головну.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-left max-h-48 overflow-auto">
                <p className="text-sm font-semibold text-red-400 mb-2">Деталі помилки:</p>
                <p className="text-xs font-mono text-red-400/80 break-all">
                  {error.message}
                </p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-400/60 cursor-pointer hover:text-red-400">
                      Stack trace
                    </summary>
                    <pre className="text-xs text-red-400/60 mt-2 overflow-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={handleReset} 
                variant="default"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Спробувати знову
              </Button>
              <Button 
                onClick={handleGoHome} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                На головну
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-white/40">
              Якщо проблема повторюється, спробуйте очистити кеш браузера або 
              зв'яжіться з підтримкою.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
