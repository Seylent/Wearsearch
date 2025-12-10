# Quick Fix: GET /api/items/:id/stores Endpoint

## Problem
Frontend is calling `GET /api/items/${id}/stores` but backend is returning empty or no stores data.

## Required Endpoint

```http
GET /api/items/:id/stores
```

## Backend Implementation (Node.js + Supabase)

```typescript
// In src/routes/items.ts or products.ts

router.get('/:id/stores', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Query to get all stores for this product with prices
    const { data, error } = await supabase
      .from('product_stores')
      .select(`
        price,
        stores (
          id,
          name,
          logo_url,
          telegram_url,
          instagram_url,
          rating,
          is_verified,
          shipping_info
        )
      `)
      .eq('product_id', id);

    if (error) throw error;

    // Transform the data to match frontend expectations
    const stores = data?.map(item => ({
      id: item.stores.id,
      name: item.stores.name,
      logo_url: item.stores.logo_url,
      price: item.price,  // From product_stores junction table
      telegram_url: item.stores.telegram_url,
      instagram_url: item.stores.instagram_url,
      average_rating: item.stores.rating || 0,
      total_ratings: 0,  // Add if you track this
      is_verified: item.stores.is_verified || false,
      shipping_info: item.stores.shipping_info
    })) || [];

    res.json({
      success: true,
      stores
    });

  } catch (error: any) {
    console.error('Error fetching product stores:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stores: []
    });
  }
});
```

## Alternative: Raw SQL Query

If using raw SQL instead of Supabase query builder:

```sql
SELECT 
  s.id,
  s.name,
  s.logo_url,
  ps.price,
  s.telegram_url,
  s.instagram_url,
  COALESCE(s.rating, 0) as average_rating,
  0 as total_ratings,
  COALESCE(s.is_verified, false) as is_verified,
  s.shipping_info
FROM product_stores ps
INNER JOIN stores s ON ps.store_id = s.id
WHERE ps.product_id = $1
ORDER BY s.name;
```

## Expected Response Format

```json
{
  "success": true,
  "stores": [
    {
      "id": "uuid-store-1",
      "name": "Cool Store",
      "logo_url": "https://...",
      "price": 150.00,
      "telegram_url": "https://t.me/coolstore",
      "instagram_url": "https://instagram.com/coolstore",
      "average_rating": 4.5,
      "total_ratings": 0,
      "is_verified": true,
      "shipping_info": "Fast delivery"
    }
  ]
}
```

## Key Points

1. **Price comes from `product_stores` table** - each store can have different price for same product
2. **logo_url must exist in stores table** - add it if missing:
   ```sql
   ALTER TABLE stores ADD COLUMN logo_url TEXT;
   ```
3. **average_rating** is stored as `rating` in stores table
4. **is_verified** shows verified badge on frontend

## Testing

After implementing:
```bash
curl http://localhost:3000/api/items/YOUR_PRODUCT_ID/stores
```

Should return array of stores with prices!

