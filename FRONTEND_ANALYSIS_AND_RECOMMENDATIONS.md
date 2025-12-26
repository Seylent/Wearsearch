# Frontend Architecture Analysis & Refactoring Recommendations

**Date:** December 26, 2025  
**Scope:** Complete frontend codebase analysis  
**Goal:** Production-ready, scalable, and maintainable architecture

---

## Executive Summary

The project has a solid foundation with React, TypeScript, React Query, and proper tooling. However, there are **critical architectural issues** that need to be addressed before production deployment. The codebase shows signs of incremental development without consistent refactoring, resulting in technical debt.

**Severity Levels:**
- 🔴 **Critical** - Must fix before production
- 🟡 **High** - Should fix soon
- 🟢 **Medium** - Improve when possible

---

## 1. Architecture & Project Structure

### 🔴 CRITICAL ISSUES

#### 1.1 Duplicate Entry Points
**Location:** `src/main.tsx` and `src/main.refactored.tsx`

**Problem:**
- Two entry points create confusion and maintenance overhead
- `main.tsx` is active (used in `index.html`)
- `main.refactored.tsx` serves no purpose
- Risk of developers modifying the wrong file

**Solution:**
```typescript
// KEEP: src/main.tsx (current active entry point)
// DELETE: src/main.refactored.tsx
// DELETE: src/App.refactored.tsx (if exists)
```

**Action:**
1. Verify `index.html` references `src/main.tsx`
2. Delete `src/main.refactored.tsx`
3. Delete `src/App.refactored.tsx`
4. Update any documentation

---

#### 1.2 Documentation Overload
**Count:** 30+ markdown files in root directory

**Problem:**
- Multiple "COMPLETE" documents that don't reflect reality
- Creates false confidence and confusion
- Outdated instructions mixed with current ones
- No single source of truth

**Files to DELETE:**
```
❌ FRONTEND_IMPLEMENTATION_COMPLETE.md
❌ FRONTEND_INTEGRATION_COMPLETE.md
❌ FRONTEND_IMPROVEMENTS_COMPLETE.md
❌ OPTIMIZATION_COMPLETE.md
❌ PERFORMANCE_OPTIMIZATION_COMPLETE.md
❌ I18N_TRANSLATION_COMPLETE.md
❌ REFACTOR_SUMMARY.md
❌ NETWORK_OPTIMIZATION_SUMMARY.md
❌ PERFORMANCE_SUMMARY.md
❌ RATINGS_CASCADE_DELETE_BUG.md
❌ RATINGS_FAVORITES_FIX.md
```

**Files to KEEP & CONSOLIDATE:**
```
✅ README.md (main documentation)
✅ QUICKSTART.md (for developers)
✅ DEPLOYMENT.md (for DevOps)
✅ TESTING_QUICK_GUIDE.md
✅ docs/ folder (structured documentation)
```

**Action:**
1. Create `docs/ARCHIVE/` folder
2. Move outdated/completed docs to archive
3. Create single `docs/DEVELOPMENT.md` with current state
4. Update README.md with accurate status

---

### 🟡 HIGH PRIORITY ISSUES

#### 1.3 Pages Contain Too Much Business Logic

**Problem:** Pages like `Products.tsx`, `Admin.tsx`, `ProductDetail.tsx` are 500-2000 lines with mixed concerns:
- API calls
- State management
- UI rendering
- Form handling
- Filtering/sorting logic

**Current Structure:**
```
src/pages/
  ├── Products.tsx (575 lines - too much!)
  ├── Admin.tsx (1956 lines - WAY too much!)
  └── ProductDetail.tsx
```

**Recommended Structure:**
```
src/
├── pages/              # Thin orchestration layer
│   └── Products.tsx    (50-100 lines)
├── features/           # Feature-based modules
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   └── ProductSort.tsx
│   │   ├── hooks/
│   │   │   ├── useProductFilters.ts
│   │   │   └── useProductSort.ts
│   │   └── utils/
│   │       └── productHelpers.ts
│   └── admin/
│       ├── components/
│       ├── hooks/
│       └── services/
└── shared/
    ├── components/
    ├── hooks/
    └── utils/
```

**Example Refactor:**

**Before (Products.tsx - 575 lines):**
```tsx
const Products = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({...});
  const [sort, setSort] = useState("");
  // ... 50+ more lines of state
  
  const filterProducts = () => { /* complex logic */ };
  const sortProducts = () => { /* complex logic */ };
  
  // ... 500 more lines of JSX
};
```

**After (Products.tsx - ~80 lines):**
```tsx
// pages/Products.tsx - Orchestration only
const Products = () => {
  const filters = useProductFilters();
  const sortedProducts = useProductSort(filters.products);
  const pagination = usePagination(sortedProducts);
  
  return (
    <PageLayout>
      <ProductFilters {...filters} />
      <ProductList products={pagination.items} />
      <Pagination {...pagination} />
    </PageLayout>
  );
};

// features/products/hooks/useProductFilters.ts
export const useProductFilters = () => {
  const [search, setSearch] = useState("");
  // ... filter logic
  return { search, setSearch, filteredProducts };
};
```

**Benefits:**
- Pages become 50-100 lines (easy to understand)
- Reusable business logic
- Easier to test
- Better separation of concerns

---

## 2. API & Data Layer

### 🔴 CRITICAL ISSUES

#### 2.1 Empty API_BASE_URL (Production Blocker)

**Location:** `src/config/api.config.ts`, `src/services/api.ts`

**Current Code:**
```typescript
// src/config/api.config.ts
export const API_BASE_URL = ''; // ❌ EMPTY!
export const API_URL = '/api';

// src/services/api.ts
const API_BASE_URL = '/api'; // Hardcoded
```

**Problem:**
- Relies on Vite proxy (only works in dev)
- Breaks in production build
- Breaks for SSR
- Breaks for mobile apps
- Cannot switch environments

**Solution:**
```typescript
// src/config/api.config.ts
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  TIMEOUT: 15000,
  WITH_CREDENTIALS: true,
} as const;

// Validation
if (!API_CONFIG.BASE_URL && import.meta.env.PROD) {
  console.error('VITE_API_BASE_URL is not configured!');
}

// src/services/api.ts
import { API_CONFIG } from '@/config/api.config';

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});
```

**Environment Files:**
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api

# .env.staging
VITE_API_BASE_URL=https://api-staging.wearsearch.com/api

# .env.production
VITE_API_BASE_URL=https://api.wearsearch.com/api
```

**Action:**
1. Create `.env.development`, `.env.staging`, `.env.production`
2. Update `api.config.ts` with environment variable
3. Validate in production build
4. Add to deployment documentation

---

#### 2.2 Scattered Error Handling

**Current State:**
```typescript
// api.ts - Logs but doesn't throw properly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = '/auth'; // ❌ Direct manipulation
    }
    return Promise.reject(error); // ❌ Generic error
  }
);

// Components - Inconsistent handling
try {
  await api.get('/items');
} catch (error: any) { // ❌ 'any' type
  toast({ description: error.message }); // ❌ May not be user-friendly
}
```

**Solution:**
```typescript
// services/api/errorHandler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
  
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
  
  isNotFound(): boolean {
    return this.status === 404;
  }
  
  isServerError(): boolean {
    return this.status !== undefined && this.status >= 500;
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const errorCode = error.response?.data?.error_code;
    const message = error.response?.data?.message || error.message;
    
    return new ApiError(message, status, error.code, errorCode);
  }
  
  if (error instanceof Error) {
    return new ApiError(error.message);
  }
  
  return new ApiError('An unexpected error occurred');
};

// services/api.ts
import { handleApiError, ApiError } from './errorHandler';

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = handleApiError(error);
    
    // Handle auth errors globally
    if (apiError.isAuthError()) {
      clearAuth();
      // Use event bus instead of direct navigation
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    
    return Promise.reject(apiError);
  }
);

// hooks/useAuthEvents.ts
export const useAuthEvents = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleLogout = () => {
      if (!window.location.pathname.includes('/auth')) {
        navigate('/auth');
      }
    };
    
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [navigate]);
};

// Components - Consistent error handling
import { ApiError } from '@/services/api/errorHandler';
import { useErrorToast } from '@/hooks/useErrorToast';

const MyComponent = () => {
  const { showError } = useErrorToast();
  
  try {
    await api.get('/items');
  } catch (error) {
    if (error instanceof ApiError) {
      showError(error); // Translates error_code automatically
    } else {
      showError('An unexpected error occurred');
    }
  }
};
```

**Benefits:**
- Type-safe error handling
- Consistent error messages
- Better UX
- Easier to debug

---

### 🟡 HIGH PRIORITY

#### 2.3 Excessive `invalidateQueries` Usage

**Current Pattern:**
```typescript
// hooks/useApi.ts
export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      return await api.post('/favorites', { product_id: productId });
    },
    onSuccess: () => {
      // ❌ Triggers unnecessary network request
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
};
```

**Problem:**
- Every mutation triggers a new network request
- Poor UX (loading states, delays)
- Unnecessary server load
- No optimistic updates

**Solution - Optimistic Updates:**
```typescript
export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      return await api.post('/favorites', { product_id: productId });
    },
    // ✅ Update cache immediately (optimistic)
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites });
      
      // Snapshot current value
      const previous = queryClient.getQueryData(queryKeys.favorites);
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.favorites, (old: any) => {
        return {
          ...old,
          favorites: [...(old?.favorites || []), {
            id: 'temp-' + Date.now(),
            product_id: productId,
            created_at: new Date().toISOString(),
          }],
        };
      });
      
      return { previous };
    },
    // ✅ Rollback on error
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.favorites, context.previous);
      }
    },
    // ✅ Sync with server on success
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.favorites,
        refetchType: 'active' // Only refetch active queries
      });
    },
  });
};
```

**Benefits:**
- Instant UI feedback
- Better perceived performance
- Reduced server load
- Modern UX patterns

---

#### 2.4 Missing `staleTime` and `gcTime`

**Current:** Defaults are used everywhere (staleTime: 0, gcTime: 5 min)

**Problem:**
- Data refetched unnecessarily
- Poor performance
- Excessive API calls

**Solution:**
```typescript
// app/providers.tsx - Global defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 10 * 60 * 1000,       // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

// hooks/useApi.ts - Per-query overrides
export const useProducts = () => {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: fetchProducts,
    staleTime: 10 * 60 * 1000,  // Products change less frequently
    gcTime: 30 * 60 * 1000,
  });
};

export const useProductDetails = (id: string) => {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => fetchProduct(id),
    staleTime: 15 * 60 * 1000,  // Details change even less
    gcTime: 60 * 60 * 1000,
  });
};
```

**Already Done:** ✅ Your `app/providers.tsx` has good defaults, but some hooks override them incorrectly.

**Action:**
1. Review all `useQuery` hooks
2. Remove unnecessary `staleTime: 0` overrides
3. Set appropriate staleTimes based on data volatility

---

## 3. TypeScript & Type Safety

### 🔴 CRITICAL ISSUES

#### 3.1 Weak TypeScript Configuration

**Location:** `tsconfig.json`

**Current:**
```json
{
  "compilerOptions": {
    "noImplicitAny": false,         // ❌ Allows 'any' everywhere
    "strictNullChecks": false,      // ❌ Allows null/undefined bugs
    "noUnusedParameters": false,
    "noUnusedLocals": false
  }
}
```

**Problem:**
- Type safety is disabled
- `any` is used throughout codebase
- Null/undefined bugs can slip through
- TypeScript's benefits are negated

**Solution:**
```json
{
  "compilerOptions": {
    "strict": true,                  // ✅ Enable all strict checks
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "noUnusedParameters": true,
    "noUnusedLocals": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Migration Strategy:**
```bash
# Step 1: Enable one rule at a time
# Start with noImplicitAny

# Step 2: Fix errors file by file
# Use // @ts-expect-error with explanation for temporary exceptions

# Step 3: Enable strictNullChecks
# Add null checks systematically

# Step 4: Enable all strict mode
```

**Timeline:**
- Week 1: Enable `noImplicitAny`, fix critical files
- Week 2: Enable `strictNullChecks`, add null checks
- Week 3: Enable full `strict` mode
- Week 4: Remove all `// @ts-expect-error` comments

---

#### 3.2 Runtime Validation Missing

**Problem:** No validation for API responses

**Current:**
```typescript
const response = await api.get('/items');
const products = response.data; // ❌ No validation
```

**Risk:**
- Backend changes break frontend silently
- Null reference errors
- Type mismatches
- Production crashes

**Solution - Zod Validation:**
```typescript
// types/schemas.ts
import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string().optional(),
  category: z.string().optional(),
  price: z.union([z.string(), z.number()]).optional(),
  image_url: z.string().optional(),
  gender: z.enum(['men', 'women', 'unisex']).optional(),
});

export const ProductsResponseSchema = z.object({
  success: z.boolean().optional(),
  products: z.array(ProductSchema),
  total: z.number().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;

// services/api.ts - Add validation
export const apiGet = async <T>(
  url: string,
  schema?: z.ZodSchema<T>
): Promise<T> => {
  const response = await api.get(url);
  
  if (schema) {
    try {
      return schema.parse(response.data);
    } catch (error) {
      console.error('API response validation failed:', error);
      throw new ApiError('Invalid API response format');
    }
  }
  
  return response.data;
};

// hooks/useApi.ts
import { ProductsResponseSchema } from '@/types/schemas';

export const useProducts = () => {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: () => apiGet('/items', ProductsResponseSchema),
    // ...
  });
};
```

**Benefits:**
- Catch API changes immediately
- Better error messages
- Type safety at runtime
- Self-documenting API contracts

**Action:**
1. Install Zod (already in dependencies ✅)
2. Create schemas for all API endpoints
3. Add validation to all API calls
4. Log validation errors in development

---

### 🟡 HIGH PRIORITY

#### 3.3 Excessive `any` Usage

**Found:** 15+ instances of `: any` in the codebase

**Examples:**
```typescript
// ❌ Bad
const response: any = await api.get('/items');
export const apiGet = async <T = any>(url: string): Promise<T> => {};
catch (error: any) { /* ... */ }

// ✅ Good
const response: ProductsResponse = await api.get('/items');
export const apiGet = async <T>(url: string): Promise<T> => {};
catch (error: unknown) {
  if (error instanceof ApiError) { /* ... */ }
}
```

**Action:**
1. Search for `: any` and replace with proper types
2. Use `unknown` for truly unknown types
3. Add type guards for narrowing

---

## 4. Security Issues

### 🔴 CRITICAL - Frontend-Only Authorization

**Problem:** Admin checks are done only in frontend

**Current Code:**
```typescript
// components/layout/Navigation.tsx
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
  const token = getAuth();
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    setIsAdmin(payload.role === 'admin'); // ❌ Frontend only!
  }
}, []);

// Renders admin links
{isAdmin && <Link to="/admin">Admin</Link>}
```

**Security Risk:**
- Anyone can modify JWT and gain access
- No real protection
- False sense of security

**Solution:**

**Frontend (UI Only):**
```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  
  const checkAuth = async () => {
    try {
      // ✅ Get user data from backend
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch {
      setUser(null);
    }
  };
  
  return {
    user,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
  };
};

// Just hide UI, don't rely on it for security
{isAdmin && <Link to="/admin">Admin</Link>}
```

**Backend (Real Security):**
```python
# Backend must validate EVERY request
@app.route('/admin/products', methods=['POST'])
@require_role('admin')  # ✅ Real authorization
def create_product():
    # Only admins can reach here
    pass
```

**Action:**
1. Document that frontend auth is UI-only
2. Ensure backend validates all protected routes
3. Return 403 for unauthorized requests
4. Handle 403 gracefully in frontend

---

### 🔴 CRITICAL - No Token Expiration Handling

**Current:**
```typescript
// utils/authStorage.ts
export const getAuth = (): string | null => {
  const authData = JSON.parse(localStorage.getItem(AUTH_TOKEN_KEY));
  
  if (authData.expiresAt && Date.now() > authData.expiresAt) {
    clearAuth(); // ✅ Good
    return null;
  }
  
  return authData.token;
};
```

**Problem:**
- User never notified of expiration
- No automatic refresh
- Poor UX

**Solution:**
```typescript
// hooks/useTokenRefresh.ts
export const useTokenRefresh = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const authData = getAuthData();
      
      if (!authData || !authData.expiresAt) return;
      
      // Refresh 5 minutes before expiration
      const shouldRefresh = authData.expiresAt - Date.now() < 5 * 60 * 1000;
      
      if (shouldRefresh) {
        try {
          const response = await api.post('/auth/refresh');
          setAuth(response.data.token, response.data.user.id, response.data.expiresAt);
        } catch (error) {
          // Token refresh failed, logout user
          clearAuth();
          queryClient.clear();
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }
    }, 60 * 1000); // Check every minute
    
    return () => clearInterval(interval);
  }, [queryClient]);
};

// app/providers.tsx
export const AppProviders = ({ children }) => {
  useTokenRefresh(); // ✅ Auto-refresh tokens
  useAuthEvents();   // ✅ Handle auth events
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

---

## 5. Performance Optimizations

### 🟡 HIGH PRIORITY

#### 5.1 Missing React.memo and useCallback

**Problem:** Unnecessary re-renders

**Current:**
```typescript
// ProductCard renders on every parent re-render
const ProductCard = ({ id, name, image }) => {
  return <div>...</div>;
};

// Parent
const ProductList = ({ products }) => {
  return products.map(p => <ProductCard {...p} />);
};
```

**Found:**
- `ProductCard.tsx`: Uses `memo` ✅
- Most other components: No memoization ❌

**Solution:**
```typescript
// Memoize expensive components
export const ProductCard = memo(({ id, name, image }: Props) => {
  return <div>...</div>;
});

// Memoize callbacks
const ProductList = ({ products, onFavorite }: Props) => {
  const handleFavorite = useCallback((productId: string) => {
    onFavorite(productId);
  }, [onFavorite]); // ✅ Stable reference
  
  return products.map(p => (
    <ProductCard 
      key={p.id} 
      {...p} 
      onFavorite={handleFavorite} 
    />
  ));
};
```

**Action:**
1. Memo all list item components
2. Memo components with expensive renders
3. Use `useCallback` for props passed to memoized components
4. Measure performance improvements

---

#### 5.2 Lazy Loading Already Implemented

**Status:** ✅ **GOOD** - Already using lazy loading

```typescript
// app/router.tsx
const Index = lazy(() => import('@/pages/Index'));
const Products = lazy(() => import('@/pages/Products'));
// ...
```

**No action needed** - This is done correctly.

---

## 6. i18n Issues

### 🟢 MEDIUM PRIORITY

#### 6.1 Hardcoded Strings

**Found:** Some strings not using `t()` function

**Example:**
```tsx
// ❌ Hardcoded
<Button>Loading...</Button>

// ✅ Translated
<Button>{t('common.loading')}</Button>
```

**Action:**
1. Search for hardcoded English strings
2. Add to translation files
3. Replace with `t()` calls

---

#### 6.2 Large Translation Files

**Current:** All translations in two files:
- `src/locales/en.json`
- `src/locales/uk.json`

**Problem:**
- Large files (1000+ lines)
- Hard to maintain
- Bundle size increase

**Solution:**
```
src/locales/
├── en/
│   ├── common.json
│   ├── products.json
│   ├── admin.json
│   └── errors.json
└── uk/
    ├── common.json
    ├── products.json
    ├── admin.json
    └── errors.json
```

```typescript
// i18n.ts
import enCommon from './locales/en/common.json';
import enProducts from './locales/en/products.json';
// ...

i18n.init({
  resources: {
    en: {
      common: enCommon,
      products: enProducts,
    },
  },
});

// Usage
t('products:filters.color'); // Namespace syntax
```

---

## 7. Development Experience

### 🟡 HIGH PRIORITY

#### 7.1 Basic ESLint Configuration

**Current:**
```javascript
// eslint.config.js
rules: {
  "@typescript-eslint/no-unused-vars": "off", // ❌ Disabled
}
```

**Problem:**
- Catches too few issues
- No code quality enforcement
- Inconsistent code style

**Solution:**
```javascript
// eslint.config.js
export default tseslint.config({
  extends: [
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  rules: {
    // TypeScript
    "@typescript-eslint/no-unused-vars": ["error", { 
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_" 
    }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    
    // React
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/prop-types": "off",
    
    // Best Practices
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error",
  },
});
```

**Action:**
1. Update ESLint config
2. Fix all errors
3. Add to CI/CD

---

#### 7.2 No Pre-commit Hooks

**Missing:**
- Code formatting check
- Lint check
- Type check
- Test running

**Solution:**
```bash
# Install husky and lint-staged
npm install -D husky lint-staged

# Initialize husky
npx husky init
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
npm run type-check
npm run lint-staged
```

**Benefits:**
- Catch errors before commit
- Consistent code style
- No broken code in repo

---

## 8. Recommended Refactoring Plan

### Phase 1: Critical Fixes (Week 1-2)

1. **API Configuration**
   - [ ] Add environment variables for API_BASE_URL
   - [ ] Create `.env.*` files
   - [ ] Update `api.config.ts`
   - [ ] Test production build

2. **Remove Duplicate Files**
   - [ ] Delete `main.refactored.tsx`
   - [ ] Delete `App.refactored.tsx`
   - [ ] Archive completed documentation

3. **Error Handling**
   - [ ] Create `ApiError` class
   - [ ] Update API interceptors
   - [ ] Add error event bus
   - [ ] Implement `useErrorToast` hook

4. **TypeScript Basics**
   - [ ] Enable `noImplicitAny`
   - [ ] Fix critical `any` usage
   - [ ] Add basic runtime validation

### Phase 2: Architecture (Week 3-4)

5. **Refactor Large Pages**
   - [ ] Extract business logic from `Products.tsx`
   - [ ] Extract business logic from `Admin.tsx`
   - [ ] Create feature-based structure
   - [ ] Create reusable hooks

6. **React Query Optimization**
   - [ ] Add optimistic updates for mutations
   - [ ] Review and adjust `staleTime`/`gcTime`
   - [ ] Remove unnecessary `invalidateQueries`

7. **Type Safety**
   - [ ] Create Zod schemas for all endpoints
   - [ ] Add runtime validation
   - [ ] Enable `strictNullChecks`

### Phase 3: Polish (Week 5-6)

8. **Performance**
   - [ ] Add `memo` to list components
   - [ ] Add `useCallback` where needed
   - [ ] Profile and optimize

9. **Developer Experience**
   - [ ] Update ESLint configuration
   - [ ] Add pre-commit hooks
   - [ ] Create comprehensive documentation

10. **Security**
    - [ ] Document frontend auth is UI-only
    - [ ] Implement token refresh
    - [ ] Add auth event handling

---

## 9. Quick Wins (Do First)

These can be done immediately with minimal risk:

1. **Delete unused files** (5 min)
   ```bash
   rm src/main.refactored.tsx
   rm src/App.refactored.tsx
   ```

2. **Archive old docs** (10 min)
   ```bash
   mkdir docs/ARCHIVE
   mv *_COMPLETE.md docs/ARCHIVE/
   mv *_SUMMARY.md docs/ARCHIVE/
   ```

3. **Add API_BASE_URL** (15 min)
   - Create `.env.development`
   - Update `api.config.ts`

4. **Fix obvious `any` types** (30 min)
   - Replace `catch (error: any)` with `catch (error: unknown)`
   - Add proper types to API functions

5. **Enable basic TypeScript strict mode** (1 hour)
   - Enable `noImplicitAny`
   - Fix errors in critical files

---

## 10. Success Metrics

Track these to measure improvement:

1. **Bundle Size**
   - Target: < 200 KB initial bundle
   - Current: Check with `npm run build`

2. **Type Coverage**
   - Target: 0 instances of `any`
   - Current: 15+ instances

3. **Code Quality**
   - Target: 0 ESLint errors
   - Target: 0 TypeScript errors with strict mode

4. **Performance**
   - Target: < 2s initial load (3G)
   - Target: < 100ms page transitions

5. **Test Coverage** (Future)
   - Target: 80% coverage
   - Start with critical paths

---

## 11. What's Already Good ✅

Don't change these - they're done well:

1. **Lazy Loading** - Routes are lazy loaded
2. **React Query** - Good defaults in providers
3. **Project Structure** - Good separation of concerns
4. **Component Library** - Using Radix UI (modern, accessible)
5. **Build Configuration** - Vite config is optimized
6. **i18n Setup** - Good structure, just needs splitting

---

## Conclusion

The project has a solid foundation but needs **architectural discipline** before production. The main issues are:

1. **Configuration:** Empty API_BASE_URL will break production
2. **TypeScript:** Weak configuration negates type safety
3. **Architecture:** Pages are too large, logic should be extracted
4. **Error Handling:** Scattered and inconsistent
5. **Documentation:** Too much noise, needs cleanup

**Recommended Approach:**
- Start with Phase 1 (critical fixes) immediately
- Do one refactoring phase at a time
- Test thoroughly after each change
- Don't try to fix everything at once

**Estimated Timeline:**
- Phase 1 (Critical): 1-2 weeks
- Phase 2 (Architecture): 2-3 weeks
- Phase 3 (Polish): 1-2 weeks
- **Total: 4-7 weeks** for production-ready state

Focus on **incremental improvements** rather than a big rewrite. Each phase delivers value independently.
