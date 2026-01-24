# 🧪 Integration Testing Guide

**Дата:** 5 січня 2026  
**Статус:** Backend Ready - Integration Testing Phase

---

## ✅ Backend Implementation Complete!

Всі необхідні endpoints та database migrations реалізовані. Тепер потрібно протестувати інтеграцію frontend + backend.

---

## 🎯 Testing Checklist

### Phase 1: Critical Bugs (Must Pass) 🚨

#### 1. Image Upload Field Name
```bash
Test: Upload product image
Expected: Image uploads successfully
Backend: multer accepts 'image' field

Steps:
1. Go to Admin → Add Product
2. Click "Upload Image" 
3. Select image file
4. Should see upload progress
5. Image URL appears in form
✅ PASS if image uploads
❌ FAIL if "Unexpected field" error
```

#### 2. Multiple Stores - No Duplicates
```bash
Test: Create product with 2+ stores
Expected: ONE product with multiple stores
Backend: Transaction creates 1 item + N store_prices

Steps:
1. Fill product form (name, price, etc)
2. Add Store 1 with price $150
3. Add Store 2 with price $145
4. Click "Create Product"
5. Check database/API

✅ PASS if:
  - ONE product created
  - TWO store_prices entries
  - Product ID same for both stores

❌ FAIL if:
  - TWO separate products created
```

---

### Phase 2: Export/Import (Core Feature) 📦

#### 3. Export CSV
```bash
Test: Export products to CSV
Endpoint: GET /api/v1/items/export?format=csv

Steps:
1. Go to Admin → Manage Products
2. Apply filters (e.g., category=sneakers)
3. Click "Export CSV (X)"
4. File downloads

✅ PASS if:
  - CSV file downloads
  - Contains all filtered products
  - Stores formatted as "Store1:150; Store2:145"
  - Opens correctly in Excel

Test Data:
Expected columns: ID,Name,Category,Brand,Price,Color,Gender,Description,Image URL,Stores
```

#### 4. Import CSV
```bash
Test: Import products from CSV
Endpoint: POST /api/v1/items/import

Steps:
1. Download template or export existing
2. Edit CSV (change prices, add products)
3. Click "Import CSV"
4. Select edited file
5. Wait for validation

✅ PASS if:
  - Valid rows imported
  - Invalid rows skipped with error report
  - Brands matched by name
  - Stores matched by name
  - Success toast shows count

Test Cases:
- Valid product (all fields) → should import
- Missing name → should skip
- Invalid price → should skip
- Unknown brand → should skip or create?
- Unknown store → should skip
```

---

### Phase 3: Templates (Productivity) 📝

#### 5. Save Template
```bash
Test: Save product as template
Endpoint: POST /api/v1/templates

Steps:
1. Fill product form (category, brand, gender, etc)
2. Click "Save as Template"
3. Enter name: "Nike Sneaker Base"
4. Template saved

✅ PASS if:
  - Template appears in list
  - Contains correct data
  - Persists after page reload

Backend Check:
- Template in database
- JSONB data correct
```

#### 6. Load Template
```bash
Test: Load template into form
Endpoint: GET /api/v1/templates

Steps:
1. Start creating new product
2. Click "Show Templates"
3. Click template name
4. Form auto-fills

✅ PASS if:
  - Category auto-filled
  - Brand auto-filled
  - Gender auto-filled
  - Color auto-filled
  - Description auto-filled
  - Name/price/image NOT filled (correct)
```

---

### Phase 4: Stock Management (Inventory) 📦

#### 7. View Stock
```bash
Test: Get stock levels
Endpoint: GET /api/v1/items/:id/stock

Steps:
1. Go to Manage Products
2. Click 📦 icon on product card
3. Stock panel opens

✅ PASS if:
  - Shows all stores for product
  - Shows current stock numbers
  - Shows price per store
```

#### 8. Update Stock
```bash
Test: Update stock quantity
Endpoint: PUT /api/v1/items/:id/stores/:storeId/stock

Steps:
1. Open stock panel
2. Enter stock number (e.g., 25)
3. Auto-saves

✅ PASS if:
  - Stock updates in database
  - Low stock warning appears (< 10)
  - Out of stock indicator appears (0)
  - Persists after page reload

Test Cases:
- Stock = 25 → No warning
- Stock = 5 → ⚠️ Low stock (orange)
- Stock = 0 → ❌ Out of stock (red)
```

---

### Phase 5: Multiple Images (Visual) 🖼️

#### 9. Upload Multiple Images
```bash
Test: Upload multiple images
Endpoint: POST /api/v1/items/:id/images

Steps:
1. Create/edit product
2. Click "Enable Multi-Image"
3. Add 3 image URLs
4. Click star to set primary
5. Save product

✅ PASS if:
  - All 3 images saved to database
  - Primary image flagged correctly
  - Images display in grid
  - Primary has gold star badge

Backend Check:
- product_images table has 3 rows
- is_primary = true for 1 image
- display_order correct
```

#### 10. Delete Image
```bash
Test: Delete individual image
Endpoint: DELETE /api/v1/items/:id/images/:imageId

Steps:
1. Open product with multiple images
2. Click X on one image
3. Confirm delete

✅ PASS if:
  - Image removed from UI
  - Deleted from database
  - Other images remain
  - If primary deleted, new primary auto-selected
```

---

### Phase 6: Scheduled Publishing (Automation) ⏰

#### 11. Schedule Product
```bash
Test: Schedule product publish date
Endpoint: POST /api/v1/items/:id/schedule

Steps:
1. Create product
2. Set Status: Draft
3. Set "Publish At": Tomorrow 10:00 AM
4. Save product

✅ PASS if:
  - Product saved as draft
  - publish_at date saved in database
  - Product NOT visible on frontend
  - Shows in "Scheduled Products" list

Backend:
- items.status = 'draft'
- items.publish_at = future date
```

#### 12. Cron Job Auto-Publish
```bash
Test: Automatic publishing
Cron Job: Runs every minute

Steps:
1. Create scheduled product (publish in 2 min)
2. Wait 3 minutes
3. Check product status

✅ PASS if:
  - Status changed to 'published' automatically
  - Product NOW visible on frontend
  - Cron job logs show execution

Check Logs:
- Cron job ran at correct time
- Product status updated
- No errors
```

---

### Phase 7: Advanced Features (Nice to Have) 🚀

#### 13. Bulk Delete
```bash
Test: Delete multiple products
Endpoint: DELETE /api/v1/items/batch

Steps:
1. Click "Select" mode
2. Check 3 products
3. Click "Delete (3)"
4. Confirm

✅ PASS if:
  - All 3 products deleted
  - Database cascade deletes (stores, images)
  - Success toast shows count
```

#### 14. Filter Presets
```bash
Test: Save and load filter preset
Storage: Backend database (if implemented) or localStorage

Steps:
1. Apply multiple filters
2. Click "Save Preset" → "Affordable Nike"
3. Clear filters
4. Load "Affordable Nike" preset

✅ PASS if:
  - Filters restore correctly
  - Preset persists after logout
  - Multiple presets supported
```

---

## 🔍 API Testing (Postman/Insomnia)

### Test All Endpoints:

```bash
# Export
GET /api/v1/items/export?format=csv
GET /api/v1/items/export?format=json

# Import  
POST /api/v1/items/import
Content-Type: multipart/form-data
Body: file=products.csv

# Templates
GET /api/v1/templates
POST /api/v1/templates
DELETE /api/v1/templates/:id

# Stock
GET /api/v1/items/:id/stock
PUT /api/v1/items/:id/stores/:storeId/stock

# Multiple Images
POST /api/v1/items/:id/images (multipart)
PUT /api/v1/items/:id/images/reorder
DELETE /api/v1/items/:id/images/:imageId

# Scheduled Publishing
POST /api/v1/items/:id/schedule
GET /api/v1/items/scheduled

# Batch Operations
DELETE /api/v1/items/batch
POST /api/v1/items/batch-update
```

---

## 📊 Performance Testing

### 1. Large Dataset
```bash
Test: Import 1000 products
Expected: < 10 seconds
Monitor: Memory usage, database connections

✅ PASS if completes without timeout
```

### 2. Concurrent Users
```bash
Test: 10 users editing products simultaneously
Expected: No conflicts, no data loss

✅ PASS if all edits save correctly
```

### 3. Caching
```bash
Test: API response time
GET /api/v1/items (no cache) → ~500ms
GET /api/v1/items (cached) → ~50ms

✅ PASS if Redis cache working
```

---

## 🔒 Security Testing

### 1. Authentication
```bash
Test: Access admin endpoints without token
Expected: 401 Unauthorized

✅ PASS if requires authentication
```

### 2. Authorization
```bash
Test: Regular user tries admin action
Expected: 403 Forbidden

✅ PASS if role check works
```

### 3. Rate Limiting
```bash
Test: 200 requests in 1 minute
Expected: 429 Too Many Requests after limit

✅ PASS if rate limiter active
```

### 4. SQL Injection
```bash
Test: Import CSV with SQL injection attempt
File: "; DROP TABLE items; --"

✅ PASS if parametrized queries prevent injection
```

### 5. XSS Prevention
```bash
Test: Product name with <script> tag
Expected: Escaped/sanitized

✅ PASS if no script execution
```

---

## 🐛 Known Issues Checklist

Before deploying, verify these were fixed:

- [x] Image upload field name = 'image'
- [x] Multiple stores create ONE product
- [ ] CSV import handles large files (1000+ rows)
- [ ] Stock updates don't cause race conditions
- [ ] Scheduled publishing cron job is set up
- [ ] Multiple images CASCADE DELETE on product delete
- [ ] Templates don't expose sensitive data
- [ ] Filter presets have reasonable size limit

---

## 📝 Test Results Template

```markdown
## Test Run: [Date]

### Critical Features:
- [ ] Image Upload: ✅ / ❌
- [ ] Multiple Stores: ✅ / ❌

### Export/Import:
- [ ] Export CSV: ✅ / ❌
- [ ] Import CSV: ✅ / ❌

### Templates:
- [ ] Save Template: ✅ / ❌
- [ ] Load Template: ✅ / ❌

### Stock Management:
- [ ] View Stock: ✅ / ❌
- [ ] Update Stock: ✅ / ❌

### Multiple Images:
- [ ] Upload Images: ✅ / ❌
- [ ] Delete Image: ✅ / ❌

### Scheduled Publishing:
- [ ] Schedule Product: ✅ / ❌
- [ ] Cron Auto-Publish: ✅ / ❌

### Notes:
- Issues found: [list]
- Performance: [notes]
- Security: [notes]

Tested by: [Name]
Environment: [Dev/Staging/Prod]
```

---

## 🚀 Deployment Checklist

Before going to production:

- [ ] All tests passed
- [ ] Database migrations run
- [ ] Cron job configured
- [ ] Redis cache configured
- [ ] Environment variables set
- [ ] Backup strategy in place
- [ ] Rollback plan ready
- [ ] Monitoring alerts set
- [ ] Load testing passed
- [ ] Security audit passed

---

## 📞 Support

If tests fail:
1. Check API logs
2. Check database state
3. Check frontend console
4. Review endpoint documentation
5. Contact developers

**All documentation in:** `docs/BACKEND_REQUIRED_CHANGES.md`

---

**Next Step:** Run all tests and deploy! 🎉
