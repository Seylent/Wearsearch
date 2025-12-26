# Testing Guide - Performance Optimizations

## Quick Verification Steps

### 1. Build the Application
```bash
npm run build
```

**Expected Output**:
- Smaller bundle sizes than before
- Multiple chunk files generated
- No build errors

### 2. Preview Production Build
```bash
npm run preview
```

Opens the production build at `http://localhost:4173`

### 3. Visual Verification

#### Homepage (Index)
1. **Load the page** - Hero text should appear immediately (within 1s)
2. **Observe loading** - Products section should show skeletons, then load
3. **Check network** - Data requests should happen AFTER initial render
4. **Verify images** - Hero images should load progressively

#### Products Page
1. **Initial render** - Layout and filters should appear immediately
2. **Product grid** - Should show skeleton loaders
3. **Data load** - Products should populate after ~100ms delay

#### Product Detail Page
1. **Navigation and layout** - Renders immediately
2. **Product data** - Loads progressively
3. **Related products** - Separate query, cached
4. **Store listings** - No duplicate requests

### 4. Chrome DevTools Analysis

#### Network Tab
```bash
# Open Chrome DevTools > Network
# Refresh the page
# Filter: All
```

**Check for**:
- ✅ Fewer total requests (target: <40 on homepage)
- ✅ No duplicate API calls
- ✅ Initial bundle <200KB gzipped
- ✅ Chunked resources loaded in parallel

#### Performance Tab
```bash
# Open Chrome DevTools > Performance
# Click Record
# Refresh page
# Stop recording after page loads
```

**Look for**:
- ✅ First Paint < 1s
- ✅ LCP element (hero text) < 2s
- ✅ No long blocking tasks

#### React Query DevTools
The app already has React Query configured. In development mode:

```typescript
// Add to src/app/providers.tsx if needed
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// In AppProviders:
<ReactQueryDevtools initialIsOpen={false} />
```

**Verify**:
- ✅ Queries are cached properly
- ✅ No duplicate queries running
- ✅ Stale times respected

### 5. Lighthouse Audit

#### Option A: Chrome DevTools
```bash
# Open Chrome DevTools > Lighthouse
# Select "Desktop" or "Mobile"
# Click "Analyze page load"
```

#### Option B: CLI
```bash
# Install lighthouse globally
npm install -g lighthouse

# Run audit
lighthouse http://localhost:4173 --view
```

#### Expected Scores:
- **Performance**: >90 (was likely <50)
- **FCP**: <2s (was ~24s)
- **LCP**: <2.5s (was ~46s)
- **Speed Index**: <4s (was ~24s)
- **Total Blocking Time**: <200ms

### 6. Bundle Analysis

#### Analyze Build Output
```bash
npm run build
```

Check the output for:
- `react-core-[hash].js` - <100KB
- `router-[hash].js` - <50KB
- `ui-*-[hash].js` - Multiple small chunks
- `icons-*-[hash].js` - Separated icon libraries

#### Visual Bundle Analyzer (Optional)
```bash
# Install
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts plugins
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  react(),
  visualizer({ open: true })
]

# Build and view
npm run build
```

### 7. Real-World Testing

#### Throttling Test
```bash
# Chrome DevTools > Network
# Throttling: "Fast 3G" or "Slow 3G"
# Refresh page
```

**Verify**:
- Hero text still appears quickly
- Layout doesn't shift (CLS)
- Progressive loading works well

#### Cache Test
```bash
# Load page once
# Refresh (Cmd+R / Ctrl+R)
```

**Verify**:
- Second load is much faster
- Cached queries don't refetch
- Only stale data is revalidated

### 8. Mobile Testing

#### Chrome DevTools Device Mode
```bash
# Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
# Select "iPhone 12 Pro" or similar
# Run Lighthouse mobile audit
```

#### Expected:
- Similar performance improvements
- Touch interactions work
- Images still lazy load properly

## Common Issues & Solutions

### Issue: Hero images not loading
**Solution**: Check CORS settings on S3/image host

### Issue: API data not showing
**Solution**: 
1. Check browser console for errors
2. Verify API_BASE_URL in environment
3. Check React Query DevTools for failed queries

### Issue: Bundle still large
**Solution**:
1. Run `npm run build` again
2. Check for unused dependencies
3. Verify tree-shaking is working

### Issue: TypeScript errors
**Solution**: Already fixed in the codebase
- All hooks accept options parameter
- No duplicate variable declarations

## Performance Checklist

Before deployment, verify:
- [ ] FCP < 2s
- [ ] LCP < 2.5s
- [ ] Speed Index < 4s
- [ ] Network requests < 40 (homepage)
- [ ] No console errors
- [ ] No duplicate API calls
- [ ] Images load progressively
- [ ] Layout doesn't shift (CLS)
- [ ] All TypeScript checks pass
- [ ] Production build works

## Monitoring After Deployment

### Real User Monitoring (RUM)
Consider adding:
- Google Analytics (Core Web Vitals)
- Sentry (Performance monitoring)
- LogRocket (Session replay)

### Continuous Testing
- Set up automated Lighthouse CI
- Monitor bundle sizes
- Track Core Web Vitals in production

## Additional Resources

- [Web.dev - Performance](https://web.dev/performance/)
- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Vite Code Splitting](https://vitejs.dev/guide/build.html#chunking-strategy)

---

**Need Help?**
Check `PERFORMANCE_FIX_2024.md` for detailed implementation notes.
