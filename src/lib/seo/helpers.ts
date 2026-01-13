/**
 * SEO Helper Functions
 * Допоміжні функції для роботи з SEO на фронтенді
 */

/**
 * Визначає чи потрібен canonical URL для сторінки
 * SEO сторінки (index, follow): головна, категорії, бренди, продукти
 * Search і фільтри (noindex, follow): пошук та комбінації фільтрів
 * 
 * Згідно бекенд документації SEO_BACKEND_COMPLETE.md:
 * - ✅ Окремі категорії (/products?type=jackets) → index, follow
 * - ❌ Комбінації фільтрів (/products?type=jackets&color=black) → noindex, follow
 */
export function shouldIndexPage(pathname: string, searchParams?: URLSearchParams): boolean {
  // Пошукові сторінки - не індексуємо
  if (pathname.includes('/search')) {
    return false;
  }

  // Технічні сторінки - не індексуємо
  const noIndexPaths = ['/api', '/admin', '/auth', '/profile', '/test'];
  if (noIndexPaths.some(path => pathname.startsWith(path))) {
    return false;
  }

  // Перевірка для сторінки products
  if (pathname === '/products' && searchParams) {
    const params = Array.from(searchParams.keys());
    
    // Дозволяємо ТІЛЬКИ одну категорію (type)
    if (params.length === 1 && params[0] === 'type') {
      return true; // ✅ SEO сторінка категорії
    }
    
    // Якщо є додаткові параметри фільтрації - не індексуємо
    if (params.length > 1 || (params.length === 1 && params[0] !== 'type')) {
      return false; // ❌ Фільтрована сторінка
    }
  }

  // Всі інші сторінки (головна, бренди, продукти) - індексуємо
  return true;
}

/**
 * Генерує robots meta для сторінки
 */
export function getRobotsConfig(pathname: string, searchParams?: URLSearchParams) {
  const shouldIndex = shouldIndexPage(pathname, searchParams);
  
  return {
    index: shouldIndex,
    follow: true,
    // Додаткові правила для пошукових ботів
    googleBot: {
      index: shouldIndex,
      follow: true,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };
}

/**
 * Витягує мову з Accept-Language header або cookies
 */
export function getPreferredLanguage(headers?: Headers): 'uk' | 'en' {
  if (!headers) return 'uk';

  // Перевіряємо Accept-Language header
  const acceptLanguage = headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLang = acceptLanguage.split(',')[0].split('-')[0];
    if (preferredLang === 'en') return 'en';
    if (preferredLang === 'uk' || preferredLang === 'ru') return 'uk';
  }

  // За замовчуванням українська
  return 'uk';
}

/**
 * Формує URL з канонічним форматом
 */
export function getCanonicalUrl(baseUrl: string, pathname: string): string {
  // Видаляємо trailing slash (окрім головної)
  const cleanPath = pathname === '/' ? pathname : pathname.replace(/\/$/, '');
  
  // Видаляємо query параметри
  const urlWithoutQuery = cleanPath.split('?')[0];
  
  return `${baseUrl}${urlWithoutQuery}`;
}

/**
 * Перевіряє чи є сторінка SEO-оптимізованою
 */
export function isSEOPage(pathname: string): boolean {
  const seoPatterns = [
    /^\/$/,                           // Головна
    /^\/categories\/[^/]+$/,          // Категорії
    /^\/brands\/[^/]+$/,              // Бренди
    /^\/products\/[^/]+$/,            // Продукти
    /^\/stores\/[^/]+$/,              // Магазини
    /^\/(about|contacts|terms|privacy)$/,  // Статичні сторінки
  ];

  return seoPatterns.some(pattern => pattern.test(pathname));
}

/**
 * Генерує structured data breadcrumbs з pathname
 */
export function generateBreadcrumbsFromPath(pathname: string, baseUrl: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: 'Головна', url: baseUrl }
  ];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    
    // Перекладаємо сегменти на людську мову
    const nameMap: Record<string, string> = {
      'categories': 'Категорії',
      'brands': 'Бренди',
      'products': 'Продукти',
      'stores': 'Магазини',
      'about': 'Про нас',
      'contacts': 'Контакти',
    };

    breadcrumbs.push({
      name: nameMap[segment] || segment,
      url: `${baseUrl}${currentPath}`
    });
  }

  return breadcrumbs;
}
