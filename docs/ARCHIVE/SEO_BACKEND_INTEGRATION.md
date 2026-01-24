# Інтеграція Бекенд SEO API

## ✅ Виконано

Фронтенд успішно інтегровано з бекенд SEO API.

### 1. Оновлено сторінки категорій ([categories/[slug]/page.tsx](../src/app/categories/[slug]/page.tsx))
- ✅ Використання `seo_title` з API
- ✅ Використання `seo_description` з API
- ✅ Використання `canonical_url` з API
- ✅ Використання `seo_text` замість статичного контенту
- ✅ Підтримка параметру `?lang=uk`
- ✅ OpenGraph та Twitter метадані
- ✅ Правильні robots (index: true, follow: true)

### 2. Оновлено сторінки брендів ([brands/[slug]/page.tsx](../src/app/brands/[slug]/page.tsx))
- ✅ Використання `seo_title` з API
- ✅ Використання `seo_description` з API
- ✅ Використання `canonical_url` з API
- ✅ Використання `seo_text` з fallback
- ✅ Підтримка параметру `?lang=uk`
- ✅ OpenGraph та Twitter метадані
- ✅ Використання `brand.id` як slug

### 3. Оновлено sitemap ([sitemap.ts](../src/app/sitemap.ts))
- ✅ Використання `canonical_url` з API для всіх entities
- ✅ Підтримка `?lang=uk` для всіх запитів
- ✅ Fallback на конструювання URL якщо canonical_url відсутній
- ✅ Правильна структура для категорій, брендів, продуктів

### 4. Створено SEO helpers ([lib/seo/helpers.ts](../src/lib/seo/helpers.ts))
- ✅ `shouldIndexPage()` - визначає чи індексувати сторінку
- ✅ `getRobotsConfig()` - генерує robots meta
- ✅ `getPreferredLanguage()` - витягує мову з headers
- ✅ `getCanonicalUrl()` - формує canonical URL
- ✅ `isSEOPage()` - перевіряє чи SEO-сторінка
- ✅ `generateBreadcrumbsFromPath()` - генерує breadcrumbs

## 📋 Структура API відповідей

### Категорії (`GET /api/categories/:slug?lang=uk`)
```typescript
{
  id: number;
  name: string;
  slug: string;
  description: string;
  seo_title: string;
  seo_description: string;
  seo_text: string;
  seo_keywords: string[];
  canonical_url: string;
  image_url?: string;
  updated_at: string;
}
```

### Бренди (`GET /api/brands/:id?lang=uk`)
```typescript
{
  id: number;
  name: string;
  description: string;
  seo_title: string;
  seo_description: string;
  seo_text: string;
  seo_keywords: string[];
  canonical_url: string;
  logo_url?: string;
  updated_at: string;
}
```

### Популярні продукти (`GET /api/products/popular?limit=100&lang=uk`)
```typescript
{
  id: number;
  name: string;
  seo_title?: string;
  seo_description?: string;
  canonical_url: string;
  image_url?: string;
  updated_at: string;
}
```

## 🚀 Як працює

### 1. Metadata генерація
```typescript
// Отримуємо дані з API
const category = await fetch(`${API_URL}/api/categories/${slug}?lang=uk`);

// Використовуємо SEO поля з бекенду
return {
  title: category.seo_title,
  description: category.seo_description,
  alternates: {
    canonical: category.canonical_url,
  },
  robots: { index: true, follow: true },
};
```

### 2. SEO-текст на сторінці
```tsx
{/* Відображаємо seo_text з бекенду */}
{category.seo_text && (
  <SEOTextSection
    title={`Все про ${category.name.toLowerCase()}`}
    content={category.seo_text}
    keywords={category.seo_keywords || []}
  />
)}
```

### 3. Sitemap з canonical URLs
```typescript
categories = categoriesData.map((category: any) => ({
  url: category.canonical_url || `${SITE_URL}/categories/${category.slug}`,
  lastModified: new Date(category.updated_at),
  changeFrequency: 'daily',
  priority: 0.8,
}));
```

## ⚙️ Налаштування

### Environment Variables
```env
NEXT_PUBLIC_SITE_URL=https://wearsearch.com
NEXT_PUBLIC_API_URL=https://api.wearsearch.com
```

### Revalidation
- **Metadata**: 3600 секунд (1 година)
- **Static params**: 86400 секунд (1 день)
- **Sitemap**: 3600 секунд (1 година)

## 🔍 Що перевірити

### 1. View Source
```bash
curl https://wearsearch.com/categories/jackets | grep "seo_title"
```
Повинен показувати SEO-оптимізований title з бекенду.

### 2. Canonical URLs
```html
<link rel="canonical" href="https://wearsearch.com/categories/jackets" />
```

### 3. Robots Meta
```html
<!-- SEO сторінки -->
<meta name="robots" content="index, follow" />

<!-- Пошук та фільтри -->
<meta name="robots" content="noindex, follow" />
```

### 4. Sitemap
```bash
curl https://wearsearch.com/sitemap.xml
```
Повинен містити canonical URLs з бекенду.

## 🐛 Troubleshooting

### Проблема: Метадані не оновлюються
**Рішення**: Очистити Next.js cache
```bash
npm run build
# або видалити .next/cache
```

### Проблема: 404 на категоріях/брендах
**Рішення**: Перевірити що API endpoints працюють
```bash
curl http://localhost:3000/api/categories?lang=uk
curl http://localhost:3000/api/brands?lang=uk
```

### Проблема: SEO-текст не відображається
**Рішення**: Перевірити що поле `seo_text` містить HTML
```typescript
console.log(category.seo_text); // Повинен бути HTML
```

## 📚 Додаткова документація

- [SEO Implementation Guide](./SEO_IMPLEMENTATION.md) - повна документація
- [Backend SEO Complete](./SEO_BACKEND_COMPLETE.md) - бекенд документація (якщо є)
- [SEO Quick Start](./SEO_QUICK_START.md) - швидкий старт (якщо є)

---

**Оновлено**: 13 січня 2026  
**Статус**: ✅ Інтеграція завершена  
**Наступні кроки**: Тестування на production
