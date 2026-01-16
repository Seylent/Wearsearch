# 💱 Інтеграція Currency у Frontend

**Дата:** 14 січня 2026  
**Статус:** ✅ Виправлено

---

## ⚠️ ВАЖЛИВЕ ПРАВИЛО

**Backend робить конвертацію, НЕ frontend!**

```typescript
// ❌ НЕПРАВИЛЬНО - конвертація на клієнті
const priceUSD = priceUAH / exchangeRate;

// ✅ ПРАВИЛЬНО - backend конвертує
const response = await fetch('/api/pages/home?currency=USD');
// Ціни вже в USD!
```

---

## 📋 Як Працює Система

### 1. Backend API (згідно з документацією)

```
GET /api/pages/home?currency=USD
GET /api/pages/products?currency=USD
GET /api/v1/items/:id?currency=USD
```

**Відповідь:**
```json
{
  "items": [
    { "id": "1", "price": 26.67 }  // ✅ Вже в USD!
  ],
  "currency": {
    "code": "USD",
    "symbol": "$",
    "convertedFrom": "UAH",
    "convertedAt": "2026-01-14T12:00:00Z"
  }
}
```

### 2. Frontend Роль

Frontend **тільки**:
1. ✅ Додає параметр `?currency=USD` до запитів
2. ✅ Форматує отримані ціни з символом валюти
3. ✅ Зберігає вибір користувача в localStorage

Frontend **НЕ**:
- ❌ Не конвертує ціни сам
- ❌ Не множить/ділить на exchangeRate
- ❌ Не робить математичні операції з цінами

---

## 🔧 Правильна Реалізація

### CurrencyContext - Менеджмент Валюти

**Файл:** [src/contexts/CurrencyContext.tsx](../src/contexts/CurrencyContext.tsx)

```typescript
export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState<'UAH' | 'USD'>('UAH');
  
  // ✅ Тільки зберігаємо вибір
  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
```

### useCurrencyConversion - Форматування

**Файл:** [src/hooks/useCurrencyConversion.ts](../src/hooks/useCurrencyConversion.ts)

```typescript
export const useCurrencyConversion = () => {
  const { currency } = useCurrency();

  // ✅ ТІЛЬКИ форматування, БЕЗ конвертації!
  const formatPrice = (price: number): string => {
    const symbol = currency === 'USD' ? '$' : '₴';
    
    if (currency === 'USD') {
      return `${symbol}${price.toFixed(2)}`;  // ✅ price вже в USD!
    } else {
      return `${price.toFixed(0)} ${symbol}`;
    }
  };

  return { formatPrice };
};
```

### API Запити з Currency

**Приклад 1: useHomepageData**

```typescript
export const useHomepageData = () => {
  const { currency } = useCurrency();

  return useQuery({
    queryKey: ['homepage', currency],  // ✅ Invalidate при зміні
    queryFn: async () => {
      // ✅ Додаємо currency до запиту
      const response = await api.get('/pages/home', { 
        params: { currency } 
      });
      return response.data;  // ✅ Ціни вже сконвертовані!
    },
  });
};
```

**Приклад 2: ProductsContent**

```typescript
export const ProductsContent = () => {
  const { currency } = useCurrency();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [currency]);  // ✅ Refetch при зміні валюти

  const fetchProducts = async () => {
    // ✅ Backend конвертує
    const response = await fetch(`/api/v1/products?currency=${currency}`);
    const data = await response.json();
    setProducts(data.items);  // ✅ Ціни вже в потрібній валюті
  };

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          {/* ✅ Тільки форматуємо */}
          <span>{formatPrice(product.price)}</span>
        </div>
      ))}
    </div>
  );
};
```

---

## 🎨 UI Components

### CurrencySwitch - Перемикач Валюти

```typescript
export const CurrencySwitch = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="currency-switch">
      <button
        className={currency === 'UAH' ? 'active' : ''}
        onClick={() => setCurrency('UAH')}
      >
        ₴ UAH
      </button>
      <button
        className={currency === 'USD' ? 'active' : ''}
        onClick={() => setCurrency('USD')}
      >
        $ USD
      </button>
    </div>
  );
};
```

### PriceDisplay - Відображення Ціни

```typescript
interface PriceDisplayProps {
  price: number;  // ✅ Вже сконвертована backend'ом
}

export const PriceDisplay = ({ price }: PriceDisplayProps) => {
  const { formatPrice } = useCurrencyConversion();

  return (
    <span className="price">
      {formatPrice(price)}  {/* ✅ Тільки форматуємо */}
    </span>
  );
};
```

---

## ✅ Checklist Для Нових Компонентів

При роботі з цінами:

- [ ] Використовую `useCurrency()` для отримання поточної валюти
- [ ] Додаю `?currency=${currency}` до API запитів
- [ ] Використовую `formatPrice()` для відображення
- [ ] **НЕ** роблю математичні операції з цінами
- [ ] **НЕ** множу/ділю на exchangeRate
- [ ] Додаю `currency` до `queryKey` для правильного кешування
- [ ] Refetch дані при зміні валюти (`useEffect([currency])`)

---

## 🐛 Типові Помилки

### ❌ Помилка 1: Конвертація на клієнті

```typescript
// ❌ НЕПРАВИЛЬНО
const { exchangeRate } = useCurrency();
const priceUSD = priceUAH / exchangeRate.rate;

// ✅ ПРАВИЛЬНО
const { currency } = useCurrency();
const response = await fetch(`/api/products?currency=${currency}`);
const price = response.data.items[0].price; // Вже сконвертована!
```

### ❌ Помилка 2: Забули додати currency до запиту

```typescript
// ❌ НЕПРАВИЛЬНО - завжди повертає UAH
const response = await fetch('/api/products');

// ✅ ПРАВИЛЬНО
const { currency } = useCurrency();
const response = await fetch(`/api/products?currency=${currency}`);
```

### ❌ Помилка 3: Не refetch при зміні валюти

```typescript
// ❌ НЕПРАВИЛЬНО - показує стару валюту
useEffect(() => {
  fetchProducts();
}, []); // Відсутній currency в залежностях!

// ✅ ПРАВИЛЬНО
const { currency } = useCurrency();
useEffect(() => {
  fetchProducts();
}, [currency]); // ✅ Refetch при зміні
```

---

## 📚 Додаткові Ресурси

- [Backend Currency Guide](../../backend/docs/FRONTEND_CURRENCY_GUIDE.md) - Повна документація від backend
- [CurrencyContext.tsx](../src/contexts/CurrencyContext.tsx) - Імплементація контексту
- [useCurrencyConversion.ts](../src/hooks/useCurrencyConversion.ts) - Hook для форматування
- [Currency Storage Utils](../src/utils/currencyStorage.ts) - Utilities для localStorage

---

## 🔍 Debugging

### Перевірка чи працює конвертація:

```typescript
// 1. Перевір що параметр додається до URL
console.log('Currency:', currency);
console.log('Request URL:', `/api/products?currency=${currency}`);

// 2. Перевір відповідь backend
const response = await fetch(`/api/products?currency=USD`);
const data = await response.json();
console.log('Currency info:', data.currency);
// Має бути: { code: "USD", symbol: "$", convertedFrom: "UAH" }

// 3. Перевір що ціни різні
const responseUAH = await fetch('/api/products?currency=UAH');
const responseUSD = await fetch('/api/products?currency=USD');
console.log('UAH price:', responseUAH.data.items[0].price); // ~1000
console.log('USD price:', responseUSD.data.items[0].price); // ~26.67
```

---

**Версія:** 1.0  
**Останнє оновлення:** 14 січня 2026  
**Автор:** Frontend Team
