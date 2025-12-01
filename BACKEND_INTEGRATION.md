# Backend API Connection Guide

## Overview
Your frontend is now configured to connect to a custom backend API. All API services are set up in the `src/services/` directory.

## Configuration

### 1. Environment Variables
Update the `.env` file with your actual backend URL:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Change `http://localhost:3000/api` to match your backend's actual URL and port.

### 2. Available Services

#### **API Client** (`src/services/api.ts`)
- Axios instance with authentication interceptors
- Automatic token management
- Error handling for common HTTP errors
- Base URL: configured via `VITE_API_BASE_URL`

#### **Authentication Service** (`src/services/authService.ts`)
```typescript
import { authService } from '@/services';

// Login
await authService.login({ email, password });

// Register
await authService.register({ email, password, displayName });

// Logout
await authService.logout();

// Get current user
const user = await authService.getCurrentUser();

// Check if authenticated
const isAuth = authService.isAuthenticated();
```

#### **Product Service** (`src/services/productService.ts`)
```typescript
import { productService } from '@/services';

// Get all products
const { products, total } = await productService.getAllProducts();

// Get product by ID
const product = await productService.getProductById(1);

// Search products
const results = await productService.searchProducts('jacket');

// Get by category
const products = await productService.getProductsByCategory('Outerwear');

// Admin: Create product
await productService.createProduct(productData);

// Admin: Update product
await productService.updateProduct(1, updatedData);

// Admin: Delete product
await productService.deleteProduct(1);
```

#### **User Service** (`src/services/userService.ts`)
```typescript
import { userService } from '@/services';

// Get profile
const profile = await userService.getProfile();

// Update profile
await userService.updateProfile({ displayName: 'New Name' });

// Get favorites
const favorites = await userService.getFavorites();

// Add to favorites
await userService.addFavorite(productId);

// Remove from favorites
await userService.removeFavorite(productId);

// Toggle favorite
await userService.toggleFavorite(productId, isFavorited);
```

#### **Upload Service** (`src/services/uploadService.ts`)
```typescript
import { uploadService } from '@/services';

// Upload single image
const { url } = await uploadService.uploadImage(file);

// Upload multiple images
const { files } = await uploadService.uploadImages([file1, file2]);

// Validate before upload
const validation = uploadService.validateImage(file);
if (!validation.valid) {
  console.error(validation.error);
}
```

### 3. Backend API Endpoints
Your backend should implement these endpoints:

#### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh auth token
- `GET /auth/me` - Get current user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

#### Products
- `GET /products` - Get all products (with filters & pagination)
- `GET /products/:id` - Get product by ID
- `GET /products/search` - Search products
- `GET /products/categories` - Get all categories
- `GET /products/category/:category` - Get products by category
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)

#### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/favorites` - Get user favorites
- `POST /users/favorites/:productId` - Add to favorites
- `DELETE /users/favorites/:productId` - Remove from favorites

#### Uploads
- `POST /upload/image` - Upload single image
- `POST /upload/images` - Upload multiple images

### 4. Authentication Flow
The API client automatically handles authentication:
1. Login/Register stores JWT token in localStorage
2. All subsequent requests include `Authorization: Bearer <token>` header
3. On 401 error, token is cleared and user redirected to `/auth`
4. Logout clears tokens from localStorage

### 5. Using in Components
```tsx
import { useEffect, useState } from 'react';
import { productService, authService } from '@/services';
import type { Product } from '@/services';

function MyComponent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { products } = await productService.getAllProducts();
        setProducts(products);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Component JSX...
}
```

### 6. Error Handling
All services throw errors that can be caught:
```tsx
try {
  await productService.getProductById(id);
} catch (error) {
  console.error(error.message); // User-friendly error message
}
```

### 7. TypeScript Support
All services include full TypeScript type definitions. Import types as needed:
```typescript
import type { Product, User, AuthResponse } from '@/services';
```

## Next Steps
1. Update `.env` with your actual backend URL
2. Ensure your backend implements the expected endpoints
3. Configure CORS on your backend to allow requests from your frontend
4. Replace Supabase calls in components with the new services
5. Test authentication flow
6. Test product CRUD operations

## CORS Configuration (Backend)
Make sure your backend allows requests from your frontend:
```javascript
// Express example
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite dev server
  credentials: true
}));
```

## Notes
- Token is stored in localStorage as `authToken`
- All file uploads support images only (JPEG, PNG, GIF, WebP)
- Maximum file size: 5MB per image
- The API client has a 10-second timeout
