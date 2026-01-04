# Wearsearch - Fashion Discovery Platform

A modern, high-performance fashion discovery platform built with React, TypeScript, and Tailwind CSS.

## � Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Performance Optimizations](#-performance-optimizations)
- [Development Workflow](#-development-workflow)
- [API Integration](#-api-integration)
- [Contributing](#-contributing)

## �🚀 Features

- **Product Discovery** - Browse and search fashion items from multiple brands
- **Store Management** - Discover stores and their offerings
- **User Authentication** - Secure login and registration
- **Favorites System** - Save your favorite products
- **Store Ratings** - Rate and review stores
- **Admin Panel** - Manage products, stores, and brands
- **Optimized Performance** - React Query caching, code splitting, and WebP images
- **Responsive Design** - Black & white glassmorphism aesthetic
- **Internationalization** - Full i18n support (English, Ukrainian)
- **Error Logging** - Centralized error tracking with context

## 🏗️ Architecture

### Overview

Wearsearch follows a **feature-based architecture** with clear separation of concerns. The application is built using modern React patterns, TypeScript for type safety, and a centralized state management approach using React Query.

### Core Principles

1. **Feature-Based Organization** - Code organized by feature, not by file type
2. **Type Safety** - Comprehensive TypeScript coverage
3. **Performance First** - React Query caching, code splitting, lazy loading
4. **Error Handling** - Centralized error logging service
5. **i18n Ready** - All text translatable, backend returns data only

### Architecture Layers

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  (Pages, Components, UI, i18n)              │
├─────────────────────────────────────────────┤
│           Business Logic Layer              │
│  (Hooks, State Management, React Query)     │
├─────────────────────────────────────────────┤
│           Data Access Layer                 │
│  (API Services, Auth, Error Logging)        │
├─────────────────────────────────────────────┤
│           Utility Layer                     │
│  (Helpers, Validators, Types)               │
└─────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Component → React Query Hook → API Service → Backend
                ↓              ↓                  ↓
           UI Update ← Cache Update ← Response Transform
```

### Key Patterns

#### 1. Container/View Pattern
Components are split into smart (container) and presentational components:
- **Container**: Handles data fetching, state, side effects
- **View**: Pure UI rendering with props

#### 2. Custom Hooks Pattern
Business logic abstracted into reusable hooks:
```typescript
// API hooks (React Query)
useProducts(), useStores(), useBrands()

// Aggregated data hooks (batch requests)
useHomepageData(), useProductDetailData()

// Feature hooks
useAuth(), useFavorites(), useImageUpload()
```

#### 3. Service Layer Pattern
All API calls centralized in service modules:
```typescript
// services/
├── api.ts           // Unified axios instance
├── authService.ts   // Authentication
├── productService.ts // Products
├── storeService.ts  // Stores
├── brandService.ts  // Brands
└── logger.ts        // Error logging
```

### State Management Strategy

**React Query** is the primary state management solution:
- **Server State**: Cached with React Query (products, stores, users)
- **Client State**: React useState/useContext for UI state
- **Authentication**: localStorage + authStorage utility
- **Favorites**: localStorage for guests, backend for authenticated users

### Authentication Flow

```
1. Login → API returns token + user
2. Store in localStorage (authStorage.ts)
3. Set Authorization header in axios
4. useAuth hook provides auth state
5. Protected routes check authentication
6. Logout → Clear localStorage + API call
```

### Error Handling Strategy

Centralized error logging service (`src/services/logger.ts`):
```typescript
import { logError, logApiError, logAuthError } from '@/services/logger';

// API errors
logApiError(error, '/products', { component: 'ProductList' });

// Auth errors
logAuthError(error, 'LOGIN');

// General errors
logError(error, { component: 'Component', action: 'ACTION' });
```

**Benefits:**
- Consistent error tracking across codebase
- Context-aware logging (component, action, userId)
- Development mode: Grouped console output
- Production ready for Sentry/LogRocket integration

### Performance Optimizations

1. **API Request Optimization**
   - Aggregated endpoints (homepage, product detail)
   - React Query caching (5min stale time, 10min gc time)
   - Request batching for multiple simultaneous calls

2. **Code Splitting**
   - Route-based splitting with React.lazy()
   - Manual vendor chunks (react, ui, icons)
   - Dynamic imports for dialogs and heavy components

3. **Image Optimization**
   - WebP format (40% size reduction)
   - Lazy loading with Intersection Observer
   - AWS S3 CDN integration

4. **Bundle Optimization**
   - Tree-shaking unused code
   - Minification with esbuild
   - Compression (gzip/brotli)

### i18n Architecture

**Frontend-Only Translation Approach:**
- All text content in `src/locales/` (en.json, uk.json)
- Backend returns raw data only (no translated strings)
- React i18next for runtime translation
- Fallback language: English
- No string concatenation in code

**Translation Structure:**
```typescript
// locales/en.json
{
  "common": { "loading": "Loading..." },
  "product": { 
    "card": { "title": "Product" },
    "detail": { "description": "Description" }
  }
}

// Usage
const { t } = useTranslation();
t('product.card.title');
```

## 📁 Project Structure

```
src/
├── app/                      # Application configuration
│   ├── providers.tsx        # React Query, Toaster, i18n providers
│   └── router.tsx           # Route configuration with lazy loading
│
├── components/              # React components
│   ├── ui/                 # shadcn/ui components (Button, Input, etc.)
│   ├── common/             # Shared components (ProductCard, SkeletonLoader)
│   ├── layout/             # Layout components (Navigation, Footer)
│   └── [feature]/          # Feature-specific components
│
├── features/               # Feature-based modules
│   ├── auth/              # Authentication (LoginDialog, RegisterDialog, useAuth)
│   │   ├── components/    # Auth UI components
│   │   └── hooks/         # Auth hooks
│   ├── product/           # Product features
│   └── search/            # Search features
│
├── hooks/                 # Custom React hooks
│   ├── useApi.ts         # React Query API hooks (unified)
│   ├── useAggregatedData.ts # Batch API requests
│   ├── use-toast.ts      # Toast notifications
│   └── [feature].ts      # Feature-specific hooks
│
├── pages/                # Page components (HomePage, ProductDetail, etc.)
│   ├── HomePage.tsx
│   ├── ProductDetail.tsx
│   ├── StoresList.tsx
│   └── BrandsList.tsx
│
├── services/            # API services layer
│   ├── api.ts          # Unified axios instance with interceptors
│   ├── authService.ts  # Authentication API calls
│   ├── productService.ts # Product API calls
│   ├── storeService.ts  # Store API calls
│   ├── brandService.ts  # Brand API calls
│   ├── userService.ts   # User profile, favorites
│   ├── logger.ts        # Error logging service
│   └── endpoints.ts     # API endpoint constants
│
├── types/              # TypeScript type definitions
│   └── index.ts       # Centralized types (User, Product, Store, etc.)
│
├── utils/             # Utility functions
│   ├── authStorage.ts # Auth token management (localStorage)
│   ├── cn.ts         # Tailwind className utilities
│   ├── errorTranslation.ts # Error message translation
│   ├── translations.ts # Category/color translations
│   └── apiOptimizations.ts # Request batching, caching
│
├── locales/          # i18n translation files
│   ├── en.json      # English translations
│   └── uk.json      # Ukrainian translations
│
├── assets/          # Static assets (images, fonts)
│   └── assets-webp/ # Optimized WebP images
│
├── design/          # Design system
│   └── tokens.ts   # Design tokens (colors, spacing, typography)
│
└── config/         # Configuration files
    └── [configs]

docs/                    # Documentation
scripts/                # Build and utility scripts
public/                 # Public static files
```

### Key Directories Explained

- **`src/app/`**: Application bootstrap (providers, router)
- **`src/features/`**: Self-contained feature modules (auth, product, search)
- **`src/hooks/`**: Reusable hooks (API, state, effects)
- **`src/services/`**: API layer with axios services
- **`src/utils/`**: Pure utility functions (no React dependencies)
- **`src/locales/`**: Translation files for i18n
- **`src/design/`**: Design system tokens

## 🛠️ Tech Stack

### Core Technologies
- **React 18.3** - UI library with Concurrent Features
- **TypeScript 5.8** - Type-safe JavaScript
- **Vite 5.4** - Fast build tool and dev server
- **React Router 6** - Client-side routing

### State Management & Data Fetching
- **TanStack Query (React Query) 5.x** - Server state management, caching
- **Axios 1.7** - HTTP client with interceptors

### UI & Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library (Radix UI primitives)
- **Lucide React** - Icon library
- **React Icons** - Additional icons (Social media)

### Internationalization
- **react-i18next 15.x** - i18n framework
- **i18next** - Core i18n engine

### Development Tools
- **ESLint** - Code linting (TypeScript rules enabled)
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

### Image Optimization
- **Sharp** - Image processing and WebP conversion

### Build Output
- **JavaScript**: 423 KB main bundle (minified + gzip)
- **Vendors**: 158 KB React, 118 KB UI components
- **Total**: ~0.87 MB (91.6% reduction from original)

## 📋 Prerequisites

- Node.js 18+ or Bun
- npm/pnpm/bun package manager

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd wearsearchh
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
# or
bun install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and configure:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Supabase Configuration (Optional)
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# Application Configuration
VITE_APP_NAME=Wearsearch
VITE_APP_VERSION=2.0.0

# Feature Flags (Optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

### 4. Start development server

```bash
npm run dev
```

Visit `http://localhost:8080`

## 📦 Build for Production

```bash
npm run build
```

**Build Output:**
- Minified JavaScript bundles
- Optimized CSS (Tailwind purge)
- Source maps for debugging
- gzip/brotli compression ready

Preview production build:

```bash
npm run preview
```

## 💻 Development Workflow

### 1. Development Server

Start the dev server with hot module replacement:
```bash
npm run dev
```
Server runs on `http://localhost:8080`

### 2. Code Quality

**ESLint** checks code quality:
```bash
npm run lint
```

**ESLint Configuration:**
- TypeScript rules enabled
- Unused variables: Warning (with `_` prefix ignore)
- No eslint-disable or @ts-ignore suppressions

### 3. Type Checking

TypeScript type checking:
```bash
npx tsc --noEmit
```

### 4. Error Logging

Use the centralized logger service:
```typescript
import { logError, logApiError, logAuthError } from '@/services/logger';

try {
  await api.get('/endpoint');
} catch (error) {
  logApiError(error, '/endpoint', { component: 'MyComponent' });
}
```

### 5. Adding New Features

**Follow this structure:**
```
1. Create feature folder: src/features/[feature-name]/
2. Add components: src/features/[feature-name]/components/
3. Add hooks: src/features/[feature-name]/hooks/
4. Add types: src/types/index.ts
5. Add API service: src/services/[feature]Service.ts
6. Add translations: src/locales/en.json, uk.json
7. Update router: src/app/router.tsx
```

### 6. Best Practices

✅ **Do:**
- Use React Query for server state
- Use custom hooks for reusable logic
- Keep components small and focused
- Use TypeScript types from `@/types`
- Log errors with logger service
- Add i18n keys for all text
- Write semantic HTML

❌ **Don't:**
- Use console.error (use logger instead)
- Add @ts-ignore or eslint-disable
- Concatenate translated strings
- Fetch data in components (use hooks)
- Store auth tokens manually (use authStorage)
- Mix server and client state

## 🔧 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 📊 Performance Optimizations

### Implemented

✅ **React Query Caching** - 60-70% fewer API calls  
✅ **Code Splitting** - Manual chunks for vendors  
✅ **WebP Images** - 40% smaller image sizes  
✅ **Lazy Loading** - Images load on demand  
✅ **Minification** - esbuild optimization  
✅ **Bundle Size** - Reduced from 10.4MB to 0.87MB (91.6% reduction)

### Build Output

```
dist/assets/index.js         423 KB (main bundle)
dist/assets/react-vendor.js  158 KB (React libs)
dist/assets/ui-vendor.js     118 KB (UI components)
dist/assets/query.js          31 KB (React Query)
dist/assets/icons.js          17 KB (Icon libraries)
```

## 🔐 Authentication

The app uses a unified authentication storage system:

```typescript
import { setAuth, getAuth, clearAuth, isAuthenticated } from '@/utils/authStorage';

// Store token
setAuth(token, userId, expiresAt);

// Get token
const token = getAuth();

// Clear auth
clearAuth();

// Check if authenticated
if (isAuthenticated()) {
  // ...
}
```

## 🌐 API Integration

All API calls use a unified axios instance:

```typescript
import { api, apiGet, apiPost } from '@/services/api.unified';

// Using hooks (recommended)
import { useProducts, useStores } from '@/hooks/useApi.unified';

const { data: products, isLoading } = useProducts();

// Direct API calls
const response = await apiGet('/items');
const created = await apiPost('/items', data);
```

## 🎨 Design System

### Colors
- Black: `#000000`
- White: `#FFFFFF`

### Glassmorphism Classes
- `.glass-card` - Standard glass effect
- `.glass-card-strong` - Stronger glass effect
- `.neon-text` - Neon text glow
- `.btn-glass` - Glass button style

## 📝 Type Definitions

All types are centralized in `src/types/index.ts`:

```typescript
import type { 
  User, 
  Product, 
  Store, 
  Brand,
  ApiResponse 
} from '@/types';
```

## 🔍 Image Optimization

Convert images to WebP:

```bash
npx tsx scripts/convertImages.ts
```

This will:
- Convert all JPG/PNG images to WebP
- Reduce image sizes by 25-40%
- Save originals as backup

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Radix UI](https://www.radix-ui.com/) - Headless UI primitives
- [Lucide](https://lucide.dev/) - Icon library
- [TanStack Query](https://tanstack.com/query) - Data fetching

## 📧 Support

For support, email support@wearsearch.com or create an issue.

---

**Made with ❤️ by the Wearsearch Team**
