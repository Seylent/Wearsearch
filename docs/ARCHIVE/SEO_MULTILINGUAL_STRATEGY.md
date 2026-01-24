# SEO-Friendly Multilingual URL Architecture

## Current Implementation

Currently, the website uses **client-side language switching** without URL changes:
- Language is stored in `localStorage`
- No URL reflection of current language
- Not optimal for SEO or direct linking

## Recommended Future Architecture

### URL Structure

Implement language prefixes in URLs:

```
/ (redirect to /en or /uk based on preference)
/en/                    → English homepage
/en/products            → English products page
/en/products/:id        → English product detail
/en/stores              → English stores page
/uk/                    → Ukrainian homepage
/uk/products            → Ukrainian products page
/uk/products/:id        → Ukrainian product detail
/uk/stores              → Ukrainian stores page
```

### Benefits

1. **SEO Optimization**
   - Search engines can index language-specific pages
   - Users can share direct links to specific language versions
   - Better ranking for localized content

2. **User Experience**
   - Bookmarkable language-specific URLs
   - Browser back/forward navigation preserves language
   - Deep linking support

3. **Analytics**
   - Track language-specific traffic
   - Better insights into user preferences

## Implementation Plan

### Phase 1: Router Configuration (React Router v6)

Update `src/app/router.tsx`:

```typescript
import { createBrowserRouter } from 'react-router-dom';
import { languageService, SUPPORTED_LANGUAGES } from '@/i18n';

// Language-aware wrapper component
function LanguageRouteWrapper({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const { i18n } = useTranslation();
  
  useEffect(() => {
    if (params.lang && params.lang !== i18n.language) {
      i18n.changeLanguage(params.lang);
    }
  }, [params.lang]);
  
  return <>{children}</>;
}

const routes = [
  {
    path: '/:lang',
    element: <LanguageRouteWrapper><App /></LanguageRouteWrapper>,
    children: [
      { path: '', element: <Index /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:id', element: <ProductDetail /> },
      { path: 'stores', element: <Stores /> },
      // ... other routes
    ]
  },
  {
    path: '/',
    element: <Navigate to={`/${languageService.getInitialLanguage()}`} replace />
  }
];
```

### Phase 2: Navigation Updates

Update all navigation links to include language prefix:

```typescript
// Instead of:
<Link to="/products">Products</Link>

// Use:
<Link to={`/${i18n.language}/products`}>Products</Link>

// Or create a helper:
function useLocalizedLink(path: string) {
  const { i18n } = useTranslation();
  return `/${i18n.language}${path}`;
}
```

### Phase 3: SEO Metadata

Add to each page component:

```typescript
import { Helmet } from 'react-helmet-async';

function Products() {
  const { i18n, t } = useTranslation();
  
  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>{t('products.title')} | Wearsearch</title>
        <meta name="description" content={t('products.metaDescription')} />
        
        {/* Hreflang tags for alternate languages */}
        <link 
          rel="alternate" 
          hrefLang="en" 
          href={`${window.location.origin}/en/products`} 
        />
        <link 
          rel="alternate" 
          hrefLang="uk" 
          href={`${window.location.origin}/uk/products`} 
        />
        <link 
          rel="alternate" 
          hrefLang="x-default" 
          href={`${window.location.origin}/en/products`} 
        />
      </Helmet>
      
      {/* Page content */}
    </>
  );
}
```

### Phase 4: Server-Side Considerations (if using SSR)

If implementing Server-Side Rendering (SSR) with Vite SSR or Next.js:

1. Detect language from URL on server
2. Render appropriate language version
3. Set `Content-Language` HTTP header
4. Generate sitemap with all language versions

## Language Detection Priority

The system already implements this in `i18n.ts`:

1. **URL path** (highest priority): `/en/products` → use English
2. **localStorage**: User's saved preference
3. **Default**: Fall back to English

## hreflang Implementation

Add `react-helmet-async` for dynamic meta tags:

```bash
npm install react-helmet-async
```

Wrap app in provider:

```typescript
import { HelmetProvider } from 'react-helmet-async';

root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
```

## Sitemap Generation

Generate language-specific sitemap entries:

```xml
<url>
  <loc>https://wearsearch.com/en/products</loc>
  <xhtml:link 
    rel="alternate" 
    hreflang="uk" 
    href="https://wearsearch.com/uk/products" />
  <xhtml:link 
    rel="alternate" 
    hreflang="en" 
    href="https://wearsearch.com/en/products" />
</url>
```

## Migration Strategy

### For Existing URLs

Set up redirects to preserve existing links:

```typescript
// In router or middleware
if (!pathname.startsWith('/en') && !pathname.startsWith('/uk')) {
  const lang = languageService.getInitialLanguage();
  return <Navigate to={`/${lang}${pathname}`} replace />;
}
```

### For External Links

Maintain support for non-prefixed URLs temporarily:
- Redirect to language-prefixed version
- Use 301 redirects for SEO

## Testing Checklist

- [ ] All internal links use language prefix
- [ ] Language switching updates URL
- [ ] Direct URL access loads correct language
- [ ] Search engines can crawl all language versions
- [ ] hreflang tags are correct
- [ ] Sitemap includes all language variants
- [ ] 404 pages respect language context
- [ ] Social sharing uses correct language URLs

## Performance Considerations

- **Code splitting**: Load only active language translations
- **Caching**: Cache language-specific pages separately
- **CDN**: Configure CDN to respect language URLs

## Current Status

✅ **Implemented:**
- Language detection from URL in `languageService.detectLanguageFromURL()`
- Initial language priority system
- HTML `lang` attribute updates

⏳ **Pending Implementation:**
- Router configuration with language prefix
- Navigation component updates
- SEO meta tags and hreflang
- Sitemap generation

## Quick Start for SEO Implementation

1. Install dependencies:
   ```bash
   npm install react-helmet-async
   ```

2. Update router to use `/:lang` prefix

3. Create `useLocalizedLink` hook for navigation

4. Add Helmet to page components with hreflang tags

5. Generate sitemap with language variants

6. Test with Google Search Console

---

**Note:** This is a comprehensive strategy document. Implementation should be phased based on business priorities and SEO requirements.
