# Frontend-Backend API Alignment Guide

## Current Status ✅

Your frontend has been updated to work with the backend API at `http://localhost:3000/api`.

## API Endpoints Summary

### Authentication Endpoints
| Endpoint | Method | Purpose | Used In |
|----------|--------|---------|---------|
| `/api/auth/login` | POST | User login | `Auth.tsx` |
| `/api/auth/register` | POST | User registration | `Auth.tsx` |
| `/api/auth/me` | GET | Get current user info | `Header.tsx`, `ProductDetail.tsx`, `Profile.tsx` |
| `/api/auth/profile` | PUT | Update user profile | `Profile.tsx` |
| `/api/auth/password` | PUT | Change password | `Profile.tsx` |

### Product Endpoints
| Endpoint | Method | Purpose | Used In |
|----------|--------|---------|---------|
| `/api/items` | GET | Get all products (with filters, pagination, sorting) | `Index.tsx` |
| `/api/items/:id` | GET | Get single product by ID | `ProductDetail.tsx` |
| `/api/items/:id/stores` | GET | Get stores for a product | `ProductDetail.tsx` |

### Admin Product Endpoints
| Endpoint | Method | Purpose | Used In |
|----------|--------|---------|---------|
| `/api/admin/products` | GET | Get all products (admin) | `Admin.tsx` |
| `/api/admin/products` | POST | Create new product | `Admin.tsx`, `AdminAddItem.tsx` |
| `/api/admin/products/:id` | PUT | Update product | `Admin.tsx` |
| `/api/admin/products/:id` | DELETE | Delete product | `Admin.tsx` |

### Store Endpoints
| Endpoint | Method | Purpose | Used In |
|----------|--------|---------|---------|
| `/api/stores` | GET | Get all stores (public) | `Admin.tsx`, `AdminAddItem.tsx`, `StoreManagement.tsx` |
| `/api/admin/stores` | POST | Create new store | `Admin.tsx`, `AdminAddItem.tsx`, `StoreManagement.tsx` |
| `/api/admin/stores/:id` | PUT | Update store | `Admin.tsx`, `StoreManagement.tsx` |
| `/api/admin/stores/:id` | DELETE | Delete store | `StoreManagement.tsx` |

### Rating Endpoints
| Endpoint | Method | Purpose | Used In |
|----------|--------|---------|---------|
| `/api/ratings` | POST | Create new rating | `StoreRating.tsx` |
| `/api/ratings/:id` | PUT | Update rating | `Profile.tsx`, `StoreRating.tsx` |
| `/api/ratings/:id` | DELETE | Delete rating | `Profile.tsx` |
| `/api/ratings/product/:productId` | GET | Get ratings for a product | `ProductDetail.tsx`, `StoreRating.tsx` |
| `/api/ratings/user` | GET | Get user's ratings | `Profile.tsx` |
| `/api/ratings/user/:userId` | GET | Get user's rating | `StoreRating.tsx` |

### Upload Endpoints
| Endpoint | Method | Purpose | Used In |
|----------|--------|---------|---------|
| `/api/upload/image` | POST | Upload single image to S3 | `ImageUploader.tsx` |

## Query Parameters Supported

### GET `/api/items` (Product List)
- `name` - Search by product name
- `color` - Filter by color (can be multiple)
- `type` - Filter by type/category (can be multiple)
- `limit` - Number of items per page
- `skip` - Number of items to skip (for pagination)
- `sort_by` - Field to sort by (`name` or `price`)
- `order` - Sort order (`asc` or `desc`)

Example:
```
GET /api/items?name=jacket&color=Black&type=Outerwear&limit=15&skip=0&sort_by=price&order=asc
```

## Request/Response Formats

### Standard Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Product Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "type": "Outerwear",
    "color": "Black",
    "price": "299.99",
    "image_url": "https://s3.amazonaws.com/...",
    "description": "Product description"
  }
}
```

### Products List Response (with pagination)
```json
{
  "success": true,
  "data": [ /* array of products */ ],
  "pagination": {
    "total": 150,
    "limit": 15,
    "skip": 0
  }
}
```

### Authentication Response
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "refresh_token": "refresh_token",
  "expires_in": 3600
}
```

### User Info Response
```json
{
  "id": "user_id",
  "username": "username",
  "email": "user@example.com",
  "display_name": "Display Name",
  "role": "user" | "admin"
}
```

## Authentication Flow

1. **Login**: POST to `/api/auth/login` with username and password
2. **Store Token**: Save `access_token` to `localStorage`
3. **Authenticated Requests**: Include `Authorization: Bearer <token>` header
4. **Check Auth**: Call `/api/auth/me` to verify token and get user info
5. **Logout**: Remove token from localStorage

## Frontend Token Storage

```typescript
// Login - store token
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('token_type', data.token_type);
localStorage.setItem('refresh_token', data.refresh_token);

// Use token in requests
const token = localStorage.getItem('access_token');
headers: { 'Authorization': `Bearer ${token}` }

// Logout - clear token
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('token_type');
```

## Files Already Updated ✅

- ✅ `src/pages/Index.tsx` - Product listing with backend API
- ✅ `src/pages/Auth.tsx` - Login/register with backend API
- ✅ `src/pages/ProductDetail.tsx` - Product details from backend API
- ✅ `src/pages/Profile.tsx` - User profile with backend API
- ✅ `src/pages/Admin.tsx` - Admin panel with backend API
- ✅ `src/components/Header.tsx` - Auth check with backend API
- ✅ `src/components/AdminAddItem.tsx` - Product creation with backend API
- ✅ `src/components/ImageUploader.tsx` - S3 upload via backend API
- ✅ `src/components/StoreRating.tsx` - Ratings via backend API
- ✅ `src/components/StoreManagement.tsx` - Store CRUD via backend API

## Environment Configuration

Create/update `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Backend Requirements

Your backend should:
1. Accept requests from `http://localhost:5173` (CORS)
2. Return JSON responses with `success` and `data` fields
3. Accept `Authorization: Bearer <token>` header for protected routes
4. Support query parameters for filtering/pagination on `/api/items`

## Testing Checklist

- [ ] Login works and stores token
- [ ] Header shows user as logged in after login
- [ ] Product list loads from backend
- [ ] Filters work (color, type, search)
- [ ] Pagination works correctly
- [ ] Sorting works (name, price)
- [ ] Product details page loads
- [ ] Admin can create/edit/delete products
- [ ] Image upload works via S3
- [ ] Ratings can be created/edited
- [ ] Logout clears token and updates UI

## Common Issues & Solutions

### Issue: "Failed to fetch products"
**Solution**: Ensure backend is running on `http://localhost:3000` and returns correct JSON format

### Issue: "401 Unauthorized"
**Solution**: Token expired or invalid. Logout and login again.

### Issue: "CORS error"
**Solution**: Backend must allow requests from `http://localhost:5173`

### Issue: "Products not showing after login"
**Solution**: Check that `/api/items` returns `{ success: true, data: [...] }` format

### Issue: "Pagination not working"
**Solution**: Backend should return `pagination` object with `total`, `limit`, `skip`

## Next Steps

1. Ensure backend is running: `http://localhost:3000`
2. Test login flow
3. Test product listing and filtering
4. Test admin operations (if admin user)
5. Test image uploads
6. Test ratings functionality

---

**Last Updated**: December 2, 2025
**Status**: ✅ Frontend fully aligned with backend API
