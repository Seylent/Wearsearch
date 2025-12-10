# AWS S3 CORS Configuration

## Your S3 Bucket
- **Bucket**: `wearsearch`
- **Region**: `eu-north-1`
- **Example URL**: `https://wearsearch.s3.eu-north-1.amazonaws.com/wearsearch+photo/stussy+puffer.png`

## Issue
The URL has spaces in the folder name (`wearsearch+photo`) which should be encoded as `wearsearch%20photo` or renamed to `wearsearch-photo`.

## Required CORS Configuration

### Step 1: Go to AWS S3 Console
1. Open https://s3.console.aws.amazon.com/s3/buckets/wearsearch
2. Click on your bucket `wearsearch`
3. Go to **Permissions** tab
4. Scroll down to **Cross-origin resource sharing (CORS)**
5. Click **Edit**

### Step 2: Add CORS Rules
Paste this configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:8080",
            "http://192.168.69.49:8080",
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

### Step 3: Make Bucket Public (if needed)
If images still don't load, make the bucket publicly readable:

**Bucket Policy:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::wearsearch/*"
        }
    ]
}
```

**Block Public Access Settings:**
- Uncheck "Block all public access"
- Or at minimum, uncheck "Block public access to buckets and objects granted through new public bucket or access point policies"

## Recommended: Fix Folder Name
Instead of `wearsearch+photo` (which has a space), use:
- `wearsearch-photo` ✅
- `wearsearch_photo` ✅
- `products` ✅

## Testing
After configuring CORS, test the URL directly in browser:
```
https://wearsearch.s3.eu-north-1.amazonaws.com/wearsearch+photo/stussy+puffer.png
```

Should load immediately without CORS errors.

## Backend Upload Configuration
Make sure your backend saves the full S3 URL:

```javascript
const s3Url = `https://wearsearch.s3.eu-north-1.amazonaws.com/${key}`;
// Save s3Url to database
```

## Check Browser Console
After changes:
1. Refresh your frontend
2. Open browser console (F12)
3. Look for CORS errors
4. Images should now load properly
