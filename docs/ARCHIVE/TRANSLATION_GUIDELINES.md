# Translation Guidelines for Wearsearch

This document defines **strict rules** for managing translation keys across the Wearsearch application to ensure consistency, maintainability, and prevent duplication.

---

## Table of Contents

1. [Key Naming Convention](#key-naming-convention)
2. [Namespace Structure](#namespace-structure)
3. [Rules and Enforcement](#rules-and-enforcement)
4. [Examples](#examples)
5. [Common Mistakes](#common-mistakes)
6. [Review Checklist](#review-checklist)

---

## Key Naming Convention

### General Rules

1. **camelCase**: All keys must use camelCase
   - ✅ `productTitle`, `addToCart`, `searchPlaceholder`
   - ❌ `product-title`, `add_to_cart`, `SearchPlaceholder`

2. **Descriptive**: Keys should clearly describe the content
   - ✅ `products.noProductsFound`
   - ❌ `products.text1`, `products.msg`

3. **No Abbreviations**: Avoid unclear abbreviations
   - ✅ `navigation.signOut`, `products.description`
   - ❌ `nav.out`, `prod.desc`

4. **Consistent Verbs**: Use standard verbs across the app
   - Create, Add, Edit, Update, Delete, Remove
   - View, Show, Display
   - Search, Find, Filter, Sort
   - Save, Submit, Cancel, Close

5. **Pluralization**: Be explicit with singular/plural
   - ✅ `product`, `products`, `productCount`
   - ❌ `product` (used for both singular and plural)

### Naming Pattern

```
{namespace}.{feature}.{element}.{state}
```

- **namespace**: Top-level section (nav, home, products, etc.)
- **feature**: Specific feature or component
- **element**: UI element type (button, title, label, etc.)
- **state**: Optional state indicator (loading, error, success)

---

## Namespace Structure

### Current Namespaces

```typescript
{
  "nav": {},          // Navigation menu, header links
  "home": {},         // Homepage content
  "products": {},     // Products page and product cards
  "stores": {},       // Stores page and store cards
  "auth": {},         // Authentication (login, signup, etc.)
  "profile": {},      // User profile page
  "admin": {},        // Admin panel
  "favorites": {},    // Favorites/saved items
  "common": {},       // Common UI elements (buttons, labels, messages)
  "errors": {},       // Error messages
  "footer": {}        // Footer content
}
```

### Namespace Rules

1. **One namespace per major section**: Don't mix concerns
   - ✅ `products.filterByColor`, `stores.filterByLocation`
   - ❌ `common.productsFilterByColor`

2. **Common namespace**: Only for truly reusable elements
   - Buttons: save, cancel, delete, edit, back
   - States: loading, error, success
   - Actions: search, close, open

3. **Shared components**: If a component is used in multiple places, choose the most relevant namespace
   - FavoriteButton → `products.save`, `products.saved`
   - Not `common.save` unless truly generic

---

## Rules and Enforcement

### Rule 1: No Duplicate Keys

❌ **Bad:**
```json
{
  "products": {
    "save": "Save",
    "saveButton": "Save"  // Duplicate!
  }
}
```

✅ **Good:**
```json
{
  "products": {
    "save": "Save"  // Single source of truth
  }
}
```

### Rule 2: Consistent Action Naming

Use the same verb pattern across all namespaces:

```json
{
  "products": {
    "addToCart": "Add to Cart",
    "editProduct": "Edit Product",
    "deleteProduct": "Delete Product"
  },
  "stores": {
    "addStore": "Add Store",       // Same pattern: verb + noun
    "editStore": "Edit Store",
    "deleteStore": "Delete Store"
  }
}
```

### Rule 3: Group Related Keys

✅ **Good:** Related keys are grouped together
```json
{
  "products": {
    "filter": "Filter",
    "filterByColor": "Filter by Color",
    "filterByCategory": "Filter by Category",
    "filterByBrand": "Filter by Brand",
    "clearFilters": "Clear Filters"
  }
}
```

❌ **Bad:** Related keys scattered
```json
{
  "products": {
    "filter": "Filter",
    "color": "Color",  // Should be filterByColor
    "removeFilters": "Remove Filters",  // Inconsistent verb
    "brandFilter": "Brand"  // Inconsistent pattern
  }
}
```

### Rule 4: State Indicators

Use consistent suffixes for states:

```json
{
  "products": {
    "loading": "Loading products...",
    "error": "Failed to load products",
    "noProducts": "No products found",
    "success": "Products loaded successfully"
  }
}
```

### Rule 5: Color Names

All colors should be in `products` namespace:

```json
{
  "products": {
    "black": "Black",
    "white": "White",
    "red": "Red",
    "blue": "Blue"
    // ... etc
  }
}
```

### Rule 6: Category Names

All categories should be in `products` namespace:

```json
{
  "products": {
    "jackets": "Jackets",
    "hoodies": "Hoodies",
    "tshirts": "T-shirts",
    "pants": "Pants"
    // ... etc
  }
}
```

---

## Examples

### Navigation

```json
{
  "nav": {
    "allItems": "All Items",
    "stores": "Stores",
    "about": "About",
    "favorites": "Favorites",
    "profile": "Profile",
    "signIn": "Sign In",
    "signOut": "Sign Out"
  }
}
```

### Products Page

```json
{
  "products": {
    "title": "All Products",
    "searchPlaceholder": "Search products...",
    "filter": "Filter",
    "sort": "Sort",
    "sortByName": "Name",
    "sortByPriceAsc": "Price: Low to High",
    "sortByPriceDesc": "Price: High to Low",
    "category": "Category",
    "allCategories": "All Categories",
    "color": "Color",
    "gender": "Gender",
    "brand": "Brand",
    "addToCart": "Add to Cart",
    "viewDetails": "View Details",
    "save": "Save",
    "saved": "Saved",
    "editProduct": "Edit Product",
    "deleteProduct": "Delete Product",
    "noProducts": "No products found",
    "loading": "Loading products...",
    "error": "Failed to load products"
  }
}
```

### Common Elements

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "back": "Back",
    "close": "Close",
    "search": "Search",
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success!",
    "confirm": "Confirm",
    "yes": "Yes",
    "no": "No"
  }
}
```

### Error Messages

```json
{
  "errors": {
    "networkError": "Network connection failed",
    "unauthorized": "You are not authorized",
    "notFound": "Page not found",
    "serverError": "Server error occurred",
    "validationError": "Please check your input",
    "requiredField": "This field is required",
    "invalidEmail": "Invalid email address",
    "passwordTooShort": "Password must be at least 8 characters"
  }
}
```

---

## Common Mistakes

### ❌ Mistake 1: Using Generic Keys

```json
{
  "products": {
    "text1": "Search products",  // Too generic
    "button": "Click here"       // What does it do?
  }
}
```

✅ **Fix:**
```json
{
  "products": {
    "searchPlaceholder": "Search products",
    "addToCartButton": "Add to Cart"
  }
}
```

### ❌ Mistake 2: Mixing Languages in Keys

```json
{
  "products": {
    "chernyy": "Black",  // Ukrainian key name
    "біла": "White"      // Ukrainian key name
  }
}
```

✅ **Fix:**
```json
{
  "products": {
    "black": "Black",
    "white": "White"
  }
}
```

### ❌ Mistake 3: Inconsistent Patterns

```json
{
  "stores": {
    "add": "Add Store",         // Verb only
    "storeEdit": "Edit Store",  // Noun + verb
    "deleteStore": "Delete"     // Verb + noun but value missing noun
  }
}
```

✅ **Fix:**
```json
{
  "stores": {
    "addStore": "Add Store",
    "editStore": "Edit Store",
    "deleteStore": "Delete Store"
  }
}
```

### ❌ Mistake 4: Hardcoded Text in Components

```tsx
// ❌ Bad
<button>Save</button>
<h1>Products</h1>

// ✅ Good
<button>{t('products.save')}</button>
<h1>{t('products.title')}</h1>
```

---

## Review Checklist

Before adding new translations, verify:

- [ ] **Keys use camelCase**
- [ ] **Key name is descriptive and clear**
- [ ] **No duplicate keys exist**
- [ ] **Correct namespace is used**
- [ ] **Related keys are grouped together**
- [ ] **Both English and Ukrainian translations are added**
- [ ] **Translations are accurate and contextually appropriate**
- [ ] **No hardcoded text remains in components**
- [ ] **Follows existing verb patterns (add, edit, delete, etc.)**
- [ ] **State indicators use consistent suffixes (loading, error, success)**

---

## Adding New Translations

### Step-by-Step Process

1. **Identify the namespace**: Which section does this belong to?
   - Navigation? → `nav`
   - Product page? → `products`
   - Common UI element? → `common`

2. **Choose a descriptive key**: Follow camelCase and be specific
   - `products.addToCart` not `products.add`

3. **Check for existing keys**: Search both en.json and uk.json
   - Avoid duplicates: reuse existing keys when possible

4. **Add to both files**: Always add to en.json AND uk.json simultaneously
   ```json
   // en.json
   "newFeatureTitle": "New Feature"
   
   // uk.json
   "newFeatureTitle": "Нова функція"
   ```

5. **Update component**: Replace hardcoded text with `t('namespace.key')`
   ```tsx
   {t('products.newFeatureTitle')}
   ```

6. **Test both languages**: Switch languages and verify translations appear correctly

---

## Maintenance

### Regular Audits

Perform quarterly audits to:
- Remove unused keys
- Consolidate duplicate keys
- Standardize naming patterns
- Update outdated translations

### Git Commit Messages

When adding translations:
```
feat(i18n): add product filter translations

- Added filter-related keys to products namespace
- Translations for en and uk locales
- Follows camelCase naming convention
```

---

## Tools and Validation

### Recommended Tools

1. **i18n-ally** (VS Code extension)
   - Shows missing translations
   - Highlights unused keys
   - Inline translation previews

2. **eslint-plugin-i18next**
   - Enforces translation usage
   - Detects hardcoded strings
   - Validates key references

### Manual Validation Script

```bash
# Check for hardcoded text in components (example patterns)
grep -r "\"[A-Z][a-z]" src/components/ | grep -v ".json" | grep -v "className"
```

---

## Questions?

When in doubt:
1. Check existing similar translations
2. Follow the most common pattern in the namespace
3. Prioritize clarity over brevity
4. Ask for code review if uncertain

---

**Last Updated**: December 2025  
**Enforced Starting**: Immediately for all new code
