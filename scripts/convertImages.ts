import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, '../assets');
const outputDir = path.join(__dirname, '../assets-webp');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function convertToWebP() {
  console.log('Starting image conversion...');
  
  // Get all image files
  const files = fs.readdirSync(assetsDir);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png)$/i.test(file)
  );

  console.log(`Found ${imageFiles.length} images to convert`);

  for (const file of imageFiles) {
    const inputPath = path.join(assetsDir, file);
    const outputFileName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const outputPath = path.join(outputDir, outputFileName);

    try {
      const stats = fs.statSync(inputPath);
      const originalSize = (stats.size / 1024).toFixed(2);

      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);

      const newStats = fs.statSync(outputPath);
      const newSize = (newStats.size / 1024).toFixed(2);
      const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);

      console.log(`✓ ${file} → ${outputFileName}`);
      console.log(`  ${originalSize}KB → ${newSize}KB (${savings}% smaller)`);
    } catch (error) {
      console.error(`✗ Failed to convert ${file}:`, error.message);
    }
  }

  console.log('\nConversion complete!');
  console.log(`Images saved to: ${outputDir}`);
}

convertToWebP();
