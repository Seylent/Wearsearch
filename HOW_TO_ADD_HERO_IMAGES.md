# 📸 How to Add Hero Images (Your Clothing Photos)

## 🎯 What Was Created

A beautiful **slideshow carousel** behind the "Discover Exceptional Fashion" text on the homepage!

**Visual Layout:**
```
┌────────────────────────────────────┐
│                                    │
│     [Floating Product Images]      │  ← Your clothing photos!
│                                    │
│    Discover                        │  ← Text on top
│    Exceptional                     │
│    Fashion                         │
│                                    │
│    [Buttons] [Stats]               │
│                                    │
└────────────────────────────────────┘
```

**Features:**
- ✨ 3 floating images at a time
- 🔄 Auto-rotates every 4 seconds
- 🎨 Grayscale effect matching your theme
- ✨ Smooth fade transitions
- 📱 Responsive design
- 🎭 Floating animation with glow

---

## 📁 Step 1: Add Your Photos

### Option A: Use Public Folder (Easiest)

1. Create folder: `public/hero/`
2. Add your photos:
   ```
   public/
   └── hero/
       ├── sneakers-1.jpg
       ├── jacket-black.jpg
       ├── tshirt-acne.jpg
       ├── jordan-4.jpg
       ├── sweater-knit.jpg
       ├── pants-balenciaga.jpg
       ├── puffer-jacket.jpg
       └── beanie-pattern.jpg
   ```

3. **Done!** Images will load automatically

### Option B: Use URLs

If images are hosted online (Supabase, Cloudinary, etc.):

Edit `src/components/sections/HeroImageCarousel.tsx`:

```typescript
const HERO_IMAGES = [
  'https://your-cdn.com/sneakers.jpg',
  'https://your-cdn.com/jacket.jpg',
  'https://your-cdn.com/tshirt.jpg',
  // ... more URLs
];
```

---

## 🖼️ Recommended Image Specs

| Property | Value |
|----------|-------|
| **Size** | 400x500px or larger |
| **Aspect** | Portrait (3:4 ratio) |
| **Format** | JPG or PNG |
| **Quality** | Medium-High (not too large) |
| **Background** | Any (will be styled automatically) |

---

## 🎨 Customization Options

### Change Auto-Rotate Speed

Edit line 19 in `HeroImageCarousel.tsx`:

```typescript
}, 4000); // Change to 3000 (3sec) or 5000 (5sec)
```

### Add More Images

Just add more paths to the array:

```typescript
const HERO_IMAGES = [
  '/hero/image-1.jpg',
  '/hero/image-2.jpg',
  '/hero/image-3.jpg',
  '/hero/image-4.jpg',
  '/hero/new-image.jpg',  // ← Add here
  '/hero/another.jpg',     // ← And here
];
```

### Change Image Positions

Edit transform values in `HeroImageCarousel.tsx`:

```typescript
// Main image (center)
transform: 'translateX(0) translateY(0) rotate(-2deg)'

// Left image
transform: 'translateX(-200px) translateY(50px) rotate(-8deg)'
//           ↑ Move more left   ↑ Move down   ↑ Tilt

// Right image  
transform: 'translateX(200px) translateY(-30px) rotate(6deg)'
//           ↑ Move more right  ↑ Move up     ↑ Tilt
```

### Change Opacity/Visibility

In `HeroSection.tsx` line where carousel is added:

```typescript
opacity-30 md:opacity-50
//      ↑ Mobile  ↑ Desktop
// Change to: opacity-60 md:opacity-80 for more visible
// Change to: opacity-20 md:opacity-30 for more subtle
```

---

## 🎭 Visual Effects Included

### 1. **Grayscale Effect**
- Main image: Full color on hover
- Background images: Always grayscale
- Matches monochrome theme!

### 2. **Glass Morphism**
- Gradient overlays
- Border glows
- Blur effects

### 3. **Floating Animation**
- Subtle up/down movement
- Glowing orbs
- Depth effect

### 4. **Progress Dots**
- Shows current slide
- Clickable navigation
- Auto-updates

---

## 🔧 Troubleshooting

### Images Not Showing?

**Check 1:** Verify folder structure
```bash
ls public/hero/
# Should show: sneakers-1.jpg, jacket-black.jpg, etc.
```

**Check 2:** Check browser console (F12)
- Look for 404 errors
- Verify image paths

**Check 3:** Use fallback images
The carousel has automatic fallbacks to Unsplash if images fail to load.

### Images Too Large?

**Optimize before upload:**
- Use: https://tinypng.com/
- Target size: 200-400KB per image
- Dimensions: 400x500px

### Want Different Layout?

Edit the carousel layout in `HeroImageCarousel.tsx`:
- Add more floating images
- Change positions
- Adjust rotations
- Modify animations

---

## 📊 Your Photos Will Look Like:

```
        [Jordan 4 Sneakers]
               ↓
          Main Image
        Centered, Sharp
            
[T-shirt]            [Puffer Jacket]
  ↓                         ↓
Left Side                Right Side
Blurred                  Blurred
```

**Then rotates to:**
```
        [Puffer Jacket]
               ↓
          Main Image
            
[Jordan 4]           [Balenciaga Pants]
  ↓                         ↓
Left Side                Right Side
```

---

## 🚀 Quick Start

1. **Add 8 photos** to `public/hero/`
2. **Name them:**
   - `sneakers-1.jpg`
   - `jacket-black.jpg`
   - `tshirt-acne.jpg`
   - `jordan-4.jpg`
   - `sweater-knit.jpg`
   - `pants-balenciaga.jpg`
   - `puffer-jacket.jpg`
   - `beanie-pattern.jpg`

3. **Reload page** → **Done!** 🎉

---

## 🎨 Pro Tips

1. **Best photos**: Clean product shots on simple backgrounds
2. **Consistency**: Use similar lighting across all photos
3. **Variety**: Mix different product types (shoes, jackets, shirts)
4. **Quality**: High-res photos look better when scaled
5. **Testing**: Check on both mobile and desktop

---

**Your hero section will look AMAZING with real product photos!** ✨

