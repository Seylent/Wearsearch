# Architecture Documentation

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router (pages & layouts)
│   ├── layout.tsx    # Root layout with SEO
│   ├── page.tsx      # Homepage
│   ├── products/     # Products pages
│   ├── stores/       # Stores pages
│   └── ...
│
├── components/       # UI Components
│   ├── layout/       # Layout components (Navigation, Footer)
│   ├── ui/           # Reusable UI primitives (shadcn/ui)
│   ├── pages/        # Page-specific components
│   └── ...
│
├── features/         # Feature-based modules
│   ├── search/       # Search feature
│   └── ...
│
├── hooks/            # Shared React hooks
├── contexts/         # React Context providers
├── services/         # API & external services
│   └── api/          # API clients
├── lib/              # Utility functions & helpers
├── types/            # TypeScript types
├── constants/        # App constants
├── config/           # Configuration files
└── locales/          # i18n translations
```

## 🏗️ Architecture Principles

### 1. **Next.js App Router First**
- All pages in `src/app/`
- Server Components by default
- Client Components only when needed (`'use client'`)
- SEO via `generateMetadata()`

### 2. **Feature-First Organization**
```
features/search/
├── components/      # Feature UI
├── hooks/          # Feature hooks
└── utils/          # Feature utilities
```

### 3. **Clear Separation of Concerns**
- **UI Layer**: `components/` - Pure presentational
- **Business Logic**: `hooks/` + `services/`
- **Data**: `services/api/`
- **State**: `contexts/` or React Query

### 4. **API Layer**
```typescript
// services/api/products.api.ts
export const productsApi = {
  getAll: () => apiClient.get('/products'),
  getById: (id) => apiClient.get(`/products/${id}`),
};
```

## 🎨 UI Component Guidelines

### Atomic Design Levels
1. **Primitives** (`components/ui/`) - buttons, inputs, cards
2. **Composites** (`components/`) - search bars, product cards
3. **Page Sections** (`components/pages/`) - page-specific layouts

### Component Template
```tsx
// Server Component (default)
export default async function ProductCard({ id }: Props) {
  const product = await fetchProduct(id);
  return <div>{product.name}</div>;
}

// Client Component (when needed)
'use client';
export function InteractiveCard() {
  const [state, setState] = useState();
  return <button onClick={...}>...</button>;
}
```

## 📊 Data Flow

```
User Action
    ↓
Component (UI)
    ↓
Hook (Logic) → React Query
    ↓
API Service
    ↓
Backend
```

## ♿ Accessibility (a11y)

### Required Standards
- ✅ Semantic HTML (`<nav>`, `<main>`, `<article>`)
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Color contrast (WCAG AA)

### Example
```tsx
<button
  aria-label="Add to favorites"
  aria-pressed={isFavorite}
  onClick={handleToggle}
>
  <HeartIcon aria-hidden="true" />
</button>
```

## ⚡ Performance Optimization

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

### Code Splitting
```tsx
// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### React Query Caching
```tsx
const { data } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => fetchProducts(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## 🧪 Testing Strategy

### Unit Tests
- Pure functions in `lib/`
- API services
- Custom hooks

### Integration Tests
- Page flows
- API integration
- User interactions

### Test Structure
```typescript
describe('ProductCard', () => {
  it('displays product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
  });
});
```

## 🌐 Internationalization (i18n)

```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('welcome.title')}</h1>;
}
```

## 📦 State Management

### Local State
- `useState` for component state
- `useReducer` for complex state

### Global State
- React Context for theme, auth, language
- React Query for server state

### Avoid
- ❌ Redux (too complex for this project)
- ❌ Props drilling (use Context)

## 🚀 Deployment Checklist

- [ ] Run `npm run build` locally
- [ ] Check bundle size with `ANALYZE=true npm run build`
- [ ] Test production build: `npm run start`
- [ ] Verify SEO meta tags (view-source)
- [ ] Test accessibility with Lighthouse
- [ ] Check Core Web Vitals

## 📝 Code Style

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Constants: `UPPER_CASE.ts`
- Types: `types.ts` or `PascalCase.types.ts`

### Import Order
```typescript
// 1. External
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal (@/)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// 3. Relative
import { helpers } from './helpers';
import styles from './styles.module.css';
```

## 🔧 Common Patterns

### Error Boundaries
```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <YourComponent />
</ErrorBoundary>
```

### Loading States
```tsx
if (isLoading) return <Skeleton />;
if (error) return <Error error={error} />;
return <Content data={data} />;
```

## 🎯 Best Practices

1. **Keep components small** (< 200 lines)
2. **Extract complex logic to hooks**
3. **Use TypeScript strictly** (no `any`)
4. **Write meaningful names** (no `data1`, `temp`)
5. **Add comments for complex logic**
6. **Delete unused code** (no commented blocks)

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
