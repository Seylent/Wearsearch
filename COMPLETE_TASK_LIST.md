# Complete Task List - Detailed Implementation Plan

## 🎯 Overview
All tasks requested with detailed implementation steps and backend requirements.

---

## ✅ TASK 1: Techno Text Logo (Only Text, No Icon)

### Current State:
- Logo has icon + text
- Using: `/public/logo-new.svg`

### Required Changes:
1. **Create new techno-style text logo**
   - Font: Orbitron, Rajdhani, or similar techno font
   - Text: "WEARSEARCH" or "WearSearch"
   - Style: Bold, modern, cyberpunk aesthetic
   - Effects: Slight neon glow or gradient
   - Format: SVG (clean, scalable)

2. **Remove icon from Navigation**
   - Update `src/components/layout/Navigation.tsx`
   - Replace logo with text-only version

### Files to Modify:
- `public/logo-text-only.svg` (create new)
- `src/components/layout/Navigation.tsx`

### Backend Required: ❌ No

**Status:** PENDING

---

## ✅ TASK 2: Store Logo Upload

### Current State:
- Store logo field exists in Admin
- Uses ImageUploader component
- Displays in store list

### What's Working:
- ✅ Upload functionality exists
- ✅ Display in Stores page
- ✅ Display in ProductDetail page

### What Needs Verification:
- Test if logo upload works correctly
- Check if logo displays in all places

### Files Involved:
- `src/pages/Admin.tsx` - Upload form ✅
- `src/pages/Stores.tsx` - Display logos ✅
- `src/pages/ProductDetail.tsx` - Display logos ✅

### Backend Required:
⚠️ **VERIFY:** Does `stores` table have `logo_url` column?

```sql
-- If missing, add:
ALTER TABLE stores ADD COLUMN logo_url TEXT;
```

**Status:** NEEDS TESTING

---

## ✅ TASK 3: Edit Email & Password

### Current State:
- No profile edit functionality
- Users can't change email or password

### Required Implementation:

#### Frontend (New Page):
Create `src/pages/Profile.tsx`:
```typescript
- Display current email
- Change Email form
- Change Password form
- Save button
```

#### Add Route:
```typescript
// src/App.tsx
<Route path="/profile" element={<Profile />} />
```

#### Add to Navigation:
```typescript
// src/components/UserProfileMenu.tsx
<MenuItem onClick={() => navigate('/profile')}>
  <Settings /> Edit Profile
</MenuItem>
```

### Backend Required:
✅ **REQUIRED:** New endpoints

```typescript
// 1. Update Email
PUT /api/auth/email
Body: { email: "new@email.com", password: "current_password" }

// 2. Update Password  
PUT /api/auth/password
Body: { current_password: "...", new_password: "..." }

// 3. Verify Current Password (for security)
POST /api/auth/verify-password
Body: { password: "..." }
Response: { valid: true/false }
```

**Status:** PENDING (Backend needed)

---

## ✅ TASK 4: Fix Product with Multiple Stores (CRITICAL)

### Current Problem:
```
Creating product with 2 stores:
❌ Result: Creates 2 separate products (duplicates)
✅ Should: Create 1 product with 2 store associations
```

### Root Cause:
Backend doesn't support the new format where one product has multiple stores.

### Current Frontend Code:
```typescript
// Admin.tsx - handleCreateProduct()
// Sends:
{
  "name": "Nike Air Max",
  "stores": [
    {"store_id": "uuid-1", "price": 150},
    {"store_id": "uuid-2", "price": 145}
  ]
}
```

### Backend Required:
🚨 **CRITICAL:** Update product creation endpoint

```typescript
// POST /api/admin/products
// Should:
1. Create ONE entry in `products` table
2. Create MULTIPLE entries in `product_stores` table

// Example backend implementation:
async function createProduct(req, res) {
  const { name, type, color, stores, ...productData } = req.body;
  
  // 1. Create product
  const product = await db.products.create({
    name, type, color, ...productData
  });
  
  // 2. Create product-store associations
  if (stores && stores.length > 0) {
    await Promise.all(
      stores.map(store => 
        db.product_stores.create({
          product_id: product.id,
          store_id: store.store_id,
          price: store.price
        })
      )
    );
  }
  
  return res.json({ success: true, data: product });
}
```

### Also Required:
```typescript
// PUT /api/admin/products/:id
// Should REPLACE all store associations:
1. Delete old product_stores entries
2. Insert new ones from request
```

### Frontend Fallback:
Currently has fallback that creates duplicates if backend doesn't support new format.
**TODO:** Remove fallback once backend is updated.

**Status:** PENDING (Backend critical)

---

## ✅ TASK 5: Remove Featured Product Checkboxes

### Current State:
- "Show in Hero" / "Featured Product" checkbox in Admin
- Not used anywhere in frontend

### Files to Modify:
1. `src/pages/Admin.tsx`
   - Remove `isFeatured` state
   - Remove checkbox from form
   - Remove from API calls

### Backend Required:
❌ No changes needed (column can stay in DB, just not used)

**Status:** PENDING

---

## ✅ TASK 6: Complete Site Optimization Analysis

### Areas to Analyze:

#### 1. **Unnecessary Components**
Check for:
- Unused imports
- Dead code
- Duplicate components
- Unused pages

#### 2. **API Calls Optimization**
- ✅ Already optimized /me requests
- Check other API calls
- Add request deduplication
- Consider implementing React Query

#### 3. **Bundle Size**
- Check for large dependencies
- Lazy load routes
- Code splitting

#### 4. **Performance Issues**
- Re-renders
- Heavy computations
- Large lists without virtualization

#### 5. **Unused Features**
- Featured products system (not used)
- Ratings system (if not used)
- Other legacy features

### Deliverables:
1. List of unused components to delete
2. List of optimizations to implement
3. Bundle size analysis
4. Performance recommendations

**Status:** PENDING

---

## 📋 Implementation Order

### Phase 1: Quick Fixes (30 min)
1. ✅ Remove Featured Product checkboxes
2. ✅ Create new techno text logo
3. ✅ Update Navigation with new logo

### Phase 2: Testing & Verification (15 min)
4. ✅ Test store logo upload
5. ✅ Verify logo displays everywhere

### Phase 3: Profile Edit (1 hour)
6. Create Profile page
7. Add email change form
8. Add password change form
9. Integrate with backend (once endpoints ready)

### Phase 4: Critical Fix (Backend)
10. Fix product creation with multiple stores
11. Update backend endpoints
12. Test thoroughly

### Phase 5: Optimization (1-2 hours)
13. Complete site analysis
14. Remove unused code
15. Optimize bundle
16. Performance improvements

---

## 🔴 Backend Requirements Summary

### Critical (Must Have):
1. **Product Creation with Stores Array**
   ```
   POST /api/admin/products
   Body: { ..., stores: [{store_id, price}] }
   ```

2. **Product Update with Stores Array**
   ```
   PUT /api/admin/products/:id
   Body: { ..., stores: [{store_id, price}] }
   ```

3. **Store Logo Column**
   ```sql
   ALTER TABLE stores ADD COLUMN logo_url TEXT;
   ```

### Important (For Profile Edit):
4. **Update Email**
   ```
   PUT /api/auth/email
   ```

5. **Update Password**
   ```
   PUT /api/auth/password
   ```

6. **Verify Password**
   ```
   POST /api/auth/verify-password
   ```

---

## 📊 Progress Tracking

- [ ] Task 1: Techno Text Logo
- [ ] Task 2: Store Logo Upload (Verify)
- [ ] Task 3: Edit Email & Password
- [ ] Task 4: Fix Product Stores (Backend)
- [ ] Task 5: Remove Featured Checkbox
- [ ] Task 6: Site Optimization Analysis

**Estimated Time:** 3-4 hours (excluding backend development)

---

## 🎯 Next Steps

1. Start with quick fixes (logo, featured checkbox)
2. Test store logo upload
3. Create profile edit page
4. Wait for backend updates for critical fixes
5. Perform optimization analysis
6. Remove unused code

I will now begin implementation! 🚀

