# 🔍 DEBUGGING RATINGS & FAVORITES ISSUES

## ✅ Changes Applied

I've added extensive logging to diagnose why:
1. **Ratings statistics aren't updating** after submission
2. **Favorites aren't being saved** when clicked

### Key Changes:

1. **Changed from `invalidateQueries` to `refetchQueries`**
   - `invalidateQueries` = marks data as stale (lazy refetch)
   - `refetchQueries` = force immediate refetch ✅
   
2. **Added comprehensive console logging**
   - Every API call now logs request and response
   - Track data flow through the entire system
   
3. **Better error handling**
   - Full error response details logged
   - User-friendly error messages

## 🧪 How to Debug

### Step 1: Open Browser DevTools
```
Press F12 or Right-click → Inspect
```

### Step 2: Go to Console Tab
Look for these messages to track what's happening:

### Step 3: Test Favorites

**When you click the heart icon, you should see:**
```
Toggling favorite for product: abc-123 Current state: false
API: Adding favorite for product: abc-123
API: Add favorite response: { success: true, ... }
API: Favorite added, refetching favorites list...
API: Fetching favorites list...
API: Favorites response: { favorites: [...] }
API: Favorites list refetched
```

**If it fails, you'll see:**
```
API: Add favorite error: { error: "..." }
Toggle favorite error: ...
Error details: { error: "...", message: "..." }
```

### Step 4: Test Ratings

**When you click a star to rate, you should see:**
```
Submitting rating: { storeId: "xyz", productId: "abc", rating: 5 }
API: Submitting rating: { storeId: "xyz", productId: "abc", rating: 5 }
Rating submission response: { success: true, ... }
API: Fetching store ratings for: xyz
API: Store ratings response: { average: 5.0, count: 1 }
API: Parsed store ratings: { average: 5.0, count: 1 }
Queries refetched successfully
```

**If it fails, you'll see:**
```
Rating submission error: ...
Error response: { error: "...", message: "..." }
```

### Step 5: Check Network Tab

1. Go to **Network** tab in DevTools
2. Filter by **Fetch/XHR**
3. Look for these requests:

**For Favorites:**
- `POST /api/favorites/add` → Should return 200/201
- `GET /api/user/favorites` → Should return your favorites list

**For Ratings:**
- `POST /api/ratings` → Should return 200/201
- `GET /api/ratings/store/{storeId}` → Should return updated average

## 🔍 Common Issues & Solutions

### Issue 1: "401 Unauthorized"
**Symptom:** Console shows `API: Favorites fetch error: 401`

**Solution:**
1. Check if you're logged in (user icon in nav)
2. Try logging out and back in
3. Check localStorage for `auth_token`:
   ```javascript
   // In console:
   localStorage.getItem('auth_token')
   ```

### Issue 2: "404 Not Found"
**Symptom:** Console shows `API: Favorites fetch error: 404`

**Solution:**
- Backend endpoint might be wrong
- Check if API is running: `http://localhost:3000/api/user/favorites`

### Issue 3: Favorites Save but Don't Show
**Symptom:** Success toast appears but heart stays empty

**Solution:**
- Check console for: `API: Favorites list refetched`
- Look at response data structure in Network tab
- Verify productId matches between add and list

### Issue 4: Rating Submits but Statistics Don't Update
**Symptom:** "You rated this store X stars" shows but top shows "0.0 (0 ratings)"

**Solution:**
- Check if `refetchQueries` completes: `Queries refetched successfully`
- Look at `/api/ratings/store/{storeId}` response in Network tab
- Verify backend is calculating average correctly

## 📊 Expected Data Structures

### Favorites Response:
```json
{
  "success": true,
  "favorites": [
    {
      "id": "favorite-record-id",
      "product_id": "product-id",
      "created_at": "2024-12-12T...",
      "products": {
        "id": "product-id",
        "name": "Product Name",
        "price": "1000",
        "images": ["url1", "url2"],
        "brand": "Brand Name"
      }
    }
  ]
}
```

### Store Ratings Response:
```json
{
  "success": true,
  "average": 4.5,
  "count": 10,
  "data": [
    { "rating": 5, "user_id": "...", ... },
    { "rating": 4, "user_id": "...", ... }
  ]
}
```

### Add Favorite Response:
```json
{
  "success": true,
  "message": "Favorite added successfully",
  "favorite": {
    "id": "new-favorite-id",
    "product_id": "product-id",
    "user_id": "user-id"
  }
}
```

## 🛠️ Quick Fixes to Try

### If nothing works:

1. **Clear browser cache**
   ```
   Ctrl+Shift+Delete → Clear cache
   ```

2. **Hard refresh**
   ```
   Ctrl+Shift+R
   ```

3. **Check API base URL**
   ```javascript
   // In console:
   console.log(import.meta.env.VITE_API_BASE_URL)
   // Should be: http://localhost:3000/api
   ```

4. **Verify auth token exists**
   ```javascript
   // In console:
   const token = localStorage.getItem('auth_token');
   console.log('Token exists:', !!token);
   console.log('Token:', token?.substring(0, 20) + '...');
   ```

5. **Test API directly**
   Open in browser or use curl:
   ```bash
   # Get favorites
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/user/favorites
   
   # Add favorite
   curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"productId":"PRODUCT_ID"}' http://localhost:3000/api/favorites/add
   ```

## 📝 What to Report Back

If issues persist, send me:

1. **Console logs** (copy all relevant messages)
2. **Network tab screenshot** showing failed requests
3. **Response data** from the failing request (click on it in Network tab → Response)
4. **Auth status:** `localStorage.getItem('auth_token')` exists? Yes/No

## 🎯 Next Steps

After seeing the console logs, we can:
- Fix endpoint URLs if they're wrong
- Adjust data parsing if backend returns different structure  
- Add middleware if auth isn't being sent correctly
- Modify query keys if caching isn't working

---

**Current Status:** 🔍 Debugging Mode Active
**Server:** http://localhost:8081
**Action:** Try adding favorite or rating, then check console!
