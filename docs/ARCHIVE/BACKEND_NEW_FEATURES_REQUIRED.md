# Backend Required Changes for New Features

**Дата:** 6 січня 2026  
**Статус:** Frontend Ready - Backend Implementation Needed

---

## 🎯 Overview

Frontend реалізував нові user-facing та analytics features, які зараз працюють з localStorage/mock data. Потрібна backend інтеграція для production.

---

# ЧАСТИНА 1: User-Facing Features (НОВІ)

---

## 🚨 КРИТИЧНО: Public Wishlist Sharing (БАГОВИЙ ENDPOINT)

### Проблема

Endpoint `GET /api/v1/wishlist/public/:shareId` повертає **пустий список товарів**, хоча у користувача є 2 збережені favorites.

**Поточна відповідь (НЕПРАВИЛЬНА):**
```json
{
  "owner_name": "User",
  "items_count": 0,
  "items": []
}
```

**Очікувана відповідь (ПРАВИЛЬНА):**
```json
{
  "owner_name": "Seylent",
  "items_count": 2,
  "items": [
    {
      "id": "123",
      "name": "Nike Air Max 90",
      "brand": "Nike",
      "image_url": "https://example.com/image.jpg",
      "price": 150.00,
      "currency": "UAH",
      "added_at": "2026-01-05T15:30:00Z"
    },
    {
      "id": "456",
      "name": "Adidas Ultraboost",
      "brand": "Adidas", 
      "image_url": "https://example.com/image2.jpg",
      "price": 180.00,
      "currency": "UAH",
      "added_at": "2026-01-04T10:00:00Z"
    }
  ]
}
```

### Причина багу

Endpoint `/api/v1/wishlist/public/:shareId` **НЕ робить JOIN** з таблицею favorites.

Favorites зберігаються через `POST /api/user/favorites/:productId`, але публічний wishlist їх не підтягує.

### Як виправити

Endpoint повинен:
1. Знайти `user_id` по `share_id` в таблиці wishlist_settings
2. Перевірити що `is_public = true`
3. **Отримати favorites цього user_id з таблиці favorites**
4. **JOIN з items щоб отримати деталі товарів**
5. Повернути результат

### SQL Query для виправлення

```sql
-- Крок 1: Знайти користувача по share_id
SELECT 
  ws.user_id,
  ws.is_public,
  u.name as owner_name
FROM user_wishlist_settings ws
JOIN users u ON ws.user_id = u.id
WHERE ws.share_id = 'ba1393cebdfbab2d53138f0521787e01';

-- Крок 2: Отримати favorites з деталями товарів
SELECT 
  i.id,
  i.name,
  i.price,
  i.currency,
  i.image_url,
  b.name as brand,
  f.created_at as added_at
FROM favorites f
JOIN items i ON f.product_id = i.id   -- або f.item_id = i.id
LEFT JOIN brands b ON i.brand_id = b.id
WHERE f.user_id = <user_id_from_step_1>
ORDER BY f.created_at DESC;
```

### Приклад виправленого коду (Node.js)

```javascript
// GET /api/v1/wishlist/public/:shareId
router.get('/wishlist/public/:shareId', async (req, res) => {
  const { shareId } = req.params;
  
  try {
    // 1. Знайти налаштування по share_id
    const settings = await db.query(`
      SELECT ws.user_id, ws.is_public, u.name as owner_name
      FROM user_wishlist_settings ws
      JOIN users u ON ws.user_id = u.id
      WHERE ws.share_id = $1
    `, [shareId]);
    
    if (!settings.rows.length) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }
    
    const { user_id, is_public, owner_name } = settings.rows[0];
    
    if (!is_public) {
      return res.status(403).json({ error: 'This wishlist is private' });
    }
    
    // 2. ⚠️ ЦЕ ЧАСТИНА ЩО ВІДСУТНЯ! Отримати favorites з items
    const favorites = await db.query(`
      SELECT 
        i.id,
        i.name,
        i.price,
        i.currency,
        i.image_url,
        b.name as brand,
        f.created_at as added_at
      FROM favorites f
      JOIN items i ON f.product_id = i.id
      LEFT JOIN brands b ON i.brand_id = b.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `, [user_id]);
    
    // 3. Повернути результат
    return res.json({
      owner_name: owner_name || 'User',
      items_count: favorites.rows.length,
      items: favorites.rows
    });
    
  } catch (error) {
    console.error('Public wishlist error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Поточна структура API (для довідки)

| Endpoint | Метод | Auth | Опис |
|----------|-------|------|------|
| `/api/user/favorites/:productId` | POST | ✅ Bearer | Додати в favorites |
| `/api/user/favorites/:productId` | DELETE | ✅ Bearer | Видалити з favorites |
| `/api/v1/pages/favorites` | GET | ✅ Bearer | Отримати свої favorites |
| `/api/v1/wishlist/settings` | GET | ✅ Bearer | Налаштування приватності |
| `/api/v1/wishlist/settings` | PUT | ✅ Bearer | Оновити is_public |
| `/api/v1/wishlist/share` | POST | ✅ Bearer | Генерувати share_id |
| `/api/v1/wishlist/public/:shareId` | GET | ❌ Public | **⚠️ БАГОВИЙ** - не підтягує items |

---

## 5️⃣ Product Reviews & Ratings ⭐

### Database Migration

```sql
CREATE TABLE product_reviews (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  text TEXT,
  helpful_count INT DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(product_id, user_id),  -- Один відгук на продукт від користувача
  INDEX idx_product_rating (product_id, rating DESC),
  INDEX idx_created_at (created_at DESC)
);

CREATE TABLE review_helpful (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_id INT NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, review_id)
);
```

### Required Endpoints

#### Get Product Reviews
```
GET /api/v1/items/:productId/reviews

Query params:
  - sort: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' (default 'newest')
  - limit: number (default 10)
  - offset: number (pagination)

Response:
{
  "reviews": [
    {
      "id": 123,
      "user_id": 456,
      "user_name": "Олександр К.",
      "user_avatar": "https://...",
      "rating": 5,
      "title": "Відмінні кросівки!",
      "text": "Дуже комфортні, рекомендую...",
      "helpful_count": 12,
      "is_verified_purchase": true,
      "created_at": "2026-01-05T15:30:00Z"
    }
  ],
  "stats": {
    "average_rating": 4.5,
    "total_reviews": 45,
    "rating_distribution": {
      "5": 25,
      "4": 12,
      "3": 5,
      "2": 2,
      "1": 1
    }
  },
  "total": 45
}
```

#### Submit Review
```
POST /api/v1/items/:productId/reviews
Authorization: Bearer <token>

{
  "rating": 5,
  "title": "Відмінний товар",
  "text": "Дуже задоволений покупкою..."
}

Response:
{
  "success": true,
  "review": { ... }
}
```

#### Mark Review as Helpful
```
POST /api/v1/reviews/:reviewId/helpful
Authorization: Bearer <token>

Response:
{
  "success": true,
  "helpful_count": 13
}
```

#### Delete Own Review
```
DELETE /api/v1/reviews/:reviewId
Authorization: Bearer <token>

Response:
{
  "success": true
}
```

---

## 6️⃣ User Collections / Wishlists 📁

### Database Migration

```sql
CREATE TABLE user_collections (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  emoji VARCHAR(10) DEFAULT '📁',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user (user_id)
);

CREATE TABLE collection_items (
  collection_id INT NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  
  PRIMARY KEY (collection_id, product_id)
);
```

### Required Endpoints

#### Get User Collections
```
GET /api/v1/users/me/collections
Authorization: Bearer <token>

Response:
{
  "collections": [
    {
      "id": "uuid-1",
      "name": "Хочу купити",
      "emoji": "🛒",
      "description": "На наступну зарплату",
      "product_count": 5,
      "is_public": false,
      "created_at": "2026-01-05T15:30:00Z"
    }
  ]
}
```

#### Create Collection
```
POST /api/v1/users/me/collections
Authorization: Bearer <token>

{
  "name": "Літні кросівки",
  "emoji": "☀️",
  "description": "Для відпустки"
}

Response:
{
  "success": true,
  "collection": { ... }
}
```

#### Update Collection
```
PUT /api/v1/users/me/collections/:id
Authorization: Bearer <token>

{
  "name": "Нова назва",
  "emoji": "🎯"
}
```

#### Delete Collection
```
DELETE /api/v1/users/me/collections/:id
Authorization: Bearer <token>
```

#### Add Product to Collection
```
POST /api/v1/users/me/collections/:id/items
Authorization: Bearer <token>

{
  "product_id": 123,
  "notes": "Розмір 42"
}
```

#### Remove Product from Collection
```
DELETE /api/v1/users/me/collections/:id/items/:productId
Authorization: Bearer <token>
```

#### Get Collection Products
```
GET /api/v1/users/me/collections/:id/items
Authorization: Bearer <token>

Response:
{
  "products": [
    {
      "id": 123,
      "name": "Nike Air Max",
      "price": 150,
      "image_url": "...",
      "added_at": "2026-01-05T15:30:00Z",
      "notes": "Розмір 42"
    }
  ]
}
```

---

## 7️⃣ Personalized Recommendations 🎯

### Database Migration

```sql
CREATE TABLE user_preferences (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_categories TEXT[],
  preferred_brands TEXT[],
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_product_interactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL,  -- 'view', 'favorite', 'cart', 'purchase'
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_interaction (user_id, interaction_type),
  INDEX idx_product (product_id)
);
```

### Required Endpoints

#### Get Personalized Recommendations
```
GET /api/v1/recommendations
Authorization: Bearer <token>

Query params:
  - limit: number (default 10)
  - exclude_viewed: boolean (default true)

Response:
{
  "recommendations": [
    {
      "id": 123,
      "name": "Adidas Ultraboost",
      "price": 160,
      "image_url": "...",
      "category": "sneakers",
      "brand": "Adidas",
      "reason": "based_on_favorites",  // 'based_on_favorites', 'based_on_views', 'trending', 'similar_users'
      "score": 0.95
    }
  ]
}
```

#### Get Similar Products (для "Recently Viewed")
```
GET /api/v1/items/:productId/similar

Query params:
  - limit: number (default 6)

Response:
{
  "products": [
    {
      "id": 456,
      "name": "Similar Product",
      "price": 145,
      "image_url": "...",
      "similarity_score": 0.89
    }
  ]
}
```

#### Track Interaction (для recommendations algorithm)
```
POST /api/v1/interactions
Authorization: Bearer <token>

{
  "product_id": 123,
  "type": "view"  // 'view', 'favorite', 'cart', 'purchase'
}
```

**Recommendation Algorithm (спрощений):**
```sql
-- Рекомендації на основі категорій улюблених товарів
WITH user_fav_categories AS (
  SELECT DISTINCT i.category
  FROM favorites f
  JOIN items i ON f.item_id = i.id
  WHERE f.user_id = $1
)
SELECT i.*, 
  CASE 
    WHEN i.category IN (SELECT category FROM user_fav_categories) THEN 0.8
    ELSE 0.5
  END as score
FROM items i
WHERE i.id NOT IN (
  SELECT item_id FROM favorites WHERE user_id = $1
)
ORDER BY score DESC, i.created_at DESC
LIMIT 10;
```

---

## 8️⃣ Search History & Popular Queries 🔍

### Database Migration

```sql
CREATE TABLE user_search_history (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),  -- для неавторизованих
  query VARCHAR(255) NOT NULL,
  results_count INT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user (user_id),
  INDEX idx_created_at (created_at DESC)
);

CREATE TABLE popular_searches (
  query VARCHAR(255) PRIMARY KEY,
  search_count INT DEFAULT 1,
  last_searched_at TIMESTAMP DEFAULT NOW()
);
```

### Required Endpoints

#### Get Search History
```
GET /api/v1/search/history
Authorization: Bearer <token>  (optional)

Query params:
  - limit: number (default 10)

Response:
{
  "history": [
    {
      "query": "nike air max",
      "results_count": 25,
      "searched_at": "2026-01-05T15:30:00Z"
    }
  ]
}
```

#### Clear Search History
```
DELETE /api/v1/search/history
Authorization: Bearer <token>
```

#### Get Popular Searches
```
GET /api/v1/search/popular

Query params:
  - limit: number (default 5)

Response:
{
  "popular": [
    { "query": "nike", "count": 1250 },
    { "query": "adidas ultraboost", "count": 890 },
    { "query": "кросівки", "count": 750 }
  ]
}
```

#### Track Search (викликається при пошуку)
```
POST /api/v1/search/track

{
  "query": "nike air max",
  "results_count": 25
}
```

---

# ЧАСТИНА 2: Analytics Features (попередні)

---

## 1️⃣ Price History Tracking 📊

### Database Migration

```sql
CREATE TABLE store_price_history (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  changed_by INT REFERENCES users(id),
  
  INDEX idx_product_store (product_id, store_id),
  INDEX idx_changed_at (changed_at DESC)
);
```

### Required Endpoints

#### Get Price History
```
GET /api/v1/items/:productId/price-history
GET /api/v1/items/:productId/stores/:storeId/price-history

Query params:
  - limit: number (default 50)
  - store_id: string (filter by store)

Response:
{
  "history": [
    {
      "id": 123,
      "store_id": 1,
      "store_name": "Nike Store",
      "old_price": 150.00,
      "new_price": 145.00,
      "changed_at": "2026-01-05T15:30:00Z",
      "changed_by": "admin_user_id"
    }
  ],
  "total": 15
}
```

### Auto-Tracking Logic

**Option A: Database Trigger**
```sql
CREATE TRIGGER track_price_changes
AFTER UPDATE ON store_prices
FOR EACH ROW
WHEN (OLD.price != NEW.price)
EXECUTE FUNCTION log_price_change();
```

**Option B: Application-Level Hook**
```javascript
// In updateStorePrice function
if (oldPrice !== newPrice) {
  await db.query(`
    INSERT INTO store_price_history (product_id, store_id, old_price, new_price, changed_by)
    VALUES ($1, $2, $3, $4, $5)
  `, [productId, storeId, oldPrice, newPrice, userId]);
}
```

**Frontend Usage:**
```typescript
// Already implemented
const history = await fetch(`/api/v1/items/${productId}/price-history`);
```

---

## 2️⃣ Activity Log / Audit Trail 📋

### Database Migration

```sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,  -- 'items', 'stores', 'brands', etc.
  entity_id INT NOT NULL,
  action VARCHAR(20) NOT NULL,       -- 'create', 'update', 'delete'
  changes JSONB,                     -- Store old/new values
  user_id INT REFERENCES users(id),
  user_name VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_user (user_id),
  INDEX idx_created_at (created_at DESC)
);
```

### Required Endpoints

#### Get Activity Log
```
GET /api/v1/audit-log

Query params:
  - entity_type: string (filter by type)
  - entity_id: string (filter by ID)
  - limit: number (default 50)
  - offset: number (pagination)

Response:
{
  "logs": [
    {
      "id": 1,
      "entity_type": "items",
      "entity_id": 123,
      "action": "update",
      "changes": {
        "name": { "old": "Old Name", "new": "New Name" },
        "price": { "old": 150, "new": 145 }
      },
      "user_id": 1,
      "user_name": "Admin User",
      "ip_address": "192.168.1.1",
      "created_at": "2026-01-05T15:30:00Z"
    }
  ],
  "total": 100
}
```

### Auto-Logging Logic

**Middleware для всіх admin endpoints:**
```javascript
const auditLogger = async (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    // Log only successful operations
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logActivity({
        entityType: req.params.entityType || 'items',
        entityId: req.params.id || data.id,
        action: req.method === 'POST' ? 'create' : 
                req.method === 'PUT' ? 'update' : 
                req.method === 'DELETE' ? 'delete' : 'read',
        changes: req.body,
        userId: req.user?.id,
        userName: req.user?.name,
        ipAddress: req.ip
      });
    }
    
    return originalJson(data);
  };
  
  next();
};

// Apply to all admin routes
app.use('/api/v1/items', authenticate, auditLogger, itemsRouter);
```

**Frontend Usage:**
```typescript
// Already implemented
const logs = await fetch('/api/v1/audit-log?entity_type=items&limit=20');
```

---

## 3️⃣ Product Relations 🔗

### Database Migration

```sql
CREATE TABLE product_relations (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  related_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  relation_type VARCHAR(50) NOT NULL,  -- 'similar', 'bundle', 'frequently_bought'
  score DECIMAL(3,2) DEFAULT 1.0,      -- Relevance score (0.00 - 1.00)
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INT REFERENCES users(id),
  
  UNIQUE(product_id, related_id, relation_type),
  INDEX idx_product (product_id, relation_type),
  INDEX idx_score (score DESC),
  CHECK (product_id != related_id)
);
```

### Required Endpoints

#### Add Related Product
```
POST /api/v1/items/:id/relations
Content-Type: application/json

{
  "related_id": 456,
  "type": "similar",  // 'similar', 'bundle', 'frequently_bought'
  "score": 0.95       // optional
}

Response:
{
  "success": true,
  "relation_id": 789
}
```

#### Get Related Products
```
GET /api/v1/items/:id/related
GET /api/v1/items/:id/related?type=similar

Response:
{
  "relations": [
    {
      "id": 789,
      "type": "similar",
      "score": 0.95,
      "product": {
        "id": 456,
        "name": "Adidas Ultraboost",
        "price": 160,
        "image_url": "...",
        "category": "sneakers"
      }
    }
  ]
}
```

#### Delete Relation
```
DELETE /api/v1/items/:id/relations/:relationId

Response:
{
  "success": true
}
```

**Frontend Usage:**
```typescript
// Already implemented
await fetch(`/api/v1/items/${productId}/relations`, {
  method: 'POST',
  body: JSON.stringify({ related_id: relatedId, type: 'similar' })
});

const relations = await fetch(`/api/v1/items/${productId}/related`);
```

---

## 4️⃣ Advanced Analytics (Enhanced) 📈

### Existing Analytics Enhancement

**Current endpoint:** `GET /api/v1/dashboard`

**Add to response:**
```json
{
  "analytics": {
    // Existing...
    "totalProducts": 150,
    "totalStores": 5,
    "categoriesCount": {...},
    
    // NEW: Add these
    "recentActivity": [
      {
        "action": "create",
        "entity": "product",
        "name": "Nike Air Max",
        "timestamp": "2026-01-05T15:30:00Z"
      }
    ],
    "priceStats": {
      "avgPriceChange": -2.5,  // % change last 30 days
      "volatileProducts": 5,    // Products with >10% price change
      "stableProducts": 145
    },
    "relationStats": {
      "productsWithRelations": 45,
      "totalRelations": 120,
      "mostRelatedProduct": {
        "id": 123,
        "name": "Nike Air Max",
        "relationCount": 15
      }
    }
  }
}
```

**Optional: Dedicated Analytics Endpoint**
```
GET /api/v1/analytics/summary

Response:
{
  "overview": {
    "totalProducts": 150,
    "totalSales": 1250,
    "avgPrice": 125.50,
    "totalRevenue": 156875.00
  },
  "trends": {
    "priceChanges": 25,
    "newProducts": 10,
    "deletedProducts": 2
  },
  "topPerformers": {
    "byViews": [...],
    "byFavorites": [...],
    "byRevenue": [...]
  }
}
```

---

## 📝 Implementation Checklist

### Priority 1: Critical (Must Have)
- [x] Frontend implementation (DONE)
- [ ] Database migrations for all 4 features
- [ ] Price history tracking (auto-trigger or hook)
- [ ] Activity log middleware
- [ ] Product relations CRUD endpoints

### Priority 2: Integration
- [ ] Update dashboard endpoint with new analytics
- [ ] Add authentication/authorization checks
- [ ] Test all endpoints with frontend
- [ ] Add rate limiting (100 req/min per user)

### Priority 3: Performance
- [ ] Index all foreign keys
- [ ] Paginate activity log (limit 50 default)
- [ ] Cache relations (Redis, 5 min TTL)
- [ ] Optimize price history queries

### Priority 4: Nice to Have
- [ ] Export activity log to CSV
- [ ] Price change notifications (webhooks)
- [ ] Auto-generate similar products (ML)
- [ ] Analytics dashboard with charts

---

## 🧪 Testing Requirements

### 1. Price History
```bash
# Create product with price $150
POST /api/v1/items → {price: 150}

# Update price to $145
PUT /api/v1/items/:id → {price: 145}

# Verify history recorded
GET /api/v1/items/:id/price-history
Expected: [{old_price: 150, new_price: 145}]
```

### 2. Activity Log
```bash
# Create product
POST /api/v1/items → {name: "Test"}

# Verify logged
GET /api/v1/audit-log?entity_type=items
Expected: [{action: "create", entity_id: X}]
```

### 3. Product Relations
```bash
# Add relation
POST /api/v1/items/1/relations → {related_id: 2, type: "similar"}

# Verify relation
GET /api/v1/items/1/related
Expected: [{related_id: 2, type: "similar"}]

# Test constraint: cannot relate to self
POST /api/v1/items/1/relations → {related_id: 1}
Expected: 400 error
```

---

## 🚀 Frontend Integration (Already Done)

Frontend вже готовий і використовує:
- `recordPriceChange()` - автоматично викликається при зміні ціни
- `logActivity()` - викликається на create/update/delete
- `addRelatedProduct()`, `getRelatedProducts()` - UI в Analytics tab
- Всі дані зберігаються в localStorage до backend ready

**Після backend implementation:**
1. Замінити localStorage calls на API calls
2. Додати error handling
3. Протестувати всі flows
4. Deploy!

---

## 📞 Questions?

See:
- `docs/BACKEND_REQUIRED_CHANGES.md` - Main backend guide
- `docs/INTEGRATION_TESTING_GUIDE.md` - Testing guide
- `src/pages/Admin.tsx` - Frontend implementation (lines 754-870)

**Ready to implement! 🎉**

---

# 📋 ПОВНИЙ ЧЕКЛІСТ ДЛЯ БЕКЕНДУ

## User-Facing Features (Пріоритет 1 - для користувачів)

### Reviews (Відгуки)
- [ ] Таблиці: `product_reviews`, `review_helpful`
- [ ] `GET /api/v1/items/:id/reviews` - отримати відгуки
- [ ] `POST /api/v1/items/:id/reviews` - додати відгук
- [ ] `POST /api/v1/reviews/:id/helpful` - позначити корисним
- [ ] `DELETE /api/v1/reviews/:id` - видалити відгук

### Collections (Колекції)
- [ ] Таблиці: `user_collections`, `collection_items`
- [ ] `GET /api/v1/users/me/collections` - список колекцій
- [ ] `POST /api/v1/users/me/collections` - створити
- [ ] `PUT /api/v1/users/me/collections/:id` - оновити
- [ ] `DELETE /api/v1/users/me/collections/:id` - видалити
- [ ] `POST /api/v1/users/me/collections/:id/items` - додати товар
- [ ] `DELETE /api/v1/users/me/collections/:id/items/:productId` - видалити товар
- [ ] `GET /api/v1/users/me/collections/:id/items` - товари в колекції

### Recommendations (Рекомендації)
- [ ] Таблиці: `user_preferences`, `user_product_interactions`
- [ ] `GET /api/v1/recommendations` - персоналізовані рекомендації
- [ ] `GET /api/v1/items/:id/similar` - схожі товари
- [ ] `POST /api/v1/interactions` - трекінг взаємодій

### Search History (Історія пошуку)
- [ ] Таблиці: `user_search_history`, `popular_searches`
- [ ] `GET /api/v1/search/history` - історія пошуку
- [ ] `DELETE /api/v1/search/history` - очистити історію
- [ ] `GET /api/v1/search/popular` - популярні запити
- [ ] `POST /api/v1/search/track` - зберегти пошук

## Analytics Features (Пріоритет 2 - для адміна)

### Price History
- [ ] Таблиця: `store_price_history`
- [ ] `GET /api/v1/items/:id/price-history`
- [ ] Автоматичний тригер при зміні ціни

### Activity Log
- [ ] Таблиця: `audit_log`
- [ ] `GET /api/v1/audit-log`
- [ ] Middleware для логування

### Product Relations
- [ ] Таблиця: `product_relations`
- [ ] `GET /api/v1/items/:id/related`
- [ ] `POST /api/v1/items/:id/relations`
- [ ] `DELETE /api/v1/items/:id/relations/:relationId`

---

## 🚀 Frontend Status

| Feature | Frontend | Backend | Notes |
|---------|----------|---------|-------|
| Product Reviews | ✅ Done | ✅ Ready | API integrated |
| Collections | ✅ Done | ✅ Ready | API integrated |
| Recommendations | ✅ Done | ✅ Ready | API integrated |
| Search History | ✅ Done | ✅ Ready | API integrated |
| Similar Products | ✅ Done | ✅ Ready | API integrated |
| Interaction Tracking | ✅ Done | ✅ Ready | API integrated |
| Recently Viewed | ✅ Done | ❌ Not needed | Повністю на клієнті |
| Share Button | ✅ Done | ❌ Not needed | Повністю на клієнті |
| Price Range Filter | ✅ Done | ⚠️ Maybe | Фільтрація на фронті |
| Price History | ✅ Done | ⏳ Pending | localStorage |
| Activity Log | ✅ Done | ⏳ Pending | localStorage |
| Product Relations | ✅ Done | ⏳ Pending | localStorage |

---

## 📞 Контакти

Файли фронтенду для інтеграції:
- `src/components/ProductReviews.tsx` - Відгуки
- `src/components/CollectionManager.tsx` - Менеджер колекцій
- `src/components/AddToCollection.tsx` - Додавання в колекцію
- `src/hooks/useCollections.ts` - Хук колекцій
- `src/hooks/useSearchHistory.ts` - Хук історії пошуку
- `src/hooks/useRecentlyViewed.ts` - Хук переглянутих товарів
- `src/components/ShareButton.tsx` - Кнопка "Поділитися"
- `src/components/PriceRangeFilter.tsx` - Фільтр цін

**Всі фічі готові до інтеграції з бекендом! 🎉**
