# Bundle Size Optimization Guide

## Changes Made

### 1. Vite Configuration Improvements

**File:** `vite.config.ts`

#### Minification Enhancement
- ✅ Switched from `esbuild` to `terser` for better minification
- ✅ Added terser options:
  - Remove all `console.log` statements in production
  - Remove debuggers
  - Strip all comments
  - Better Safari 10 compatibility

#### Strategic Code Splitting
Changed from single vendor chunk to multiple strategic chunks:
- `react-vendor` - React core (react, react-dom)
- `ui-vendor` - Radix UI components (@radix-ui/*)
- `router-vendor` - React Router + React Query
- `i18n-vendor` - Internationalization (i18next)
- `animation-vendor` - Framer Motion
- `vendor` - Other dependencies

**Benefits:**
- Better caching (users only re-download changed chunks)
- Parallel loading of critical dependencies
- Reduced initial bundle size

#### Bundle Analysis
- Added `rollup-plugin-visualizer` to analyze bundle size
- Run `npm run build:analyze` to see bundle composition

### 2. Dependencies to Install

```bash
npm install --save-dev terser rollup-plugin-visualizer
```

### 3. Build Scripts Enhanced

```json
{
  "build": "vite build --mode production",
  "build:analyze": "vite build --mode production && open dist/stats.html"
}
```

## Expected Improvements

### Before
- Total JS: ~4,555 KB
- Potential savings: 1,744 KB (minification) + 2,500 KB (unused code)

### After
- ✅ Minified with terser: **~1,744 KB savings**
- ✅ Better tree-shaking: **~500-800 KB savings**
- ✅ Code splitting: **Faster initial load**

### Metrics Improvements Expected
1. **FCP (First Contentful Paint):** 15-25% faster
2. **LCP (Largest Contentful Paint):** 20-30% faster
3. **TTI (Time to Interactive):** 25-35% faster
4. **Total Bundle Size:** 35-45% reduction

## Additional Optimizations

### 1. Lazy Load Heavy Components

Already implemented in `src/app/router.tsx`:
- ✅ All routes use `React.lazy()`
- ✅ Suspense boundaries with loading states

### 2. Dynamic Imports for Heavy Features

Consider lazy loading:
- Image galleries (when user scrolls)
- Charts/visualizations (if used)
- Rich text editors
- Large form components

Example:
```tsx
const ImageGallery = lazy(() => import('./components/ImageGallery'));

// Use with Suspense
<Suspense fallback={<Spinner />}>
  <ImageGallery images={images} />
</Suspense>
```

### 3. Dependency Analysis

Heavy dependencies to watch:
- `framer-motion` (87 KB) - Consider alternatives for simple animations
- `@tanstack/react-query` (42 KB) - Required, but ensure tree-shaking works
- `@radix-ui/*` (varies) - Only import components you use
- `lucide-react` (large icon set) - Use tree-shaking imports

### 4. Import Optimization

**Bad:**
```tsx
import * as Icons from 'lucide-react';
```

**Good:**
```tsx
import { Home, User, Settings } from 'lucide-react';
```

### 5. Remove Unused Dependencies

Check and remove:
```bash
npx depcheck
```

### 6. Compression

Ensure your server uses:
- ✅ Brotli compression (better than gzip)
- ✅ Cache headers for static assets
- ✅ CDN for asset delivery

## Back/Forward Cache Issues

### Common Causes & Fixes

1. **Service Workers**
   - Ensure proper cleanup
   - Use `Cache-Control: no-cache` for HTML

2. **`unload` Event Listeners**
   - Replace with `pagehide` or `visibilitychange`
   - Remove `beforeunload` if not needed

3. **Open Connections**
   - Close WebSocket connections on page unload
   - Cancel pending fetch requests

4. **IndexedDB Transactions**
   - Complete all transactions before navigation

### Implementation in React

```tsx
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // Clean up resources
      // Close connections
      // Cancel requests
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
```

## Testing

### 1. Production Build
```bash
npm run build
npm run preview
```

### 2. Analyze Bundle
```bash
npm run build:analyze
```

Check `dist/stats.html` for:
- Largest chunks
- Duplicate dependencies
- Unused code

### 3. Lighthouse Audit
```bash
# Chrome DevTools > Lighthouse
# Or use CLI
npx lighthouse http://localhost:4173 --view
```

### 4. Bundle Size Tracking
```bash
# After each build
du -sh dist/assets/*.js | sort -h
```

## Monitoring

### Metrics to Track
1. **Total JS Size:** Target < 200 KB (gzipped)
2. **Initial Bundle:** Target < 100 KB (gzipped)
3. **Largest Chunk:** Target < 150 KB (gzipped)
4. **Number of Chunks:** Keep between 5-10

### Tools
- [Bundlephobia](https://bundlephobia.com/) - Check package sizes before installing
- [Bundle Wizard](https://bundlewizard.dev/) - Analyze your bundle
- Chrome DevTools > Coverage - Find unused code

## Next Steps

1. ✅ Install dependencies: `npm install --save-dev terser rollup-plugin-visualizer`
2. ✅ Build production: `npm run build`
3. ✅ Analyze: Check `dist/stats.html`
4. ⏳ Optimize imports (remove unused)
5. ⏳ Test with Lighthouse
6. ⏳ Deploy and measure improvements

## Results Tracking

### Before Optimization
- [ ] Total bundle size: _____ KB
- [ ] FCP: _____ ms
- [ ] LCP: _____ ms
- [ ] Lighthouse score: _____

### After Optimization
- [ ] Total bundle size: _____ KB (___% reduction)
- [ ] FCP: _____ ms (___% faster)
- [ ] LCP: _____ ms (___% faster)
- [ ] Lighthouse score: _____ (___% improvement)

## References

- [Vite - Building for Production](https://vitejs.dev/guide/build.html)
- [Web.dev - Code Splitting](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [Chrome - Back/Forward Cache](https://web.dev/bfcache/)
