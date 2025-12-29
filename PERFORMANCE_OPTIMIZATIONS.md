/**
 * Performance Optimization Guide
 * Best practices for React performance
 */

## 🚀 Performance Optimizations Implemented

### 1. **Lazy Loading** ✅

#### Pages (Already Done)
```typescript
// src/app/router.tsx
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
// ... all pages lazy loaded
```

#### Dialogs & Modals
```typescript
// src/components/common/LazyDialog.tsx
<LazyDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  importFunc={() => import('./HeavyDialogContent')}
/>
```

**Benefits:**
- Smaller initial bundle
- Faster first paint
- Load on demand

---

### 2. **useMemo для списків і обчислень** ✅

#### Already Implemented:
```typescript
// useProductFilters.ts
const filteredProducts = useMemo(() => {
  let filtered = [...allProducts];
  // Heavy filtering logic
  return filtered;
}, [allProducts, filters]);

// useProductSearch.ts  
const results = useMemo(() => {
  // Search & filter logic
  return products.filter(...).slice(0, 5);
}, [debouncedQuery, productsData]);
```

**When to use useMemo:**
- ✅ Filtering/sorting large arrays
- ✅ Complex calculations
- ✅ Derived data from props/state
- ❌ Simple value assignments
- ❌ Primitive values

---

### 3. **useCallback для функцій** ✅

#### Already Implemented:
```typescript
// useProductFilters.ts
const toggleColor = useCallback((color: string) => {
  setColors(prev => 
    prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
  );
}, []);

const resetFilters = useCallback(() => {
  setColors([]);
  setTypes([]);
  // ...
}, []);
```

**When to use useCallback:**
- ✅ Functions passed to child components
- ✅ Dependencies in useEffect
- ✅ Event handlers in memoized components
- ❌ Functions used only in same component
- ❌ Functions that change every render anyway

---

### 4. **Віртуалізація довгих списків** ✅

#### New Component Created:
```typescript
// src/components/common/VirtualizedProductGrid.tsx
<VirtualizedProductGrid
  products={products}
  columns={4}
  estimateSize={400}
/>
```

**How it works:**
- Only renders visible items + overscan
- Uses `@tanstack/react-virtual`
- 1000 items → renders ~10-15
- Smooth scrolling performance

**When to use:**
- ✅ Lists > 100 items
- ✅ Complex list items
- ✅ Infinite scroll
- ❌ Small lists (< 50 items)
- ❌ Simple text lists

---

### 5. **Component Memoization**

#### React.memo for Pure Components:
```typescript
// ProductCard.tsx (should add)
import { memo } from 'react';

export const ProductCard = memo(({
  id, name, image, price, category, brand
}) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.id === nextProps.id &&
         prevProps.name === nextProps.name;
});
```

**When to use React.memo:**
- ✅ Pure presentational components
- ✅ Components that re-render often with same props
- ✅ Expensive render logic
- ❌ Components with children prop
- ❌ Props change on every render

---

## 📊 Performance Checklist

### ✅ Already Optimized:
- [x] Pages lazy loaded
- [x] useMemo in hooks (filters, search)
- [x] useCallback in hooks (toggles, actions)
- [x] React Query caching (10min staleTime)
- [x] Debounced search
- [x] Aggregated API endpoints

### 🔄 To Implement:
- [ ] Add React.memo to ProductCard
- [ ] Use VirtualizedProductGrid for large lists
- [ ] Lazy load Dialog contents
- [ ] Add React.memo to pure UI components

### 🎯 Optional Advanced:
- [ ] Code split large dependencies
- [ ] Preload critical routes
- [ ] Service Worker for caching
- [ ] Image lazy loading (native `loading="lazy"`)

---

## 🛠️ How to Use

### VirtualizedProductGrid
```tsx
import { VirtualizedProductGrid } from '@/components/common/VirtualizedProductGrid';

// In Products.tsx
{products.length > 50 ? (
  <VirtualizedProductGrid products={products} columns={gridColumns} />
) : (
  <div className="grid">
    {products.map(p => <ProductCard {...p} />)}
  </div>
)}
```

### LazyDialog
```tsx
import { LazyDialog } from '@/components/common/LazyDialog';

const [isOpen, setIsOpen] = useState(false);

<LazyDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  importFunc={() => import('./FilterDialog')}
  componentProps={{ filters, onApply: handleApply }}
/>
```

### Memoized ProductCard
```tsx
// ProductCard.tsx
export default memo(ProductCard, (prev, next) => {
  return prev.id === next.id && 
         prev.name === next.name &&
         prev.price === next.price;
});
```

---

## 📈 Expected Improvements

| Optimization | Impact | Use Case |
|-------------|--------|----------|
| **Lazy Loading** | 30-50% smaller initial bundle | All pages |
| **useMemo** | Prevents unnecessary recalculations | Filters, sorts |
| **useCallback** | Prevents child re-renders | Event handlers |
| **Virtualization** | 10x faster for 1000+ items | Product grid |
| **React.memo** | Skips unnecessary renders | Pure components |

---

## ⚠️ Common Mistakes

### ❌ Over-optimization
```typescript
// DON'T: useMemo for simple values
const doubled = useMemo(() => count * 2, [count]);

// DO: Just compute it
const doubled = count * 2;
```

### ❌ Wrong dependencies
```typescript
// DON'T: Missing dependencies
const fn = useCallback(() => {
  console.log(value);
}, []); // ❌ Should include [value]

// DO: Include all dependencies
const fn = useCallback(() => {
  console.log(value);
}, [value]); // ✅
```

### ❌ Premature optimization
```typescript
// DON'T: Memoize everything
const Component = memo(() => {
  const value = useMemo(() => 1 + 1, []);
  const fn = useCallback(() => {}, []);
  // ...
});

// DO: Measure first, optimize bottlenecks
```

---

## 🔍 Profiling Tools

1. **React DevTools Profiler**
   - Record renders
   - Find slow components
   - Check why components re-render

2. **Chrome DevTools Performance**
   - Record page load
   - Check main thread blocking
   - Analyze bundle size

3. **Bundle Analyzer**
   ```bash
   npm run build -- --analyze
   ```

---

## 📚 Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [useMemo vs useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)
- [When to useMemo](https://overreacted.io/before-you-memo/)
- [React Virtual](https://tanstack.com/virtual/latest)
