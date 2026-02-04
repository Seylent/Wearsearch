'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { logError } from '@/services/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, { component: 'AppError', action: 'APP_ERROR' });
  }, [error]);

  return (
    <div className="min-h-screen text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-6xl font-bold text-foreground/10">500</div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Щось пішло не так</h2>
          <p className="text-muted-foreground">
            Спробуйте оновити сторінку або повернутись пізніше.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-earth text-cream text-sm font-medium"
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
  );
}
