# Backend Required Changes - Complete Guide

**Дата:** 5 січня 2026  
**Пріоритет:** CRITICAL → HIGH → MEDIUM

---

## 🚨 CRITICAL - Must Fix Immediately

### 1. **Image Upload Field Name Mismatch**

**Problem:** Frontend sends `'image'` field, backend expects different field name.

**Error:**
```
POST http://localhost:3000/api/supabase-upload/image 400/500
ApiError: Unexpected field
```

**Solution:**
```javascript
// Backend route must accept 'image' field:
router.post('/supabase-upload/image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    const url = await uploadToStorage(req.file);
    res.json({
      url: url,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### 2. **Product Creation with Multiple Stores - Creates Duplicates**

**Problem:** Creating product with 2+ stores creates SEPARATE products instead of one product with multiple stores.

**Current (WRONG):**
```
User creates "Nike Air Max" with:
  - Store A: $150
  - Store B: $145

Result: 
  Product 1: "Nike Air Max", Store A, $150
  Product 2: "Nike Air Max", Store B, $145  ❌
```

**Expected (CORRECT):**
```
Product: "Nike Air Max"
  ├─ Store A: $150
  └─ Store B: $145  ✅
```

**Solution:**

Frontend sends:
```json
{
  "name": "Nike Air Max",
  "type": "sneakers",
  "price": 150,
  "stores": [
    { "store_id": "1", "store_name": "Store A", "price": 150 },
    { "store_id": "2", "store_name": "Store B", "price": 145 }
  ]
}
```

Backend must:
1. Create ONE product
2. Insert multiple store_prices entries
3. Transaction to ensure atomicity

```javascript
// Example backend implementation:
async createProduct(data) {
  const transaction = await db.transaction();
  
  try {
    // 1. Create product once
    const product = await db.items.create({
      name: data.name,
      type: data.type,
      price: data.price,
      // ... other fields
    }, { transaction });
    
    // 2. Create store_prices for each store
    if (data.stores && data.stores.length > 0) {
      const storePrices = data.stores.map(store => ({
        item_id: product.id,
        store_id: store.store_id,
        price: store.price,
      }));
      
      await db.store_prices.bulkCreate(storePrices, { transaction });
    }
    
    await transaction.commit();
    return product;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

---

## 🔧 HIGH PRIORITY - New Endpoints Required

### 3. **Batch Operations**

#### Bulk Delete
```
DELETE /api/v1/items/batch
Content-Type: application/json

{
  "ids": ["123", "456", "789"]
}

Response:
{
  "success": true,
  "deleted": 3,
  "failed": 0
}
```

#### Bulk Update
```
POST /api/v1/items/batch-update
Content-Type: application/json

{
  "ids": ["123", "456"],
  "updates": {
    "category": "sneakers",
    "gender": "unisex"
  }
}

Response:
{
  "success": true,
  "updated": 2
}
```

---

### 4. **Export/Import Endpoints**

#### Export CSV
```
GET /api/v1/items/export?format=csv&ids=123,456

Response: text/csv
Headers:
  Content-Disposition: attachment; filename="products_2026-01-05.csv"
  Content-Type: text/csv

CSV Format:
ID,Name,Category,Brand,Price,Color,Gender,Description,Image URL,Stores
123,"Nike Air Max",sneakers,Nike,150,white,unisex,"Description","https://...","Store1:150; Store2:145"
```

#### Import CSV
```
POST /api/v1/items/import
Content-Type: multipart/form-data

file: products.csv

Response:
{
  "success": true,
  "imported": 45,
  "failed": 2,
  "errors": [
    { "row": 5, "error": "Invalid price" },
    { "row": 12, "error": "Brand not found" }
  ]
}
```

**CSV Format Expected:**
```csv
Name,Category,Brand Name,Price,Color,Gender,Description,Image URL,Stores (StoreName:Price; ...)
"Nike Air Max",sneakers,Nike,150.00,white,unisex,"Classic sneakers","https://...","Store1:150; Store2:145"
```

**Backend Logic:**
1. Parse CSV rows
2. Validate each row (required fields, data types)
3. Find or skip missing brands/stores
4. Use transaction for batch insert
5. Return detailed error report

---

### 5. **Price History Tracking**

#### Get Price History
```
GET /api/v1/items/:itemId/stores/:storeId/price-history

Response:
{
  "product_id": "123",
  "store_id": "1",
  "history": [
    {
      "id": 1,
      "price": 150.00,
      "changed_at": "2026-01-01T10:00:00Z",
      "changed_by": "admin_user_id"
    },
    {
      "id": 2,
      "price": 145.00,
      "changed_at": "2026-01-05T15:30:00Z",
      "changed_by": "admin_user_id"
    }
  ]
}
```

#### Record Price Change
```
POST /api/v1/items/:itemId/stores/:storeId/price-history
Content-Type: application/json

{
  "old_price": 150.00,
  "new_price": 145.00
}

Response:
{
  "success": true,
  "history_id": 123
}
```

**Database Table:**
```sql
CREATE TABLE store_price_history (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  changed_by INT REFERENCES users(id),
  INDEX idx_product_store (product_id, store_id),
  INDEX idx_changed_at (changed_at DESC)
);
```

**Backend Logic:**
- Автоматично записувати історію при UPDATE store_prices
- Trigger або application-level hook
- Зберігати user_id для audit trail

---

### 6. **Activity Log / Audit Trail**

#### Get Activity Log
```
GET /api/v1/audit-log?entity=items&entity_id=123&limit=50

Response:
{
  "logs": [
    {
      "id": 1,
      "entity_type": "items",
      "entity_id": 123,
      "action": "create",
      "changes": {
        "name": "Nike Air Max",
        "price": 150
      },
      "user_id": "admin_123",
      "user_name": "Admin User",
      "created_at": "2026-01-05T10:00:00Z"
    },
    {
      "id": 2,
      "entity_type": "items",
      "entity_id": 123,
      "action": "update",
      "changes": {
        "price": { "old": 150, "new": 145 }
      },
      "user_id": "admin_123",
      "created_at": "2026-01-05T15:30:00Z"
    }
  ],
  "total": 2
}
```

**Database Table:**
```sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,  -- 'items', 'stores', 'brands'
  entity_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,       -- 'create', 'update', 'delete'
  changes JSONB,                     -- Store old/new values
  user_id INT REFERENCES users(id),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_user (user_id)
);
```

**Implementation Tips:**
```javascript
// Middleware для automatic logging
function auditLog(entity_type) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = (body) => {
      // Log after successful operation
      db.audit_log.create({
        entity_type,
        entity_id: req.params.id || body.id,
        action: req.method === 'POST' ? 'create' : 
                req.method === 'PUT' ? 'update' : 
                req.method === 'DELETE' ? 'delete' : 'view',
        changes: req.body,
        user_id: req.user?.id,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      return originalJson(body);
    };
    
    next();
  };
}

// Usage:
router.post('/items', auditLog('items'), createItem);
router.put('/items/:id', auditLog('items'), updateItem);
router.delete('/items/:id', auditLog('items'), deleteItem);
```

---

### 7. **Analytics Aggregations**

#### Overview Stats
```
GET /api/v1/analytics/overview

Response:
{
  "products": {
    "total": 1234,
    "active": 1200,
    "inactive": 34,
    "growth_7d": 5.2  // percent
  },
  "stores": {
    "total": 45,
    "with_products": 42
  },
  "brands": {
    "total": 120,
    "top_5": [
      { "id": 1, "name": "Nike", "product_count": 234 },
      { "id": 2, "name": "Adidas", "product_count": 189 }
    ]
  },
  "price_stats": {
    "average": 125.50,
    "min": 10.00,
    "max": 999.99,
    "median": 89.99
  }
}
```

#### Trending Products
```
GET /api/v1/analytics/products/trending?days=7&limit=10

Response:
{
  "products": [
    {
      "id": 123,
      "name": "Nike Air Max",
      "views": 1234,
      "clicks": 89,
      "conversion_rate": 7.2
    }
  ]
}
```

**Implementation:**
- Cache results (Redis, 5-10 min TTL)
- Pre-aggregate daily stats via cron job
- Use database views for complex queries

---

### 8. **Inventory Stock Management**

#### Stock Tracking
```
GET /api/v1/items/:id/stock

Response:
{
  "product_id": 123,
  "stores": [
    {
      "store_id": 1,
      "store_name": "Store A",
      "stock": 25,
      "low_stock_threshold": 10,
      "is_low_stock": false,
      "last_updated": "2026-01-05T10:00:00Z"
    }
  ]
}
```

#### Update Stock
```
PUT /api/v1/items/:id/stores/:storeId/stock
Content-Type: application/json

{
  "stock": 25,
  "low_stock_threshold": 10
}

Response:
{
  "success": true,
  "stock": 25
}
```

**Database Schema:**
```sql
-- Add columns to store_prices table
ALTER TABLE store_prices ADD COLUMN stock INT DEFAULT NULL;
ALTER TABLE store_prices ADD COLUMN low_stock_threshold INT DEFAULT 10;
ALTER TABLE store_prices ADD COLUMN is_available BOOLEAN DEFAULT TRUE;
ALTER TABLE store_prices ADD COLUMN last_stock_update TIMESTAMP;

-- Or create separate stock table
CREATE TABLE store_stock (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  stock INT NOT NULL DEFAULT 0,
  low_stock_threshold INT DEFAULT 10,
  is_available BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, store_id)
);
```

**Low Stock Alerts:**
```
GET /api/v1/inventory/low-stock

Response:
{
  "alerts": [
    {
      "product_id": 123,
      "product_name": "Nike Air Max",
      "store_id": 1,
      "store_name": "Store A",
      "stock": 5,
      "threshold": 10
    }
  ]
}
```

---

### 9. **Multiple Images per Product**

#### Current Issue:
Frontend can only upload 1 image per product (`image_url` field).

#### New Structure:

**Database:**
```sql
-- Option A: JSON array in items table
ALTER TABLE items ADD COLUMN images JSONB DEFAULT '[]';

-- Example:
images = [
  {"url": "https://...", "is_primary": true, "order": 0},
  {"url": "https://...", "is_primary": false, "order": 1}
]

-- Option B: Separate table (RECOMMENDED)
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_product (product_id, display_order)
);
```

**Endpoints:**

```
# Upload multiple images
POST /api/v1/items/:id/images
Content-Type: multipart/form-data

files: [image1.jpg, image2.jpg, image3.jpg]

Response:
{
  "success": true,
  "images": [
    { "id": 1, "url": "https://...", "is_primary": true },
    { "id": 2, "url": "https://..." }
  ]
}

# Set primary image
PUT /api/v1/items/:id/images/:imageId/primary

# Reorder images
PUT /api/v1/items/:id/images/reorder
{
  "order": [3, 1, 2]  // image IDs in new order
}

# Delete image
DELETE /api/v1/items/:id/images/:imageId
```

---

### 10. **Product Templates**

#### Save as Template
```
POST /api/v1/templates
Content-Type: application/json

{
  "name": "Nike Sneaker Template",
  "category": "sneakers",
  "template_data": {
    "type": "sneakers",
    "gender": "unisex",
    "brand_id": "123",
    "description": "Classic sneaker design..."
  }
}

Response:
{
  "id": 1,
  "name": "Nike Sneaker Template"
}
```

#### Get Templates
```
GET /api/v1/templates?category=sneakers

Response:
{
  "templates": [
    {
      "id": 1,
      "name": "Nike Sneaker Template",
      "category": "sneakers",
      "template_data": {...}
    }
  ]
}
```

**Database:**
```sql
CREATE TABLE product_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  template_data JSONB NOT NULL,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 11. **Scheduled Publishing**

#### Schedule Product
```
POST /api/v1/items/:id/schedule
Content-Type: application/json

{
  "publish_at": "2026-01-10T10:00:00Z",
  "unpublish_at": "2026-02-10T10:00:00Z"  // optional
}

Response:
{
  "success": true,
  "scheduled": true
}
```

#### Get Scheduled Products
```
GET /api/v1/items/scheduled

Response:
{
  "products": [
    {
      "id": 123,
      "name": "Nike Air Max",
      "publish_at": "2026-01-10T10:00:00Z",
      "status": "scheduled"
    }
  ]
}
```

**Database:**
```sql
ALTER TABLE items ADD COLUMN publish_at TIMESTAMP NULL;
ALTER TABLE items ADD COLUMN unpublish_at TIMESTAMP NULL;
ALTER TABLE items ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
-- status: 'draft', 'scheduled', 'published', 'archived'

CREATE INDEX idx_publish_at ON items(publish_at) WHERE publish_at IS NOT NULL;
```

**Cron Job:**
```javascript
// Run every minute
cron.schedule('* * * * *', async () => {
  // Publish scheduled products
  await db.items.update(
    { status: 'published' },
    {
      where: {
        status: 'scheduled',
        publish_at: { [Op.lte]: new Date() }
      }
    }
  );
  
  // Unpublish expired products
  await db.items.update(
    { status: 'archived' },
    {
      where: {
        status: 'published',
        unpublish_at: { [Op.lte]: new Date() }
      }
    }
  );
});
```

---

### 12. **Product Relations**

#### Add Related Products
```
POST /api/v1/items/:id/relations
Content-Type: application/json

{
  "type": "similar",  // 'similar', 'bundle', 'frequently_bought'
  "related_ids": [456, 789]
}

Response:
{
  "success": true,
  "relations": 2
}
```

#### Get Related Products
```
GET /api/v1/items/:id/related?type=similar

Response:
{
  "relations": [
    {
      "type": "similar",
      "product": {
        "id": 456,
        "name": "Adidas Ultraboost",
        "price": 160
      }
    }
  ]
}
```

**Database:**
```sql
CREATE TABLE product_relations (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  related_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  relation_type VARCHAR(50) NOT NULL,  -- 'similar', 'bundle', 'frequently_bought'
  score DECIMAL(3,2) DEFAULT 1.0,      -- Relevance score
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, related_id, relation_type),
  INDEX idx_product (product_id, relation_type),
  CHECK (product_id != related_id)
);
```

---

## 📊 PERFORMANCE OPTIMIZATIONS

### 1. Caching Strategy

**Redis Cache:**
```javascript
// Cache product lists
GET /api/v1/items → cache 5 min
GET /api/v1/pages/products → cache 10 min
GET /api/v1/pages/home → cache 15 min

// Invalidate on change:
POST /api/v1/items → clear cache
PUT /api/v1/items/:id → clear cache
DELETE /api/v1/items/:id → clear cache
```

**Implementation:**
```javascript
const cache = require('redis').createClient();

// Middleware
async function cacheMiddleware(key, ttl) {
  return async (req, res, next) => {
    const cached = await cache.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.setex(key, ttl, JSON.stringify(data));
      return originalJson(data);
    };
    
    next();
  };
}

// Usage:
router.get('/items', 
  cacheMiddleware('items:all', 300), 
  getItems
);
```

---

### 2. Database Indexes

**Critical Indexes:**
```sql
-- Items table
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_brand ON items(brand_id);
CREATE INDEX idx_items_price ON items(price);
CREATE INDEX idx_items_created ON items(created_at DESC);
CREATE INDEX idx_items_status ON items(status) WHERE status = 'published';

-- Full-text search
CREATE INDEX idx_items_search ON items USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Store prices
CREATE INDEX idx_store_prices_item ON store_prices(item_id);
CREATE INDEX idx_store_prices_store ON store_prices(store_id);
CREATE INDEX idx_store_prices_price ON store_prices(price);

-- Composite indexes for common queries
CREATE INDEX idx_items_type_brand ON items(type, brand_id);
CREATE INDEX idx_items_type_price ON items(type, price);
```

---

### 3. Pagination & Field Selection

**Always require pagination:**
```
GET /api/v1/items?page=1&limit=20

Response:
{
  "items": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1234,
    "totalPages": 62,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Field selection (GraphQL-style):**
```
GET /api/v1/items?fields=id,name,price,image_url

Response reduces payload by 70%
```

---

### 4. Image Optimization

**CDN Setup:**
```
1. Upload to S3/Supabase Storage
2. CloudFront/CDN distribution
3. Image transformations:
   - Thumbnail: 150x150
   - Medium: 500x500
   - Large: 1200x1200
   - WebP format
```

**Endpoint:**
```
GET /api/v1/images/:id?size=thumbnail&format=webp

Returns optimized image URL:
https://cdn.wearsearch.com/images/123_thumbnail.webp
```

---

## 🔒 SECURITY IMPROVEMENTS

### 1. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: 'Too many requests'
});

// Admin actions stricter
const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50
});

app.use('/api/', apiLimiter);
app.use('/api/v1/admin/', adminLimiter);
```

---

### 2. Input Validation

```javascript
const { body, validationResult } = require('express-validator');

router.post('/items',
  [
    body('name').trim().notEmpty().isLength({ max: 255 }),
    body('price').isFloat({ min: 0, max: 999999 }),
    body('type').isIn(['jackets', 'hoodies', 'pants', ...]),
    body('stores').optional().isArray(),
    body('stores.*.store_id').isInt(),
    body('stores.*.price').isFloat({ min: 0 })
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Create product...
  }
);
```

---

### 3. SQL Injection Prevention

✅ **Always use parameterized queries:**
```javascript
// Good:
db.query('SELECT * FROM items WHERE id = $1', [id]);

// Bad (SQL injection):
db.query(`SELECT * FROM items WHERE id = ${id}`);
```

---

## 📝 TESTING

### API Tests Examples

```javascript
// Jest + Supertest
describe('Product API', () => {
  test('Create product with multiple stores', async () => {
    const response = await request(app)
      .post('/api/v1/items')
      .send({
        name: 'Test Product',
        price: 100,
        stores: [
          { store_id: 1, price: 100 },
          { store_id: 2, price: 95 }
        ]
      })
      .expect(201);
    
    expect(response.body.id).toBeDefined();
    expect(response.body.stores).toHaveLength(2);
  });
  
  test('Export CSV', async () => {
    const response = await request(app)
      .get('/api/v1/items/export?format=csv')
      .expect(200)
      .expect('Content-Type', /csv/);
    
    expect(response.text).toContain('ID,Name,Category');
  });
});
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Fix image upload field name
- [ ] Fix product creation with multiple stores
- [ ] Add batch delete endpoint
- [ ] Add export/import endpoints
- [ ] Add price history tracking
- [ ] Add activity log
- [ ] Add analytics aggregations
- [ ] Add stock management
- [ ] Add multiple images support
- [ ] Add product templates
- [ ] Add scheduled publishing
- [ ] Add product relations
- [ ] Setup Redis caching
- [ ] Create database indexes
- [ ] Add rate limiting
- [ ] Setup CDN for images
- [ ] Add input validation
- [ ] Write API tests
- [ ] Update API documentation

---

## 📚 ADDITIONAL RESOURCES

### API Documentation
Create OpenAPI/Swagger documentation for all new endpoints.

### Database Migrations
Use migration tool (Sequelize, Knex, Prisma) for all schema changes.

### Monitoring
Setup error tracking (Sentry) and performance monitoring (New Relic, DataDog).

---

## 💬 CONTACTS

Якщо виникнуть питання щодо реалізації будь-якої функції - звертайся до frontend розробника для уточнень.

**Frontend Implementation:** ✅ Ready  
**Backend Implementation:** ⏳ Pending
