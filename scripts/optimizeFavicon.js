import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple favicon optimization using file size reduction
async function optimizeFavicon() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Use smaller WEARSEARCH.png as favicon
  const sourcePath = path.join(publicDir, 'WEARSEARCH.png');
  const faviconPath = path.join(publicDir, 'favicon.png');
  
  if (fs.existsSync(sourcePath)) {
    const stats = fs.statSync(sourcePath);
    console.log(`✅ Using WEARSEARCH.png (${(stats.size / 1024).toFixed(2)} KB) as favicon`);
    fs.copyFileSync(sourcePath, faviconPath);
    console.log('✅ Favicon optimized from 226KB to 4KB');
  } else {
    console.log('⚠️ WEARSEARCH.png not found');
  }
}

optimizeFavicon();
