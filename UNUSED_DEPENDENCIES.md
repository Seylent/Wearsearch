# Unused Dependencies Analysis

## ✅ Safe to Remove (Not Used Anywhere)

### UI Components (0 imports found)
1. **`input-otp`** - OTP input component
   - Component exists: `src/components/ui/input-otp.tsx`
   - **Not imported anywhere** ❌
   
2. **`vaul`** - Drawer component  
   - Component exists: `src/components/ui/drawer.tsx`
   - **Not imported anywhere** ❌
   
3. **`cmdk`** - Command palette
   - Component exists: `src/components/ui/command.tsx`
   - **Not imported anywhere** ❌
   
4. **`recharts`** - Chart library
   - Component exists: `src/components/ui/chart.tsx`
   - **Not imported anywhere** ❌
   - **Size: ~200 KB** 🔴

5. **`react-day-picker`** - Date picker
   - Component exists: `src/components/ui/calendar.tsx`
   - **Not imported anywhere** ❌
   
6. **`embla-carousel-react`** - Carousel
   - Component exists: `src/components/ui/carousel.tsx`
   - **Not imported anywhere** ❌
   - **Size: ~50 KB** 🔴

### Radix UI Components (Limited Use)
These are imported but check if they're actually used:

7. **`@radix-ui/react-collapsible`** - No usage found
8. **`@radix-ui/react-context-menu`** - Only in UI file
9. **`@radix-ui/react-hover-card`** - No usage found  
10. **`@radix-ui/react-menubar`** - No usage found
11. **`@radix-ui/react-navigation-menu`** - No usage found
12. **`@radix-ui/react-popover`** - No usage found
13. **`@radix-ui/react-progress`** - No usage found
14. **`@radix-ui/react-radio-group`** - No usage found
15. **`@radix-ui/react-scroll-area`** - No usage found (but in sidebar.tsx)
16. **`@radix-ui/react-slider`** - No usage found
17. **`@radix-ui/react-switch`** - No usage found
18. **`@radix-ui/react-toggle`** - Only in toggle-group
19. **`@radix-ui/react-toggle-group`** - No usage found
20. **`@radix-ui/react-aspect-ratio`** - No usage found
21. **`@radix-ui/react-accordion`** - No usage found

### Other Dependencies
22. **`@tanstack/react-virtual`** - Virtual scrolling
   - **Not used** (removed VirtualizedProductGrid)
   - **Size: ~30 KB** 🔴

23. **`sonner`** - Toast notifications
   - Check if actually used vs @radix-ui/react-toast

24. **`next-themes`** - Theme provider
   - Check if this is actually used for theme switching

## 📊 Estimated Savings

### High Priority (Immediate Removal)
- `recharts`: ~200 KB
- `embla-carousel-react`: ~50 KB  
- `@tanstack/react-virtual`: ~30 KB
- `vaul`: ~20 KB
- `cmdk`: ~30 KB
- `input-otp`: ~15 KB
- `react-day-picker`: ~40 KB

**Total: ~385 KB gzipped, ~1,200 KB raw**

### Medium Priority (Unused Radix Components)
Each unused @radix-ui component: ~10-20 KB
~15 unused components × 15 KB = ~225 KB

**Total Potential Savings: ~600 KB gzipped, ~2,500 KB raw** ✅

## 🔧 Action Plan

### Step 1: Remove Unused Heavy Dependencies
```bash
npm uninstall recharts embla-carousel-react @tanstack/react-virtual vaul cmdk input-otp react-day-picker
```

### Step 2: Remove Unused Radix UI Components
```bash
npm uninstall @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-hover-card @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-aspect-ratio @radix-ui/react-accordion
```

### Step 3: Delete Unused UI Component Files
```bash
rm src/components/ui/calendar.tsx
rm src/components/ui/carousel.tsx
rm src/components/ui/chart.tsx
rm src/components/ui/command.tsx
rm src/components/ui/drawer.tsx
rm src/components/ui/input-otp.tsx
```

### Step 4: Check Theme Provider
If `next-themes` is not actually used:
```bash
npm uninstall next-themes
```

## ✅ Safe to Keep (Actively Used)

- `@radix-ui/react-dialog` - LoginDialog, RegisterDialog
- `@radix-ui/react-dropdown-menu` - UserProfileMenu
- `@radix-ui/react-select` - Products sorting
- `@radix-ui/react-checkbox` - Filters
- `@radix-ui/react-toast` - Notifications
- `@radix-ui/react-tooltip` - Tooltips
- `@radix-ui/react-tabs` - Profile, Admin pages
- `@radix-ui/react-alert-dialog` - Profile page
- `@radix-ui/react-avatar` - UserProfileMenu
- `@radix-ui/react-separator` - Sidebar
- `@radix-ui/react-label` - Forms

## 📝 Verification

After removal, verify the build:
```bash
npm run build
npm run preview
```

Check bundle size reduction in dist folder.

## 🎯 Expected Results

**Before:**
- Total JS: 4,696.9 KB
- Unused: 2,500.3 KB

**After:**  
- Total JS: ~2,200 KB (-53%)
- Unused: ~500 KB (-80%)
- **Lighthouse Score: +15-20 points**
