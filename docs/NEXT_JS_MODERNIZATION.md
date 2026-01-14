# Next.js Architecture Modernization Guide

## Поточний стан

Проект використовує гібридну архітектуру з елементами SPA та Next.js App Router. Деякі компоненти все ще використовують SPA-паттерни замість повноцінного SSR.

## Ключові області для покращення

### 1. Client-Only Utils vs Next.js Built-ins

**Поточні кастомні utils:**
- `authStorage.ts` - localStorage управління для auth
- `cache.ts` - кастомне кешування
- `currencyStorage.ts` - localStorage для валют
- `performanceMonitor.ts` - Web Vitals моніторинг

**Рекомендації:**
- `authStorage` - може залишитись (специфічні потреби)
- `cache` - розглянути міграцію на `unstable_cache` або React Cache
- `currencyStorage` - може бути замінено на cookies з `next/headers`
- `performanceMonitor` - готове для Next.js 15 built-in Web Vitals

### 2. Runtime Guards Implementation

**Поточна реалізація:**
```typescript
// ✅ Правильно реалізовано
if (typeof window === 'undefined') return fallbackValue;
```

**Всі client-only utils мають proper guards:**
- Перевірка `typeof window !== 'undefined'`
- Fallback значення для SSR
- Попередження в консолі для неправильного використання

### 3. Metadata Generation Status

**✅ Вже реалізовано:**
- `app/page.tsx` - статичний metadata
- `app/products/[id]/page.tsx` - динамічний generateMetadata
- `app/products/page.tsx` - параметризований metadata
- `app/stores/page.tsx` - додано статичний metadata
- `app/contacts/page.tsx` - додано статичний metadata

**⏳ Потребує реалізації:**
- `app/categories/[slug]/page.tsx`
- `app/brands/[slug]/page.tsx`
- `app/stores/[id]/page.tsx`

### 4. Server Actions Implementation

**✅ Створено приклад:**
- `app/contacts/actions.ts` - форма контактів

**💡 Можливості для розширення:**
- Форми адмін панелі
- Фільтри товарів (progressive enhancement)
- Підписка на розсилку
- Управління обраним

### 5. SSR vs Client Rendering

**Поточний підхід:**
```typescript
// Hydration-safe auth state
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

if (!isMounted) {
  return <div suppressHydrationWarning>Loading...</div>;
}
```

**Покращення:**
- Використовувати cookies для auth state
- Server Components де можливо
- Мінімізувати client-side JavaScript

## План міграції

### Phase 1: Metadata Completion ⏳
1. Додати generateMetadata для всіх динамічних сторінок
2. Створити SEO utilities для структурованих даних
3. Налаштувати sitemap.xml generation

### Phase 2: Server Actions Integration
1. Міграція форм на Server Actions
2. Progressive enhancement для фільтрів
3. Оптимізація admin панелі

### Phase 3: Performance Optimization
1. Аналіз bundle size
2. Міграція на вбудовані Next.js utilities
3. Оптимізація client-side JavaScript

### Phase 4: Full SSR Migration
1. Auth state через cookies
2. Server-side filtering і sorting
3. Мінімізація hydration mismatches

## Best Practices

### ✅ Вже дотримуємося:
- App Router структура
- Server Components де доречно
- TypeScript strict mode
- Proper error boundaries
- SEO optimizations

### 🔄 В процесі впровадження:
- Client-only module guards
- Server Actions для форм
- Metadata generation
- Performance monitoring

### 📋 Планується:
- Full SSR for auth
- Cookie-based preferences
- Advanced caching strategies
- Progressive Web App features

## Переваги після міграції

1. **Performance**: Менше JavaScript, швидше завантаження
2. **SEO**: Кращі метадані, server-side рендеринг
3. **User Experience**: Progressive enhancement
4. **Maintenance**: Менше кастомного коду
5. **Security**: Server Actions замість API routes
6. **Caching**: Вбудована Next.js оптимізація

## Compatibility Notes

- Всі зміни backwards compatible
- Поступова міграція без breaking changes
- Runtime guards забезпечують стабільність
- Fallbacks для всіх client-only features