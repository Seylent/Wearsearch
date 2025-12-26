# 🚨 CRITICAL: Product Stores Not Saving

## Проблема

Frontend відправляє stores при оновленні продукту, але **stores НЕ зберігаються в базу даних**.

## Що відбувається

### 1. Frontend відправляє правильний запит:

```javascript
PUT http://localhost:3000/api/admin/products/{productId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Product Name",
  "price": 123,
  "type": "Outerwear",
  "color": "Olive",
  "gender": null,
  "brand_id": null,
  "description": null,
  "image_url": "https://...",
  "stores": [
    {
      "store_id": "uuid-магазину",
      "price": 123
    }
  ]
}
```

### 2. Backend повертає:

```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

### 3. Але коли робимо GET:

```javascript
GET http://localhost:3000/api/items/{productId}/stores
```

**Response:**
```json
{
  "success": true,
  "stores": []  // ❌ ПОРОЖНЬО!
}
```

---

## ЩО ПОТРІБНО ВИПРАВИТИ

### 1. У PUT `/api/admin/products/:id` endpoint:

```javascript
// Приймаєш в req.body:
{
  stores: [
    { store_id: "uuid", price: 123 },
    { store_id: "uuid2", price: 456 }
  ]
}

// ТРЕБА:
// 1. Видалити старі зв'язки з таблиці product_stores для цього product_id
await db.query(
  'DELETE FROM product_stores WHERE product_id = $1',
  [productId]
);

// 2. Додати нові зв'язки
for (const store of stores) {
  await db.query(
    'INSERT INTO product_stores (product_id, store_id, price) VALUES ($1, $2, $3)',
    [productId, store.store_id, store.price]
  );
}

// 3. ПОВЕРНУТИ stores в response (опціонально але краще):
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "stores": [
      {
        "id": "store-uuid",
        "name": "Store Name",
        "price": 123
      }
    ]
  }
}
```

---

## Структура Бази Даних

Переконайся що є таблиця `product_stores`:

```sql
CREATE TABLE IF NOT EXISTS product_stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, store_id)  -- Один продукт не може бути двічі в одному магазині
);
```

---

## Тестування

### 1. Оновити продукт з 2 магазинами:

```bash
curl -X PUT http://localhost:3000/api/admin/products/{productId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Test Product",
    "price": 200,
    "stores": [
      {"store_id": "store-uuid-1", "price": 150},
      {"store_id": "store-uuid-2", "price": 250}
    ]
  }'
```

### 2. Перевірити що stores збережені:

```bash
curl http://localhost:3000/api/items/{productId}/stores
```

**Очікуваний результат:**
```json
{
  "success": true,
  "stores": [
    {
      "id": "store-uuid-1",
      "name": "Store 1",
      "price": 150
    },
    {
      "id": "store-uuid-2", 
      "name": "Store 2",
      "price": 250
    }
  ]
}
```

### 3. Оновити продукт з іншими магазинами:

```bash
# Тепер тільки 1 магазин
curl -X PUT http://localhost:3000/api/admin/products/{productId} \
  -d '{
    "stores": [
      {"store_id": "store-uuid-3", "price": 300}
    ]
  }'
```

### 4. Перевірити що старі видалені:

```bash
curl http://localhost:3000/api/items/{productId}/stores
# Має повернути тільки store-uuid-3
```

---

## Додатково: POST (Create Product)

Те саме для POST `/api/admin/products`:

```javascript
// Приймаєш:
{
  "name": "New Product",
  "stores": [
    {"store_id": "uuid", "price": 123}
  ]
}

// Створюєш product
const product = await createProduct(...);

// Додаєш stores
for (const store of stores) {
  await db.query(
    'INSERT INTO product_stores (product_id, store_id, price) VALUES ($1, $2, $3)',
    [product.id, store.store_id, store.price]
  );
}
```

---

## Перевірка

Після виправлення, в консолі браузера має з'явитися:

```
✅ Found stores: 1 (або більше)
✅ Stores details: [{id, name, price}]
```

Замість:

```
❌ NO STORES FOUND! Backend did not save stores to database!
```

---

## Приклад правильної реалізації (Node.js + PostgreSQL)

```javascript
// PUT /api/admin/products/:id
router.put('/admin/products/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, price, type, color, gender, brand_id, description, image_url, stores } = req.body;

  try {
    // 1. Оновити продукт
    await db.query(
      `UPDATE products 
       SET name = $1, price = $2, type = $3, color = $4, 
           gender = $5, brand_id = $6, description = $7, image_url = $8
       WHERE id = $9`,
      [name, price, type, color, gender, brand_id, description, image_url, id]
    );

    // 2. Видалити старі зв'язки
    await db.query('DELETE FROM product_stores WHERE product_id = $1', [id]);

    // 3. Додати нові stores
    if (stores && stores.length > 0) {
      for (const store of stores) {
        await db.query(
          'INSERT INTO product_stores (product_id, store_id, price) VALUES ($1, $2, $3)',
          [id, store.store_id, store.price]
        );
      }
    }

    // 4. Завантажити оновлені stores для response
    const storesResult = await db.query(
      `SELECT s.id, s.name, ps.price
       FROM product_stores ps
       JOIN stores s ON ps.store_id = s.id
       WHERE ps.product_id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        stores: storesResult.rows
      }
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## ⚠️ ДІАГНОСТИКА: Перевірка Бази Даних

### Перевір що таблиця product_stores існує:

```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'product_stores';
```

Якщо таблиці немає - створи її:

```sql
CREATE TABLE IF NOT EXISTS product_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, store_id)
);

CREATE INDEX idx_product_stores_product_id ON product_stores(product_id);
CREATE INDEX idx_product_stores_store_id ON product_stores(store_id);
```

### Перевір чи є записи для продукту:

```sql
-- Замість '83bcb743-4b52-4c4a-bfa0-a3ab42219f47' підстав свій product_id
SELECT 
  ps.*,
  s.name as store_name,
  p.name as product_name
FROM product_stores ps
LEFT JOIN stores s ON ps.store_id = s.id
LEFT JOIN products p ON ps.product_id = p.id
WHERE ps.product_id = '83bcb743-4b52-4c4a-bfa0-a3ab42219f47';
```

**Якщо результат порожній** - це означає PUT endpoint НЕ записує дані!

### Додай логування в PUT endpoint:

```javascript
router.put('/admin/products/:id', async (req, res) => {
  const { stores } = req.body;
  
  console.log('🔍 PUT /admin/products/:id called');
  console.log('📥 Received stores:', stores);
  console.log('📊 Stores count:', stores?.length || 0);
  
  // ... твій код для оновлення продукту ...
  
  // КРИТИЧНО: Після оновлення продукту треба зберегти stores!
  if (stores && stores.length > 0) {
    console.log('💾 Saving stores to database...');
    
    // 1. Видалити старі
    await db.query('DELETE FROM product_stores WHERE product_id = $1', [id]);
    console.log('🗑️ Old stores deleted');
    
    // 2. Додати нові
    for (const store of stores) {
      await db.query(
        'INSERT INTO product_stores (product_id, store_id, price) VALUES ($1, $2, $3)',
        [id, store.store_id, store.price]
      );
      console.log('✅ Saved store:', store.store_id, 'price:', store.price);
    }
    
    console.log('💾 All stores saved successfully');
  } else {
    console.warn('⚠️ No stores in request body!');
  }
});
```

### Мануальний тест в базі даних:

```sql
-- 1. Знайди product_id та store_id
SELECT id, name FROM products LIMIT 5;
SELECT id, name FROM stores LIMIT 5;

-- 2. Додай запис ВРУЧНУ
INSERT INTO product_stores (product_id, store_id, price)
VALUES (
  '83bcb743-4b52-4c4a-bfa0-a3ab42219f47',  -- твій product_id
  'твій-store-id-тут',                      -- твій store_id
  150.00
);

-- 3. Перевір що запис додався
SELECT * FROM product_stores 
WHERE product_id = '83bcb743-4b52-4c4a-bfa0-a3ab42219f47';
```

Якщо мануальний INSERT працює - значить проблема в коді endpoint.

---

## Підсумок

**ПРОБЛЕМА:** Backend отримує `stores` масив але НЕ зберігає в `product_stores` таблицю.

**РІШЕННЯ:** Додати логіку в PUT endpoint для збереження зв'язків product-store.

**КРИТИЧНО:** Без цього неможливо додавати/редагувати продукти з магазинами!
