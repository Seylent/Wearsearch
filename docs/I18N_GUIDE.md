# i18n Implementation Guide

## 📋 Current Status

### ✅ Completed (Client-Side i18n)
- ✅ i18next configuration with Ukrainian (uk) and English (en)
- ✅ Language switcher in navigation
- ✅ Persistent language selection (localStorage)
- ✅ All UI translations in place
- ✅ Helper functions for URL language management

### ⚠️ Prepared (Server-Side Routing)
- ⚠️ Middleware created but disabled (requires Server Components)
- ⚠️ URL helpers ready (`/uk/products`, `/en/products`)
- ⚠️ Language detection from pathname

---

## 🚀 How It Works Now

### Client-Side Only
Currently, the app uses **client-side i18n**:
- Language is stored in `localStorage`
- All translations load on client
- No URL-based language switching
- Works with `'use client'` components

### Files Structure
```
src/
├── i18n.ts                 # i18next configuration
├── locales/
│   ├── en.json            # English translations
│   └── uk.json            # Ukrainian translations
├── lib/
│   └── i18nHelpers.ts     # URL language helpers (ready for Server Components)
├── components/
│   └── LanguageSelector.tsx  # Language switcher
├── middleware.ts          # Disabled (pass-through only)
└── app/
    ├── layout.tsx         # Root layout
    └── [lang]/           # ❌ Not implemented yet (requires Server Components)
```

---

## 🔮 Future Implementation (Server Components Required)

When converting pages to Server Components, enable:

### 1. URL-Based Routing
```
/ → /uk (redirect to default language)
/products → /uk/products
/en/products → English version
/uk/products → Ukrainian version
```

### 2. Middleware Activation
Uncomment in `middleware.ts`:
```typescript
// Redirect to default locale if no locale in pathname
const locale = defaultLocale;
request.nextUrl.pathname = `/${locale}${pathname}`;
return NextResponse.redirect(request.nextUrl);
```

### 3. Update LanguageSelector
Uncomment URL navigation:
```typescript
const newPath = switchLanguageInPath(pathname, langCode);
router.push(newPath);
```

### 4. Create Dynamic Route Structure
```
src/app/
├── [lang]/
│   ├── layout.tsx        # Server Component with lang param
│   ├── page.tsx          # Home
│   ├── products/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── ...
```

---

## 📖 Usage

### Adding New Translations
1. Add key to `src/locales/en.json`
2. Add key to `src/locales/uk.json`
3. Use in component:
```tsx
const { t } = useTranslation();
<h1>{t('home.title')}</h1>
```

### Current Language Access
```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
const currentLang = i18n.language; // 'uk' or 'en'
```

### Programmatic Language Change
```typescript
import { languageService } from '@/i18n';

languageService.setLanguage('en');
```

---

## 🔧 Technical Details

### Default Language
- **Default:** Ukrainian (`uk`)
- **Fallback:** English (`en`)
- **Supported:** `['uk', 'en']`

### Storage
- **Key:** `wearsearch_language`
- **Location:** `localStorage`
- **Auto-sync:** Yes (on language change)

### SEO Considerations
- **Current:** Client-side only (no SEO benefit)
- **Future:** URL-based routing improves SEO
  - `<link rel="alternate" hreflang="uk" href="...">`
  - `<link rel="alternate" hreflang="en" href="...">`

---

## 🎯 Migration Path to Server Components

1. **Convert pages to Server Components** (remove 'use client')
2. **Enable middleware** (uncomment redirects)
3. **Create `[lang]` folder structure**
4. **Update all page.tsx** to accept `lang` param
5. **Generate alternate links** for SEO
6. **Test language switching** in URLs

---

## ⚡ Performance

### Bundle Size
- **Current:** All translations loaded on initial page load (~50KB)
- **Future:** Split by language, only load active locale (~25KB)

### Loading Strategy
- **Current:** Load all on mount
- **Future:** Server-side pre-render with correct language

---

## 📚 References
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [i18next Documentation](https://www.i18next.com/)
- [React i18next](https://react.i18next.com/)
