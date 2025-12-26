# 🐛 BUG: Store Ratings Deleted When Product is Deleted

## Problem Description

When a product is deleted, all store ratings associated with that product are also deleted. This is incorrect behavior because:

1. **Store ratings are about the STORE, not the product**
2. A user's rating of a store should persist even if the product they were viewing is deleted
3. Store statistics (average rating, total ratings) become incorrect when ratings disappear

## Example Scenario

```
1. User rates "Store A" with 5 stars while viewing "Product X"
2. Admin deletes "Product X"
3. User's rating of "Store A" is DELETED (THIS IS THE BUG)
4. Store A's average rating drops incorrectly
```

## Root Cause

The `ratings` table has this constraint:

```sql
product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE
```

The `ON DELETE CASCADE` means when a product is deleted, all ratings referencing that `product_id` are automatically deleted.

## Why product_id Was Included

The `product_id` was added to track "which product page was the user on when they rated the store" as context. However, this created an unintended dependency where deleting the product also deletes the rating.

## Solution Options

### ✅ Option 1: Make product_id Nullable with SET NULL (RECOMMENDED)

```sql
-- Drop the old constraint
ALTER TABLE ratings DROP CONSTRAINT ratings_product_id_fkey;

-- Add new constraint with SET NULL
ALTER TABLE ratings 
ADD CONSTRAINT ratings_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE SET NULL;

-- Make product_id nullable
ALTER TABLE ratings ALTER COLUMN product_id DROP NOT NULL;
```

**Benefits:**
- Ratings persist when products are deleted
- Product context is preserved when available
- Minimal code changes needed

**After this change:**
- When a product is deleted, `product_id` in ratings becomes `NULL`
- Store ratings remain intact
- No application code changes required

### Option 2: Remove product_id Entirely

If `product_id` is not used anywhere in queries or analytics:

```sql
ALTER TABLE ratings DROP COLUMN product_id;
```

**Benefits:**
- Simplest solution
- No foreign key issues
- Ratings fully independent of products

**Drawbacks:**
- Lose the context of "which product page user was on"
- May need to update frontend code to not send `product_id`

### Option 3: Keep CASCADE but Update Ratings Before Delete

In the product deletion endpoint:

```javascript
async function deleteProduct(productId) {
  // First, set product_id to NULL in all ratings
  await supabase
    .from('ratings')
    .update({ product_id: null })
    .eq('product_id', productId);
  
  // Then delete the product
  await supabase
    .from('products')
    .delete()
    .eq('id', productId);
}
```

**Drawbacks:**
- More complex deletion logic
- Not ideal for database integrity
- Still requires making product_id nullable

## Recommended Implementation

**Option 1** is the best solution. Here's the complete migration:

```sql
-- Migration: Fix ratings cascade delete issue
-- Date: 2025-12-13

BEGIN;

-- 1. Drop the existing foreign key constraint
ALTER TABLE ratings 
DROP CONSTRAINT IF EXISTS ratings_product_id_fkey;

-- 2. Make product_id nullable
ALTER TABLE ratings 
ALTER COLUMN product_id DROP NOT NULL;

-- 3. Add the new foreign key with ON DELETE SET NULL
ALTER TABLE ratings 
ADD CONSTRAINT ratings_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE SET NULL;

COMMIT;
```

## Testing After Fix

1. **Create test data:**
   - Create a product
   - Rate the store from that product's page
   - Verify rating appears in MyRatings page

2. **Test deletion:**
   - Delete the product
   - Check that rating still exists in database
   - Verify `product_id` is now `NULL` for that rating
   - Check that store's average rating is still correct
   - Verify rating still shows on MyRatings page

3. **Verify statistics:**
   - Store's average_rating should be unchanged
   - Store's total_ratings should be unchanged

## Frontend Changes

**No changes required!** The frontend already handles this correctly:

- The `StoreRating` component sends `product_id` when submitting ratings
- If backend makes `product_id` nullable, frontend will continue to work
- If a rating has `product_id: null`, it still displays correctly

## Database Schema Before & After

### Before (Current - BUGGY):
```sql
product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE
```

### After (Fixed):
```sql
product_id UUID REFERENCES products(id) ON DELETE SET NULL
```

## Priority

**HIGH** - This is a data integrity issue that causes user ratings to be incorrectly deleted.

---

**Summary:** Change the foreign key constraint on `ratings.product_id` from `ON DELETE CASCADE` to `ON DELETE SET NULL` and make the column nullable. This will preserve store ratings even when products are deleted.
