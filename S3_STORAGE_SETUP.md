# S3 Storage Integration

## Overview
The frontend now uses your backend's S3 storage for image uploads instead of Supabase Storage.

## What Was Changed

### 1. Admin Panel (`src/pages/Admin.tsx`)
- ✅ Imported `uploadService` from `@/services/uploadService`
- ✅ Updated `uploadImage()` function to use backend S3 API
- ✅ Added image validation before upload
- ✅ Images now upload to: `http://localhost:3000/api/upload/image`

### 2. Upload Service (`src/services/uploadService.ts`)
Already configured with:
- Single image upload endpoint: `/upload/image`
- Multiple images upload endpoint: `/upload/images`
- File validation (5MB max, JPEG/PNG/GIF/WebP only)

### 3. Environment Configuration (`.env`)
Backend URL configured:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Backend Requirements

### Make sure your backend has:

1. **Upload endpoint at `/api/upload/image`** that:
   - Accepts `multipart/form-data`
   - Field name: `image`
   - Returns JSON: `{ url: string, filename: string, size: number, mimetype: string }`

2. **S3/MinIO configuration** properly set up

3. **CORS enabled** for frontend origin:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:8080',
     credentials: true
   }));
   ```

## Backend Endpoint Example

Your backend should handle uploads like this:

```javascript
// POST /api/upload/image
router.post('/upload/image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Upload to S3
  const s3Url = await uploadToS3(req.file);

  res.json({
    url: s3Url,
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});
```

## Testing

1. **Start your backend:**
   ```bash
   cd C:\mywebsite-backend\wearsearchh-backend
   npm start
   ```

2. **Make sure backend is running on `http://localhost:3000`**

3. **Test image upload:**
   - Go to Admin panel
   - Try uploading a product image
   - Check browser console for upload logs
   - Verify image URL returned from backend

## Troubleshooting

### Upload fails with "Network Error"
- Check if backend is running
- Verify CORS is configured
- Check `.env` has correct `VITE_API_BASE_URL`

### Upload fails with "401 Unauthorized"
- Backend may require authentication
- Add auth token handling in upload service if needed

### Images don't display
- Check S3 bucket permissions (public read access)
- Verify returned URL is accessible
- Check browser console for CORS errors

## How It Works

1. User selects image file in Admin panel
2. File is validated (size, type)
3. FormData with image is sent to backend
4. Backend uploads to S3 and returns public URL
5. URL is saved to Supabase `products.image_url`
6. Images are served from S3, not Supabase Storage
