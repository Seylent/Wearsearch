# Backend API Requirements & Issues - FOR BACKEND DEVELOPER

## 🚨 Current Issues

1. **Ratings are submitted but statistics don't update** - After POST /ratings, the GET /ratings/store/{storeId} still returns 0.0 average and 0 count
2. **Favorites are added but don't appear in list** - After POST /favorites/add, the GET /user/favorites returns empty array or doesn't include the new item

---

## 📋 Required API Endpoints & Expected Behavior

### 1. FAVORITES SYSTEM

#### GET `/api/user/favorites`
**Purpose:** Fetch all favorites for authenticated user

**Request:**
```http
GET /api/user/favorites
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "success": true,
  "total": 2,
  "favorites": [
    {
      "id": "favorite-uuid",
      "user_id": "user-uuid",
      "product_id": "product-uuid",
      "created_at": "2024-12-12T10:30:00Z",
      "products": {
        "id": "product-uuid",
        "name": "Product Name",
        "price": "1000",
        "brand": "Brand Name",
        "type": "Category",
        "images": ["https://url1.jpg", "https://url2.jpg"],
        "image_url": "https://url1.jpg"
      }
    }
  ]
}
```

**CRITICAL:** The response MUST include the nested `products` object with full product details!

---

#### POST `/api/favorites/add`
**Purpose:** Add product to user's favorites

**Request:**
```http
POST /api/favorites/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product-uuid"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Favorite added successfully",
  "favorite": {
    "id": "new-favorite-uuid",
    "user_id": "user-uuid",
    "product_id": "product-uuid",
    "created_at": "2024-12-12T10:30:00Z"
  }
}
```

**VERIFICATION NEEDED:**
- ✅ Does this endpoint save to database correctly?
- ✅ Does it handle duplicates? (prevent adding same product twice)
- ✅ Does it return 201 status code on success?
- ✅ After this call, does GET /user/favorites immediately include the new item?

---

#### DELETE `/api/user/favorites/{productId}`
**Purpose:** Remove product from user's favorites

**Request:**
```http
DELETE /api/user/favorites/{productId}
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Favorite removed successfully"
}
```

**VERIFICATION NEEDED:**
- ✅ Does this endpoint delete from database correctly?
- ✅ Does it return 200 status code on success?
- ✅ Does it return 404 if favorite doesn't exist?
- ✅ After this call, does GET /user/favorites no longer include the item?

---

### 2. RATINGS SYSTEM

#### POST `/api/ratings`
**Purpose:** Submit or update a rating for a store

**Request:**
```http
POST /api/ratings
Authorization: Bearer {token}
Content-Type: application/json

{
  "storeId": "store-uuid",
  "productId": "product-uuid",
  "rating": 5
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Rating submitted successfully",
  "rating": {
    "id": "rating-uuid",
    "user_id": "user-uuid",
    "store_id": "store-uuid",
    "product_id": "product-uuid",
    "rating": 5,
    "created_at": "2024-12-12T10:30:00Z"
  }
}
```

**CRITICAL REQUIREMENTS:**
1. **Upsert Logic:** If user already rated this store, UPDATE the existing rating (don't create duplicate)
2. **Recalculate Average:** After insert/update, IMMEDIATELY recalculate store's average rating
3. **Return Success:** Return 200/201 with confirmation

**VERIFICATION NEEDED:**
- ✅ Does this save to database?
- ✅ Does it handle duplicate ratings (same user + same store)?
- ✅ Does it trigger average rating recalculation?
- ✅ After this call, does GET /ratings/store/{storeId} show updated average?

---

#### GET `/api/ratings/store/{storeId}`
**Purpose:** Get average rating and all ratings for a store

**Request:**
```http
GET /api/ratings/store/{storeId}
```

**Expected Response:**
```json
{
  "success": true,
  "average": 4.5,
  "count": 10,
  "data": [
    {
      "id": "rating-uuid",
      "user_id": "user-uuid",
      "store_id": "store-uuid",
      "product_id": "product-uuid",
      "rating": 5,
      "comment": "Great store!",
      "created_at": "2024-12-12T10:30:00Z"
    }
  ]
}
```

**CRITICAL:** `average` and `count` MUST be calculated from actual ratings in database!

**VERIFICATION NEEDED:**
- ✅ Does this query all ratings for the store?
- ✅ Does it calculate average correctly: `AVG(rating)`?
- ✅ Does it count total ratings: `COUNT(*)`?
- ✅ Does it return 0.0 and 0 if no ratings exist?

---

#### GET `/api/ratings/user/{userId}/store/{storeId}`
**Purpose:** Get specific user's rating for a store

**Request:**
```http
GET /api/ratings/user/{userId}/store/{storeId}
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "rating-uuid",
    "rating": 5,
    "comment": "Great!",
    "created_at": "2024-12-12T10:30:00Z"
  }
}
```

**If no rating exists:**
```json
{
  "success": false,
  "message": "No rating found"
}
```

**VERIFICATION NEEDED:**
- ✅ Does this query user's rating for specific store?
- ✅ Does it handle multiple ratings? (should return only ONE - the most recent or update existing)
- ✅ Does it return 404 if user hasn't rated this store?

---

## 🔍 Database Schema Verification

### `favorites` table
```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id) -- Prevent duplicates
);

-- Index for performance
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
```

**VERIFY:**
- ✅ Unique constraint on (user_id, product_id) exists?
- ✅ Foreign keys set up correctly?
- ✅ CASCADE delete works when product/user deleted?

---

### `ratings` table
```sql
CREATE TABLE ratings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, store_id) -- One rating per user per store
);

-- Index for performance
CREATE INDEX idx_ratings_store_id ON ratings(store_id);
CREATE INDEX idx_ratings_user_store ON ratings(user_id, store_id);
```

**VERIFY:**
- ✅ Unique constraint on (user_id, store_id) exists?
- ✅ Rating CHECK constraint (1-5) works?
- ✅ Foreign keys set up correctly?

---

## 🐛 Known Backend Issues to Fix

### Issue 1: Ratings Statistics Not Updating
**Problem:** User submits rating with POST /ratings, gets success response, but GET /ratings/store/{storeId} still shows 0.0 average and 0 count.

**Possible Causes:**
1. ❌ POST /ratings doesn't actually save to database (transaction rollback?)
2. ❌ GET /ratings/store/{storeId} queries wrong table/doesn't calculate average
3. ❌ Unique constraint on (user_id, store_id) is missing → multiple rows → query fails
4. ❌ Average calculation is wrong or not triggered

**Fix Required:**
```python
# Example correct implementation
@app.post("/ratings")
async def submit_rating(rating_data: RatingCreate, user=Depends(get_current_user)):
    # Upsert rating (insert or update if exists)
    rating = await db.ratings.upsert(
        where={"user_id": user.id, "store_id": rating_data.store_id},
        create={
            "user_id": user.id,
            "store_id": rating_data.store_id,
            "product_id": rating_data.product_id,
            "rating": rating_data.rating
        },
        update={
            "rating": rating_data.rating,
            "updated_at": datetime.now()
        }
    )
    
    # Recalculate store average
    avg_result = await db.ratings.aggregate({
        "where": {"store_id": rating_data.store_id},
        "avg": {"rating": True},
        "count": {"_all": True}
    })
    
    # Update store table with new average
    await db.stores.update({
        "where": {"id": rating_data.store_id},
        "data": {
            "average_rating": avg_result.avg.rating,
            "total_ratings": avg_result.count._all
        }
    })
    
    return {"success": True, "rating": rating}
```

---

### Issue 2: Favorites Not Appearing in List
**Problem:** User clicks heart icon, POST /favorites/add returns success, but GET /user/favorites doesn't include the new item.

**Possible Causes:**
1. ❌ POST /favorites/add doesn't actually save to database
2. ❌ GET /user/favorites doesn't join with products table (missing product details)
3. ❌ GET /user/favorites filters by wrong user_id
4. ❌ Database transaction not committed

**Fix Required:**
```python
# Example correct implementation
@app.post("/favorites/add")
async def add_favorite(data: FavoriteCreate, user=Depends(get_current_user)):
    # Check if already exists
    existing = await db.favorites.find_first({
        "where": {
            "user_id": user.id,
            "product_id": data.productId
        }
    })
    
    if existing:
        return {"success": True, "message": "Already in favorites"}
    
    # Insert new favorite
    favorite = await db.favorites.create({
        "data": {
            "user_id": user.id,
            "product_id": data.productId
        }
    })
    
    # COMMIT TRANSACTION
    await db.commit()
    
    return {"success": True, "favorite": favorite}

@app.get("/user/favorites")
async def get_favorites(user=Depends(get_current_user)):
    # MUST include product details via JOIN
    favorites = await db.favorites.find_many({
        "where": {"user_id": user.id},
        "include": {
            "products": True  # Include full product object
        },
        "orderBy": {"created_at": "desc"}
    })
    
    return {
        "success": True,
        "total": len(favorites),
        "favorites": favorites
    }
```

---

## ✅ Testing Checklist for Backend Developer

### Test Favorites:
1. [ ] POST /favorites/add with valid productId → Returns 201, saves to DB
2. [ ] POST /favorites/add with duplicate productId → Returns 200, doesn't create duplicate
3. [ ] GET /user/favorites → Returns array with `products` nested object
4. [ ] DELETE /user/favorites/{productId} → Removes from DB, returns 200
5. [ ] GET /user/favorites after delete → Item no longer in list

### Test Ratings:
1. [ ] POST /ratings with valid data → Returns 200/201, saves to DB
2. [ ] POST /ratings again (same user+store) → Updates existing rating, not duplicate
3. [ ] GET /ratings/store/{storeId} → Returns correct average and count
4. [ ] POST rating then GET store ratings → Average updates immediately
5. [ ] GET /ratings/user/{userId}/store/{storeId} → Returns user's rating

### Test Edge Cases:
1. [ ] POST without auth token → Returns 401
2. [ ] POST with invalid productId → Returns 404
3. [ ] POST with invalid storeId → Returns 404
4. [ ] DELETE non-existent favorite → Returns 404
5. [ ] POST rating with invalid value (0 or 6) → Returns 400

---

## 📊 Database Queries to Run for Debugging

### Check if favorites are actually saved:
```sql
SELECT * FROM favorites WHERE user_id = 'YOUR_USER_ID';
```

### Check if ratings are actually saved:
```sql
SELECT * FROM ratings WHERE store_id = 'YOUR_STORE_ID';
```

### Check for duplicate ratings (should be empty):
```sql
SELECT user_id, store_id, COUNT(*) 
FROM ratings 
GROUP BY user_id, store_id 
HAVING COUNT(*) > 1;
```

### Manually calculate store average:
```sql
SELECT 
    store_id,
    AVG(rating) as average,
    COUNT(*) as count
FROM ratings
WHERE store_id = 'YOUR_STORE_ID'
GROUP BY store_id;
```

---

## 🔐 Authentication Verification

**CRITICAL:** All endpoints must verify JWT token and extract user_id correctly!

```python
# Example authentication middleware
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": user_id}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Verify:**
- ✅ JWT token is decoded correctly
- ✅ User ID is extracted from token
- ✅ User ID matches database user
- ✅ 401 returned if token invalid/expired

---

## 🚀 Response Time Requirements

- GET /user/favorites → **< 500ms**
- POST /favorites/add → **< 300ms**
- POST /ratings → **< 500ms** (includes average recalculation)
- GET /ratings/store/{storeId} → **< 300ms**

Add database indexes if queries are slow!

---

## 📞 Contact Frontend Developer

If you need clarification or want to test together, let me know:
- Frontend is calling: `http://localhost:8000/api/*`
- Test tool available at: `http://localhost:8081/api-test.html`
- You can test your endpoints directly from this tool

---

## ✅ When Done

Reply with:
1. ✅ Which issues you fixed
2. ✅ Any changes to API response format
3. ✅ Database schema changes made
4. ✅ Test results showing favorites/ratings work correctly

Then we can test from frontend and confirm everything works! 🎯
