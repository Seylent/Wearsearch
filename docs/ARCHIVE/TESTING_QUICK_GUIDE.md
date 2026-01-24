# 🧪 Quick Testing Guide

## Guest Favorites Testing

### Test 1: Add Favorites as Guest
```bash
1. Open browser in Incognito/Private mode
2. Navigate to http://localhost:5173
3. Click on any product
4. Click the heart icon ❤️
5. Should see toast: "Додано - Увійдіть щоб зберегти назавжди"
6. Heart should fill with red color
```

**Verify localStorage:**
```javascript
// Open DevTools Console
localStorage.getItem('guestFavorites')
// Should show: ["product-id-here"]
```

### Test 2: Guest Favorites Persist
```bash
1. Add 3-4 products to favorites (as guest)
2. Navigate to different pages
3. Return to product pages
4. Heart icons should remain filled ✅
```

### Test 3: Sync on Login
```bash
1. Add 2-3 products to favorites (as guest)
2. Click "Login" in navigation
3. Login with valid credentials
4. Open Console (F12)
5. Should see: "✅ Synced 2 favorites. Total: X"
6. Navigate to Favorites page
7. Guest favorites should appear in list
```

**Verify localStorage cleared:**
```javascript
// After login, check DevTools Console
localStorage.getItem('guestFavorites')
// Should show: null
```

---

## Related Products Testing

### Test 1: View Related Products
```bash
1. Navigate to any product detail page
2. Scroll down past "Where to Buy" section
3. Should see "Similar Products ✨" section
4. Should display up to 6 product cards
```

### Test 2: Click Related Product
```bash
1. Scroll to Related Products section
2. Click on any product card
3. Should navigate to that product's page
4. New related products should load
```

### Test 3: Responsive Layout
```bash
Desktop (>1024px): 6 columns (1 row)
Tablet (768-1024px): 3 columns (2 rows)
Mobile (<768px): 2 columns (3 rows)
```

**Test by resizing browser window**

### Test 4: Empty State
```bash
1. Find a product with unique category/brand
2. Should NOT show Related Products section
3. (Section is hidden, not showing "No products")
```

---

## Quick Debug Commands

### Check Guest Favorites in Console
```javascript
// View current guest favorites
JSON.parse(localStorage.getItem('guestFavorites') || '[]')

// Manually add favorite
const guestFavs = JSON.parse(localStorage.getItem('guestFavorites') || '[]')
guestFavs.push('test-product-id')
localStorage.setItem('guestFavorites', JSON.stringify(guestFavs))

// Clear guest favorites
localStorage.removeItem('guestFavorites')
```

### Check API Responses
```javascript
// Check related products API (replace {id})
fetch('http://localhost:3000/api/items/{id}/related')
  .then(r => r.json())
  .then(console.log)

// Check sync endpoint (requires auth token)
fetch('http://localhost:3000/api/favorites/sync', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ 
    guestFavorites: ['product-id-1', 'product-id-2'] 
  })
}).then(r => r.json()).then(console.log)
```

---

## Expected Results ✅

### Guest Favorites:
- ✅ Heart icon fills immediately (no login required)
- ✅ Toast notification appears
- ✅ State persists across page navigation
- ✅ Automatic sync after login
- ✅ localStorage cleared after sync
- ✅ No duplicate favorites in backend

### Related Products:
- ✅ Section appears below product details
- ✅ Shows 1-6 similar products
- ✅ Grid layout adapts to screen size
- ✅ Products are clickable and navigate correctly
- ✅ Section hidden when no results
- ✅ Loading skeleton shows while fetching

---

## Troubleshooting

### Guest Favorites Not Saving
```bash
✅ Check: Browser localStorage enabled
✅ Check: Not in private/incognito mode for production
✅ Check: Console for errors
✅ Verify: FavoriteButton component imported correctly
```

### Sync Not Working
```bash
✅ Check: Backend server running (http://localhost:3000)
✅ Check: Network tab for /api/favorites/sync request
✅ Check: Auth token is valid
✅ Verify: Backend endpoint exists and works
```

### Related Products Not Showing
```bash
✅ Check: Product has category set
✅ Check: Other products exist with same category
✅ Check: /api/items/:id/related returns data
✅ Check: Console for React errors
✅ Verify: RelatedProducts component imported in ProductDetail
```

---

## Console Log Messages to Look For

**Guest Favorites:**
```
✅ Synced 2 favorites. Total: 5
🔄 Syncing 2 guest favorites...
```

**Related Products:**
```
(No console logs - uses React Query silently)
```

**Errors to Watch:**
```
❌ Failed to sync guest favorites: [error details]
❌ Failed to fetch related products: [error details]
```

---

🎉 **Happy Testing!**

If you encounter any issues, check the console logs and network requests in DevTools.
