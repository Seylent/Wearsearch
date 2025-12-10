# Backend Integration - Complete Setup ✅

## Overview
Your frontend is now fully integrated with your backend S3 upload service!

## Configuration Status

### Frontend Configuration ✅
- **API Base URL**: `http://localhost:3000/api`
- **Upload Endpoint**: `/upload/image`
- **Full URL**: `http://localhost:3000/api/upload/image`
- **Field Name**: `image` (matches backend)
- **CORS**: Configured for `localhost:8080`

### Backend Configuration ✅
- **Server**: Running on `localhost:3000`
- **S3 Bucket**: `wearsearch`
- **S3 Region**: `eu-north-1`
- **Upload Path**: `products/`
- **File Size Limit**: 5MB
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **CORS**: Configured for frontend

### AWS S3 Configuration ✅
- **Bucket Name**: `wearsearch`
- **Region**: `eu-north-1`
- **CORS**: Configured (GET, HEAD methods allowed)
- **Public Access**: Enabled for image display

## How It Works

### Upload Flow
1. **User selects image** in Admin panel
2. **Frontend validates** file (size, type)
3. **Frontend sends** POST request to backend:
   ```
   POST http://localhost:3000/api/upload/image
   Content-Type: multipart/form-data
   Field: image = [file]
   ```
4. **Backend receives** and uploads to S3 using multer-s3
5. **Backend responds** with:
   ```json
   {
     "success": true,
     "url": "https://wearsearch.s3.eu-north-1.amazonaws.com/products/...",
     "filename": "...",
     "size": 12345,
     "mimetype": "image/png"
   }
   ```
6. **Frontend saves** URL to Supabase database
7. **Product displays** image from S3

### API Communication

**Upload Service** (`src/services/uploadService.ts`):
```typescript
// Sends FormData with 'image' field
formData.append('image', file);
const response = await api.post('/upload/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

**Backend Endpoint**:
```javascript
// Receives 'image' field and uploads to S3
app.post('/api/upload/image', upload.single('image'), (req, res) => {
  res.json({
    success: true,
    url: req.file.location  // S3 URL from multer-s3
  });
});
```

## Testing

### 1. Test Upload in Admin Panel
1. Go to `http://localhost:8080/admin`
2. Fill product form
3. Click "Upload Image" button
4. Select an image file
5. Submit form
6. Check console for upload logs

### 2. Expected Console Output
```
Uploading image to backend S3: image.png
Upload successful! Response: { url: "https://...", ... }
Image URL: https://wearsearch.s3.eu-north-1.amazonaws.com/products/...
```

### 3. Verify Image Display
1. Go to main page `http://localhost:8080/`
2. Product card should show the uploaded image
3. No CORS errors in console
4. Image loads successfully

### 4. Test Backend Directly
```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@/path/to/test-image.jpg"
```

Expected response:
```json
{
  "success": true,
  "url": "https://wearsearch.s3.eu-north-1.amazonaws.com/products/1234567890-test-image.jpg",
  "filename": "products/1234567890-test-image.jpg",
  "size": 45678,
  "mimetype": "image/jpeg"
}
```

## Troubleshooting

### Upload Fails
**Check:**
1. Backend server is running on port 3000
2. AWS credentials are set in backend `.env`
3. S3 bucket name is correct (`wearsearch`)
4. Network tab shows request to `http://localhost:3000/api/upload/image`

**Console errors:**
- "Network Error" → Backend not running
- "400 Bad Request" → Check field name is `image`
- "500 Server Error" → Check backend logs for AWS credentials

### Images Don't Display
**Check:**
1. AWS S3 CORS is configured (see `AWS_S3_CORS_SETUP.md`)
2. S3 bucket public access is enabled
3. Image URL is correct in database
4. Browser console for CORS errors

**Fix CORS:**
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

### Backend CORS Issues
**Error:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Fix in backend:**
```javascript
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

## File Structure

```
Frontend (wearsearchh):
├── src/
│   ├── services/
│   │   ├── api.ts              # Axios instance, base URL
│   │   ├── endpoints.ts        # API endpoints (/upload/image)
│   │   └── uploadService.ts    # Upload functions
│   └── pages/
│       └── Admin.tsx            # Uses uploadService

Backend (wearsearchh-backend):
├── routes/
│   └── upload.routes.js         # POST /api/upload/image
├── .env                         # AWS credentials
└── server.js                    # Express app with CORS

AWS S3:
└── wearsearch bucket
    └── products/                # Uploaded images folder
```

## API Reference

### POST /api/upload/image
Upload a single image to S3.

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/upload/image`
- Content-Type: `multipart/form-data`
- Body: `image` field with file

**Response (Success):**
```json
{
  "success": true,
  "url": "https://wearsearch.s3.eu-north-1.amazonaws.com/products/1701234567890-filename.jpg",
  "filename": "products/1701234567890-filename.jpg",
  "size": 123456,
  "mimetype": "image/jpeg"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

**Error Codes:**
- `400` - No file uploaded / Invalid file type
- `413` - File too large (>5MB)
- `500` - Server error / AWS upload failed

## Next Steps

✅ **Everything is configured!** You can now:

1. **Upload images** through Admin panel
2. **Images are stored** in AWS S3
3. **URLs are saved** to Supabase database
4. **Images display** on frontend with CORS

### Optional Improvements

- **Add image compression** before upload
- **Add image cropping/resizing** functionality
- **Add multiple image upload** per product
- **Add image deletion** from S3
- **Add upload progress indicator**
- **Add image preview** before upload

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Backend (.env)
```env
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_REGION=eu-north-1
AWS_BUCKET_NAME=wearsearch
PORT=3000
```

---

🎉 **Your image upload system is fully operational!**
