# 🏗️ Architecture Refactoring Plan

## 📋 Current Issues

### 1. **Business Logic in UI Components**
- ❌ `SearchDropdown.tsx` - fetches data, filtering logic, navigation
- ❌ `ImageUploader.tsx` - direct fetch() call for upload
- ❌ `Navigation.tsx` - auth checking, state management
- ❌ Pages have 500+ lines with mixed concerns

### 2. **Prop Drilling**
- Multiple levels of props passing
- Hard to track data flow
- Difficult to refactor

### 3. **Direct Fetches in Components**
- `ImageUploader.tsx:96` - raw fetch() call
- Should use centralized API layer

### 4. **No Container/View Separation**
- Logic and presentation mixed
- Hard to test UI separately
- Reusability issues

---

## 🎯 Refactoring Strategy

### Phase 1: Extract Business Logic (Priority: HIGH)

#### 1.1 Create Feature Hooks
```
src/features/
├── products/
│   ├── hooks/
│   │   ├── useProductFilters.ts    # Filter logic
│   │   ├── useProductSearch.ts     # Search logic  
│   │   └── useProductSort.ts       # Sort logic
│   ├── components/
│   │   ├── ProductFilters/         # Pure UI
│   │   ├── ProductSearch/          # Pure UI
│   │   └── ProductSort/            # Pure UI
│   └── utils/
│       └── productHelpers.ts
├── auth/
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth state
│   │   └── useAdminCheck.ts        # Admin verification
│   └── components/
│       └── ProtectedRoute.tsx
└── upload/
    ├── hooks/
    │   └── useImageUpload.ts       # Upload logic
    └── services/
        └── uploadService.ts        # API calls
```

#### 1.2 Extract from SearchDropdown
**Before:** 199 lines with logic + UI
**After:** 
- `useProductSearch.ts` - search logic (40 lines)
- `SearchDropdownView.tsx` - pure UI (80 lines)
- `SearchDropdownContainer.tsx` - orchestration (30 lines)

#### 1.3 Extract from Navigation
**Before:** Auth + search + menu in one component
**After:**
- `useAuth.ts` - authentication state
- `useNavigation.ts` - menu state
- `NavigationView.tsx` - pure UI
- `NavigationContainer.tsx` - orchestration

---

### Phase 2: Eliminate Prop Drilling (Priority: HIGH)

#### 2.1 Existing Contexts (✅ Done)
- ✅ `FavoritesContext` - favorites state
- ✅ `ProductsContext` - products for search
- ⚠️ `ProductsContext` currently unused - remove or use

#### 2.2 New Contexts Needed
```typescript
// src/contexts/FiltersContext.tsx
export const FiltersProvider = ({ children }) => {
  const filters = useProductFilters();
  return <FiltersContext.Provider value={filters}>{children}</FiltersContext.Provider>;
};

// src/contexts/UploadContext.tsx
export const UploadProvider = ({ children }) => {
  const upload = useImageUpload();
  return <UploadContext.Provider value={upload}>{children}</UploadContext.Provider>;
};
```

---

### Phase 3: Container/View Pattern (Priority: MEDIUM)

#### 3.1 Pattern Structure
```
components/
├── SearchDropdown/
│   ├── SearchDropdownContainer.tsx  # Data fetching, logic
│   ├── SearchDropdownView.tsx       # Pure UI, no logic
│   ├── SearchDropdownItem.tsx       # Presentational
│   └── index.ts                     # Export container as default
```

#### 3.2 Container Responsibilities
- Data fetching via hooks
- State management
- Event handlers (business logic)
- Pass data/callbacks to View

#### 3.3 View Responsibilities
- Receive props only
- Render UI
- Call prop callbacks
- Zero business logic

#### Example:
```tsx
// SearchDropdownContainer.tsx
export const SearchDropdownContainer = ({ onClose }) => {
  const { query, setQuery, results, loading } = useProductSearch();
  const navigate = useNavigate();
  
  const handleSelect = (id: string) => {
    navigate(`/product/${id}`);
    onClose();
  };
  
  return (
    <SearchDropdownView
      query={query}
      onQueryChange={setQuery}
      results={results}
      loading={loading}
      onSelect={handleSelect}
      onClose={onClose}
    />
  );
};

// SearchDropdownView.tsx
export const SearchDropdownView = ({ query, onQueryChange, results, loading, onSelect, onClose }) => (
  <div className="search-dropdown">
    <input value={query} onChange={e => onQueryChange(e.target.value)} />
    {loading ? <Spinner /> : <ResultsList items={results} onSelect={onSelect} />}
  </div>
);
```

---

### Phase 4: Centralize API Calls (Priority: HIGH)

#### 4.1 Remove Direct Fetches
**Current violations:**
- `ImageUploader.tsx:96` - `fetch('/api/upload/image')`

**Solution:**
```typescript
// src/services/uploadService.ts
export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload/image', formData);
    return response.data.url;
  }
};

// src/hooks/useImageUpload.ts
export const useImageUpload = () => {
  return useMutation({
    mutationFn: (file: File) => uploadService.uploadImage(file),
    onSuccess: (url) => {
      toast.success('Image uploaded');
    },
    onError: (error) => {
      toast.error('Upload failed');
    }
  });
};
```

#### 4.2 Hook Usage in Component
```tsx
// ImageUploader.tsx
export const ImageUploader = ({ onImageUpload }) => {
  const uploadMutation = useImageUpload();
  
  const handleUpload = async (file: File) => {
    const url = await uploadMutation.mutateAsync(file);
    onImageUpload(url);
  };
  
  return <ImageUploaderView onUpload={handleUpload} loading={uploadMutation.isPending} />;
};
```

---

### Phase 5: Page Refactoring (Priority: MEDIUM)

#### 5.1 Reduce Page Complexity
**Target:** Pages should be 50-100 lines (orchestration only)

**Before (Products.tsx - 575 lines):**
```tsx
const Products = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({...});
  const [sort, setSort] = useState("");
  // ... 50 more lines of state
  
  const filterProducts = () => { /* 100 lines */ };
  // ... 400 more lines
};
```

**After (Products.tsx - 80 lines):**
```tsx
const Products = () => {
  const filters = useProductFilters();
  const search = useProductSearch();
  const sort = useProductSort();
  const products = useFilteredProducts(filters, search, sort);
  const pagination = usePagination(products);
  
  return (
    <ProductsLayout>
      <ProductFilters {...filters} />
      <ProductSearch {...search} />
      <ProductSort {...sort} />
      <ProductGrid products={pagination.items} />
      <Pagination {...pagination} />
    </ProductsLayout>
  );
};
```

---

## 📝 Implementation Checklist

### Phase 1: Business Logic Extraction
- [ ] Create `src/features/` directory structure
- [ ] Extract `useProductSearch` from SearchDropdown
- [ ] Extract `useProductFilters` from Products
- [ ] Extract `useAuth` from Navigation
- [ ] Extract `useImageUpload` from ImageUploader

### Phase 2: Prop Drilling Elimination
- [ ] Audit all prop chains > 2 levels
- [ ] Create `FiltersContext` if needed
- [ ] Remove unused `ProductsContext` OR use it properly
- [ ] Document context usage patterns

### Phase 3: Container/View Pattern
- [ ] Refactor SearchDropdown to Container/View
- [ ] Refactor Navigation to Container/View
- [ ] Refactor ImageUploader to Container/View
- [ ] Create pattern documentation

### Phase 4: API Centralization
- [ ] Remove `fetch()` from ImageUploader
- [ ] Create `uploadService.ts`
- [ ] Create `useImageUpload` hook
- [ ] Audit for other direct fetch calls

### Phase 5: Page Simplification
- [ ] Refactor Products page (575 → 100 lines)
- [ ] Refactor Favorites page
- [ ] Refactor ProductDetail page
- [ ] Refactor Admin pages

---

## 🎯 Success Metrics

### Before
- ❌ Pages: 500-800 lines
- ❌ Mixed UI/logic in components
- ❌ Direct API calls in components
- ❌ Props passed 3-4 levels deep

### After
- ✅ Pages: 50-100 lines (orchestration only)
- ✅ Separate Container/View components
- ✅ All API calls through hooks/services
- ✅ Shared state via Context (0-1 prop levels)
- ✅ Reusable business logic hooks
- ✅ Easy to test components

---

## 🚀 Quick Wins (Start Here)

1. **ImageUploader** (1-2 hours)
   - Create `uploadService.ts`
   - Create `useImageUpload.ts` hook
   - Remove direct fetch()
   - Impact: Better error handling, reusability

2. **SearchDropdown** (2-3 hours)
   - Create `useProductSearch.ts` hook
   - Split to Container/View
   - Impact: Cleaner code, testable search logic

3. **Remove ProductsContext** (30 min)
   - Currently defined but unused
   - Remove from providers.tsx
   - Delete context file
   - Impact: Less confusion, cleaner code

---

## 📚 Patterns & Best Practices

### Custom Hook Pattern
```typescript
// ✅ Good - Encapsulated logic
export const useProductFilters = () => {
  const [filters, setFilters] = useState({});
  
  const applyFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const resetFilters = () => setFilters({});
  
  return { filters, applyFilter, resetFilters };
};
```

### Container/View Pattern
```typescript
// ✅ Container - Data & Logic
const ProductsContainer = () => {
  const { data, loading } = useProducts();
  return <ProductsView products={data} loading={loading} />;
};

// ✅ View - Pure UI
const ProductsView = ({ products, loading }) => (
  <div>{loading ? <Spinner /> : <ProductList items={products} />}</div>
);
```

### Service Pattern
```typescript
// ✅ Service - API abstraction
export const productService = {
  getAll: () => api.get('/items'),
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
};
```

---

## ⚠️ Anti-Patterns to Avoid

### ❌ Don't Mix Logic and UI
```tsx
// ❌ Bad
const Component = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('/api/items').then(r => r.json()).then(setData);
  }, []);
  
  return <div>{data.map(...)}</div>;
};
```

### ❌ Don't Use Direct Fetch
```tsx
// ❌ Bad
const response = await fetch('/api/items');

// ✅ Good
const { data } = useQuery({ queryFn: () => api.get('/items') });
```

### ❌ Don't Drill Props > 2 Levels
```tsx
// ❌ Bad
<GrandParent user={user}>
  <Parent user={user}>
    <Child user={user} />
  </Parent>
</GrandParent>

// ✅ Good
<UserProvider value={user}>
  <GrandParent>
    <Parent>
      <Child /> {/* uses useUser() */}
    </Parent>
  </GrandParent>
</UserProvider>
```

---

## 📊 Priority Matrix

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| Remove direct fetch() | High | Low | 🔴 **NOW** |
| Extract useProductSearch | High | Medium | 🔴 **NOW** |
| Container/View for SearchDropdown | Medium | Medium | 🟡 **SOON** |
| Refactor Products page | High | High | 🟡 **SOON** |
| Extract useAuth | Medium | Low | 🟢 **LATER** |
| FiltersContext | Low | Medium | 🟢 **LATER** |

---

## 🎓 Learning Resources

- **Container/View Pattern**: https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0
- **Custom Hooks**: https://react.dev/learn/reusing-logic-with-custom-hooks
- **Context Best Practices**: https://kentcdodds.com/blog/how-to-use-react-context-effectively
- **React Query Patterns**: https://tkdodo.eu/blog/practical-react-query
