# Backend Required Changes for New Analytics Features

**Дата:** 5 січня 2026  
**Статус:** Frontend Ready - Backend Implementation Needed

---

## 🎯 Overview

Frontend реалізував 4 нові analytics features, які зараз працюють з localStorage. Потрібна backend інтеграція для production.

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
