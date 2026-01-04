import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/useSEO";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useSEO({
    title: t('notFound.seoTitle', 'Page Not Found'),
    description: t('notFound.seoDescription', 'The page you are looking for does not exist.'),
    keywords: '404, not found',
    type: 'website',
  });

  // Log 404 in development only
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[404] Not found:', location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t('notFound.title', 'Oops! Page not found')}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t('notFound.backHome', 'Return to Home')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
