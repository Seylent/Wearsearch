# Динамічне SEO з API - Backend Integration Guide

## 📋 Що реалізовано на фронтенді

Додано повну інтеграцію з бекенд API для динамічного SEO. Фронтенд тепер отримує SEO дані з API замість статичних значень.

## ✅ Зроблені зміни

### 1. Створено SEO API сервіс ([src/services/api/seo.api.ts](src/services/api/seo.api.ts))

```typescript
// Методи API:
- seoApi.getHomeSEO() → GET /api/v1/seo/home/home
- seoApi.getCategorySEO(slug) → GET /api/v1/seo/category/:slug
- seoApi.getColorSEO(slug) → GET /api/v1/seo/color/:slug
- seoApi.getProductSEO(id) → GET /api/v1/seo/product/:id
- seoApi.getStoreSEO(id) → GET /api/v1/seo/store/:id
- seoApi.getBrandSEO(id) → GET /api/v1/seo/brand/:id
```

### 2. Оновлені сторінки

#### ✅ Головна сторінка ([Index.tsx](src/pages/Index.tsx))
- Завантажує SEO з `/api/v1/seo/home/home`
- Використовує `meta_title`, `meta_description`, `h1_title`, `content_text`
- Fallback на переклади якщо API недоступне

#### ✅ Сторінка каталогу ([Products.tsx](src/pages/Products.tsx))
- Розпізнає `?type=jackets` → завантажує `/api/v1/seo/category/jackets`
- Розпізнає `?color=Black` → завантажує `/api/v1/seo/color/Black`
- Пріоритет: категорія > колір > дефолт

#### ✅ Сторінка товару ([ProductDetail.tsx](src/pages/ProductDetail.tsx))
- Завантажує SEO з `/api/v1/seo/product/:id`
- Fallback на дані продукту

## 🔧 Що потрібно на бекенді

### Повний список SEO Endpoints:

```http
# Основні сторінки
GET /api/v1/seo/home/home         # Головна сторінка
GET /api/v1/seo/category/:slug    # Сторінка категорії (jackets, hoodies, etc.)
GET /api/v1/seo/color/:slug       # Сторінка фільтру кольору (Black, White, etc.)
GET /api/v1/seo/product/:id       # Сторінка товару
GET /api/v1/seo/store/:id         # Сторінка магазину (future-ready)
GET /api/v1/seo/brand/:id         # Сторінка бренду (future-ready)

# SEO файли
GET /api/v1/sitemap.xml           # XML sitemap
GET /api/v1/robots.txt            # Robots.txt
```

### 1. Endpoint для головної сторінки

```http
GET /api/v1/seo/home/home
```

**Response:**
```json
{
  "success": true,
  "item": {
    "meta_title": "Wearsearch - Знайдіть свій ідеальний стиль",
    "meta_description": "Відкрийте для себе найкращі fashion товари від топових магазинів. Величезний вибір одягу, взуття та аксесуарів.",
    "canonical_url": "https://wearsearch.com/",
    "h1_title": "Відкрийте світ моди",
    "content_text": "Кураторська колекція від найінноваційніших дизайнерів світу",
    "keywords": "fashion, clothing, online shopping, brands"
  }
}
```

### 2. Endpoints для категорій

```http
GET /api/v1/seo/category/:slug
```

**Параметри:**
- `:slug` - назва категорії: `jackets`, `hoodies`, `T-shirts`, `pants`, `jeans`, `shorts`, `shoes`, `accessories`

**Response:**
```json
{
  "success": true,
  "item": {
    "meta_title": "Куртки - Купити стильні куртки онлайн | Wearsearch",
    "meta_description": "Знайдіть ідеальну куртку з нашої кураторської колекції. Зимові, демісезонні, бомбери та більше.",
    "canonical_url": "https://wearsearch.com/products?type=jackets",
    "h1_title": "Куртки",
    "content_text": "Великий вибір курток від провідних брендів",
    "keywords": "куртки, jackets, верхній одяг, зимові куртки"
  }
}
```

### 3. Endpoints для кольорів

```http
GET /api/v1/seo/color/:slug
```

**Параметри:**
- `:slug` - колір: `Black`, `White`, `Gray`, `Blue`, `Red`, `Green`, `Yellow`, `Orange`, `Pink`, `Purple`, `Brown`, `Beige`, `Navy`, `Maroon`, `Olive`, `Cream`

**Response:**
```json
{
  "success": true,
  "item": {
    "meta_title": "Чорний одяг та аксесуари | Wearsearch",
    "meta_description": "Шукаєте чорний одяг? Перегляньте нашу колекцію чорних товарів від топових брендів.",
    "canonical_url": "https://wearsearch.com/products?color=Black",
    "keywords": "чорний одяг, black fashion, black clothing"
  }
}
```

### 4. Endpoint для товарів

```http
GET /api/v1/seo/product/:id
```

### 5. Endpoint для магазинів (future-ready)

```http
GET /api/v1/seo/store/:id
```

**Параметри:**
- `:id` - ID магазину

**Response:**
```json
{
  "success": true,
  "item": {
    "meta_title": "Supreme Store - Купити оригінальну продукцію | Wearsearch",
    "meta_description": "Офіційний магазин Supreme. Широкий вибір одягу, аксесуарів та ексклюзивних колекцій.",
    "canonical_url": "https://wearsearch.com/store/5",
    "h1_title": "Supreme Official Store",
    "content_text": "Автентична продукція Supreme з гарантією якості",
    "keywords": "supreme, streetwear, магазин"
  }
}
```

### 6. Endpoint для брендів (future-ready)

```http
GET /api/v1/seo/brand/:id
```

**Параметри:**
- `:id` - ID бренду

**Response:**
```json
{
  "success": true,
  "item": {
    "meta_title": "Nike - Спортивний одяг та взуття | Wearsearch",
    "meta_description": "Оригінальна продукція Nike. Кросівки, одяг та аксесуари для спорту та стилю.",
    "canonical_url": "https://wearsearch.com/brand/10",
    "h1_title": "Nike",
    "content_text": "Just Do It - легендарний бренд спортивного одягу",
    "keywords": "nike, спорт, кросівки, sportswear"
  }
}
```

**Параметри:**
- `:id` - ID товару

**Response:**
```json
{
  "success": true,
  "item": {
    "meta_title": "Nike Air Max 90 - Купити онлайн | Wearsearch",
    "meta_description": "Nike Air Max 90 - класичні кросівки в сучасному стилі. Порівняйте ціни в різних магазинах.",
    "canonical_url": "https://wearsearch.com/product/123",
    "keywords": "nike air max, кросівки, взуття"
  }
}
```

## 💡 Backend Implementation Patterns

### Варіант 1: Проста база даних

```python
# models/seo_data.py
from sqlalchemy import Column, Integer, String, Text

class SEOData(Base):
    __tablename__ = 'seo_data'
    
    id = Column(Integer, primary_key=True)
    page_type = Column(String(50))  # 'home', 'category', 'color', 'product'
    slug = Column(String(100))  # 'home', 'jackets', 'Black', '123'
    meta_title = Column(String(255))
    meta_description = Column(Text)
    canonical_url = Column(String(500))
    h1_title = Column(String(255), nullable=True)
    content_text = Column(Text, nullable=True)
    keywords = Column(String(500), nullable=True)
    
    __table_args__ = (
        UniqueConstraint('page_type', 'slug'),
    )
```

### Варіант 2: Endpoints

```python
# routers/seo.py
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/seo", tags=["SEO"])

@router.get("/home/{slug}")
async def get_home_seo(slug: str, db: Session = Depends(get_db)):
    """Get SEO data for homepage"""
    seo = db.query(SEOData).filter(
        SEOData.page_type == 'home',
        SEOData.slug == slug
    ).first()
    
    if not seo:
        # Return default values
        return {
            "success": True,
            "item": {
                "meta_title": "Wearsearch - Discover Fashion",
                "meta_description": "Shop fashion online",
            }
        }
    
    return {
        "success": True,
        "item": {
            "meta_title": seo.meta_title,
            "meta_description": seo.meta_description,
            "canonical_url": seo.canonical_url,
            "h1_title": seo.h1_title,
            "content_text": seo.content_text,
            "keywords": seo.keywords,
        }
    }

@router.get("/category/{slug}")
async def get_category_seo(slug: str, db: Session = Depends(get_db)):
    """Get SEO data for category page"""
    seo = db.query(SEOData).filter(
        SEOData.page_type == 'category',
        SEOData.slug == slug
    ).first()
    
    if not seo:
        return {
            "success": True,
            "item": {
                "meta_title": f"{slug.title()} - Wearsearch",
                "meta_description": f"Browse our collection of {slug}",
            }

@router.get("/store/{store_id}")
async def get_store_seo(store_id: str, db: Session = Depends(get_db)):
    """Get SEO data for store page"""
    seo = db.query(SEOData).filter(
        SEOData.page_type == 'store',
        SEOData.slug == store_id
    ).first()
    
    if seo:
        return {"success": True, "item": seo.to_dict()}
    
    # Fallback: generate from store data
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    return {
        "success": True,
        "item": {
            "meta_title": f"{store.name} - Official Store | Wearsearch",
            "meta_description": f"Shop products from {store.name}. Browse their collection and find the best deals.",
            "canonical_url": f"https://wearsearch.com/store/{store_id}",
        }
    }

@router.get("/brand/{brand_id}")
async def get_brand_seo(brand_id: str, db: Session = Depends(get_db)):
    """Get SEO data for brand page"""
    seo = db.query(SEOData).filter(
        SEOData.page_type == 'brand',
        SEOData.slug == brand_id
    ).first()
    
    if seo:
        return {"success": True, "item": seo.to_dict()}
    
    # Fallback: generate from brand data
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    return {
        "success": True,
        "item": {
            "meta_title": f"{brand.name} - Products & Collections | Wearsearch",
            "meta_description": f"Discover {brand.name} products. Shop the latest collections and exclusive items.",
            "canonical_url": f"https://wearsearch.com/brand/{brand_id}",
        }
    }
        }
    
    return {"success": True, "item": seo.to_dict()}

@router.get("/color/{slug}")
async def get_color_seo(slug: str, db: Session = Depends(get_db)):
    """Get SEO data for color filter page"""
    seo = db.query(SEOData).filter(
        SEOData.page_type == 'color',
        SEOData.slug == slug
    ).first()
    
    if not seo:
        return {
            "success": True,
            "item": {
                "meta_title": f"{slug} Fashion - Wearsearch",
                "meta_description": f"Shop {slug} clothing and accessories",
            }
        }
    
    return {"success": True, "item": seo.to_dict()}

@router.get("/product/{product_id}")
async def get_product_seo(product_id: str, db: Session = Depends(get_db)):
    """Get SEO data for product page"""
    # Try to get custom SEO first
    seo = db.query(SEOData).filter(
        SEOData.page_type == 'product',
        SEOData.slug == product_id
    ).first()
    
    if seo:
        return {"success": True, "item": seo.to_dict()}
    
    # Fallback: generate from product data
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "success": True,
        "item": {
            "meta_title": f"{product.name} - {product.brand} | Wearsearch",
            "meta_description": product.description[:160] if product.description else f"Buy {product.name} from multiple stores",
            "canonical_url": f"https://wearsearch.com/product/{product_id}",
        }
    }
```

### Варіант 3: Migration для даних

```python
# alembic/versions/xxx_add_seo_data.py
def upgrade():
    op.create_table(
        'seo_data',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('page_type', sa.String(50), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('meta_title', sa.String(255), nullable=False),
        sa.Column('meta_description', sa.Text(), nullable=False),
        sa.Column('canonical_url', sa.String(500), nullable=True),
        sa.Column('h1_title', sa.String(255), nullable=True),
        sa.Column('content_text', sa.Text(), nullable=True),
        sa.Column('keywords', sa.String(500), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('page_type', 'slug', name='unique_page_slug')
    )
    
    # Додати базові SEO дані
    op.execute("""
        INSERT INTO seo_data (page_type, slug, meta_title, meta_description, canonical_url, h1_title, content_text) VALUES
        ('home', 'home', 'Wearsearch - Discover Fashion', 'Shop the latest fashion trends', 'https://wearsearch.com/', 'Discover Exceptional Fashion', 'Curated collections from innovative designers'),
        ('category', 'jackets', 'Jackets - Wearsearch', 'Browse our jacket collection', 'https://wearsearch.com/products?type=jackets', 'Jackets', 'Premium jackets from top brands'),
        ('category', 'hoodies', 'Hoodies - Wearsearch', 'Browse our hoodie collection', 'https://wearsearch.com/products?type=hoodies', 'Hoodies', 'Comfortable hoodies for every style'),
        ('color', 'Black', 'Black Fashion - Wearsearch', 'Shop black clothing and accessories', 'https://wearsearch.com/products?color=Black', NULL, NULL)
    """)
```

## 🎯 Пріоритети для бекенду

### Must Have (необхідно)
1. ✅ Створити таблицю `seo_data` в БД
2. ✅ Реалізувати 4 endpoints (home, category, color, product)
3. ✅ Додати базові SEO для головної та категорій

### Nice to Have (бажано)
1. ⭐ Адмін панель для редагування SEO
2. ⭐ Автогенерація SEO для нових товарів
3. ⭐ A/B тестування різних title/description
4. ⭐ Аналітика CTR по різним варіантам

## 📊 Переваги реалізації

1. **SEO оптимізація** - унікальні title/description для кожної сторінки
2. **Гнучкість** - можна змінювати SEO без релізу фронтенду
3. **Багатомовність** - легко додати переклади в БД
4. **Аналітика** - відслідковувати яке SEO працює краще

## 🧪 Як тестувати

### 1. Перевірити що endpoints працюють:

```bash
# Головна
curl http://localhost:3000/api/v1/seo/home/home

# Категорія
curl http://localhost:3000/api/v1/seo/category/jackets

# Колір
curl http://localhost:3000/api/v1/seo/color/Black

# Товар
curl http://localhost:3000/api/v1/seo/product/123
```

### 2. Перевірити на фронтенді:

1. Відкрити головну сторінку → перевірити title в табі браузера
2. Відкрити DevTools → Elements → `<head>` → перевірити `<meta>` теги
3. Перейти на `/products?type=jackets` → перевірити що title змінився
4. Перейти на `/products?color=Black` → перевірити title
5. Відкрити будь-який товар → перевірити title

### 3. Перевірити fallback:

Якщо API не відповідає або повертає помилку - фронтенд має використати дефолтні значення з перекладів.

## ❓ FAQ

**Q: Що якщо endpoint не готовий?**
A: Фронтенд має fallback на статичні переклади, все працюватиме як зараз.

**Q: Чи обов'язково canonical_url?**
A: Ні, опціональне поле. Якщо null - фронтенд згенерує автоматично.

**Q: Як додати нові кольори/категорії?**
A: Просто додати рядок в таблицю seo_data з відповідним slug.

**Q: Чи треба робити кеш?**
A: Рекомендується. SEO дані змінюються рідко, можна кешувати на 1 годину.

## 📝 Приклад повної інтеграції

```python
# main.py
from routers import seo

app.include_router(seo.router, prefix="/api/v1")
```

```sql
-- Seed data для старту
INSERT INTO seo_data VALUES
(1, 'home', 'home', 'Wearsearch - Знайдіть свій стиль', 'Великий вибір fashion товарів', 'https://wearsearch.com/', 'Відкрийте світ моди', 'Кураторська колекція від топових брендів', 'fashion, clothing'),
(2, 'category', 'jackets', 'Куртки - Wearsearch', 'Купіть стильні куртки онлайн', 'https://wearsearch.com/products?type=jackets', 'Куртки', 'Вибір курток від провідних брендів', 'куртки, jackets'),
(3, 'color', 'Black', 'Чорний одяг - Wearsearch', 'Чорна мода онлайн', 'https://wearsearch.com/products?color=Black', NULL, NULL, 'black fashion');
```

Фронтенд готовий! Чекаю на бекенд API 🚀
