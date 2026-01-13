'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Brand Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Помилка завантаження бренду</h2>
          <p className="text-white/60">
            Не вдалося завантажити інформацію про бренд.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()} variant="default">
            Спробувати знову
          </Button>
          <Button onClick={() => window.location.href = '/brands'} variant="outline">
            Всі бренди
          </Button>
        </div>
      </div>
    </div>
  );
}
