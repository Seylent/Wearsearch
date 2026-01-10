# Backend Implementation Required for Store-Product Size Management

## Overview
Frontend has been updated to support size management when adding stores to products. The following backend changes are required to fully implement this feature.

## Database Changes

### 1. Update `product_stores` table
Add a `sizes` column to store available sizes for each store-product relationship:

```sql
ALTER TABLE product_stores 
ADD COLUMN sizes JSON DEFAULT NULL;

-- Alternative for PostgreSQL:
ALTER TABLE product_stores 
ADD COLUMN sizes JSONB DEFAULT NULL;

-- Example data structure:
-- sizes: ["S", "M", "L", "XL"] or ["38", "39", "40", "41", "42"]
```

## API Endpoints Updates

### 1. Create Product Endpoint
**Endpoint:** `POST /api/products`

Update request body to include sizes in stores array:
```json
{
  "name": "Example Product",
  "price": 99.99,
  "category": "shoes",
  "color": "black",
  "gender": "unisex",
  "brand_id": "brand123",
  "description": "Product description",
  "image_url": "https://example.com/image.jpg",
  "stores": [
    {
      "store_id": "store123",
      "price": 99.99,
      "sizes": ["S", "M", "L", "XL"]
    },
    {
      "store_id": "store456", 
      "price": 105.99,
      "sizes": ["38", "39", "40", "41", "42"]
    }
  ]
}
```

### 2. Update Product Endpoint
**Endpoint:** `PUT /api/products/{id}`

Same structure as create endpoint - include sizes in stores array.

### 3. Get Product Stores Endpoint
**Endpoint:** `GET /api/products/{id}/stores`

Update response to include sizes:
```json
{
  "items": [
    {
      "store_id": "store123",
      "store_name": "Example Store",
      "price": 99.99,
      "sizes": ["S", "M", "L", "XL"],
      "stores": {
        "id": "store123",
        "name": "Example Store"
      }
    }
  ]
}
```

### 4. Get Product by ID Endpoint
**Endpoint:** `GET /api/products/{id}`

Include sizes in product_stores array in response:
```json
{
  "item": {
    "id": "product123",
    "name": "Example Product",
    "price": 99.99,
    // ... other fields
    "product_stores": [
      {
        "store_id": "store123",
        "store_name": "Example Store",
        "price": 99.99,
        "sizes": ["S", "M", "L", "XL"]
      }
    ]
  }
}
```

## Backend Logic Updates

### 1. Product Creation
When creating a product with stores, save the sizes array to the database:

```python
# Example Python/Django logic
for store_data in request.data.get('stores', []):
    ProductStore.objects.create(
        product=product,
        store_id=store_data['store_id'],
        price=store_data['price'],
        sizes=store_data.get('sizes', [])  # Save sizes array
    )
```

### 2. Product Update
When updating product stores:
- Allow updating existing store prices AND sizes
- Allow adding new stores with sizes
- Allow removing stores

### 3. Data Validation
Add validation for sizes field:
- Must be an array of strings
- Each size should be a non-empty string
- Optional field (can be empty array or null)

## Example Implementation (Django Models)

```python
from django.db import models
from django.contrib.postgres.fields import JSONField  # or ArrayField

class ProductStore(models.Model):
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    store = models.ForeignKey('Store', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sizes = JSONField(default=list, blank=True)  # Store array of size strings
    
    class Meta:
        unique_together = ['product', 'store']
```

## Migration Considerations

1. **Backward Compatibility**: Existing records will have `sizes` as NULL/empty array
2. **Default Values**: Set empty array `[]` as default for new records
3. **Data Migration**: Optionally migrate existing size data if it exists elsewhere

## Frontend Integration Notes

The frontend now sends and expects:
- `sizes` field in store objects when creating/updating products
- `sizes` array in responses when fetching product data
- Empty array `[]` for stores without specific sizes
- Individual size management in edit mode

## Testing Checklist

- [ ] Create product with stores including sizes
- [ ] Update product store prices and sizes
- [ ] Add new store with sizes to existing product
- [ ] Remove store from product
- [ ] Edit sizes for existing store-product relationship
- [ ] Handle empty sizes array gracefully
- [ ] Validate sizes data type and format
- [ ] Test backward compatibility with existing data

## Error Handling

Add appropriate error messages for:
- Invalid sizes format (not array)
- Invalid size values (empty strings, etc.)
- Size validation failures
- Store-product relationship conflicts