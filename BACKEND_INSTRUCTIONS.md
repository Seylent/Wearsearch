# Backend API Requirements for Wearsearch Frontend

## Overview
This document outlines all the API endpoints required by the frontend application. The base URL should be configured in `.env.local` as `VITE_API_BASE_URL` (default: `http://localhost:3000/api`).

---

## 🔐 Authentication Endpoints

### 1. Login
**Endpoint:** `POST /api/auth/login`  
**Request Body:**
```json
{
  "identifier": "user@email.com OR username",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "user_id",
    "email": "user@email.com",
    "username": "username",
    "display_name": "Display Name",
    "role": "user" // or "admin"
  }
}
```
**Notes:** Must support login with EITHER email OR username via the `identifier` field.

### 2. Register
**Endpoint:** `POST /api/auth/register`  
**Request Body:**
```json
{
  "email": "user@email.com",
  "password": "password123",
  "username": "username" // optional
}
```

### 3. Get Current User
**Endpoint:** `GET /api/auth/me`  
**Headers:** `Authorization: Bearer {access_token}`  
**Response:**
```json
{
  "id": "user_id",
  "email": "user@email.com",
  "username": "username",
  "display_name": "Display Name",
  "role": "user"
}
```

### 4. Update Profile
**Endpoint:** `PUT /api/auth/profile`  
**Headers:** `Authorization: Bearer {access_token}`  
**Request Body:**
```json
{
  "display_name": "New Display Name"
}
```

### 5. Change Password
**Endpoint:** `PUT /api/auth/password`  
**Headers:** `Authorization: Bearer {access_token}`  
**Request Body:**
```json
{
  "current_password": "old_password",
  "new_password": "new_password"
}
```

---

## 🛍️ Product Endpoints

### 1. Get All Products (with filters and pagination)
**Endpoint:** `GET /api/items`  
**Query Parameters:**
- `page` (number, optional): Page number for pagination
- `limit` (number, optional): Items per page (default: 24)
- `search` (string, optional): Search query
- `type` (string, optional): Product type filter (e.g., "T-shirt", "Hoodie")
- `color` (string, optional): Color filter
- `category` (string, optional): Category filter

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product description",
      "price": "99.99",
      "image": "https://image-url.com/main.jpg",
      "images": ["url1.jpg", "url2.jpg"],
      "color": "Black",
      "type": "T-shirt",
      "category": "Men",
      "brand_id": "brand_id",
      "brand_name": "Brand Name",
      "stores": [
        {
          "store_id": "store_id",
          "store_name": "Store Name",
          "price": "99.99",
          "telegram": "@storename",
          "instagram": "@storename"
        }
      ]
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

### 2. Get Product by ID
**Endpoint:** `GET /api/items/{id}`  
**Response:** Same as single product object above

### 3. Get Product Stores
**Endpoint:** `GET /api/items/{id}/stores`  
**Response:**
```json
{
  "stores": [
    {
      "store_id": "store_id",
      "store_name": "Store Name",
      "price": "99.99",
      "telegram": "@storename",
      "instagram": "@storename",
      "shipping": "Worldwide"
    }
  ]
}
```

---

## 🏪 Store Endpoints

### 1. Get All Stores
**Endpoint:** `GET /api/stores`  
**Response:**
```json
{
  "stores": [
    {
      "id": "store_id",
      "name": "Store Name",
      "logo_url": "https://logo-url.com",
      "telegram": "@storename",
      "instagram": "@storename",
      "shipping": "Worldwide",
      "is_verified": true,
      "product_count": 50
    }
  ]
}
```

### 2. Get Store by ID
**Endpoint:** `GET /api/stores/{id}`  
**Response:** Single store object with products array

---

## 🏷️ Brand Endpoints

### 1. Get All Brands
**Endpoint:** `GET /api/brands`  
**Response:**
```json
{
  "brands": [
    {
      "id": "brand_id",
      "name": "Brand Name",
      "logo_url": "https://logo-url.com",
      "description": "Brand description",
      "website_url": "https://brand-website.com",
      "product_count": 30
    }
  ]
}
```

### 2. Create Brand (Admin)
**Endpoint:** `POST /api/brands`  
**Headers:** `Authorization: Bearer {access_token}` (Admin role required)  
**Request Body:**
```json
{
  "name": "Brand Name",
  "logo_url": "https://logo-url.com",
  "description": "Brand description",
  "website_url": "https://brand-website.com"
}
```

### 3. Update Brand (Admin)
**Endpoint:** `PUT /api/brands/{id}`  
**Headers:** `Authorization: Bearer {access_token}` (Admin role required)

### 4. Delete Brand (Admin)
**Endpoint:** `DELETE /api/brands/{id}`  
**Headers:** `Authorization: Bearer {access_token}` (Admin role required)

---

## 🖼️ Hero Images Endpoints (NEW - REQUIRED)

### 1. Get Active Hero Images (Public)
**Endpoint:** `GET /api/hero-images`  
**Response:**
```json
{
  "images": [
    {
      "id": "image_id",
      "image_url": "https://image-url.com/hero1.jpg",
      "title": "Optional title",
      "sort_order": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```
**Notes:** Should only return images where `is_active = true`, sorted by `sort_order` ASC

### 2. Get All Hero Images (Admin)
**Endpoint:** `GET /api/admin/hero-images`  
**Headers:** `Authorization: Bearer {access_token}` (Admin role required)  
**Response:** Same as above but includes inactive images

### 3. Create Hero Image (Admin)
**Endpoint:** `POST /api/admin/hero-images`  
**Headers:** `Authorization: Bearer {access_token}` (Admin role required)  
**Request Body:**
```json
{
  "image_url": "https://image-url.com/hero.jpg",
  "title": "Optional title",
  "is_active": true,
  "sort_order": 1
}
```

### 4. Delete Hero Image (Admin)
**Endpoint:** `DELETE /api/admin/hero-images/{id}`  
**Headers:** `Authorization: Bearer {access_token}` (Admin role required)

---

## ⭐ Favorites Endpoints

### 1. Get User Favorites
**Endpoint:** `GET /api/user/favorites`  
**Headers:** `Authorization: Bearer {access_token}`  
**Response:**
```json
{
  "favorites": [
    {
      "id": "favorite_id",
      "product_id": "product_id",
      "product": { /* full product object */ }
    }
  ]
}
```

### 2. Add Favorite
**Endpoint:** `POST /api/user/favorites/{product_id}`  
**Headers:** `Authorization: Bearer {access_token}`

### 3. Remove Favorite
**Endpoint:** `DELETE /api/user/favorites/{product_id}`  
**Headers:** `Authorization: Bearer {access_token}`

### 4. Check if Favorite
**Endpoint:** `GET /api/user/favorites/{product_id}/check`  
**Headers:** `Authorization: Bearer {access_token}`  
**Response:**
```json
{
  "is_favorited": true
}
```

### 5. Toggle Favorite (Alternative)
**Endpoint:** `POST /api/user/favorites/toggle`  
**Headers:** `Authorization: Bearer {access_token}`  
**Request Body:**
```json
{
  "product_id": "product_id"
}
```
**Response:**
```json
{
  "is_favorited": true,
  "message": "Added to favorites" // or "Removed from favorites"
}
```

---

## ⭐ Ratings Endpoints

### 1. Get User Ratings
**Endpoint:** `GET /api/ratings/user/{user_id}`  
**Headers:** `Authorization: Bearer {access_token}`  
**Response:**
```json
{
  "ratings": [
    {
      "id": "rating_id",
      "user_id": "user_id",
      "store_id": "store_id",
      "product_id": "product_id",
      "rating": 5,
      "comment": "Great product!",
      "created_at": "2024-01-01T00:00:00Z",
      "store": { /* store object */ },
      "product": { /* product object */ }
    }
  ]
}
```

### 2. Add Rating
**Endpoint:** `POST /api/ratings`  
**Headers:** `Authorization: Bearer {access_token}`  
**Request Body:**
```json
{
  "store_id": "store_id",
  "product_id": "product_id",
  "rating": 5,
  "comment": "Optional comment"
}
```

### 3. Delete Rating
**Endpoint:** `DELETE /api/ratings/{rating_id}`  
**Headers:** `Authorization: Bearer {access_token}`  
**Query Parameters:**
- `user_id` (required): User ID for authorization check

### 4. Get Store Ratings
**Endpoint:** `GET /api/ratings/store/{store_id}`  
**Response:**
```json
{
  "ratings": [ /* array of rating objects */ ],
  "average_rating": 4.5,
  "total_ratings": 10
}
```

---

## 🔧 Admin - Product Management

### 1. Create Product
**Endpoint:** `POST /api/admin/products`  
**Headers:** `Authorization: Bearer {access_token}` (Admin role required)  
**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": "99.99",
  "image": "https://main-image.jpg",
  "images": ["url1.jpg", "url2.jpg"],
  "color": "Black",
  "type": "T-shirt",
  "category": "Men",
  "brand_id": "brand_id",
  "stores": [
    {
      "store_id": "store_id",
      "price": "99.99"
    }
  ]
}
```

### 2. Update Product
**Endpoint:** `PUT /api/admin/products/{id}`  
**Headers:** `Authorization: Bearer {access_token}` (Admin role required)

### 3. Delete Product
**Endpoint:** `DELETE /api/admin/products/{id}`  
**Headers:** `Authorization: Bearer {access_token}` (Admin role required)

---

## 🔧 Admin - Store Management

### 1. Get All Stores (Admin with search)
**Endpoint:** `GET /api/admin/stores`  
**Headers:** `Authorization: Bearer {access_token}` (Admin role required)  
**Query Parameters:**
- `search` (optional): Search query for store name

### 2. Create Store
**Endpoint:** `POST /api/admin/stores`  
**Headers:** `Authorization: Bearer {access_token}` (Admin role required)  
**Request Body:**
```json
{
  "name": "Store Name",
  "logo_url": "https://logo-url.com",
  "telegram": "@storename",
  "instagram": "@storename",
  "shipping": "Worldwide",
  "is_verified": false
}
```

### 3. Update Store
**Endpoint:** `PUT /api/admin/stores/{id}`  
**Headers:** `Authorization: Bearer {access_token}` (Admin role required)

### 4. Delete Store
**Endpoint:** `DELETE /api/admin/stores/{id}`  
**Headers:** `Authorization: Bearer {access_token}` (Admin role required)

---

## 📤 Image Upload Endpoint

### Upload Image to S3/Supabase
**Endpoint:** `POST /api/supabase-upload/image`  
**Headers:** `Authorization: Bearer {access_token}`  
**Request:** `multipart/form-data` with file
**Response:**
```json
{
  "success": true,
  "url": "https://storage-url.com/image.jpg",
  "message": "Image uploaded successfully"
}
```

---

## 🔒 Authorization Notes

1. **JWT Token Storage:** Frontend stores `access_token` and `refresh_token` in localStorage
2. **Token Header:** All authenticated requests send `Authorization: Bearer {access_token}`
3. **Admin Verification:** Backend must verify `role === "admin"` for admin endpoints
4. **Token Refresh:** Implement token refresh logic for expired access tokens

---

## 🆕 New Features Added in This Update

### 1. Hero Images Background Carousel
- Frontend now fetches and displays hero images on the homepage
- Images rotate every 5 seconds as a background with 20% opacity
- Requires `/api/hero-images` endpoint (public)
- Requires `/api/admin/hero-images` CRUD endpoints (admin only)

### 2. Multi-Select Delete for Hero Images
- Admin can select multiple hero images and delete them at once
- Frontend sends multiple DELETE requests in parallel
- Each delete uses `/api/admin/hero-images/{id}`

### 3. Real-Time Stats on Homepage
- Frontend now fetches real counts instead of static "500+", "10K+", "50+"
- Requires working endpoints: `/api/brands`, `/api/items`, `/api/stores`
- All endpoints should return arrays with length for counting

### 4. Username/Email Login Support
- Login endpoint must accept `identifier` field that can be EITHER email OR username
- Backend should check if identifier is email format, else treat as username

### 5. Store Search in Admin Panel
- Admin product creation now has store search functionality
- Frontend uses existing `/api/admin/stores?search=query` endpoint

---

## ⚠️ Common Issues to Fix

### Products Not Displaying
**Cause:** `/api/items` endpoint returning error or wrong format  
**Solution:** Ensure response matches this structure:
```json
{
  "products": [ /* array of products */ ],
  "total": 100
}
```

### Stats Showing 0
**Cause:** Endpoints `/api/brands`, `/api/items`, `/api/stores` not returning data  
**Solution:** Ensure all endpoints return arrays that can be counted

### Hero Images Not Showing
**Cause:** `/api/hero-images` endpoint doesn't exist or returns wrong format  
**Solution:** Create endpoint that returns active images array

### Login Error "No token provided"
**Cause:** Frontend was using wrong token key (`authToken` instead of `access_token`)  
**Status:** ✅ FIXED in frontend - now uses `access_token`

---

## 📋 Testing Checklist

- [ ] `/api/auth/login` accepts `identifier` (email OR username)
- [ ] `/api/items` returns products array with pagination
- [ ] `/api/stores` returns stores array
- [ ] `/api/brands` returns brands array
- [ ] `/api/hero-images` returns active hero images (public access)
- [ ] `/api/admin/hero-images` CRUD operations work (admin only)
- [ ] `/api/user/favorites` endpoints work with auth
- [ ] `/api/ratings` endpoints work for user ratings
- [ ] All admin endpoints verify admin role
- [ ] Image upload endpoint works with multipart/form-data

---

## 🔄 API Response Standards

All API responses should follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": { /* optional error details */ }
}
```

**List Response:**
```json
{
  "items": [ /* array of items */ ],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```
