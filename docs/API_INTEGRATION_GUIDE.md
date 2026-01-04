# 🔌 API Integration Guide

**Дата:** 5 січня 2026  
**Статус:** Backend API Ready - Integration Required

---

## ✅ Що готово:

1. ✅ **Frontend features** - всі 20 features реалізовані
2. ✅ **Backend endpoints** - всі API routes готові
3. ✅ **API Service** - `advanced.api.ts` створено
4. ⏳ **Integration** - потрібно замінити localStorage на API calls

---

## 📦 Backend API Endpoints

**Base URL:** `http://localhost:3000/api/v1/advanced`

**Authentication:** Bearer token в header

### Доступні endpoints:

| Feature | Endpoint | Method | Status |
|---------|----------|--------|--------|
| Export CSV | `/items/export?format=csv` | GET | ✅ |
| Export JSON | `/items/export?format=json` | GET | ✅ |
| Import CSV | `/items/import` | POST | ✅ |
| Templates | `/templates` | GET/POST/DELETE | ✅ |
| Stock | `/items/:id/stock` | GET/PUT | ✅ |
| Multiple Images | `/items/:id/images` | GET/POST/PUT/DELETE | ✅ |
| Scheduled Publishing | `/items/:id/schedule` | POST | ✅ |
| Price History | `/items/:id/price-history` | GET | ✅ |
| Activity Log | `/audit-log` | GET/POST | ✅ |
| Product Relations | `/items/:id/related` | GET/POST/DELETE | ✅ |
| Analytics | `/analytics/summary` | GET | ✅ |

**Документація:** `c:\backend\Wearsearch-api-main\docs\FRONTEND_API_ENDPOINTS.md`

---

## 🔧 Як інтегрувати:

### Крок 1: Імпортувати API service

В `Admin.tsx` додайте на початок файлу:

```typescript
import { advancedApi } from "@/services/api/advanced.api";
```

### Крок 2: Замінити localStorage calls

#### Приклад 1: Templates

**Було (localStorage):**
```typescript
const saveAsTemplate = () => {
  const template = { id: Date.now().toString(), name, data };
  const updated = [...savedTemplates, template];
  setSavedTemplates(updated);
  localStorage.setItem('admin_product_templates', JSON.stringify(updated));
};
```

**Стане (API):**
```typescript
const saveAsTemplate = async () => {
  try {
    const template = await advancedApi.createTemplate({
      name: templateName,
      category: productCategory,
      template_data: {
        brand: productBrandId,
        gender: productGender,
        color: productColor,
        description: productDescription,
      }
    });
    
    setSavedTemplates([...savedTemplates, template]);
    toast({ title: "Template saved", description: "Saved to database" });
  } catch (error) {
    toast({ 
      title: "Error", 
      description: "Failed to save template",
      variant: "destructive" 
    });
  }
};
```

#### Приклад 2: Price History

**Було (localStorage):**
```typescript
const recordPriceChange = (productId, storeId, storeName, oldPrice, newPrice) => {
  const historyEntry = { id: Date.now().toString(), store_id: storeId, ... };
  const updated = { ...priceHistory, [productId]: [...(priceHistory[productId] || []), historyEntry] };
  setPriceHistory(updated);
  localStorage.setItem('admin_price_history', JSON.stringify(updated));
};
```

**Стане (API):**
```typescript
const recordPriceChange = async (productId, storeId, storeName, oldPrice, newPrice) => {
  // Backend автоматично записує через trigger - нічого не потрібно!
  // Просто оновлюємо ціну, backend сам логує
};

const loadPriceHistory = async (productId: string) => {
  try {
    const data = await advancedApi.getPriceHistory(productId);
    setPriceHistory({ [productId]: data.history });
  } catch (error) {
    console.error("Failed to load price history", error);
  }
};
```

#### Приклад 3: Export Products

**Було (localStorage/client-side):**
```typescript
const exportToCSV = () => {
  const csv = products.map(p => `${p.name},${p.price},...`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  // download...
};
```

**Стане (API):**
```typescript
const exportToCSV = async () => {
  try {
    const ids = selectedProductIds.size > 0 
      ? Array.from(selectedProductIds) 
      : undefined;
    
    const blob = await advancedApi.exportProducts('csv', ids);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString()}.csv`;
    a.click();
    
    toast({ title: "Export successful", description: `${ids?.length || 'All'} products exported` });
  } catch (error) {
    toast({ 
      title: "Export failed", 
      description: error.message,
      variant: "destructive" 
    });
  }
};
```

---

## 📋 Checklist для кожної feature:

### 1. Export/Import ✅
- [ ] Замінити `exportToCSV()` на API call
- [ ] Замінити `exportToJSON()` на API call
- [ ] Замінити `handleImportCSV()` на API call
- [ ] Додати error handling
- [ ] Тестувати з backend

### 2. Templates ✅
- [ ] Замінити `saveAsTemplate()` на API call
- [ ] Замінити `loadTemplate()` на API fetch
- [ ] Замінити `deleteTemplate()` на API call
- [ ] Видалити localStorage для templates
- [ ] Load templates on mount

### 3. Stock Management ✅
- [ ] Замінити `updateStock()` на API call
- [ ] Fetch stock from API on product load
- [ ] Видалити localStorage для stock
- [ ] Update UI after API response

### 4. Multiple Images ✅
- [ ] Integrate file upload with API
- [ ] Use API for set primary
- [ ] Use API for delete image
- [ ] Show images from backend

### 5. Scheduled Publishing ✅
- [ ] Send schedule data to API on save
- [ ] Fetch scheduled products list
- [ ] Update status indicator

### 6. Price History ✅
- [ ] Fetch history from API (видалити localStorage)
- [ ] Backend автоматично логує зміни
- [ ] Update UI to show API data

### 7. Activity Log ✅
- [ ] Fetch logs from API (видалити localStorage)
- [ ] Backend автоматично логує дії
- [ ] Pagination підтримка

### 8. Product Relations ✅
- [ ] Fetch relations from API
- [ ] Add relation через API
- [ ] Delete relation через API
- [ ] Видалити localStorage

---

## 🚀 Швидкий старт:

### 1. Environment Variable

Додайте в `.env`:
```
VITE_API_URL=http://localhost:3000
```

### 2. Test API Connection

```typescript
// В Admin.tsx useEffect
useEffect(() => {
  const testAPI = async () => {
    try {
      const analytics = await advancedApi.getAnalyticsSummary();
      console.log('✅ API Connected:', analytics);
    } catch (error) {
      console.error('❌ API Error:', error);
      toast({
        title: "API Connection Error",
        description: "Check if backend is running on port 3000",
        variant: "destructive"
      });
    }
  };
  
  testAPI();
}, []);
```

### 3. Replace Functions One by One

Починайте з найпростішого:
1. ✅ Analytics (просто fetch)
2. ✅ Price History (fetch only)
3. ✅ Activity Log (fetch only)
4. ✅ Templates (CRUD)
5. ✅ Export/Import
6. ✅ Stock Management
7. ✅ Product Relations
8. ✅ Multiple Images (file upload)

---

## 🧪 Testing After Integration

### Test 1: Export
```typescript
// Should download CSV from backend
exportToCSV(); // Відкрийте Network tab, перевірте API call
```

### Test 2: Templates
```typescript
// Should save to database
saveAsTemplate();
// Reload page - templates should persist
```

### Test 3: Price History
```typescript
// Update product price
// Check price-history endpoint was called
// See history in Analytics tab
```

---

## ⚠️ Важливі зміни:

### 1. Authentication
Backend очікує JWT token:
```typescript
const token = localStorage.getItem('token');
// Переконайтесь що token існує при admin routes
```

### 2. Error Handling
Всі API calls можуть провалитись:
```typescript
try {
  await advancedApi.someCall();
} catch (error) {
  toast({ 
    title: "Error", 
    description: error.message,
    variant: "destructive" 
  });
}
```

### 3. Loading States
Додайте loading indicators:
```typescript
const [loading, setLoading] = useState(false);

const doSomething = async () => {
  setLoading(true);
  try {
    await advancedApi.someCall();
  } finally {
    setLoading(false);
  }
};
```

### 4. Remove localStorage
Після інтеграції видаліть:
```typescript
// ВИДАЛИТИ після integration:
localStorage.setItem('admin_product_templates', ...);
localStorage.setItem('admin_stock_data', ...);
localStorage.setItem('admin_price_history', ...);
localStorage.setItem('admin_activity_log', ...);
localStorage.setItem('admin_product_relations', ...);
localStorage.setItem('admin_filter_presets', ...);
```

---

## 📊 Progress Tracking

| Feature | localStorage | API Integration | Tested | Status |
|---------|--------------|----------------|--------|--------|
| Export/Import | ✅ | ⏳ | ⏳ | Pending |
| Templates | ✅ | ⏳ | ⏳ | Pending |
| Stock | ✅ | ⏳ | ⏳ | Pending |
| Multi Images | ✅ | ⏳ | ⏳ | Pending |
| Scheduling | ✅ | ⏳ | ⏳ | Pending |
| Price History | ✅ | ⏳ | ⏳ | Pending |
| Activity Log | ✅ | ⏳ | ⏳ | Pending |
| Relations | ✅ | ⏳ | ⏳ | Pending |
| Analytics | ✅ | ⏳ | ⏳ | Pending |

---

## 🎯 Next Steps:

1. **Review API Service** - `src/services/api/advanced.api.ts`
2. **Update Admin.tsx** - Replace localStorage with API calls
3. **Test each feature** - Verify backend integration works
4. **Remove localStorage** - Clean up temporary storage
5. **Deploy** - Push to production!

**API Service готовий. Час інтегрувати! 🚀**
