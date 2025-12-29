# Backend BFF Issues - Requires Fix

## ❌ Current Status

BFF endpoints are returning **500 Internal Server Error**

## 🐛 Error Details

```
GET http://localhost:3000/api/pages/home
Error: Cannot read properties of undefined (reading 'value')

GET http://localhost:3000/api/pages/products
Error: Cannot read properties of undefined (reading 'value')
```

## 🔍 Root Cause Analysis

### Error Meaning
```javascript
// Somewhere in code:
someVariable.value  // ❌ Error here

// But someVariable is undefined
console.log(someVariable); // undefined
```

### Where to Look

#### 1️⃣ **src/routes/pages.ts** (Most likely)

**Check `/api/pages/home` endpoint:**
```typescript
// ❌ WRONG - if row.price is undefined:
const products = rows.map(row => ({
  price: row.price.value  // Crashes here!
}));

// ✅ CORRECT:
const products = rows.map(row => ({
  price: row.price  // Direct value
}));
```

**Check `/api/pages/products` endpoint:**
```typescript
// Same issue - check all .value accesses
```

#### 2️⃣ **Database Queries**

**Check if all fields are in SELECT:**
```sql
-- ❌ WRONG - missing field:
SELECT id, name FROM products;
-- Then accessing row.price.value crashes

-- ✅ CORRECT:
SELECT id, name, price FROM products;
```

**Check JOINs:**
```sql
-- ❌ WRONG - missing JOIN:
SELECT p.*, b.name as brand_name
FROM products p
-- Missing: LEFT JOIN brands b ON p.brand_id = b.id

-- ✅ CORRECT:
SELECT p.*, b.name as brand_name
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
```

#### 3️⃣ **src/schemas/api-contracts.ts**

**Check Zod schemas:**
```typescript
// ❌ WRONG - expects object:
export const ProductSchema = z.object({
  price: z.object({
    value: z.number()  // Expects { value: 123 }
  })
});

// ✅ CORRECT - direct value:
export const ProductSchema = z.object({
  price: z.number()  // Expects 123
});
```

## 🔧 Specific Fixes Needed

### Fix #1: Check Price Field
```typescript
// In pages.ts, find lines like:
price: row.price.value  // ❌ Remove .value

// Change to:
price: row.price  // ✅ Direct access
```

### Fix #2: Check Brand Field
```typescript
// If you see:
brand: row.brand.value  // ❌ Wrong

// Change to:
brand: row.brand  // ✅ Correct
```

### Fix #3: Check All Object Accesses
Search backend code for:
```bash
grep -r "\.value" src/routes/pages.ts
```

Remove all `.value` accesses unless you're sure the field is an object.

### Fix #4: Add NULL Checks
```typescript
// Before:
const products = rows.map(row => ({
  brand: row.brand.name  // Crashes if brand is null
}));

// After:
const products = rows.map(row => ({
  brand: row.brand?.name || null  // Safe
}));
```

## 🧪 Testing Steps

### 1. Test Endpoints Manually
```bash
# Test homepage
curl http://localhost:3000/api/pages/home

# Test products
curl "http://localhost:3000/api/pages/products?page=1&limit=24"
```

### 2. Check Backend Logs
Look for full stack trace - it will show exact line number:
```
Error: Cannot read properties of undefined (reading 'value')
  at /path/to/pages.ts:123:45  ← Check this line!
```

### 3. Debug Single Product
```typescript
// In pages.ts, add logging:
console.log('Raw row:', JSON.stringify(rows[0], null, 2));
```

This will show exact structure from database.

## 📝 Endpoints to Fix

### 1. `/api/pages/home` - 500 Error ❌

**Expected Response:**
```typescript
{
  success: true,
  data: {
    products: Product[],
    brands: Brand[],
    statistics: Statistics
  }
}
```

**Current Issue:** Backend crashes with `.value` error

### 2. `/api/pages/products` - 500 Error ❌

**Expected Response:**
```typescript
{
  success: true,
  data: {
    products: Product[],
    brands: Brand[],
    pagination: {...},
    filters: {...}
  }
}
```

**Current Issue:** Backend crashes with `.value` error

### 3. `/api/pages/product/:id` - Works with fallback ⚠️

Frontend uses fallback (3 separate requests) because aggregated endpoint returns empty stores.

### 4. `/api/pages/stores` - Works with fallback ⚠️

Has `stores.description` column error, frontend uses fallback.

## ✅ Frontend Fallback Status

Frontend has **automatic fallback** to old endpoints, so the app works normally:

- ✅ Homepage: Falls back to `/api/items` + `/api/statistics`
- ✅ Products: Falls back to `/api/items` + `/api/brands`
- ✅ Product Detail: Uses `/api/items/:id` + `/api/items/:id/stores`
- ✅ Stores: Uses `/api/stores`

**User experience:** Not affected! App works with old endpoints.

## 🔧 Debugging Steps

1. **Check backend logs** for full stack trace
2. **Inspect Zod schemas** in `api-contracts.ts`:
   - Are all fields properly defined?
   - Are optional fields marked with `.optional()`?
3. **Check database queries**:
   - Are all JOINs correct?
   - Are all fields in SELECT clause?
4. **Test response manually**:
   ```bash
   curl http://localhost:3000/api/pages/home
   ```

## 🎯 Quick Fixes

### Option 1: Fix Zod Validation
```typescript
// Make sure all fields are properly typed
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nullable(), // Not .value!
  // ... etc
});
```

### Option 2: Fix Data Transformation
```typescript
// Check where you map database results
const products = rows.map(row => ({
  id: row.id,
  name: row.name,
  price: row.price, // Not row.price.value!
  // ... etc
}));
```

### Option 3: Temporarily Disable Validation
```typescript
// In pages.ts routes, comment out validation
// const validation = safeValidateResponse(HomepageResponseSchema, data);
// if (!validation.success) { throw ... }
res.json(data);
```

## 📊 Expected vs Actual

### Expected (from BFF_ARCHITECTURE_COMPLETE.md):
- ✅ Endpoints should work
- ✅ Zod validation should pass
- ✅ Performance: 45-64% faster

### Actual:
- ❌ Endpoints return 500 errors
- ❌ Frontend uses fallback
- ⚠️ Performance: Same as before (uses old endpoints)

## 🚀 When Fixed

Once backend BFF is fixed:
1. Frontend will automatically start using aggregated endpoints
2. Performance will improve (45-64% faster)
3. Number of requests will decrease
4. Remove fallback code (optional)

## 📞 Contact

Frontend is ready and working with fallback. Backend team should:
1. Fix the `.value` error
2. Test endpoints return correct format
3. Verify Zod validation passes

---

**Status:** Frontend production-ready with fallback ✅
**Backend:** Needs fixes before BFF can be used ❌
