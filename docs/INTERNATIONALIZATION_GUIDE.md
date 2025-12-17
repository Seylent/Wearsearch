# Internationalization (i18n) Implementation Guide

## Overview
The website now supports multiple languages (English and Ukrainian) using `react-i18next`. Users can switch languages using the globe icon in the navigation bar.

## What Was Implemented

### 1. **Dependencies Installed**
- `i18next` - Core i18n functionality
- `react-i18next` - React integration for i18next

### 2. **Translation Files Created**
- **English**: `src/locales/en.json`
- **Ukrainian**: `src/locales/uk.json`

Both files contain translation keys organized by sections:
- `nav` - Navigation items
- `home` - Home page content
- `products` - Product listing page
- `stores` - Stores page
- `about` - About page
- `auth` - Authentication forms
- `profile` - User profile
- `favorites` - Favorites page
- `admin` - Admin panel
- `common` - Common UI elements
- `productDetail` - Product detail page
- `footer` - Footer content

### 3. **i18n Configuration** (`src/i18n.ts`)
- Initializes i18next with English and Ukrainian translations
- Defaults to English if no language is selected
- Saves user's language preference in `localStorage`
- Automatically persists language choice across sessions

### 4. **Language Selector Component** (`src/components/LanguageSelector.tsx`)
- Globe icon button in the navigation bar
- Dropdown menu with language options (English 🇬🇧 / Українська 🇺🇦)
- Shows checkmark next to currently selected language
- Styled to match the existing design system

### 5. **Updated Components**
- **Navigation.tsx** - Uses `t()` function for navigation links
- **ContactsDialog.tsx** - Translated contact section title
- **UserProfileMenu.tsx** - Translated menu items (Profile, Favorites, Admin, Sign Out)

## How to Use Translations in Your Code

### Basic Usage

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.allItems')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

### With Variables (Interpolation)

```tsx
// In translation file:
{
  "welcome": "Welcome, {{name}}!"
}

// In component:
<p>{t('welcome', { name: userName })}</p>
```

### Change Language Programmatically

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  
  const switchToUkrainian = () => {
    i18n.changeLanguage('uk');
  };
}
```

## How to Add More Translations

### 1. Add new keys to both translation files

**src/locales/en.json:**
```json
{
  "myNewSection": {
    "title": "My Title",
    "description": "My Description"
  }
}
```

**src/locales/uk.json:**
```json
{
  "myNewSection": {
    "title": "Мій заголовок",
    "description": "Мій опис"
  }
}
```

### 2. Use the new translations in your components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('myNewSection.title')}</h1>
      <p>{t('myNewSection.description')}</p>
    </div>
  );
}
```

## Adding More Languages

To add a new language (e.g., Polish):

1. Create `src/locales/pl.json` with all translations
2. Update `src/i18n.ts`:
```tsx
import plTranslations from './locales/pl.json';

const resources = {
  en: { translation: enTranslations },
  uk: { translation: ukTranslations },
  pl: { translation: plTranslations }  // Add new language
};
```

3. Update `LanguageSelector.tsx`:
```tsx
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' }  // Add new language
];
```

## Testing

1. **Start the development server**: `npm run dev`
2. **Click the globe icon** in the top-right navigation bar
3. **Select a language** from the dropdown
4. **Verify** that:
   - Navigation items change language
   - Language preference persists on page reload
   - All translated components display correctly

## Current Translation Coverage

✅ **Fully Translated:**
- Navigation bar
- User profile menu
- Contacts dialog

⏳ **Needs Translation:**
- Home page content
- Product listing page
- Product detail page
- Stores page
- About page
- Auth pages
- Admin panel
- Footer

To translate additional pages, import `useTranslation` hook and replace hardcoded strings with `t('translation.key')` calls.

## Notes

- Language preference is stored in browser's `localStorage` under the key `'language'`
- Default language is English (`'en'`)
- The system automatically falls back to English if a translation key is missing in the selected language
- All translation keys use dot notation (e.g., `nav.allItems`, `common.loading`)

## Example: Translating a Full Page

```tsx
import { useTranslation } from 'react-i18next';

function ProductsPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('products.title')}</h1>
      <button>{t('common.search')}</button>
      <p>{t('products.noProducts')}</p>
    </div>
  );
}
```

This makes it easy to add translations across the entire site systematically!
