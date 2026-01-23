'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-6xl font-bold text-white/10">500</div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Щось пішло не так</h2>
          <p className="text-white/60">Спробуйте оновити сторінку або повернутись пізніше.</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
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
  );
}
