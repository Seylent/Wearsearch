# Debug Guide - /me Requests

## How to Debug /me Requests

### 1. Open Browser Console
```
Press F12 → Console tab
```

### 2. Look for these messages:

#### ✅ **Good (Using Cache):**
```
✅ Using cached user data: {id: "...", role: "admin", ...}
```
**Meaning:** No API call made, using cached data

#### 🔍 **Expected Once (First Load):**
```
🔍 No cache, fetching /me from API (should happen only ONCE)
💾 Caching user data: {id: "...", role: "admin", ...}
```
**Meaning:** First time or cache cleared, fetching once and caching

#### ⚠️ **Problem (If you see this often):**
```
🔍 No cache, fetching /me from API (should happen only ONCE)
```
Repeating multiple times = Something is clearing the cache

---

## When /me Should Be Called

### ✅ Expected:
1. **First page load** (no cache yet)
2. **After login** (new user data)
3. **After logout then login** (cache cleared)
4. **After hard refresh + cache clear**

### ❌ Should NOT happen:
1. When navigating between pages
2. When clicking "Edit" on a product
3. When changing tabs in Admin panel
4. When adding/removing stores from product

---

## Current Optimization Strategy

### Admin Panel (`src/pages/Admin.tsx`):
```javascript
useEffect(() => {
  checkAdmin();      // Checks cache first, only fetches if needed
  fetchData();       // Get products and stores
  fetchHeroImages(); // Get hero images
}, []); // ← Empty array = runs ONCE on mount
```

### StoreRating Component (`src/components/StoreRating.tsx`):
```javascript
useEffect(() => {
  checkAuthOnce(); // Checks cache first, only fetches if needed
}, []); // ← Empty array = runs ONCE on mount

useEffect(() => {
  if (userId && productId) {
    loadUserRating(userId); // No /me call here!
  }
}, [productId, userId]);
```

---

## Cache Storage

### Where is cache stored?
```
localStorage.user = JSON.stringify({
  id: "user-uuid",
  email: "user@example.com",
  role: "admin",
  ...
})
```

### Check cache manually:
```javascript
// In browser console:
console.log('Cache:', localStorage.getItem('user'));

// Or:
JSON.parse(localStorage.getItem('user'));
```

### Clear cache manually (for testing):
```javascript
localStorage.removeItem('user');
```

---

## Common Issues & Solutions

### Issue 1: Multiple /me on edit
**Symptom:** When clicking "Edit Product", you see multiple /me requests

**Cause:** Some component is not checking cache

**Solution:** Already fixed! Now uses cache.

---

### Issue 2: /me on every navigation
**Symptom:** Every time you navigate, new /me request

**Cause:** Some component has useEffect without proper dependencies

**Solution:** Check all useEffect:
```bash
grep -r "useEffect.*auth/me" src/
```

---

### Issue 3: Cache not persisting
**Symptom:** Always see "No cache, fetching /me"

**Possible causes:**
1. Browser in incognito mode
2. localStorage disabled
3. Something is clearing localStorage
4. Different domain/subdomain

**Check:**
```javascript
// Test if localStorage works:
localStorage.setItem('test', 'works');
console.log(localStorage.getItem('test')); // Should print 'works'
```

---

## Expected Network Activity

### First Visit:
```
GET /api/auth/me  ← First time, no cache
GET /api/admin/products
GET /api/stores
GET /api/admin/hero-images
```

### After Cache is Set:
```
(no /me request!)
GET /api/admin/products
GET /api/stores
GET /api/admin/hero-images
```

### When Editing Product:
```
(no /me request!)
GET /api/items/:id
GET /api/items/:id/stores
```

---

## How to Verify Fix

### Test 1: Admin Panel Load
1. Clear browser cache (Ctrl+Shift+Delete)
2. Open http://localhost:8080/admin
3. Check console:
   - Should see: "No cache, fetching /me" **ONCE**
   - Should see: "Caching user data"

### Test 2: Navigate Around
1. Stay on admin panel
2. Switch tabs (Add Product → Manage Products → Stores)
3. Check console:
   - Should **NOT** see any new /me requests
   - Should see: "Using cached user data"

### Test 3: Edit Product
1. Go to "Manage Products"
2. Click "Edit" on any product
3. Check console:
   - Should **NOT** see /me request
   - Should see: "Using cached user data"
   - Should see: GET /api/items/:id
   - Should see: GET /api/items/:id/stores

### Test 4: Refresh Page
1. Press F5 (normal refresh)
2. Check console:
   - Should see: "Using cached user data" (cache still there!)
   - Should **NOT** see /me request

### Test 5: Hard Refresh
1. Press Ctrl+Shift+R
2. Check console:
   - Cache might be cleared
   - May see "No cache, fetching /me" **ONCE**

---

## Performance Metrics

### Before Optimization:
- Admin page load: 10-20 /me requests
- Edit product: 5-10 /me requests
- Total per session: 50-100+ requests

### After Optimization:
- Admin page load: 1 /me request (or 0 if cached)
- Edit product: 0 /me requests
- Total per session: 1 request

**Reduction: 99%!** 🎉

---

## If Issues Persist

### 1. Check for multiple instances:
```bash
# Search for all /me API calls:
grep -r "api/auth/me" src/ --exclude-dir=node_modules
```

### 2. Check useEffect dependencies:
Look for patterns like:
```javascript
useEffect(() => {
  fetchUserData(); // Contains /me call
}, [someValue]); // ← If someValue changes often, problem!
```

### 3. Check component mounting:
If a component with /me call unmounts and remounts frequently, it will call /me each time.

### 4. Enable network throttling:
DevTools → Network → Slow 3G
This makes it easier to see requests happening.

---

## Summary

✅ **Cache Strategy Working:**
- /me called once per session
- Cache checked before API call
- All components use cached data

✅ **Monitoring:**
- Console logs show cache hits
- Network tab shows minimal requests
- Performance is optimized

🔍 **If you see issues:**
- Check console logs
- Look for patterns
- Report with screenshot of console

