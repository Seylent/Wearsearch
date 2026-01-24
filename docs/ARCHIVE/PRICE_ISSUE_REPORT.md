# Проблема з цінами на картках продуктів

## Опис проблеми

На різних сторінках один і той же продукт показує різні ціни:

- **Сторінка продукту** (`/product/{id}`): $98.77 (мінімальна ціна з магазинів)
- **Картка продукту** на сторінці Products: $229.73 (з `product.price`)

## Причина

### Сторінка ProductDetail
На сторінці окремого продукту ціна береться з масиву stores:
```typescript
const priceRange = useMemo(() => {
  if (stores.length === 0) return null;
  
  const prices = stores.map(s => s.price).filter(p => p != null);
  if (prices.length === 0) return null;
  
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}, [stores, formatPrice]);
```

### Сторінка Products (список продуктів)
На сторінці списку продуктів дані приходять з ендпоінту `/pages/products`, який повертає:
```json
{
  "items": [
    {
      "id": "...",
      "name": "Mertra",
      "price": 229.73,  // ← Ця ціна НЕ мінімальна ціна з магазинів!
      ...
    }
  ]
}
```

## Рішення

### Варіант 1: Бекенд повертає мінімальну ціну (РЕКОМЕНДОВАНО)

Бекенд повинен в ендпоінті `/pages/products` для кожного продукту повертати `min_price` - мінімальну ціну з усіх магазинів, де доступний цей продукт:

```json
{
  "items": [
    {
      "id": "666338b-ef63-45ab-bcd4-27b96c2333a",
      "name": "Mertra",
      "price": 229.73,           // Оригінальна ціна (можна залишити)
      "min_price": 98.77,        // ← ДОДАТИ: мінімальна ціна з магазинів
      "max_price": 350.00,       // ← ДОДАТИ: максимальна ціна (опціонально)
      "store_count": 5,          // ← ДОДАТИ: кількість магазинів (опціонально)
      ...
    }
  ]
}
```

**SQL запит для бекенду:**
```sql
SELECT 
  p.*,
  MIN(ps.price) as min_price,
  MAX(ps.price) as max_price,
  COUNT(DISTINCT ps.store_id) as store_count
FROM products p
LEFT JOIN product_stores ps ON p.id = ps.product_id
WHERE ps.price IS NOT NULL
GROUP BY p.id
```

### Варіант 2: Фронтенд робить додатковий запит (НЕ РЕКОМЕНДОВАНО)

Для кожного продукту на сторінці Products робити окремий запит до `/items/{id}/stores` - це призведе до N+1 проблеми та погіршення перфомансу.

### Варіант 3: Використовувати `product.price` як є

Якщо бекенд не може змінити API, можна залишити як є, але це вводить користувачів в оману - на картці показується одна ціна, а на сторінці продукту - інша.

## Рекомендації для фронтенду

Після того, як бекенд додасть `min_price`, оновити ProductCard:

```typescript
// src/components/ProductCard.tsx
interface ProductCardProps {
  id: number | string;
  name: string;
  image?: string;
  price?: string | number;
  minPrice?: string | number;  // ← Додати
  category?: string;
  brand?: string;
  isNew?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ 
  id, name, image, price, minPrice, category, brand, isNew 
}) => {
  // Використовувати min_price якщо доступна, інакше price
  const displayPrice = minPrice ?? price;
  
  return (
    // ... render
    <p className="font-display text-sm sm:text-base font-bold text-white">
      {t('common.from')} {formatPrice(displayPrice || 0)}
    </p>
  );
});
```

## Приклад використання (після змін бекенду)

```tsx
// src/pages/Products.tsx
{products.map((product: Product) => (
  <ProductCard
    key={product.id}
    id={product.id}
    name={product.name}
    image={product.image_url || product.image}
    minPrice={product.min_price}  // ← Використовувати min_price
    price={product.price}          // Fallback
    category={product.type}
    brand={product.brand}
  />
))}
```

## Поточний статус

- ✅ **ВИРІШЕНО**: Бекенд додав `min_price`, `max_price`, `store_count` до ендпоінту `/pages/products`
- ✅ **ВИРІШЕНО**: Фронтенд оновлено для використання `min_price`
- ✅ **ВИРІШЕНО**: Ціни тепер однакові на всіх сторінках
- ✅ Додано відображення діапазону цін (якщо min_price ≠ max_price)
- ✅ Додано відображення кількості магазинів

## Що було зроблено

### Backend
- Додано поля `min_price`, `max_price`, `store_count` до відповіді `/pages/products`
- Поля обчислюються на основі даних з `product_stores` таблиці

### Frontend
1. **Оновлено тип Product** (`src/types/index.ts`):
   ```typescript
   export interface Product {
     // ... існуючі поля
     min_price?: number | string;  // Minimum price across all stores
     max_price?: number | string;  // Maximum price across all stores
     store_count?: number;         // Number of stores selling this product
   }
   ```

2. **Оновлено ProductCard** (`src/components/ProductCard.tsx`):
   - Додано пропси `minPrice`, `maxPrice`, `storeCount`
   - Використовується `min_price` замість `price` для відображення
   - Показується діапазон цін, якщо min ≠ max
   - Показується кількість магазинів

3. **Оновлено використання ProductCard**:
   - `src/pages/Products.tsx` - передає нові поля
   - `src/pages/Index.tsx` - передає нові поля

4. **Переклади** (`src/locales/*.json`):
   - Використовується існуючий переклад `quickView.availableIn`

## Наступні кроки

- ✅ **ЗАВЕРШЕНО**: Backend додав поля `min_price`, `max_price`, `store_count`
- ✅ **ЗАВЕРШЕНО**: Frontend оновлено для використання нових полів
- ✅ **ЗАВЕРШЕНО**: Тестування пройдено - білд успішний

## Приклад результату

На картці продукту тепер показується:
- Якщо `min_price === max_price`: "від 98.77₴"
- Якщо `min_price !== max_price`: "98.77₴ - 350.00₴"
- Під ціною: "Доступно в 5 магазинах" (якщо store_count > 0)
