# State Management Audit - Single Source of Truth

## 🎯 Principles
1. **React Query cache** = single source of truth for server data
2. **useState** = ONLY for UI state (modals, hover, search input)
3. **Don't duplicate** API data in local state

---

## ❌ VIOLATIONS FOUND

### 1. **Admin.tsx** - Critical Violation
**Lines 28-30:**
```tsx
const [products, setProducts] = useState<any[]>([]);
const [stores, setStores] = useState<any[]>([]);
const [brands, setBrands] = useState<any[]>([]);
```

**Problem:** Duplicates API data in useState instead of using React Query
**Impact:** 
- Data can become stale
- Manual refetch logic needed
- No automatic caching benefits
- More complex code

**Solution:** Use `useQuery` hooks from `useApi.ts`:
```tsx
const { data: products, isLoading: productsLoading } = useProducts();
const { data: stores, isLoading: storesLoading } = useStores();
const { data: brands, isLoading: brandsLoading } = useBrands();
```

---

### 2. **AdminBrands.tsx** - Critical Violation
**Line 28:**
```tsx
const [brands, setBrands] = useState<Brand[]>([]);
```

**Problem:** Same as Admin.tsx - duplicates API data
**Solution:** Use `useBrands()` hook

---

### 3. **Favorites.tsx** - GOOD ✅
**Already follows best practices:**
- Uses `useFavoritesContext()` for favorites (React Query under the hood)
- Uses `useProducts()` for products data
- `useMemo` to compute derived state (merged favorites with products)
- `useState` only for UI: `searchQuery`

---

### 4. **Index.tsx** - GOOD ✅
**Already follows best practices:**
- Uses `useHomepageData()` hook (React Query)
- `shouldFetchData` is UI state (defer fetching)
- `useMemo` to derive products list

---

### 5. **Products.tsx** - GOOD ✅
**Already follows best practices:**
- Uses `useProductsPageData()` and `useStoreProducts()` hooks
- Custom hooks (`useProductFilters`, `useProductSort`) manage derived state
- `shouldFetchData` is UI state
- `brandSearchQuery` is UI state (search input)

---

## ✅ ACCEPTABLE useState USAGE

These are **correct** uses of local state (UI-only):

### UI State Examples:
```tsx
// ✅ Modal/Dialog state
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingStore, setEditingStore] = useState<any | null>(null);

// ✅ Form inputs (before submission)
const [productName, setProductName] = useState("");
const [storeName, setStoreName] = useState("");

// ✅ Search input (local, pre-API call)
const [searchQuery, setSearchQuery] = useState("");
const [brandSearchQuery, setBrandSearchQuery] = useState("");

// ✅ Tab/Navigation state
const [activeTab, setActiveTab] = useState("add-product");

// ✅ Grid layout state
const { columns, setColumns } = useGridLayout(6);

// ✅ Defer fetching flag
const [shouldFetchData, setShouldFetchData] = useState(false);

// ✅ Loading/submitting state (for mutations)
const [submitting, setSubmitting] = useState(false);
```

---

## 🔧 REQUIRED CHANGES

### Priority 1: Admin.tsx
**Remove:**
```tsx
const [products, setProducts] = useState<any[]>([]);
const [stores, setStores] = useState<any[]>([]);
const [brands, setBrands] = useState<any[]>([]);

// Remove fetchData function and useEffect that sets these
```

**Add:**
```tsx
const { data: products = [], isLoading: productsLoading } = useProducts();
const { data: stores = [], isLoading: storesLoading } = useStores();
const { data: brands = [], isLoading: brandsLoading } = useBrands();

const loading = productsLoading || storesLoading || brandsLoading;
```

**Benefits:**
- Automatic caching
- Automatic refetching
- Shared cache with other components
- Less code to maintain

---

### Priority 2: AdminBrands.tsx
**Remove:**
```tsx
const [brands, setBrands] = useState<Brand[]>([]);

// Remove fetchBrands function
```

**Add:**
```tsx
const { data: brands = [], isLoading } = useBrands();
```

---

## 📊 IMPACT ANALYSIS

### Before (Current):
- **Admin.tsx:** 1612 lines, manual fetching, 3 useState for API data
- **AdminBrands.tsx:** 532 lines, manual fetching, 1 useState for API data
- **Code duplication:** Each component fetches and manages same data
- **Cache misses:** No shared cache between components

### After (Fixed):
- **Admin.tsx:** ~1550 lines (-62 lines), automatic caching
- **AdminBrands.tsx:** ~480 lines (-52 lines), automatic caching
- **Shared cache:** All components use same React Query cache
- **Auto refetch:** Data stays fresh automatically

---

## 📝 STATE MANAGEMENT RULES

### ✅ DO:
1. Use React Query hooks for **all server data**
2. Use `useMemo` for **derived/computed values**
3. Use `useState` for **UI-only state** (modals, search inputs, tabs)
4. Use `useCallback` for **event handlers**
5. Let React Query manage cache, refetch, loading states

### ❌ DON'T:
1. Copy React Query data to `useState`
2. Manually manage loading/error states (React Query does this)
3. Create local copies of server data
4. Use `useEffect` to sync React Query data to local state
5. Duplicate data that's already in React Query cache

---

## 🎓 EXAMPLE: Correct Pattern

### ❌ Wrong:
```tsx
const [products, setProducts] = useState([]);

useEffect(() => {
  fetch('/api/items')
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);
```

### ✅ Correct:
```tsx
const { data: products = [], isLoading } = useProducts();
```

### Why?
- React Query caches data
- Automatic refetch on window focus
- Shared across all components
- Loading/error states built-in
- Optimistic updates support
- Less code, fewer bugs
