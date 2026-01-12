/**
 * Image Optimization Script for S3
 * Generates responsive WebP versions of all product images
 * 
 * Usage: node scripts/optimizeImages.js
 */

import sharp from 'sharp';
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable as _Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({ 
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const BUCKET = process.env.S3_BUCKET_NAME;

if (!BUCKET) {
  console.error('❌ S3_BUCKET_NAME not set in .env');
  process.exit(1);
}

/**
 * Convert stream to buffer
 */
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Get image metadata
 */
async function getImageInfo(buffer) {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: buffer.length
  };
}

/**
 * Optimize a single image
 */
async function optimizeImage(key) {
  try {
    console.log(`\n📸 Processing: ${key}`);

    // Download original
    const getCommand = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const { Body } = await s3Client.send(getCommand);
    const buffer = await streamToBuffer(Body);

    const originalInfo = await getImageInfo(buffer);
    console.log(`   Original: ${originalInfo.width}×${originalInfo.height} ${originalInfo.format} (${(originalInfo.size / 1024).toFixed(0)}KB)`);

    // Generate responsive versions
    const sizes = [
      { width: 400, quality: 80, suffix: '-400w' },
      { width: 800, quality: 80, suffix: '-800w' },
      { width: 1200, quality: 75, suffix: '-1200w' }
    ];

    let totalSaved = 0;

    for (const { width, quality, suffix } of sizes) {
      // Skip if original is smaller than target
      if (originalInfo.width < width) {
        console.log(`   ⏭️  Skipping ${width}w (original is smaller)`);
        continue;
      }

      // Generate WebP
      const webpBuffer = await sharp(buffer)
        .resize(width, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality })
        .toBuffer();

      // Create new key
      const basePath = key.replace(/\.(jpg|jpeg|png)$/i, '');
      const newKey = `${basePath}${suffix}.webp`;

      // Upload to S3
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: newKey,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000', // 1 year
        Metadata: {
          'original-key': key,
          'width': width.toString(),
          'optimized': 'true'
        }
      }));

      const savedBytes = originalInfo.size - webpBuffer.length;
      totalSaved += savedBytes;

      console.log(`   ✅ ${width}w: ${(webpBuffer.length / 1024).toFixed(0)}KB (saved ${(savedBytes / 1024).toFixed(0)}KB)`);
    }

    console.log(`   💾 Total saved: ${(totalSaved / 1024).toFixed(0)}KB (${((totalSaved / originalInfo.size) * 100).toFixed(0)}%)`);

    return { success: true, saved: totalSaved };

  } catch (error) {
    console.error(`   ❌ Error processing ${key}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting image optimization...');
  console.log(`📦 Bucket: ${BUCKET}`);

  // List all images in products folder
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: 'products/',
    MaxKeys: 1000
  });

  const { Contents } = await s3Client.send(listCommand);

  if (!Contents || Contents.length === 0) {
    console.log('❌ No images found in products/ folder');
    return;
  }

  // Filter only original images (not already optimized)
  const originalImages = Contents.filter(obj => 
    obj.Key.match(/\.(jpg|jpeg|png)$/i) && 
    !obj.Key.includes('-400w') && 
    !obj.Key.includes('-800w') && 
    !obj.Key.includes('-1200w')
  );

  console.log(`\n📊 Found ${originalImages.length} images to optimize`);

  let successCount = 0;
  let failCount = 0;
  let totalSaved = 0;

  // Process each image
  for (const obj of originalImages) {
    const result = await optimizeImage(obj.Key);
    if (result.success) {
      successCount++;
      totalSaved += result.saved;
    } else {
      failCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📈 OPTIMIZATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`💾 Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
  console.log('='.repeat(50));

  if (successCount > 0) {
    console.log('\n📝 Next steps:');
    console.log('1. Update ProductCard.tsx to use responsive images');
    console.log('2. Update backend API to return WebP URLs');
    console.log('3. Test image loading in production');
  }
}

// Run
main().catch(console.error);
