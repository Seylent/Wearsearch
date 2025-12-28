# 🚀 Request Optimization Plan - Reducing 108 Requests

## 📊 Current Situation

You're seeing **108 requests** in DevTools. This is likely caused by:

### 1. **Image Resources** (Most Likely Culprit ~80-90 requests)
- Each product image = 1 request
- Each store logo = 1 request  
- Navigation icons/images = multiple requests
- Background images/decorations = multiple requests

**Example**: 
- Homepage with 6 products = 6 image requests
- Products page with 24 products = 24 image requests
- Stores page with 20 stores (each with logo) = 20 requests
- Plus: favicons, fonts, CSS, JS bundles

### 2. **API Calls** (~5-10 requests)
Your current setup is actually pretty good:
- ✅ Using React Query with caching
- ✅ Batch loading in Admin (`Promise.all` for products/stores/brands)
- ✅ Single API calls per page (not N+1 queries)

**Typical Page Loads**:
- Homepage: 1 request (`/api/items?limit=6`)
- Products Page: 2-3 requests (`/api/items`, `/api/brands`, optional `/api/stores`)
- Product Detail: 3 requests (`/api/items/:id`, `/api/items/:id/stores`, `/api/brands/:id`)

### 3. **Other Resources** (~10-15 requests)
- JavaScript bundles (Vite chunks)
- CSS files
- Fonts (Google Fonts or local)
- Favicon, manifest.json
- Service Worker (if any)

---

## ✅ Recommended Optimizations

### Priority 1: Image Optimization (Will reduce ~50-70% of requests)

#### A. **Implement Image CDN with Responsive Srcsets**
Instead of loading full-size images, use responsive images:

```tsx
// Before (1 request per image, always full size)
<img src={product.image_url} alt={product.name} />

// After (browser picks optimal size, can still be 1 request but smaller)
<img 
  src={product.image_url}
  srcSet={`
    ${product.image_url}?w=400 400w,
    ${product.image_url}?w=800 800w,
    ${product.image_url}?w=1200 1200w
  `}
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  loading="lazy"
  decoding="async"
/>
```

#### B. **Image Sprite Sheets for Icons/Small Graphics**
Combine multiple small images into one:

```css
/* One request for all icons instead of 20+ */
.icon-telegram { background-position: 0 0; }
.icon-instagram { background-position: -32px 0; }
/* etc */
```

#### C. **Lazy Loading (Already Implemented ✅)**
Your `ProductCard` already has `loading="lazy"` - Good!

#### D. **Preload Critical Images**
```tsx
// In index.html or App.tsx
<link rel="preload" as="image" href="/logo.png" />
<link rel="preload" as="image" href="/hero-bg.webp" />
```

---

### Priority 2: API Request Batching

#### Option A: **Server-Side Aggregation Endpoint** ⭐ BEST
Create a single endpoint that returns all data needed for a page:

```typescript
// Backend: New endpoint
GET /api/pages/home
Response: {
  products: [...],
  stats: {...},
  featured: [...]
}

GET /api/pages/products
Response: {
  products: [...],
  brands: [...],
  filters: {...}
}
```

**Frontend changes**:
```typescript
// src/hooks/useApi.ts
export const useHomepageData = () => {
  return useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const response = await api.get('/pages/home');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
```

**Impact**: Reduces 3-4 API calls → 1 API call per page

---

#### Option B: **GraphQL** (If Backend Supports)
Fetch only what you need in one request:

```graphql
query Homepage {
  products(limit: 6) {
    id
    name
    image_url
    price
  }
  stats {
    total_products
    total_stores
  }
}
```

---

#### Option C: **HTTP/2 Server Push** (Nginx/Backend Config)
Your server can push multiple resources with initial page load:

```nginx
# nginx.conf
location / {
  http2_push /api/items?limit=6;
  http2_push /api/brands;
  http2_push /api/stores;
}
```

---

### Priority 3: Resource Bundling & CDN

#### A. **Bundle Fonts Locally**
```typescript
// Instead of Google Fonts (2-3 requests)
// Download fonts and serve locally (0 extra requests)

// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
}
```

#### B. **Code Splitting Optimization**
```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        },
      },
    },
  },
}
```

#### C. **Inline Critical CSS**
```html
<!-- Reduces 1-2 CSS requests -->
<style>
  /* Critical above-fold styles */
  .header { ... }
  .hero { ... }
</style>
```

---

## 📈 Expected Results After Optimization

### Current (108 requests):
- Images: ~80-90 requests
- API: ~8 requests  
- Assets: ~10-15 requests

### After Priority 1 + 2:
- Images: ~30-40 requests (lazy loading + WebP + caching)
- API: ~2-3 requests (aggregated endpoints)
- Assets: ~8-10 requests (bundled fonts/icons)
- **Total: ~40-50 requests** (53% reduction)

### After All Optimizations:
- Images: ~15-20 requests (CDN + sprites + lazy loading)
- API: ~1-2 requests (aggregated + cached)
- Assets: ~5-6 requests (bundled + inlined critical)
- **Total: ~20-30 requests** (72% reduction)

---

## 🎯 Quick Wins (Implement Today)

### 1. Add Aggregated API Endpoint
**Backend** (`routes/pages.js`):
```javascript
router.get('/api/pages/home', async (req, res) => {
  const [products, stats] = await Promise.all([
    db.query('SELECT * FROM products LIMIT 6'),
    db.query('SELECT COUNT(*) FROM products'),
  ]);
  
  res.json({ products, stats });
});
```

**Frontend** (`src/pages/Index.tsx`):
```tsx
// Replace multiple useProducts(), useStats() with:
const { data } = useHomepageData();
const products = data?.products || [];
const stats = data?.stats || {};
```

### 2. Optimize Images
```bash
# Install sharp for image optimization
npm install sharp

# Create image optimization script
node scripts/optimizeImages.js
```

### 3. Enable HTTP/2
Already have it in your nginx.conf? Make sure it's enabled:
```nginx
server {
  listen 443 ssl http2;
  # ...
}
```

---

## 🔍 How to Verify

### Before:
```bash
# Open DevTools Network tab
# Filter: All
# Count: 108 requests
```

### After Each Change:
```bash
# Clear cache
# Reload page
# Count requests
# Goal: Under 30 requests
```

### Use Lighthouse:
```bash
npm run build
npm run preview
# Open DevTools > Lighthouse
# Run audit
# Check "Reduce unused JavaScript" and "Defer offscreen images"
```

---

## 💡 Is This Bad?

**Short Answer**: 108 requests is **okay** but can be optimized.

**Guidelines**:
- ✅ Under 30 requests = Excellent
- ✅ 30-50 requests = Good
- ⚠️ 50-100 requests = Acceptable (could be better)
- ❌ 100+ requests = Should optimize

**Modern HTTP/2 Considerations**:
- HTTP/2 multiplexing allows parallel requests
- Multiple small requests can be faster than one large request
- However, each request still has overhead (headers, handshakes)

**Your Case**:
- Most requests are likely images
- With HTTP/2, this isn't terrible
- But you'll see speed improvements by reducing to 30-50 requests

---

## 🚀 Implementation Priority

1. **High Impact, Low Effort**: Add aggregated API endpoints (30 min)
2. **High Impact, Medium Effort**: Optimize images with WebP + lazy loading (2 hours)
3. **Medium Impact, Low Effort**: Bundle fonts locally (20 min)  
4. **Medium Impact, High Effort**: Implement image CDN with srcset (4+ hours)

Start with #1 and #2 for maximum benefit!
