# FOR BACKEND DEVELOPER - Critical Updates Required

## 🚨 MOST CRITICAL: Product Creation with Multiple Stores

### Current Problem:
When creating a product with 2+ stores, the system creates **MULTIPLE SEPARATE PRODUCTS** (duplicates).

**Example:**
```
User creates "Nike Air Max" with 2 stores:
  - Store A: $150
  - Store B: $145

Current Result (WRONG):
  Product 1: "Nike Air Max", Store A, $150
  Product 2: "Nike Air Max", Store B, $145
  → TWO separate products!

Expected Result (CORRECT):
  Product: "Nike Air Max"
  Product-Store 1: Product ID → Store A, $150
  Product-Store 2: Product ID → Store B, $145
  → ONE product with TWO store associations!
```

### Frontend Sends:
```json
POST /api/admin/products
{
  "name": "Nike Air Max",
  "type": "sneakers",
  "color": "Black",
  "gender": "men",
  "brand": "Nike",
  "description": "Classic sneakers",
  "image_url": "https://...",
  "stores": [
    {
      "store_id": "uuid-store-1",
      "price": 150.00
    },
    {
      "store_id": "uuid-store-2",
      "price": 145.00
    }
  ]
}
```

### Backend Must:

#### 1. Create Product Endpoint
```javascript
POST /api/admin/products

async function createProduct(req, res) {
  const { name, type, color, gender, brand, description, image_url, stores } = req.body;
  
  try {
    // 1. Create ONE product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        type,
        color,
        gender,
        brand,
        description,
        image_url
      })
      .select()
      .single();
    
    if (productError) throw productError;
    
    // 2. Create product-store associations
    if (stores && stores.length > 0) {
      const productStores = stores.map(store => ({
        product_id: product.id,
        store_id: store.store_id,
        price: store.price
      }));
      
      const { error: storesError } = await supabase
        .from('product_stores')
        .insert(productStores);
      
      if (storesError) throw storesError;
    }
    
    return res.json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
```

#### 2. Update Product Endpoint
```javascript
PUT /api/admin/products/:id

async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, type, color, gender, brand, description, image_url, stores } = req.body;
  
  try {
    // 1. Update product
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        name,
        type,
        color,
        gender,
        brand,
        description,
        image_url
      })
      .eq('id', id)
      .select()
      .single();
    
    if (productError) throw productError;
    
    // 2. REPLACE store associations
    // First, delete old associations
    await supabase
      .from('product_stores')
      .delete()
      .eq('product_id', id);
    
    // Then, insert new ones
    if (stores && stores.length > 0) {
      const productStores = stores.map(store => ({
        product_id: id,
        store_id: store.store_id,
        price: store.price
      }));
      
      const { error: storesError } = await supabase
        .from('product_stores')
        .insert(productStores);
      
      if (storesError) throw storesError;
    }
    
    return res.json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
```

---

## ✅ Already Working

### 1. Get Product Stores
```
GET /api/items/:id/stores
```
✅ Already returns stores with prices

### 2. Store Logo
```
stores table already has logo_url column
```
✅ Working

---

## 🔒 Profile Edit Endpoints (NEW)

Frontend will have profile edit page. Need these endpoints:

### 1. Update Email
```javascript
PUT /api/auth/email
Authorization: Bearer {token}

Body:
{
  "email": "newemail@example.com",
  "password": "current_password" // For security verification
}

Response:
{
  "success": true,
  "message": "Email updated successfully"
}

// Validation:
- Verify current password
- Check if new email already exists
- Update email in database
- Return success
```

### 2. Update Password
```javascript
PUT /api/auth/password
Authorization: Bearer {token}

Body:
{
  "current_password": "old_password",
  "new_password": "new_password_here"
}

Response:
{
  "success": true,
  "message": "Password updated successfully"
}

// Validation:
- Verify current password
- Hash new password
- Update in database
- Return success
```

### 3. Verify Password (Optional helper)
```javascript
POST /api/auth/verify-password
Authorization: Bearer {token}

Body:
{
  "password": "password_to_verify"
}

Response:
{
  "valid": true
}

// Used for:
- Extra security check before sensitive operations
- Can be used in frontend before showing edit form
```

---

## 📊 Database Schema Verification

### Products Table (Should NOT have price column):
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  gender TEXT,
  brand TEXT,
  description TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE, -- Not used anymore, can be removed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Product-Stores Junction Table (Has price per store):
```sql
CREATE TABLE product_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, store_id)
);
```

### Stores Table (Must have logo_url):
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT, -- REQUIRED
  telegram_url TEXT,
  instagram_url TEXT,
  shipping_info TEXT,
  rating NUMERIC(3, 2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If logo_url doesn't exist:
ALTER TABLE stores ADD COLUMN logo_url TEXT;
```

---

## 🧪 Testing Checklist

### Test 1: Create Product with Multiple Stores
```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "type": "shoes",
    "color": "Black",
    "stores": [
      {"store_id": "uuid-1", "price": 100},
      {"store_id": "uuid-2", "price": 95}
    ]
  }'

# Expected: ONE product created
# Check database:
# SELECT * FROM products WHERE name = 'Test Product';
# → Should return 1 row

# SELECT * FROM product_stores WHERE product_id = '{product_id}';
# → Should return 2 rows (one per store)
```

### Test 2: Update Product Stores
```bash
curl -X PUT http://localhost:3000/api/admin/products/{id} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product Updated",
    "type": "shoes",
    "color": "Black",
    "stores": [
      {"store_id": "uuid-3", "price": 110}
    ]
  }'

# Expected: Product updated, old store associations deleted, new one added
# SELECT * FROM product_stores WHERE product_id = '{id}';
# → Should return 1 row (uuid-3), old ones deleted
```

### Test 3: Get Product with Stores
```bash
curl http://localhost:3000/api/items/{id}/stores

# Expected: Array of stores with prices
```

---

## 🎯 Priority Order

### 🔴 Critical (Do First):
1. ✅ Fix POST /api/admin/products (product creation)
2. ✅ Fix PUT /api/admin/products/:id (product update)

### 🟡 Important (Do Next):
3. ✅ Add PUT /api/auth/email
4. ✅ Add PUT /api/auth/password
5. ✅ Add POST /api/auth/verify-password (optional)

### 🟢 Verify (Should Already Work):
6. ✅ Check stores.logo_url column exists
7. ✅ Test GET /api/items/:id/stores

---

## 📞 Questions?

If anything is unclear:
1. Check BACKEND_REQUIREMENTS.md for more details
2. Check COMPLETE_TASK_LIST.md for full implementation plan
3. Frontend code is in:
   - `src/pages/Admin.tsx` (product creation)
   - `src/pages/Profile.tsx` (will be created for profile edit)

---

## ✅ Summary

**What to implement:**
1. Update POST /api/admin/products to handle stores array
2. Update PUT /api/admin/products/:id to handle stores array
3. Add profile edit endpoints (email, password)

**Expected timeline:**
- Product endpoints: 1-2 hours
- Profile endpoints: 1 hour
- Testing: 30 minutes

**Total:** ~3 hours of backend work

Good luck! 🚀

