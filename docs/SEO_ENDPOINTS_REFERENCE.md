# 📋 SEO API Endpoints - Quick Reference

## Всі необхідні endpoints для фронтенду

### 🏠 SEO Endpoints

```http
# Головна сторінка
GET /api/v1/seo/home/home

# Категорії товарів
GET /api/v1/seo/category/jackets
GET /api/v1/seo/category/hoodies
GET /api/v1/seo/category/T-shirts
GET /api/v1/seo/category/pants
GET /api/v1/seo/category/jeans
GET /api/v1/seo/category/shorts
GET /api/v1/seo/category/shoes
GET /api/v1/seo/category/accessories

# Кольори
GET /api/v1/seo/color/Black
GET /api/v1/seo/color/White
GET /api/v1/seo/color/Gray
GET /api/v1/seo/color/Blue
GET /api/v1/seo/color/Red
GET /api/v1/seo/color/Green
GET /api/v1/seo/color/Yellow
GET /api/v1/seo/color/Orange
GET /api/v1/seo/color/Pink
GET /api/v1/seo/color/Purple
GET /api/v1/seo/color/Brown
GET /api/v1/seo/color/Beige
GET /api/v1/seo/color/Navy
GET /api/v1/seo/color/Maroon
GET /api/v1/seo/color/Olive
GET /api/v1/seo/color/Cream

# Динамічні сторінки
GET /api/v1/seo/product/{id}    # Конкретний товар
GET /api/v1/seo/store/{id}      # Конкретний магазин (future)
GET /api/v1/seo/brand/{id}      # Конкретний бренд (future)
```

### 🗺️ SEO Файли

```http
# Sitemap
GET /api/v1/sitemap.xml

# Robots
GET /api/v1/robots.txt
```

## 📤 Response Format

Всі SEO endpoints повертають:

```json
{
  "success": true,
  "item": {
    "meta_title": "...",
    "meta_description": "...",
    "canonical_url": "https://wearsearch.com/...",
    "h1_title": "...",           // опціонально
    "content_text": "...",       // опціонально
    "keywords": "..."            // опціонально
  }
}
```

### Обов'язкові поля:
- ✅ `meta_title` - заголовок сторінки (50-60 символів)
- ✅ `meta_description` - опис для пошукових систем (150-160 символів)

### Опціональні поля:
- `canonical_url` - канонічний URL (якщо не вказано, фронт згенерує автоматично)
- `h1_title` - заголовок H1 на сторінці
- `content_text` - SEO текст під заголовком
- `keywords` - ключові слова (comma-separated)

## 🔧 Priority Implementation

### Phase 1: Must Have (мінімум для запуску)
1. ✅ `GET /api/v1/seo/home/home` - головна
2. ✅ `GET /api/v1/sitemap.xml` - sitemap
3. ✅ `GET /api/v1/robots.txt` - robots

### Phase 2: Important (для SEO)
4. ✅ `GET /api/v1/seo/category/{slug}` - всі 8 категорій
5. ✅ `GET /api/v1/seo/color/{slug}` - топ 5 кольорів (Black, White, Blue, Red, Gray)
6. ✅ `GET /api/v1/seo/product/{id}` - для популярних товарів

### Phase 3: Nice to Have (для майбутнього)
7. `GET /api/v1/seo/store/{id}` - коли будуть окремі сторінки магазинів
8. `GET /api/v1/seo/brand/{id}` - коли будуть окремі сторінки брендів

## 🧪 Testing Commands

```bash
# Перевірити SEO головної
curl http://localhost:3000/api/v1/seo/home/home

# Перевірити категорію
curl http://localhost:3000/api/v1/seo/category/jackets

# Перевірити колір
curl http://localhost:3000/api/v1/seo/color/Black

# Перевірити товар
curl http://localhost:3000/api/v1/seo/product/123

# Перевірити sitemap
curl http://localhost:3000/api/v1/sitemap.xml

# Перевірити robots
curl http://localhost:3000/api/v1/robots.txt
```

## 📊 Example Responses

### Home SEO
```json
{
  "success": true,
  "item": {
    "meta_title": "Wearsearch - Знайдіть свій ідеальний стиль",
    "meta_description": "Відкрийте для себе найкращі fashion товари від топових магазинів. Величезний вибір одягу, взуття та аксесуарів.",
    "canonical_url": "https://wearsearch.com/",
    "h1_title": "Відкрийте світ моди",
    "content_text": "Кураторська колекція від найінноваційніших дизайнерів світу",
    "keywords": "fashion, clothing, online shopping, wearsearch"
  }
}
```

### Category SEO
```json
{
  "success": true,
  "item": {
    "meta_title": "Куртки - Купити стильні куртки онлайн | Wearsearch",
    "meta_description": "Великий вибір курток: зимові, демісезонні, бомбери. Знайдіть ідеальну куртку з нашої колекції.",
    "canonical_url": "https://wearsearch.com/products?type=jackets",
    "keywords": "куртки, jackets, верхній одяг, зимові куртки"
  }
}
```

### Color SEO
```json
{
  "success": true,
  "item": {
    "meta_title": "Чорний одяг та аксесуари | Wearsearch",
    "meta_description": "Шукаєте чорний одяг? Перегляньте нашу колекцію чорних товарів від топових брендів.",
    "canonical_url": "https://wearsearch.com/products?color=Black",
    "keywords": "чорний одяг, black fashion, black clothing"
  }
}
```

### Sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://wearsearch.com/</loc>
    <lastmod>2026-01-04</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://wearsearch.com/products</loc>
    <lastmod>2026-01-04</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Категорії -->
  <url>
    <loc>https://wearsearch.com/products?type=jackets</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Товари -->
  <url>
    <loc>https://wearsearch.com/product/123</loc>
    <lastmod>2026-01-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

### Robots.txt
```text
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://wearsearch.com/sitemap.xml
```

## 🎯 Frontend Integration

Фронтенд вже налаштований і чекає ці endpoints:

```typescript
// Автоматично викликаються при завантаженні сторінок
import { seoApi } from '@/services/api/seo.api';

// Index.tsx
const seo = await seoApi.getHomeSEO();

// Products.tsx з фільтром
const seo = await seoApi.getCategorySEO('jackets');
const seo = await seoApi.getColorSEO('Black');

// ProductDetail.tsx
const seo = await seoApi.getProductSEO('123');
```

## 📚 Детальна документація

- [DYNAMIC_SEO_INTEGRATION.md](./DYNAMIC_SEO_INTEGRATION.md) - повний гайд з Python прикладами
- [SEO_IMPLEMENTATION_COMPLETE.md](./SEO_IMPLEMENTATION_COMPLETE.md) - підсумок реалізації
- [SMART_SEARCH_FILTERS.md](./SMART_SEARCH_FILTERS.md) - розумний пошук

---

**Статус:** ✅ Фронтенд готовий | ⏳ Чекаємо бекенд endpoints
