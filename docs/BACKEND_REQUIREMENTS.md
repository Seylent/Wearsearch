# Backend Requirements Documentation

## Overview
This document describes all the API endpoints and data structures required for the WearSearch frontend to function properly. The frontend has been fully refactored with the following key features:

## ✅ Already Implemented Backend Features
Based on your message, you already have:
- ✅ Hero Images API (`/api/admin/hero-images`)
- ✅ Hero Images database table and storage bucket

## 🔴 Critical Backend Changes Required

### 1. **Product Creation with Multiple Stores (MOST IMPORTANT)**

**Current Issue:** When creating a product with multiple stores, the frontend sends an array of stores but the backend might be creating multiple product entries.

**Required Endpoint:**
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nike Air Max",
  "type": "sneakers",
  "color": "Black",
  "gender": "men",
  "brand": "Nike",
  "description": "Classic sneakers",
  "image_url": "https://...",
  "is_featured": false,
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

**Expected Backend Behavior:**
1. Create **ONE** product entry in `products` table
2. Create **MULTIPLE** entries in `product_stores` junction table (one for each store with its price)
3. Return the created product with its ID

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-product",
    "name": "Nike Air Max",
    "type": "sneakers",
    "color": "Black",
    "gender": "men",
    "brand": "Nike",
    "description": "Classic sneakers",
    "image_url": "https://...",
    "is_featured": false,
    "created_at": "2025-12-06T..."
  }
}
```

**Fallback Mechanism:**
Currently, the frontend has a fallback that creates separate products if the backend doesn't support the new format. This should be removed once the backend is updated.

---

### 2. **Product Update with Store Management**

**Required Endpoint:**
```http
PUT /api/products/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nike Air Max",
  "type": "sneakers",
  "color": "Black",
  "gender": "men",
  "brand": "Nike",
  "description": "Updated description",
  "image_url": "https://...",
  "is_featured": true,
  "stores": [
    {
      "store_id": "uuid-store-1",
      "price": 155.00
    },
    {
      "store_id": "uuid-store-3",
      "price": 149.00
    }
  ]
}
```

**Expected Backend Behavior:**
1. Update product information
2. **REPLACE** all existing product-store associations with the new ones
   - Delete old entries from `product_stores` for this product
   - Insert new entries from the `stores` array
3. This allows admins to add/remove stores and update prices

---

### 3. **Get Product Details with Stores**

**⚠️ CRITICAL: Frontend is currently using TWO endpoints:**

**Current Frontend Calls:**
```javascript
// 1. Get product info
GET /api/items/${id}

// 2. Get stores for this product
GET /api/items/${id}/stores
```

**Option A: Keep Two Endpoints (Easier to implement)**

**Endpoint 1: Get Product**
```http
GET /api/items/:id
```
Response:
```json
{
  "success": true,
  "id": "uuid-product",
  "name": "Nike Air Max",
  "type": "sneakers",
  "color": "Black",
  "gender": "men",
  "brand": "Nike",
  "description": "Classic sneakers",
  "image_url": "https://...",
  "is_featured": false,
  "created_at": "2025-12-06T..."
}
```

**Endpoint 2: Get Stores for Product**
```http
GET /api/items/:id/stores
```
Response:
```json
{
  "success": true,
  "stores": [
    {
      "id": "uuid-store-1",
      "name": "Cool Store",
      "logo_url": "https://...",
      "price": 150.00,
      "telegram_url": "https://t.me/coolstore",
      "instagram_url": "https://instagram.com/coolstore",
      "average_rating": 4.5,
      "total_ratings": 120,
      "is_verified": true,
      "shipping_info": "Fast delivery"
    },
    {
      "id": "uuid-store-2",
      "name": "Best Shop",
      "logo_url": null,
      "price": 145.00,
      "telegram_url": "https://t.me/bestshop",
      "instagram_url": null,
      "average_rating": 4.8,
      "total_ratings": 85,
      "is_verified": true,
      "shipping_info": null
    }
  ]
}
```

**Backend Implementation for `/api/items/:id/stores`:**
```sql
SELECT 
  s.id,
  s.name,
  s.logo_url,
  ps.price,
  s.telegram_url,
  s.instagram_url,
  s.rating as average_rating,
  0 as total_ratings,  -- or actual count if you track it
  s.is_verified,
  s.shipping_info
FROM product_stores ps
JOIN stores s ON ps.store_id = s.id
WHERE ps.product_id = $1
ORDER BY s.name;
```

**Important Notes:**
- ✅ Frontend already expects this structure
- ✅ `price` comes from `product_stores.price` (per-store pricing)
- ✅ `logo_url` must be in stores table
- ✅ Frontend calculates price range automatically from stores array

---

### 4. **Get All Products with Price Ranges**

**Required Endpoint:**
```http
GET /api/products?page=1&limit=24&search=nike&color=Black&category=sneakers&sort=price_asc
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-product",
      "name": "Nike Air Max",
      "type": "sneakers",
      "color": "Black",
      "gender": "men",
      "brand": "Nike",
      "image_url": "https://...",
      "is_featured": false,
      "price_range": {
        "min": 145.00,
        "max": 150.00
      },
      "store_count": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 24,
    "total": 156,
    "total_pages": 7
  }
}
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 24)
- `search`: Search in product name, brand
- `color`: Filter by color (exact match from predefined list)
- `category`: Filter by type/category
- `gender`: Filter by gender (men/women/unisex)
- `sort`: Sort order (`price_asc`, `price_desc`, `newest`, `popular`)

**Sorting Logic:**
- `price_asc`: Sort by minimum price (ascending)
- `price_desc`: Sort by maximum price (descending)
- `newest`: Sort by created_at (descending)
- `popular`: Sort by view count or favorite count if available

---

### 5. **Store Logo Support**

**Required Database Change:**
Add `logo_url` column to `stores` table:

```sql
ALTER TABLE stores ADD COLUMN logo_url TEXT;
```

**Update Store Endpoint:**
```http
PUT /api/stores/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Cool Store",
  "logo_url": "https://...",
  "telegram_url": "https://t.me/coolstore",
  "instagram_url": "https://instagram.com/coolstore",
  "shipping_info": "Fast delivery"
}
```

**Get All Stores:**
```http
GET /api/stores
```

Response should include `logo_url` field.

---

### 6. **Statistics for About Page**

**Required Endpoint:**
```http
GET /api/statistics
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_brands": 45,
    "total_products": 1234,
    "total_stores": 28,
    "satisfaction_rate": 98
  }
}
```

**Calculation Logic:**
- `total_brands`: `SELECT COUNT(DISTINCT brand) FROM products WHERE brand IS NOT NULL`
- `total_products`: `SELECT COUNT(*) FROM products`
- `total_stores`: `SELECT COUNT(*) FROM stores`
- `satisfaction_rate`: Based on store ratings average, or hardcoded as 98 for now

---

### 7. **Hero Images API** (Partially Implemented ⚠️)

You have the admin endpoints, but need to add a **public** endpoint for the homepage carousel.

**Public Endpoint (No Auth Required):**
```http
GET /api/hero-images
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "image_url": "https://...",
      "title": "Summer Collection",
      "subtitle": "New arrivals",
      "link_url": "/products?category=summer",
      "sort_order": 0,
      "is_active": true
    }
  ]
}
```

This endpoint should:
- Be accessible without authentication (remove auth middleware)
- Return only images where `is_active = true`
- Sort by `sort_order ASC`

**Backend Implementation Example:**
```javascript
// src/routes/hero-images-public.ts (NEW FILE)
import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Public endpoint - no auth required
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

// In src/server.ts, add:
// import heroImagesPublicRoutes from './routes/hero-images-public';
// app.use('/api/hero-images', heroImagesPublicRoutes);
```

**Admin Endpoints (Auth Required):**
```http
GET /api/admin/hero-images     # List all (including inactive)
POST /api/admin/hero-images    # Create new
DELETE /api/admin/hero-images/:id  # Delete
```

---

## 📊 Database Schema Overview

### Products Table
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
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Note:** NO `price` column on products table - prices are stored per store!

### Stores Table
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,  -- NEW FIELD
  telegram_url TEXT,
  instagram_url TEXT,
  shipping_info TEXT,
  rating NUMERIC(3, 2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Product-Store Junction Table
```sql
CREATE TABLE product_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL,  -- Price is here, per store!
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, store_id)
);
```

### Hero Images Table (Already Created ✅)
```sql
CREATE TABLE hero_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  link_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🎨 Frontend Features Overview

### Admin Panel Structure
The admin panel now has **4 separate tabs**:

1. **Add Product Tab**
   - Form to create new products
   - Select multiple stores with individual prices
   - ImageUploader for product images
   - Color dropdown (15 predefined colors)
   - When editing a product (from Manage Products), this form gets pre-filled

2. **Manage Products Tab**
   - Lists all products with search
   - Edit button → pre-fills "Add Product" tab and switches to it
   - Delete button
   - Shows price range per product

3. **Stores Tab**
   - List of all stores
   - Add new store
   - Edit/delete stores
   - Upload store logo

4. **Hero Images Tab**
   - Upload hero carousel images
   - Delete images
   - Import existing 13 images button
   - Images show in order with sort_order

### Product Detail Page
- Shows product info on the left
- Shows all stores on the right (sticky sidebar)
- Stores have search, filter (verified only), and sort
- Price range calculated automatically from stores
- "Edit Product" button for admins → goes to Admin panel with product pre-loaded

### All Products Page (`/products`)
- Displays all products in grid
- Search bar
- Color filters (15 predefined colors)
- Category filter
- Sort options
- Pagination (24 items per page)

### Predefined Colors (15)
Used in both Admin panel and Products page filters:
```javascript
const PREDEFINED_COLORS = [
  "Black", "White", "Grey", "Beige", "Brown",
  "Red", "Blue", "Navy", "Green", "Yellow",
  "Orange", "Pink", "Purple", "Multicolor", "Other"
];
```

---

## 🔧 Implementation Priority

### 🔴 Critical (Must Have)
1. **GET /api/hero-images (PUBLIC)** - homepage carousel is broken without it! 🚨
2. **Product creation with stores array** - currently creates duplicates
3. **Product update with stores array** - currently can't edit stores
4. **Get product with stores** - needed for price range display
5. **Add logo_url to stores table** - store logos don't show

### 🟡 High Priority
6. **Get all products with price ranges** - for Products page
7. **Statistics endpoint** - for About page
8. **Store CRUD with logo support** - for store management

### 🟢 Already Working
- Hero Images Admin API (auth required) ✅
- Basic product CRUD ✅
- Basic store CRUD ✅
- Authentication ✅

---

## 🧪 Testing Checklist

After implementing the changes, test:

1. ✅ Create a product with 2-3 stores → should create 1 product, multiple product_stores entries
2. ✅ View product detail page → should show price range and all stores
3. ✅ Edit product and add/remove stores → should update product_stores junction table
4. ✅ View Products page → should show all products with price ranges
5. ✅ Upload store logo → should display in store list and product detail
6. ✅ View About page → should show real statistics from database
7. ✅ Upload hero images in admin → should appear in homepage carousel

---

## 📝 Summary

**Critical issues right now:**
1. 🚨 **Homepage carousel broken** - needs public `GET /api/hero-images` endpoint (no auth)
2. **Product creation** - doesn't properly handle the `stores` array, leading to duplicate products instead of one product linked to multiple stores

**Quick fixes needed:**
1. **Create** `GET /api/hero-images` - public endpoint for homepage (returns only `is_active = true`)
2. Update `POST /api/products` to accept `stores` array and create proper junction entries
3. Update `PUT /api/products/:id` to replace store associations
4. Add `logo_url` column to `stores` table
5. Ensure `GET /api/products/:id` returns full store details including prices

Everything else is working on the frontend side! 🚀

