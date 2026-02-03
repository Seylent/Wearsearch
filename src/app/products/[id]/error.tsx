'use client';

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error('Product page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          {t('errors.somethingWentWrong', 'Something went wrong!')}
        </h2>
        <p className="text-muted-foreground mb-6">
          {t('errors.productLoadFailed', 'Failed to load product. Please try again.')}
        </p>
        <Button onClick={reset} variant="pill" size="pill" className="w-full sm:w-auto">
          {t('errors.tryAgain', 'Try again')}
        </Button>
      </div>
    </div>
  );
}
