# 🖼️ Backend Image Processing Guide

## Problem
Product images have:
- Different sizes
- Different aspect ratios  
- White/colored backgrounds
- Inconsistent quality

## Solution Options

### Option 1: Automated Background Removal (Recommended)

#### Use Remove.bg API

**Install:**
```bash
npm install removebackground
```

**Backend endpoint:**
```javascript
// POST /api/admin/products/process-image
import { removeBackground } from 'removebackground';

app.post('/api/admin/products/process-image', async (req, res) => {
  const { imageUrl } = req.body;
  
  try {
    const result = await removeBackground({
      url: imageUrl,
      apiKey: process.env.REMOVE_BG_API_KEY,
      size: 'regular',
      format: 'png'
    });
    
    // Upload to Supabase Storage
    const processedUrl = await uploadToSupabase(result.base64);
    
    res.json({ 
      success: true, 
      processedUrl 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process image' });
  }
});
```

**Get API Key:**
https://www.remove.bg/api

**Pricing:**
- Free: 50 images/month
- Pro: $9/month for 500 images

---

### Option 2: Sharp Image Processing

For cropping and resizing (without background removal):

**Install:**
```bash
npm install sharp
```

**Backend endpoint:**
```javascript
import sharp from 'sharp';

app.post('/api/admin/products/crop-image', async (req, res) => {
  const { imageUrl } = req.body;
  
  try {
    const imageBuffer = await fetch(imageUrl).then(r => r.buffer());
    
    const processed = await sharp(imageBuffer)
      .resize(800, 800, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();
    
    const processedUrl = await uploadToSupabase(processed);
    
    res.json({ 
      success: true, 
      processedUrl 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to crop image' });
  }
});
```

---

### Option 3: Client-Side Upload with Preview

**Frontend component:**
```typescript
import { useState } from 'react';

export function ImageUploadWithPreview() {
  const [preview, setPreview] = useState('');
  
  const handleUpload = async (file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    // Upload to backend
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/admin/products/upload', {
      method: 'POST',
      body: formData
    });
    
    const { processedUrl } = await response.json();
    return processedUrl;
  };
  
  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      {preview && (
        <img 
          src={preview} 
          alt="Preview"
          className="w-32 h-32 object-contain"
        />
      )}
    </div>
  );
}
```

---

## Recommended Flow

1. **Admin uploads image** → Frontend
2. **Image sent to backend** → `/api/admin/products/upload`
3. **Backend processes**:
   - Removes background (remove.bg)
   - Resizes to 800x800px (sharp)
   - Converts to PNG with transparency
4. **Backend uploads to Supabase Storage**
5. **Returns processed URL** → Frontend saves to DB

---

## CSS-Only Solution (No Backend Changes)

If you don't want to modify backend, use the `ProductImage` component I created:

```typescript
import { ProductImage } from '@/components/ProductImage';

<ProductImage 
  src={product.image_url}
  alt={product.name}
  aspectRatio="square"
  removeBackground={true}
/>
```

**Features:**
- ✅ Auto-crops to square/portrait/landscape
- ✅ Centers product in frame
- ✅ Adds subtle blur background
- ✅ Loading state
- ✅ Error handling
- ✅ Lazy loading

---

## Comparison

| Solution | Cost | Quality | Speed | Backend Work |
|----------|------|---------|-------|--------------|
| CSS Only | Free | Good | Instant | None ❌ |
| Sharp | Free | Better | Fast | Medium 🔧 |
| Remove.bg | $9/mo | Best | Medium | Easy ✅ |

---

## Recommendation

**Start with:** CSS-Only (ProductImage component)  
**Upgrade to:** Remove.bg API when you have budget  

The CSS solution will make all images look consistent **immediately** without any backend work!

