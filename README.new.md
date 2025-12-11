# Wearsearch - Fashion Discovery Platform

A modern, high-performance fashion discovery platform built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Product Discovery** - Browse and search fashion items from multiple brands
- **Store Management** - Discover stores and their offerings
- **User Authentication** - Secure login and registration
- **Favorites System** - Save your favorite products
- **Store Ratings** - Rate and review stores
- **Admin Panel** - Manage products, stores, and brands
- **Optimized Performance** - React Query caching, code splitting, and WebP images
- **Responsive Design** - Black & white glassmorphism aesthetic

## 📁 Project Structure

```
src/
├── app/                    # Application configuration
│   ├── providers.tsx      # React Query, Toaster providers
│   └── router.tsx         # Route configuration
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── common/           # Shared components
│   └── layout/           # Layout components
├── features/             # Feature-based modules
│   ├── auth/            # Authentication features
│   ├── product/         # Product features
│   └── search/          # Search features
├── hooks/               # Custom React hooks
│   ├── useApi.unified.ts  # React Query API hooks
│   └── use-toast.ts      # Toast notifications
├── pages/               # Page components
├── services/            # API services
│   └── api.unified.ts   # Unified axios instance
├── types/               # TypeScript type definitions
│   └── index.ts         # Centralized types
├── utils/               # Utility functions
│   ├── authStorage.ts   # Auth token management
│   └── cn.ts            # Tailwind utilities
└── assets/              # Static assets

scripts/                 # Build scripts
├── convertImages.ts     # Image optimization script

public/                  # Public static files
docs/                    # Documentation
```

## 🛠️ Tech Stack

- **Framework**: React 18.3
- **Language**: TypeScript 5.8
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Image Optimization**: Sharp

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

Preview production build:

```bash
npm run preview
```

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
