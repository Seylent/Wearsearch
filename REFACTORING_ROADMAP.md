# Refactoring Roadmap

## 📋 Current Issues & Solutions

### 1. ✅ DONE: Removed Examples
- ❌ `src/examples/` - removed from production code

### 2. 🔄 TODO: Restructure Components

#### Current Problem
```
components/
├── layout/
├── pages/
├── ui/
├── CollectionManager.tsx
├── EnhancedSearch.tsx
├── FavoriteButton.tsx
└── ... (mixed structure)
```

#### Target Structure
```
components/
├── ui/              # Primitives (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── layout/          # Layout components
│   ├── Navigation.tsx
│   └── Footer.tsx
└── shared/          # Shared business components
    ├── ProductCard.tsx
    ├── SearchBar.tsx
    └── ...
```

### 3. 🔄 TODO: Extract Business Logic

#### Current Problem
```tsx
// ❌ Logic in component
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .finally(() => setLoading(false));
  }, []);
  
  return <div>{/* render */}</div>;
}
```

#### Target Solution
```tsx
// ✅ Logic in hook
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });
}

function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  return <div>{/* render */}</div>;
}
```

### 4. 🔄 TODO: Consolidate Services & Lib

#### Current Structure
```
lib/
├── api.ts
├── utils.ts
services/
├── api.ts
├── api/
utils/
├── helpers.ts
```

#### Target Structure
```
lib/
├── api/          # API clients
├── utils/        # Pure utilities
└── helpers/      # Business helpers

services/         # Remove (merge into lib/)
```

### 5. ⚠️ TODO: Improve Accessibility

#### Missing a11y Features
- [ ] Add `aria-label` to icon buttons
- [ ] Implement keyboard navigation for modals
- [ ] Add focus traps in dialogs
- [ ] Ensure proper heading hierarchy (h1 → h2 → h3)
- [ ] Add skip-to-content link
- [ ] Test with screen reader

#### Example Fix
```tsx
// Before
<button onClick={handleFavorite}>
  <HeartIcon />
</button>

// After
<button
  onClick={handleFavorite}
  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
  aria-pressed={isFavorite}
>
  <HeartIcon aria-hidden="true" />
  <span className="sr-only">
    {isFavorite ? "Remove from favorites" : "Add to favorites"}
  </span>
</button>
```

### 6. ⚡ TODO: Performance Optimizations

#### Bundle Size
- [ ] Analyze bundle: `ANALYZE=true npm run build`
- [ ] Lazy load heavy components (charts, editors)
- [ ] Use dynamic imports for routes
- [ ] Remove unused dependencies

#### Image Optimization
- [ ] Ensure all images use Next.js `<Image>`
- [ ] Add blur placeholders
- [ ] Set proper sizes and loading strategies

#### Font Optimization
```tsx
// next.config.mjs
const nextConfig = {
  optimizeFonts: true,
};
```

### 7. 🧪 TODO: Testing Strategy

#### Current State
- ✅ Vitest configured
- ⚠️ No clear test structure
- ❌ No integration tests

#### Target Structure
```
src/
├── components/
│   └── ProductCard/
│       ├── ProductCard.tsx
│       └── ProductCard.test.tsx
├── hooks/
│   └── useProducts/
│       ├── useProducts.ts
│       └── useProducts.test.ts
└── lib/
    └── utils/
        ├── formatPrice.ts
        └── formatPrice.test.ts
```

#### Test Coverage Goals
- Unit tests: 70%+
- Integration tests for critical flows
- E2E tests for main user journeys

### 8. 🔒 TODO: Type Safety

#### Remove `any` Types
```bash
# Find all 'any' usage
grep -r "any" src/ --include="*.ts" --include="*.tsx"
```

Replace with proper types:
```tsx
// ❌ Before
function handleData(data: any) {
  return data.items;
}

// ✅ After
interface ApiResponse {
  items: Product[];
}

function handleData(data: ApiResponse) {
  return data.items;
}
```

## 🎯 Priority Roadmap

### Phase 1: Critical (This Week)
1. ✅ Remove `examples/` folder
2. ✅ Create ARCHITECTURE.md
3. 🔄 Add basic a11y (aria-labels, keyboard nav)
4. 🔄 Optimize next.config (done)

### Phase 2: Important (Next 2 Weeks)
1. Restructure components/ folder
2. Extract all business logic to hooks
3. Add integration tests
4. Bundle size optimization

### Phase 3: Nice to Have (Month)
1. Migrate to feature-first structure
2. Full a11y audit and fixes
3. Performance profiling
4. Remove all `any` types

## 🚀 Quick Wins (Do Now)

### 1. Unused Imports Cleanup
```bash
npx eslint --fix src/
```

### 2. Format Everything
```bash
npm run format
```

### 3. Type Check
```bash
npm run type-check
```

### 4. Bundle Analysis
```bash
ANALYZE=true npm run build
```

## 📊 Metrics to Track

- **Bundle Size**: Target < 200KB (First Load JS)
- **Lighthouse Score**: Target 90+ for all metrics
- **Type Coverage**: Target 95%+ (no `any`)
- **Test Coverage**: Target 70%+
- **Build Time**: Monitor and optimize

## 🔍 Code Review Checklist

Before every PR:
- [ ] No `any` types added
- [ ] Components < 200 lines
- [ ] Business logic in hooks/services
- [ ] Added tests for new features
- [ ] Accessibility considered
- [ ] Images optimized
- [ ] No console.logs in production code
- [ ] TypeScript strict mode passes

## 📚 Learning Resources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Accessibility](https://web.dev/accessibility/)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
