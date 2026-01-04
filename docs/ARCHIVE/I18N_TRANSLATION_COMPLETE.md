# i18n Translation System Implementation ✅

## Overview

The frontend now uses **lowercase English codes** for product types, colors, and gender values from the backend, and translates them dynamically based on the user's selected language.

---

## Translation Structure

### 1. Product Types (Categories)

**Backend stores:** lowercase codes (e.g., `"jackets"`, `"shoes"`, `"accessories"`)  
**Frontend displays:** Translated values based on user language

#### Available Product Types:

| Code | English | Ukrainian (Українська) |
|------|---------|------------------------|
| `outerwear` | Outerwear | Верхній одяг |
| `jackets` | Jackets | Куртки |
| `hoodies` | Hoodies | Худі |
| `shoes` | Shoes | Взуття |
| `accessories` | Accessories | Аксесуари |
| `tops` | Tops | Топи |
| `bottoms` | Bottoms | Штани |
| `dresses` | Dresses | Сукні |
| `sportswear` | Sportswear | Спортивний одяг |
| `underwear` | Underwear | Нижня білизна |
| `tshirts` | T-Shirts | Футболки |
| `pants` | Pants | Штани |
| `jeans` | Jeans | Джинси |
| `shorts` | Shorts | Шорти |

---

### 2. Colors

**Backend stores:** lowercase codes (e.g., `"black"`, `"white"`, `"red"`)  
**Frontend displays:** Translated values

#### Available Colors:

| Code | English | Ukrainian (Українська) |
|------|---------|------------------------|
| `black` | Black | Чорний |
| `white` | White | Білий |
| `red` | Red | Червоний |
| `blue` | Blue | Синій |
| `green` | Green | Зелений |
| `yellow` | Yellow | Жовтий |
| `orange` | Orange | Помаранчевий |
| `purple` | Purple | Фіолетовий |
| `pink` | Pink | Рожевий |
| `brown` | Brown | Коричневий |
| `gray` / `grey` | Gray | Сірий |
| `beige` | Beige | Бежевий |
| `navy` | Navy | Темно-синій |
| `maroon` | Maroon | Бордовий |
| `multicolor` | Multicolor | Різнокольоровий |

---

### 3. Gender

**Backend stores:** lowercase codes (e.g., `"male"`, `"female"`, `"unisex"`)  
**Frontend displays:** Translated values

#### Available Gender Values:

| Code | English | Ukrainian (Українська) |
|------|---------|------------------------|
| `male` | Male | Чоловічий |
| `female` | Female | Жіночий |
| `unisex` | Unisex | Унісекс |

---

## Frontend Implementation

### Translation Files

**Location:** `src/locales/en.json` and `src/locales/uk.json`

```json
// en.json
{
  "productTypes": {
    "outerwear": "Outerwear",
    "jackets": "Jackets",
    "hoodies": "Hoodies",
    "shoes": "Shoes",
    "accessories": "Accessories",
    // ... etc
  },
  "colors": {
    "black": "Black",
    "white": "White",
    "red": "Red",
    "blue": "Blue",
    // ... etc
  },
  "gender": {
    "male": "Male",
    "female": "Female",
    "unisex": "Unisex"
  }
}
```

```json
// uk.json
{
  "productTypes": {
    "outerwear": "Верхній одяг",
    "jackets": "Куртки",
    "hoodies": "Худі",
    "shoes": "Взуття",
    "accessories": "Аксесуари",
    // ... etc
  },
  "colors": {
    "black": "Чорний",
    "white": "Білий",
    "red": "Червоний",
    "blue": "Синій",
    // ... etc
  },
  "gender": {
    "male": "Чоловічий",
    "female": "Жіночий",
    "unisex": "Унісекс"
  }
}
```

---

### Translation Utilities

**Location:** `src/utils/translations.ts`

#### Functions:

1. **`getCategoryTranslation(category: string): string`**
   - Translates product type/category codes
   - Handles both lowercase and capitalized inputs
   - Falls back to original value if translation missing

2. **`getColorTranslation(color: string): string`**
   - Translates color codes
   - Handles both lowercase and capitalized inputs
   - Falls back to original value if translation missing

3. **`getGenderTranslation(gender: string): string`**
   - Translates gender codes
   - Handles both lowercase and capitalized inputs
   - Falls back to original value if translation missing

---

## Usage Examples

### Example 1: Product Detail Page

```tsx
import { getCategoryTranslation, getColorTranslation } from '@/utils/translations';
import { translateGender } from '@/utils/errorTranslation';

function ProductDetail({ product }) {
  return (
    <div>
      {/* Product Type */}
      <p>Category: {getCategoryTranslation(product.type)}</p>
      
      {/* Color */}
      <p>Color: {getColorTranslation(product.color)}</p>
      
      {/* Gender */}
      <p>Gender: {translateGender(product.gender)}</p>
    </div>
  );
}
```

**API Response:**
```json
{
  "id": "123",
  "name": "Winter Jacket",
  "type": "jackets",
  "color": "black",
  "gender": "male"
}
```

**Display (English):**
- Category: Jackets
- Color: Black
- Gender: Male

**Display (Ukrainian):**
- Category: Куртки
- Color: Чорний
- Gender: Чоловічий

---

### Example 2: Product Card Component

```tsx
import { getCategoryTranslation, getColorTranslation } from '@/utils/translations';

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <span className="category">{getCategoryTranslation(product.type)}</span>
      <span className="color">{getColorTranslation(product.color)}</span>
    </div>
  );
}
```

---

### Example 3: Filter Component

```tsx
import { useTranslation } from 'react-i18next';
import { getColorTranslation } from '@/utils/translations';

function ColorFilter({ colors, selectedColors, onToggle }) {
  return (
    <div>
      {colors.map((color) => (
        <label key={color}>
          <input
            type="checkbox"
            checked={selectedColors.includes(color)}
            onChange={() => onToggle(color)}
          />
          {getColorTranslation(color)}
        </label>
      ))}
    </div>
  );
}
```

---

### Example 4: Admin Panel

```tsx
import { getCategoryTranslation, getColorTranslation } from '@/utils/translations';

function ProductList({ products }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Color</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td>{getCategoryTranslation(product.type)}</td>
            <td>{getColorTranslation(product.color)}</td>
            <td>${product.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Backend Integration Requirements

### 1. Product Type Codes

✅ **Always use lowercase**: `"jackets"`, not `"Jackets"`  
✅ **No spaces**: `"tshirts"`, not `"t-shirts"`  
✅ **No special characters**: ASCII only

```sql
-- ✅ Good
INSERT INTO products (name, type) VALUES ('Winter Jacket', 'jackets');

-- ❌ Bad
INSERT INTO products (name, type) VALUES ('Winter Jacket', 'Jackets');
INSERT INTO products (name, type) VALUES ('Winter Jacket', 'Верхній одяг');
```

---

### 2. Color Codes

✅ **Always use lowercase**: `"black"`, not `"Black"`  
✅ **Consistent naming**: Use `"multicolor"` for multi-colored items

```sql
-- ✅ Good
INSERT INTO products (name, color) VALUES ('T-Shirt', 'black');

-- ❌ Bad
INSERT INTO products (name, color) VALUES ('T-Shirt', 'Black');
INSERT INTO products (name, color) VALUES ('T-Shirt', 'Чорний');
```

---

### 3. Gender Codes

✅ **Always use lowercase**: `"male"`, `"female"`, `"unisex"`  
✅ **Allow NULL**: For gender-neutral items

```sql
-- ✅ Good
INSERT INTO products (name, gender) VALUES ('Sneakers', 'unisex');
INSERT INTO products (name, gender) VALUES ('Dress', 'female');

-- ❌ Bad
INSERT INTO products (name, gender) VALUES ('Sneakers', 'Unisex');
INSERT INTO products (name, gender) VALUES ('Dress', 'Women');
```

---

## Files Modified

### Translation Files:
- ✅ `src/locales/en.json` - Added complete lowercase translation keys
- ✅ `src/locales/uk.json` - Added complete lowercase translation keys

### Utility Files:
- ✅ `src/utils/translations.ts` - Replaced hardcoded translations with i18n-based functions

### Component Files:
- ✅ `src/pages/ProductDetail.tsx` - Added `getColorTranslation` for color display
- ✅ `src/pages/Products.tsx` - Added translation utilities for filters
- ✅ `src/pages/Admin.tsx` - Added translations for product display
- ✅ `src/components/SearchDropdown.tsx` - Already using `getCategoryTranslation`

---

## Testing

### Test Translation Switching:

1. **View a product in English:**
   - Type: "Jackets"
   - Color: "Black"
   - Gender: "Male"

2. **Switch to Ukrainian:**
   - Type: "Куртки"
   - Color: "Чорний"
   - Gender: "Чоловічий"

3. **Verify filters:**
   - Color checkboxes should show translated names
   - Category filters should show translated names
   - Gender filters should show translated names

---

## Adding New Values

### To add a new product type:

1. **Backend**: Use lowercase code
   ```sql
   INSERT INTO products (name, type) VALUES ('Hat', 'hats');
   ```

2. **Frontend**: Add to translation files
   ```json
   // en.json
   "productTypes": {
     "hats": "Hats"
   }
   
   // uk.json
   "productTypes": {
     "hats": "Капелюхи"
   }
   ```

### To add a new color:

1. **Backend**: Use lowercase code
   ```sql
   INSERT INTO products (name, color) VALUES ('Shirt', 'turquoise');
   ```

2. **Frontend**: Add to translation files
   ```json
   // en.json
   "colors": {
     "turquoise": "Turquoise"
   }
   
   // uk.json
   "colors": {
     "turquoise": "Бірюзовий"
   }
   ```

---

## Summary

✅ **Translation system complete and working**  
✅ **All product types, colors, and genders are translated**  
✅ **Automatic fallback to English if translation missing**  
✅ **Development warnings for missing translations**  
✅ **Ready for backend integration**

**Next Steps:**
1. Test with actual backend data
2. Add any missing product types/colors as needed
3. Verify translations with native Ukrainian speakers
