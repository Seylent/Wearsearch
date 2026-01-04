# S3 Image Display Troubleshooting

## Common Issues & Solutions

### 1. Images Not Displaying

#### Check the URL Format
Open browser console (F12) and check what URL is saved:
- Should be a complete URL like: `https://your-s3-domain.com/products/image.jpg`
- Not just a filename: `image.jpg` ❌

#### Fix: Backend CORS Configuration
Your backend needs CORS headers for images to load:

**In your backend `server.js` or `app.js`:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:8080', 'http://192.168.69.49:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### Fix: S3/MinIO Bucket Policy
Your S3 bucket needs public read access:

**For MinIO:**
```bash
mc anonymous set download myminio/products
```

**Or set bucket policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::products/*"]
    }
  ]
}
```

### 2. Check Image URL in Database

**Query your database:**
```sql
SELECT name, image_url FROM products;
```

**Expected format:**
- ✅ `http://localhost:9000/products/abc123.jpg`
- ✅ `https://s3.amazonaws.com/bucket/products/abc123.jpg`
- ❌ `/uploads/abc123.jpg` (relative path won't work)
- ❌ `abc123.jpg` (just filename won't work)

### 3. Backend Upload Response

Your backend `/api/upload/image` should return:
```json
{
  "url": "http://localhost:9000/products/image-123456.jpg",
  "filename": "image-123456.jpg",
  "size": 12345,
  "mimetype": "image/jpeg"
}
```

The `url` field MUST be the complete public URL to access the image.

### 4. Test Image URL Directly

1. Copy the image URL from database
2. Paste it in browser address bar
3. If image doesn't load:
   - ❌ CORS issue
   - ❌ Bucket not public
   - ❌ Wrong URL format

### 5. Common Backend Upload Mistakes

#### ❌ Wrong: Returning relative path
```javascript
res.json({ url: `/uploads/${filename}` });
```

#### ✅ Correct: Returning full S3 URL
```javascript
const s3Url = `${process.env.S3_ENDPOINT}/${bucketName}/${filename}`;
res.json({ url: s3Url });
```

### 6. Environment Variables

**Check your backend `.env`:**
```env
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=products
S3_REGION=us-east-1
```

**Make sure URLs are complete:**
```javascript
const publicUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;
```

## Quick Test

### Step 1: Upload a test image
```bash
# In your backend directory
curl -F "image=@test.jpg" http://localhost:3000/api/upload/image
```

### Step 2: Check response
Should return:
```json
{
  "url": "http://localhost:9000/products/test-123.jpg"
}
```

### Step 3: Test URL in browser
Open the URL directly - should show the image

### Step 4: Check browser console
Look for errors:
- CORS error? → Fix backend CORS
- 403 Forbidden? → Fix bucket permissions
- 404 Not Found? → Check S3 upload actually worked

## Debug Mode

Added console logging in:
- `ProductCard.tsx` - logs failed image loads
- `Admin.tsx` - logs upload response and URL

Check browser console (F12) to see:
1. What URL is being returned from backend
2. If images fail to load
3. Any CORS errors

## Still Not Working?

1. **Check backend is running**: `http://localhost:3000`
2. **Check MinIO/S3 is running**: `http://localhost:9000`
3. **Test upload manually** with curl/Postman
4. **Check bucket exists** and is public
5. **Verify CORS** is configured on both backend AND S3
6. **Check firewall** isn't blocking S3 port
