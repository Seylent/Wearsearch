# 🔍 ВИПРАВЛЕННЯ: Магазини не завантажуються

## Проблема
```
[Search] Query: wlocker
[Search] Filtered stores: 0 []
```

❌ **Проблема:** Відсутній лог `[Search] All stores:` - магазини не завантажуються!

---

## ✅ Що виправлено

### 1. Додано переклади
- ✅ `en.json` - додано секцію `search` з усіма ключами
- ✅ `uk.json` - додано секцію `search` з усіма ключами

### 2. Покращено логування
Тепер покажуть ВСІ етапи:
```javascript
[Search] Starting stores fetch...        // 1. Початок
[StoreService] Fetching all stores...    // 2. Запит до API
[StoreService] Response: [...]           // 3. Відповідь API
[Search] Stores fetched successfully: 10 // 4. Успіх
[Search] All stores: 10 [...]            // 5. Список магазинів
[Search] Query: wlocker                  // 6. Запит
[Search] ✓ Match found: wlockerstore    // 7. Знайдено (якщо є)
[Search] Filtered stores: 1 [...]        // 8. Результати
```

### 3. Додано обробку помилок
```javascript
[Search] Error fetching stores: ...
[Search] Stores query error: ...
```

---

## 🔧 Що робити ЗАРАЗ

### Крок 1: Оновіть сторінку
```
Ctrl+Shift+R (hard refresh)
```

### Крок 2: Очистіть консоль
```
F12 → Console → Clear console (іконка 🚫)
```

### Крок 3: Введіть "wlocker" в пошук

### Крок 4: Дивіться ВСІ логи

---

## 📊 Що очікувати

### ✅ Якщо все працює:
```
[Search] Starting stores fetch...
[StoreService] Fetching all stores...
[StoreService] Response: [{id: "1", name: "wlockerstore"}, ...]
[StoreService] Returned array of stores: 10
[Search] Stores fetched successfully: 10
[Search] All stores: 10 ['wlockerstore', 'Other Store', ...]
[Search] Query: wlocker
[Search] ✓ Match found: wlockerstore | normalized: wlockerstore
[Search] Filtered stores: 1 ['wlockerstore']
```

### ❌ Якщо магазинів немає в базі:
```
[Search] Starting stores fetch...
[StoreService] Fetching all stores...
[StoreService] Response: []
[StoreService] Returned array of stores: 0
[Search] Stores fetched successfully: 0
[Search] All stores: 0 []
[Search] Query: wlocker
[Search] Filtered stores: 0 []
```
➡️ **Рішення:** Магазину немає в базі даних - додай через admin панель

### ⚠️ Якщо помилка API:
```
[Search] Starting stores fetch...
[StoreService] Fetching all stores...
[StoreService] Error fetching stores: Network Error
[Search] Error fetching stores: Network Error
[Search] Stores query error: Network Error
```
➡️ **Рішення:** Backend не працює або неправильний URL

### 🔄 Якщо запит не починається:
```
[Search] Query: wlocker
[Search] Filtered stores: 0 []
// Немає "[Search] Starting stores fetch..."
```
➡️ **Проблема:** React Query не запускає запит
➡️ **Рішення:** Перевір чи `hasQuery === true` (мінімум 2 символи)

---

## 🐛 Можливі проблеми

### 1. Backend не повертає магазини
**Перевір:**
```bash
curl http://localhost:8000/stores
# Має повернути JSON масив магазинів
```

**Якщо пусто:**
- Магазинів немає в базі даних
- Endpoint `/stores` не працює
- Backend не запущений

### 2. CORS помилка
**Симптом в консолі:**
```
Access to fetch at 'http://localhost:8000/stores' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Рішення:**
Backend має дозволити CORS для frontend URL

### 3. Неправильний URL до API
**Перевір файл:**
```typescript
// src/config/api.config.ts
export const API_BASE_URL = 'http://localhost:8000';
```

### 4. React Query не запускає запит
**Перевір умову `enabled`:**
```typescript
enabled: hasQuery  // hasQuery = debouncedQuery.length >= 2
```

Якщо вводиш тільки 1 символ - запит не спрацює!

---

## 📝 Швидка діагностика

### Тест 1: API працює?
```bash
curl http://localhost:8000/stores
```
Очікується: JSON масив магазинів

### Тест 2: Магазин є в базі?
```sql
-- PostgreSQL
SELECT * FROM stores WHERE LOWER(name) LIKE '%wlocker%';
```
Очікується: 1 запис з "wlockerstore"

### Тест 3: Frontend підключений?
1. F12 → Network
2. Введи "wlocker"
3. Подивись чи є запит до `/stores`

---

## 🎯 Очікуваний результат

Після оновлення сторінки та введення "wlocker" ти маєш побачити:

1. ✅ **8 логів** в консолі (всі етапи)
2. ✅ **Магазин у результатах** (якщо є в базі)
3. ✅ **Немає missing translations**

---

## 💡 Підказки

### Якщо тільки "[Search] Query:" без інших логів
➡️ React Query не запускає запит (перевір умову `enabled`)

### Якщо "[StoreService] Error:"
➡️ Backend не працює або CORS проблема

### Якщо "All stores: 0"
➡️ Магазинів немає в базі даних

### Якщо "All stores: 10" але "Filtered: 0"
➡️ Магазин називається інакше (подивись весь список)

---

**Зроблено:** 3 січня 2026  
**Статус:** ✅ Виправлено + покращено логування  
**Наступний крок:** Оновіть сторінку та скопіюй ВСІ логи з консолі
