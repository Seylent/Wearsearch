# 🧪 Testing Guide - After Backend Updates

## ✅ What Backend Should Have Implemented

Based on `FOR_BACKEND_DEVELOPER.md`, backend should now support:

1. **Product creation with stores array**
2. **Product update with stores array**
3. **Get product stores endpoint**

---

## 🧪 How to Test Everything Works

### Test 1: Create Product with Multiple Stores

**Steps:**
1. Open `http://localhost:8080/admin`
2. Go to "Add Product" tab
3. Fill in all fields:
   - Name: Nike Air Max Test
   - Brand: Nike
   - Category: Shoes
   - Color: Black
   - Gender: Men
   - Upload image
4. Add 2 stores:
   - Store 1: Price 150
   - Store 2: Price 145
5. Click "Create Product"
6. **Open Console (F12)** and check logs:

**Expected Console Output:**
```
🚀 Creating product with stores: [{store_id: "...", store_name: "...", price: 150}, ...]
📤 Sending request to backend...
📥 Create product response: {success: true, data: {...}}
✅ Product created successfully with backend!
```

**Expected Result:**
- ✅ Success toast: "Product created and added to 2 store(s)!"
- ✅ Product list refreshes
- ✅ Form clears

**Database Check:**
```sql
-- Should have 1 product
SELECT * FROM products WHERE name = 'Nike Air Max Test';

-- Should have 2 product_stores entries
SELECT * FROM product_stores WHERE product_id = '{product_id}';
```

---

### Test 2: View Product with Stores

**Steps:**
1. Go to homepage: `http://localhost:8080`
2. Click on the product you just created
3. **Open Console (F12)**

**Expected Console Output:**
```
🔍 Fetching product: {id}
📦 Product response: {success: true, ...}
✅ Product data: {name: "Nike Air Max Test", brand: "Nike", image_url: "..."}
🖼️ Image URL: https://...
🏷️ Brand: Nike

🏪 Fetching stores for product: {id}
🏪 Stores response: {success: true, stores: [...]}
✅ Stores data: [
  {id: "...", name: "Store 1", price: 150},
  {id: "...", name: "Store 2", price: 145}
]
```

**Expected Visual Result:**
- ✅ Product image displays
- ✅ Brand name shows
- ✅ Price range shows: **$145 - $150** (on right sidebar)
- ✅ 2 stores listed with individual prices
- ✅ Search/filter works for stores

---

### Test 3: Edit Product - Add/Remove Stores

**Steps:**
1. On product page, click "Edit Product" button (if admin)
2. Or go to Admin → Manage Products → Edit
3. Should see form pre-filled with product data
4. Should see current stores listed
5. Try removing one store
6. Try adding a new store
7. Click "Update Product" or button at bottom
8. **Check Console (F12)**

**Expected Console Output:**
```
✅ Using cached user data: {id: "...", role: "admin"}  ← No /me request!
(Product update request)
```

**Expected Result:**
- ✅ Product updates
- ✅ Stores updated (old removed, new added)
- ✅ No duplicate products created

---

## 🐛 Troubleshooting

### Problem: "Cannot create product"

**Check Console:**
```
📥 Create product response: {success: false, error: "..."}
```

**Possible Issues:**
1. Backend still doesn't support `stores` array
2. Authorization failed
3. Validation error

**Solution:** Check error message in console

---

### Problem: Duplicate products created

**Symptoms:**
- Created 1 product with 2 stores
- But see 2 separate products in list

**Check Console:**
```
⚠️ Backend doesn't support multi-store format, using fallback...
📊 Fallback results: 2/2 successful
```

**Meaning:** Backend didn't implement the new format, frontend used old fallback

**Solution:** Backend needs to properly handle `stores` array (see FOR_BACKEND_DEVELOPER.md)

---

### Problem: Stores not showing on product page

**Check Console:**
```
🏪 Stores response: {success: true, stores: []}
```

**Meaning:** Product has no stores in product_stores table

**Possible Causes:**
1. Backend didn't create product_stores entries
2. Product was created with old method

**Solution:** 
- Check `product_stores` table in database
- Re-create product with new method

---

### Problem: Constant /me requests

**Check Console:**
```
🔍 No cache, fetching /me from API (repeating multiple times)
```

**Meaning:** Cache is being cleared or localStorage doesn't work

**Possible Causes:**
1. Token invalid/expired → backend returns 401 → clears cache
2. Browser in incognito mode
3. localStorage disabled

**Solution:**
```javascript
// In console, check:
localStorage.getItem('user');  // Should have cached data
localStorage.getItem('access_token');  // Should have token
```

If token is invalid, login again.

---

### Problem: "Вибиває з акаунту" (Kicks out of account)

**Symptoms:**
- Redirects to /auth
- Loses session

**Possible Causes:**
1. Token expired
2. Backend returns 401 on some request
3. checkAdmin fails

**Check Console:**
```
🔒 No token, redirecting to auth
```
or
```
❌ Failed to check admin: ...
```

**Solution:**
1. Login again
2. Check if token is valid
3. Check backend /api/auth/me endpoint

---

## 📊 Success Criteria

### ✅ Everything Working:

**Console shows:**
- ✅ Using cached user data (no excessive /me)
- ✅ Product created successfully  
- ✅ Stores loaded correctly
- ✅ Images display
- ✅ Price range calculates

**UI shows:**
- ✅ Product with proper image
- ✅ Brand name
- ✅ Price range (not single price)
- ✅ Multiple stores listed
- ✅ Can search/filter stores
- ✅ No duplicate products

**Database shows:**
```sql
SELECT COUNT(*) FROM products WHERE name = 'Nike Air Max Test';
-- Result: 1 (not 2!)

SELECT * FROM product_stores WHERE product_id = '{id}';
-- Result: 2 rows (one per store with prices)
```

---

## 🔍 Key Console Messages to Look For

### Good Signs (✅):
```
✅ Using cached user data
🚀 Creating product with stores
📤 Sending request to backend
📥 Create product response: {success: true}
✅ Product created successfully with backend!
```

### Warning Signs (⚠️):
```
⚠️ Backend doesn't support multi-store format, using fallback
📊 Fallback results: 2/2 successful
```
Meaning: Still creating duplicates, backend needs update

### Error Signs (❌):
```
❌ Unexpected error from backend
🔒 No token, redirecting to auth
❌ Failed to check admin
```
Meaning: Something is broken, needs investigation

---

## 📞 What to Report

If things don't work, send me:

1. **Console logs** (copy all messages)
2. **Network tab** (screenshot of /me requests)
3. **What you tried** (create product, edit, etc)
4. **Error messages** (if any)

I'll diagnose and fix! 🔧

