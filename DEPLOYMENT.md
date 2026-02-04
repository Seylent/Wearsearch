# ===========================================

# WEARSEARCH FRONTEND - PRODUCTION CHECKLIST

# ===========================================

## 🚀 Before Deployment

### 1. Environment Configuration

- [ ] Create production `.env` file (don't commit!)
- [ ] Set `NEXT_PUBLIC_API_BASE_URL` to production API URL
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production site URL
- [ ] Remove all `192.168.*` or localhost references
- [ ] Verify `.env` is in `.gitignore`

### 2. Code Quality

- [ ] Run `npm run lint` - fix all errors
- [ ] Run `npm run type-check` - fix TypeScript errors
- [ ] Test all critical user flows
- [ ] Check browser console for errors

### 3. API Integration

- [ ] Verify backend API is deployed and accessible
- [ ] Test all API endpoints from frontend
- [ ] Confirm authentication works
- [ ] Verify CORS is configured correctly on backend

### 4. Build & Test

- [ ] Run `npm run build` successfully
- [ ] Test production build locally with `npm run start`
- [ ] Check bundle size (should be < 500KB gzipped)
- [ ] Test on mobile devices

### 5. Deployment Platform Setup

#### For Vercel:

```bash
npm install -g vercel
vercel login
vercel --prod
```

Environment variables to set:

- `NEXT_PUBLIC_API_BASE_URL` - Your production API URL
- `NEXT_PUBLIC_SITE_URL` - Your production site URL
- `NEXT_PUBLIC_GTM_ID` - Optional analytics tag
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Optional

#### For Netlify:

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

Netlify uses `@netlify/plugin-nextjs` via `netlify.toml`.

Environment variables to set:

- `NEXT_PUBLIC_API_BASE_URL` - Your production API URL
- `NEXT_PUBLIC_SITE_URL` - Your production site URL
- `NEXT_PUBLIC_GTM_ID` - Optional analytics tag
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Optional

### 6. Post-Deployment

- [ ] Test deployed site on multiple devices
- [ ] Verify all images load correctly
- [ ] Check API calls in Network tab
- [ ] Test user authentication flow
- [ ] Verify product search and filters work
- [ ] Check store pages load correctly

## 📝 Environment Variables

### Development (.env.development)

```bash
NEXT_PUBLIC_API_BASE_URL=/api/v1
NEXT_PUBLIC_API_URL=http://localhost:3000
API_PROXY_TARGET=http://localhost:3000
```

### Production (.env.production)

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 🔒 Security Checklist

- [ ] No API keys in frontend code
- [ ] No sensitive data in localStorage (auth tokens must be in httpOnly cookies)
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] XSS protection enabled

### Auth Cookies (Required for Production)

- Set `NEXT_PUBLIC_AUTH_COOKIE_MODE=true`
- Backend must set session cookies with `HttpOnly`, `Secure`, and `SameSite=Lax` (or stricter)
- Backend should set a `csrf_token` cookie for non-GET requests

## 📊 Performance

- [ ] Images optimized (WebP format)
- [ ] Code splitting configured
- [ ] Lazy loading for routes
- [ ] CDN configured for static assets
- [ ] Gzip/Brotli compression enabled

## 🐛 Known Issues

- Document any known issues here
- Add workarounds if applicable

## 📞 Support Contacts

- Backend API: [Your backend developer contact]
- DevOps: [Your DevOps contact]
- Frontend: [Your contact]
