# Web Vitals Implementation Guide

## 📊 What are Web Vitals?

Core Web Vitals are Google's metrics for measuring user experience on the web:

### Core Metrics:
1. **LCP (Largest Contentful Paint)**: Loading performance
   - Good: < 2.5s
   - Needs improvement: 2.5s - 4.0s
   - Poor: > 4.0s

2. **FID (First Input Delay)**: Interactivity
   - Good: < 100ms
   - Needs improvement: 100ms - 300ms
   - Poor: > 300ms

3. **CLS (Cumulative Layout Shift)**: Visual stability
   - Good: < 0.1
   - Needs improvement: 0.1 - 0.25
   - Poor: > 0.25

### Additional Metrics:
4. **FCP (First Contentful Paint)**: < 1.8s good
5. **TTFB (Time to First Byte)**: < 800ms good

## 🚀 Implementation

### Files Created:
- `src/utils/webVitals.ts` - Core monitoring logic
- `src/components/WebVitalsDisplay.tsx` - Development UI widget

### Files Modified:
- `src/main.tsx` - Initialize monitoring
- `src/App.tsx` - Add display widget

### How It Works:

```typescript
// Automatically tracks vitals on page load
initWebVitals();

// In development: logs to console
// ✅ LCP: 1234ms (good)
// ⚠️ FID: 150ms (needs-improvement)

// In production: sends to analytics
sendToAnalytics(vital);
```

## 🎯 Development Features

### Visual Widget:
- Click "📊 Vitals" button in bottom-left corner
- Real-time metrics display
- Color-coded ratings:
  - ✅ Green = Good
  - ⚠️ Yellow = Needs improvement
  - ❌ Red = Poor

### Console Logging:
All metrics are logged in development mode:
```
📊 Web Vitals monitoring initialized
✅ LCP: 1234ms (good)
✅ FID: 50ms (good)
✅ CLS: 0.05 (good)
```

## 📈 Analytics Integration

### Current Implementation:
Ready for integration with:
- Google Analytics 4
- Custom API endpoints
- Sentry Performance Monitoring

### To Enable:
Uncomment in `src/utils/webVitals.ts`:

```typescript
// Google Analytics 4
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', metric.name, { ... });
}

// Custom API
navigator.sendBeacon('/api/analytics/vitals', body);

// Sentry
Sentry.metrics.set(metric.name, metric.value);
```

## 🔧 Usage

### Get Current Snapshot:
```typescript
import { getWebVitalsSnapshot } from '@/utils/webVitals';

const vitals = await getWebVitalsSnapshot();
console.log(vitals);
// { LCP: { value: 1234, rating: 'good', ... }, ... }
```

### Check if All Vitals are Good:
```typescript
import { areVitalsGood } from '@/utils/webVitals';

const allGood = await areVitalsGood();
if (allGood) {
  console.log('All vitals are good! 🎉');
}
```

## 🎨 Customization

### Hide Widget in Production:
Widget automatically hidden in production builds.

### Disable Monitoring:
Remove from `main.tsx`:
```typescript
// initWebVitals(); // Comment out
```

### Custom Thresholds:
Modify in `src/utils/webVitals.ts`:
```typescript
case 'LCP':
  return value <= 2000 ? 'good' : ... // Custom threshold
```

## 📊 Monitoring Best Practices

1. **Development**: Use widget to optimize page performance
2. **Staging**: Test vitals before production
3. **Production**: Send to analytics for monitoring
4. **CI/CD**: Add vitals budget checks

### Performance Budget Example:
```json
{
  "LCP": 2500,
  "FID": 100,
  "CLS": 0.1,
  "FCP": 1800,
  "TTFB": 800
}
```

## 🔍 Debugging Poor Vitals

### Poor LCP (> 4s):
- Optimize images (WebP, lazy loading)
- Reduce server response time
- Remove render-blocking resources
- Use CDN

### Poor FID (> 300ms):
- Split large JavaScript bundles
- Use code splitting
- Defer non-critical JS
- Optimize event handlers

### Poor CLS (> 0.25):
- Set image dimensions
- Reserve space for ads
- Avoid inserting content above existing content
- Use CSS `contain` property

## 📚 Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

*Last updated: January 4, 2026*
*Monitoring active in development mode*
