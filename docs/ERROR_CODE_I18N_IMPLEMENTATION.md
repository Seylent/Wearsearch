# Error Code & Data Field Internationalization Implementation

## Overview

This document summarizes the implementation of error code translation infrastructure and proper handling of backend data fields for internationalization.

---

## ✅ Completed Changes

### 1. **Translation Mappings** ([en.json](../src/locales/en.json), [uk.json](../src/locales/uk.json))

#### Error Codes (`errorCodes`)
Added comprehensive error code translations for:
- **Authentication**: `AUTH_INVALID_CREDENTIALS`, `AUTH_TOKEN_EXPIRED`, `AUTH_UNAUTHORIZED`, etc.
- **Products**: `PRODUCT_NOT_FOUND`, `PRODUCT_CREATE_FAILED`, `PRODUCT_UPDATE_FAILED`, etc.
- **Stores**: `STORE_NOT_FOUND`, `STORE_CREATE_FAILED`, `STORE_UPDATE_FAILED`, etc.
- **Brands**: `BRAND_NOT_FOUND`, `BRAND_CREATE_FAILED`, `BRAND_UPDATE_FAILED`, etc.
- **Favorites**: `FAVORITE_NOT_FOUND`, `FAVORITE_ADD_FAILED`, `FAVORITE_REMOVE_FAILED`, etc.
- **Images**: `IMAGE_UPLOAD_FAILED`, `IMAGE_INVALID_FORMAT`, `IMAGE_TOO_LARGE`, etc.
- **Validation**: `VALIDATION_ERROR`, `REQUIRED_FIELD`, `INVALID_EMAIL`, `PASSWORD_TOO_SHORT`, etc.
- **Network**: `NETWORK_ERROR`, `SERVER_ERROR`, `FORBIDDEN`, `NOT_FOUND`, `BAD_REQUEST`, etc.

#### Success Codes (`successCodes`)
Added success message translations:
- **CRUD Operations**: `PRODUCT_CREATED`, `STORE_UPDATED`, `BRAND_DELETED`, etc.
- **Favorites**: `FAVORITE_ADDED`, `FAVORITE_REMOVED`
- **Authentication**: `AUTH_LOGIN_SUCCESS`, `AUTH_REGISTER_SUCCESS`, `AUTH_LOGOUT_SUCCESS`
- **Profile**: `PROFILE_UPDATED`, `SETTINGS_SAVED`
- **Images**: `IMAGE_UPLOADED`, `IMAGE_DELETED`

#### Product Types (`productTypes`)
- **Shoes** → "Shoes" / "Взуття"
- **Outerwear** → "Outerwear" / "Верхній одяг"
- **Tops** → "Tops" / "Топи"
- **Bottoms** → "Bottoms" / "Штани"
- **Dresses** → "Dresses" / "Сукні"
- **Accessories** → "Accessories" / "Аксесуари"

#### Gender Values (`gender`)
- **Male**/**men** → "Men's" / "Чоловіче"
- **Female**/**women** → "Women's" / "Жіноче"
- **Unisex**/**unisex** → "Unisex" / "Унісекс"

---

### 2. **Translation Utilities** ([errorTranslation.ts](../src/utils/errorTranslation.ts))

Created comprehensive utility module with functions:

#### Error Handling
```typescript
translateErrorCode(errorCode: string): string
extractErrorCode(error: any): string | null
getErrorMessage(error: any): string
hasErrorCode(error: any): boolean
```

**Features:**
- Translates backend error codes to user-friendly messages
- Extracts error_code from various response formats
- Falls back to formatted error code if translation missing
- Logs missing translations in development

#### Success Handling
```typescript
translateSuccessCode(successCode: string): string
getSuccessMessage(response: any): string
hasSuccessCode(response: any): boolean
```

**Features:**
- Translates backend success codes
- Falls back to generic success message
- Supports both new (code-based) and legacy (message-based) formats

#### Data Field Translation
```typescript
translateProductType(type: string): string
translateGender(gender: string): string
```

**Features:**
- Treats backend enum values as translation keys
- Supports both "Male"/"men" and "Female"/"women" formats
- Returns original value if translation not found
- Logs missing translations in development

---

### 3. **API Error Handler Update** ([api.ts](../src/services/api.ts))

Updated `handleApiError` function:

```typescript
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;
    
    // Extract error_code if present (new backend format)
    const errorCode = axiosError.response?.data?.error_code || 
                      axiosError.response?.data?.code;
    
    return {
      message: axiosError.response?.data?.message || 
               axiosError.response?.data?.error ||
               axiosError.message || 
               'An unexpected error occurred',
      status: axiosError.response?.status,
      code: errorCode || axiosError.code,
      error_code: errorCode, // Pass through for translation
    };
  }
  // ... rest of error handling
};
```

**Changes:**
- Extracts `error_code` from response.data
- Falls back to `code` field if `error_code` not present
- Passes `error_code` through in ApiError object
- Backward compatible with message-based errors

---

### 4. **Type Definitions Update** ([types/index.ts](../src/types/index.ts))

Updated TypeScript interfaces:

```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  error_code?: string;  // New: backend error code
  success_code?: string; // New: backend success code
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  error_code?: string; // New: backend error code
}
```

---

### 5. **Component Updates**

#### Auth Service ([authService.ts](../src/services/authService.ts))
```typescript
import { getErrorMessage } from '@/utils/errorTranslation';

// In login/register methods:
catch (error) {
  const errorMessage = getErrorMessage(error);
  throw new Error(errorMessage);
}
```

**Before:** Used `apiError.message` directly (hardcoded English)  
**After:** Uses `getErrorMessage()` with error code translation

#### Favorite Button ([FavoriteButton.tsx](../src/components/FavoriteButton.tsx))
```typescript
import { translateSuccessCode } from '@/utils/errorTranslation';

// Guest favorite add:
toast({
  title: translateSuccessCode('FAVORITE_ADDED'),
  description: t('products.saved'),
});

// Guest favorite remove:
toast({
  title: translateSuccessCode('FAVORITE_REMOVED'),
  description: t('common.success'),
});
```

**Before:** Hardcoded Ukrainian text: "Додано", "Видалено"  
**After:** Uses translation codes that respect current language

#### Product Detail ([ProductDetail.tsx](../src/pages/ProductDetail.tsx))
```typescript
import { translateGender } from '@/utils/errorTranslation';

// Gender display:
<span>{translateGender(product.gender)}</span>
```

**Before:** Inline ternary: `product.gender === 'unisex' ? t('products.unisex') : product.gender === 'men' ? "Men's" : "Women's"`  
**After:** Clean function call with proper fallback

#### Products Page ([Products.tsx](../src/pages/Products.tsx))
```typescript
import { translateGender } from '@/utils/errorTranslation';

// Gender filter labels:
<Label>{translateGender(gender)}</Label>
```

**Before:** Hardcoded ternary with English labels  
**After:** Proper translation lookup

---

## 🎯 Backend Compatibility

### Current Support (Implemented)
✅ **Error codes**: Ready to receive `error_code` field  
✅ **Success codes**: Ready to receive `success_code` field  
✅ **Fallback**: Gracefully handles legacy `message` field  
✅ **Product types**: Treats backend values as translation keys  
✅ **Gender values**: Treats backend values as translation keys  

### Response Format Expected

**Error Response:**
```json
{
  "success": false,
  "error_code": "AUTH_INVALID_CREDENTIALS",
  "message": "Invalid credentials"  // Optional, for backward compatibility
}
```

**Success Response:**
```json
{
  "success": true,
  "success_code": "FAVORITE_ADDED",
  "message": "Added to favorites",  // Optional
  "data": { ... }
}
```

**Data Fields:**
```json
{
  "type": "Shoes",        // Used as translation key: productTypes.Shoes
  "gender": "Male",       // Used as translation key: gender.Male
  "role": "admin",        // Already i18n-compatible (enum)
  "is_verified": true     // Already i18n-compatible (boolean)
}
```

---

## 📋 Error Code Mapping Reference

### Authentication Errors
| Code | English | Ukrainian |
|------|---------|-----------|
| `AUTH_INVALID_CREDENTIALS` | Invalid email or password | Невірний email або пароль |
| `AUTH_TOKEN_EXPIRED` | Your session has expired. Please log in again | Ваша сесія закінчилася. Будь ласка, увійдіть знову |
| `AUTH_UNAUTHORIZED` | You are not authorized to perform this action | Ви не маєте прав для виконання цієї дії |
| `AUTH_USER_NOT_FOUND` | User not found | Користувача не знайдено |

### Product Errors
| Code | English | Ukrainian |
|------|---------|-----------|
| `PRODUCT_NOT_FOUND` | Product not found | Товар не знайдено |
| `PRODUCT_CREATE_FAILED` | Failed to create product | Не вдалося створити товар |
| `PRODUCT_UPDATE_FAILED` | Failed to update product | Не вдалося оновити товар |

### Favorite Errors
| Code | English | Ukrainian |
|------|---------|-----------|
| `FAVORITE_NOT_FOUND` | Favorite not found | Обране не знайдено |
| `FAVORITE_ALREADY_EXISTS` | Already in favorites | Вже в обраному |
| `FAVORITE_ADD_FAILED` | Failed to add to favorites | Не вдалося додати до обраного |

### Success Codes
| Code | English | Ukrainian |
|------|---------|-----------|
| `FAVORITE_ADDED` | Added to favorites | Додано до обраного |
| `FAVORITE_REMOVED` | Removed from favorites | Видалено з обраного |
| `AUTH_LOGIN_SUCCESS` | Logged in successfully | Успішний вхід |
| `PRODUCT_CREATED` | Product created successfully | Товар успішно створено |

*See full mappings in [en.json](../src/locales/en.json) and [uk.json](../src/locales/uk.json)*

---

## 🔄 Migration Path

### Phase 1: Current (Backward Compatible) ✅
- Frontend accepts both `error_code` and `message`
- Falls back to message if code not present
- All existing functionality preserved

### Phase 2: Backend Update (Next Sprint) ⏳
- Backend starts returning `error_code` in responses
- Backend optionally includes `message` for compatibility
- Frontend automatically uses codes when available

### Phase 3: Full Migration (Future)
- Backend removes legacy `message` field
- Frontend only uses code-based translations
- Complete separation of presentation and data

---

## 🧪 Testing

### Manual Testing Checklist
- [x] Error codes translate correctly in both languages
- [x] Success codes translate correctly in both languages
- [x] Gender values display translated text
- [x] Product types display translated text
- [x] Missing codes fall back gracefully
- [x] Legacy message format still works
- [x] Language switching updates all translations
- [x] Development logs missing translations

### Error Scenarios to Test
1. **Authentication failure** → Should show translated AUTH_INVALID_CREDENTIALS
2. **Network error** → Should show translated NETWORK_ERROR
3. **Favorite add/remove** → Should show translated success codes
4. **Product not found** → Should show translated PRODUCT_NOT_FOUND
5. **Unknown error code** → Should fall back to formatted code name

---

## 📝 Adding New Error Codes

### Backend Developer:
1. Define new error code constant (e.g., `USER_QUOTA_EXCEEDED`)
2. Return code in API response:
   ```json
   {
     "success": false,
     "error_code": "USER_QUOTA_EXCEEDED"
   }
   ```

### Frontend Developer:
1. Add translations to **both** locale files:
   ```json
   // en.json
   "errorCodes": {
     "USER_QUOTA_EXCEEDED": "You have reached your usage limit"
   }
   
   // uk.json
   "errorCodes": {
     "USER_QUOTA_EXCEEDED": "Ви досягли ліміту використання"
   }
   ```

2. **No code changes needed** – utility functions handle it automatically!

---

## 🎯 Benefits

### For Users
✅ Error messages in their preferred language  
✅ Consistent translations across the app  
✅ Better understanding of issues  

### For Developers
✅ Centralized error message management  
✅ Easy to add new error codes  
✅ Type-safe with TypeScript  
✅ Automatic fallback behavior  
✅ Development warnings for missing translations  

### For Business
✅ Better international user experience  
✅ Reduced support tickets from confused users  
✅ Professional multilingual application  
✅ Easier to add new languages in future  

---

## 📚 Related Documentation

- [Translation Guidelines](./TRANSLATION_GUIDELINES.md) - Key naming conventions
- [i18n Implementation](./I18N_IMPLEMENTATION_SUMMARY.md) - Overall i18n setup
- [SEO Multilingual Strategy](./SEO_MULTILINGUAL_STRATEGY.md) - URL-based language routing

---

**Status:** ✅ Complete and ready for backend integration  
**Last Updated:** December 25, 2025  
**Maintainer:** Frontend Team
