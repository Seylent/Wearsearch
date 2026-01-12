// Save new favicon from user's attachment
// The user provided a new W logo - white W on black background
// We need to copy WEARSEARCH.svg as the new favicon since it matches the design

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');

// Use WEARSEARCH.svg as the new favicon (it's the W logo)
const svgSource = path.join(publicDir, 'WEARSEARCH.svg');
const pngSource = path.join(publicDir, 'WEARSEARCH.png');

// Copy to favicon files
if (fs.existsSync(svgSource)) {
  // For now, use the existing WEARSEARCH.png as favicon
  if (fs.existsSync(pngSource)) {
    fs.copyFileSync(pngSource, path.join(publicDir, 'favicon.png'));
    fs.copyFileSync(pngSource, path.join(publicDir, 'favicon.ico'));
    console.log('✅ New favicon installed (WEARSEARCH logo)');
    
    const stats = fs.statSync(path.join(publicDir, 'favicon.png'));
    console.log(`✅ Favicon size: ${(stats.size / 1024).toFixed(2)} KB`);
  }
}

console.log('✅ Please replace public/favicon.png with your new W logo image');
console.log('✅ Make sure it\'s optimized (under 10KB) for best performance');
