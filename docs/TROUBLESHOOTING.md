# Troubleshooting Guide - Wearsearch Frontend

## Products Not Displaying Issue

### Symptoms
- Homepage shows loading state but no products appear
- New Arrivals section is empty
- Console shows API errors

### Root Cause
The frontend is trying to connect to the backend API but either:
1. Backend is not running
2. Backend endpoint doesn't exist
3. Backend is returning wrong data format
4. CORS issues blocking the request

### Solution Steps

#### 1. Check Backend Status
```bash
# Check if backend is running on port 3000
# Try accessing: http://localhost:3000/api/items
```

#### 2. Verify Environment Variables
Check `.env.local` file exists and contains:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**If file doesn't exist, create it with:**
```env
VITE_API_BASE_URL=http://localhost:3000/api
# Optional: override frontend dev server port (defaults to 8080)
VITE_DEV_PORT=8080
```

#### 3. Test API Endpoints Manually

Open browser and test these URLs:

**Products (should return JSON):**
```
http://localhost:3000/api/items
```

**Expected Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Product Name",
      "price": "99.99",
      "image": "url",
      "type": "T-shirt",
      "color": "Black"
    }
  ],
  "total": 1
}
```

**Stores:**
```
http://localhost:3000/api/stores
```

**Brands:**
```
http://localhost:3000/api/brands
```

**Hero Images:**
```
http://localhost:3000/api/hero-images
```

#### 4. Check Browser Console

Open browser DevTools (F12) and check:
- Network tab: Are requests being made?
- Console tab: What errors are showing?

**Common Errors:**

**Error: "Failed to fetch"**
- Backend is not running
- Wrong port number
- CORS not configured

**Error: "Unexpected token '<'"**
- Backend returning HTML instead of JSON
- Endpoint doesn't exist (404 page)
- Check BACKEND_INSTRUCTIONS.md for correct endpoint format

**Error: "401 Unauthorized"**
- Token expired or invalid
- Try logging in again

#### 5. Backend CORS Configuration

Backend must allow requests from frontend:

```javascript
// Express.js example
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:8081', // or 8080
  credentials: true
}));
```

#### 6. Restart Both Servers

```bash
# Terminal 1 - Frontend
cd c:\mywebsite\wearsearchh
npm run dev

# Terminal 2 - Backend
cd [your-backend-folder]
npm start  # or your backend start command
```

---

## Quick Diagnostic Commands

### Check if ports are in use:
```powershell
netstat -ano | findstr :3000  # Backend
netstat -ano | findstr :8080  # Frontend (or 8081)
```

### Check environment:
```powershell
cd c:\mywebsite\wearsearchh
cat .env.local
```

### Test API manually:
```powershell
curl http://localhost:3000/api/items
# or
Invoke-WebRequest -Uri http://localhost:3000/api/items
```

---

## Current Frontend Configuration

### API Calls Made on Homepage Load:

1. **Products** → `GET /api/items?limit=6`
2. **Stores** → `GET /api/stores`
3. **Brands** → `GET /api/brands`
4. **Hero Images** → `GET /api/hero-images`

All four must succeed for full homepage functionality.

### Minimum Required for Products to Show:

Only `/api/items` needs to work. The frontend will show:
- Products in New Arrivals section (limit 6)
- Stats will show 0 for stores/brands if those endpoints fail

---

## If Backend Doesn't Exist Yet

The frontend is **ready to connect** but needs backend implementation.

### Priority Order for Backend Development:

1. **Critical (Products won't show without these):**
   - `GET /api/items` - Product list
   - `POST /api/auth/login` - User login
   - `GET /api/auth/me` - Get current user

2. **Important (Features won't work):**
   - `GET /api/stores` - Store list
   - `GET /api/items/{id}` - Product details
   - Favorites endpoints
   - Ratings endpoints

3. **Admin Features:**
   - All `/api/admin/*` endpoints
   - Hero images CRUD
   - Product/Store/Brand management

4. **Optional (Enhances UX):**
   - `GET /api/brands` - Brand list
   - `GET /api/hero-images` - Hero carousel

---

## Expected API Behavior

### Example: GET /api/items

**Request:**
```
GET http://localhost:3000/api/items?limit=6
```

**Response (200 OK):**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Black T-Shirt",
      "description": "Premium cotton tee",
      "price": "49.99",
      "image": "https://example.com/image.jpg",
      "images": ["url1", "url2"],
      "color": "Black",
      "type": "T-shirt",
      "category": "Men",
      "brand_id": "1",
      "brand_name": "Brand Name"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 17
}
```

**If this returns HTML or 404:**
- Backend endpoint not implemented
- See BACKEND_INSTRUCTIONS.md for implementation guide

---

## Contact Information

For backend implementation details, see:
- `BACKEND_INSTRUCTIONS.md` - Complete API specification
- `src/services/endpoints.ts` - Frontend endpoint configuration
- `src/services/productService.ts` - How frontend calls APIs

---

## Last Resort: Mock Data (Temporary)

If backend is not ready, you can temporarily mock data by creating:

```typescript
// src/services/mockData.ts
export const mockProducts = [
  {
    id: 1,
    name: "Black T-Shirt",
    price: "49.99",
    image: "https://via.placeholder.com/400x600",
    type: "T-shirt",
    color: "Black",
    category: "Men",
    description: "Premium cotton tee",
    images: [],
    stores: []
  },
  // Add more mock products...
];
```

Then in `Index.tsx`, temporarily use:
```typescript
// Comment out API call
// const response = await productService.getAllProducts(...);

// Use mock data instead
setProducts(mockProducts);
```

**⚠️ Remove mock data once backend is ready!**
