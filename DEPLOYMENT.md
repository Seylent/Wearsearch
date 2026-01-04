# ===========================================
# WEARSEARCH FRONTEND - PRODUCTION CHECKLIST
# ===========================================

## 🚀 Before Deployment

### 1. Environment Configuration
- [ ] Create production `.env` file (don't commit!)
- [ ] Set `VITE_API_BASE_URL` to production API URL
- [ ] Update `vercel.json` or `netlify.toml` with correct API endpoint
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
- [ ] Test production build locally with `npm run preview`
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
- `VITE_API_BASE_URL` - Your production API URL

#### For Netlify:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

Environment variables to set:
- `VITE_API_BASE_URL` - Your production API URL

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
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:3000
VITE_ENABLE_DEBUG_MODE=true
```

### Production (.env.production)
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
```

## 🔒 Security Checklist
- [ ] No API keys in frontend code
- [ ] No sensitive data in localStorage
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] XSS protection enabled

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
