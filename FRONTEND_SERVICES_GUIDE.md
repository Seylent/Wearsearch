# 🎯 Frontend Services - Quick Reference Guide

## Overview
All backend APIs are now integrated and ready to use! This guide shows you how to use the services in your React components.

---

## 📦 Available Services

```typescript
import {
  authService,      // Authentication (login, register, logout)
  userService,      // User profile & favorites
  productService,   // Products listing & details
  storeService,     // Stores management & filtering
  ratingsService,   // Store ratings
  uploadService,    // Image uploads
  quickAPI,         // Quick helper functions
} from '@/services';
```

---

## 🔐 Authentication

### Login
```tsx
import { authService } from '@/services';

async function handleLogin(email: string, password: string) {
  try {
    const response = await authService.login({ email, password });
    // Token automatically stored in localStorage as 'access_token'
    console.log('Logged in:', response.user);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}
```

### Register
```tsx
async function handleRegister(email: string, password: string, displayName: string) {
  try {
    const response = await authService.register({ 
      email, 
      password, 
      display_name: displayName 
    });
    console.log('User created:', response.user);
    // Note: User needs to login after registration
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
}
```

### Get Current User
```tsx
async function loadUser() {
  try {
    const user = await authService.getCurrentUser();
    console.log('Current user:', user);
  } catch (error) {
    console.error('Not authenticated');
  }
}
```

### Logout
```tsx
async function handleLogout() {
  await authService.logout();
  // Tokens automatically cleared
}
```

---

## 👤 User Profile

### Get Profile (with stats)
```tsx
import { userService } from '@/services';

async function loadProfile() {
  try {
    const profile = await userService.getProfile();
    console.log('Profile:', profile);
    // Returns: { id, email, display_name, avatar_url, bio, favorites_count, ratings_count, ... }
  } catch (error) {
    console.error('Failed to load profile:', error.message);
  }
}
```

### Update Display Name
```tsx
async function updateName(newName: string) {
  try {
    await userService.updateDisplayName(newName);
    console.log('Name updated!');
  } catch (error) {
    console.error('Update failed:', error.message);
  }
}
```

### Update Bio
```tsx
async function updateBio(newBio: string) {
  try {
    await userService.updateBio(newBio);
    console.log('Bio updated!');
  } catch (error) {
    console.error('Update failed:', error.message);
  }
}
```

### Update Avatar
```tsx
async function updateAvatar(avatarUrl: string) {
  try {
    await userService.updateAvatar(avatarUrl);
    console.log('Avatar updated!');
  } catch (error) {
    console.error('Update failed:', error.message);
  }
}
```

### Change Password
```tsx
async function changePassword(currentPassword: string, newPassword: string) {
  try {
    await userService.changePassword({ 
      current_password: currentPassword, 
      new_password: newPassword 
    });
    console.log('Password changed!');
  } catch (error) {
    console.error('Password change failed:', error.message);
  }
}
```

---

## ❤️ Favorites

### Get Favorites List
```tsx
import { userService } from '@/services';

async function loadFavorites() {
  try {
    const favorites = await userService.getFavorites();
    console.log('Favorites:', favorites);
    // Returns array of products with favorited_at and favorite_id
  } catch (error) {
    console.error('Failed to load favorites:', error.message);
  }
}
```

### Add to Favorites
```tsx
async function addToFavorites(productId: string) {
  try {
    await userService.addFavorite(productId);
    console.log('Added to favorites!');
  } catch (error) {
    console.error('Failed to add:', error.message);
  }
}
```

### Remove from Favorites
```tsx
async function removeFromFavorites(productId: string) {
  try {
    await userService.removeFavorite(productId);
    console.log('Removed from favorites!');
  } catch (error) {
    console.error('Failed to remove:', error.message);
  }
}
```

### Check if Favorited
```tsx
async function checkFavorite(productId: string) {
  try {
    const result = await userService.checkFavorite(productId);
    console.log('Is favorited:', result.is_favorited);
    console.log('Favorite ID:', result.favorite_id);
    return result.is_favorited;
  } catch (error) {
    console.error('Check failed:', error.message);
    return false;
  }
}
```

### Toggle Favorite (Smart Helper)
```tsx
async function toggleFavorite(productId: string, isFavorited: boolean) {
  try {
    await userService.toggleFavorite(productId, isFavorited);
    console.log(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  } catch (error) {
    console.error('Toggle failed:', error.message);
  }
}
```

---

## 🛍️ Products

### Get All Products (with filters)
```tsx
import { quickAPI } from '@/services/apiHelpers';

async function loadProducts() {
  try {
    const response = await quickAPI.getProducts({
      name: 'jacket',           // Search by name
      color: 'Red',             // Filter by color
      type: 'Outerwear',        // Filter by type
      min_price: 50,            // Min price
      max_price: 200,           // Max price
      sort_by: 'price',         // Sort by: name, price, created_at
      order: 'asc',             // asc or desc
    });
    console.log('Products:', response.data);
  } catch (error) {
    console.error('Failed to load products:', error.message);
  }
}
```

### Get Single Product
```tsx
async function loadProduct(productId: string) {
  try {
    const product = await quickAPI.getProduct(productId);
    console.log('Product:', product);
  } catch (error) {
    console.error('Failed to load product:', error.message);
  }
}
```

---

## 🏪 Stores (Product Detail Page)

### Get Stores for Product (with filters)
```tsx
import { storeService } from '@/services';

async function loadProductStores(productId: string) {
  try {
    const result = await storeService.getProductStores(productId, {
      search: 'fashion',        // Search stores by name
      sort_by: 'rating',        // Sort by: name, price, rating
      order: 'desc',            // asc or desc
      min_rating: 4,            // Minimum rating (0-5)
      max_rating: 5,            // Maximum rating (0-5)
      min_price: 50,            // Minimum price
      max_price: 150,           // Maximum price
    });

    console.log('Product:', result.product_name);
    console.log('Stores count:', result.stores_count);
    console.log('Stores:', result.stores);
  } catch (error) {
    console.error('Failed to load stores:', error.message);
  }
}
```

### Example: Store Filtering Component
```tsx
function StoreFilters({ productId }: { productId: string }) {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');
  const [minRating, setMinRating] = useState<number | null>(null);

  useEffect(() => {
    loadStores();
  }, [productId, search, sortBy, minRating]);

  async function loadStores() {
    try {
      const result = await storeService.getProductStores(productId, {
        search,
        sort_by: sortBy,
        min_rating: minRating ?? undefined,
      });
      setStores(result.stores);
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  }

  return (
    <div>
      <input 
        placeholder="Search stores..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
        <option value="name">Sort by Name</option>
        <option value="price">Sort by Price</option>
        <option value="rating">Sort by Rating</option>
      </select>
      <select value={minRating ?? ''} onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : null)}>
        <option value="">Any Rating</option>
        <option value="3">3+ ⭐</option>
        <option value="4">4+ ⭐</option>
        <option value="4.5">4.5+ ⭐</option>
      </select>
      
      {stores.map(store => (
        <div key={store.id}>
          <h3>{store.name}</h3>
          <p>Price: ${store.price}</p>
          <p>Rating: {store.average_rating} ⭐ ({store.total_ratings} reviews)</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 Admin Features

### Search Stores (Admin Panel)
```tsx
import { storeService } from '@/services';

async function searchStores(searchTerm: string) {
  try {
    const stores = await storeService.getAdminStores(searchTerm);
    console.log('Found stores:', stores);
  } catch (error) {
    console.error('Search failed:', error.message);
  }
}
```

### Create Product (Admin)
```tsx
import { quickAPI } from '@/services/apiHelpers';

async function createProduct() {
  try {
    const result = await quickAPI.createProduct({
      name: 'Blue Jeans',
      color: 'Blue',
      type: 'Bottoms',
      price: 59.99,
      description: 'Comfortable denim jeans',
      image_url: 'https://...',
      store_ids: ['store-uuid-1', 'store-uuid-2'],
    });
    console.log('Product created:', result);
  } catch (error) {
    console.error('Create failed:', error.message);
  }
}
```

### Update Product (Admin)
```tsx
async function updateProduct(productId: string) {
  try {
    await quickAPI.updateProduct(productId, {
      name: 'Updated Name',
      price: 69.99,
    });
    console.log('Product updated!');
  } catch (error) {
    console.error('Update failed:', error.message);
  }
}
```

### Delete Product (Admin)
```tsx
async function deleteProduct(productId: string) {
  try {
    await quickAPI.deleteProduct(productId);
    console.log('Product deleted!');
  } catch (error) {
    console.error('Delete failed:', error.message);
  }
}
```

### Create Store (Admin)
```tsx
async function createStore() {
  try {
    const result = await quickAPI.createStore({
      name: 'New Fashion Store',
      telegram_url: 'https://t.me/newfashion',
      instagram_url: 'https://instagram.com/newfashion',
      shipping_info: 'Free shipping over $50',
      is_verified: false,
    });
    console.log('Store created:', result);
  } catch (error) {
    console.error('Create failed:', error.message);
  }
}
```

---

## ⭐ Ratings

### Create Rating
```tsx
import { ratingsService } from '@/services';

async function rateStore(storeId: string, productId: string, rating: number, comment: string) {
  try {
    const result = await ratingsService.createRating({
      store_id: storeId,
      product_id: productId,
      rating: rating,  // 1-5
      comment: comment,
    });
    console.log('Rating created:', result);
  } catch (error) {
    console.error('Rating failed:', error.message);
  }
}
```

### Get Store Ratings
```tsx
async function loadStoreRatings(storeId: string) {
  try {
    const result = await ratingsService.getStoreRatings(storeId);
    console.log('Average rating:', result.average_rating);
    console.log('Total ratings:', result.total_ratings);
    console.log('Reviews:', result.data);
  } catch (error) {
    console.error('Failed to load ratings:', error.message);
  }
}
```

---

## 📤 Image Upload

### Upload Image
```tsx
import { uploadService } from '@/services';

async function handleImageUpload(file: File) {
  try {
    const result = await uploadService.uploadImage(file);
    console.log('Image uploaded:', result.url);
    return result.url;
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
}

// Example: File input handler
function ImageUploader() {
  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = await handleImageUpload(file);
      console.log('Use this URL:', imageUrl);
    }
  }

  return <input type="file" accept="image/*" onChange={handleFileChange} />;
}
```

---

## 🔑 Authentication Token

The `access_token` is automatically:
- ✅ Stored in `localStorage` on login
- ✅ Included in all API requests via interceptor
- ✅ Cleared on logout
- ✅ Used for authentication checks

**Check if user is logged in:**
```tsx
import { authService } from '@/services';

const isLoggedIn = authService.isAuthenticated();
const token = authService.getToken();
```

---

## 🎯 Quick Examples

### Complete Login Flow
```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const response = await authService.login({ email, password });
      console.log('Logged in as:', response.user.display_name);
      window.location.href = '/';  // Redirect to home
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Complete Favorites Component
```tsx
function FavoriteButton({ productId }: { productId: string }) {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    checkStatus();
  }, [productId]);

  async function checkStatus() {
    try {
      const result = await userService.checkFavorite(productId);
      setIsFavorited(result.is_favorited);
    } catch (error) {
      setIsFavorited(false);
    }
  }

  async function toggle() {
    try {
      await userService.toggleFavorite(productId, isFavorited);
      setIsFavorited(!isFavorited);
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <button onClick={toggle}>
      {isFavorited ? '❤️ Saved' : '🤍 Save'}
    </button>
  );
}
```

---

## 🚀 All APIs Ready!

✅ Authentication (login, register, logout)  
✅ User Profile (update name, bio, avatar, password)  
✅ Favorites (add, remove, check, list)  
✅ Products (list, filter, search, detail)  
✅ **Product Stores Filtering** (search, sort, rating/price filters)  
✅ **Admin Store Search** (search by name)  
✅ Admin Management (products, stores CRUD)  
✅ Ratings (create, view by store/product)  
✅ Image Upload (Supabase storage)  

**Everything is integrated and ready to use!** 🎉
