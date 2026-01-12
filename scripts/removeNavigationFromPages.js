import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, '..', 'src', 'pages');

const filesToFix = [
  'About.tsx',
  'Contacts.tsx',
  'Index.tsx',
  'Privacy.tsx',
  'SharedWishlist.tsx',
  'Stores.tsx',
  'Terms.tsx',
  'AdminBrands.tsx'
];

function removeNavigationAndFooter(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove Navigation import
  if (content.includes('import Navigation')) {
    content = content.replace(/import Navigation from ['"]@\/components\/layout\/Navigation['"];?\n?/g, '');
    modified = true;
  }

  // Remove Footer import
  if (content.includes('import Footer')) {
    content = content.replace(/import Footer from ['"]@\/components\/layout\/Footer['"];?\n?/g, '');
    modified = true;
  }

  // Remove <Navigation /> render
  content = content.replace(/<Navigation\s*\/>/g, '');
  
  // Remove <Footer /> render
  content = content.replace(/<Footer\s*\/>/g, '');

  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${path.basename(filePath)}`);
  } else {
    console.log(`ℹ️  No changes needed: ${path.basename(filePath)}`);
  }
}

console.log('🔧 Removing Navigation and Footer from page components...\n');

filesToFix.forEach(file => {
  const filePath = path.join(pagesDir, file);
  removeNavigationAndFooter(filePath);
});

console.log('\n✅ All files processed!');
console.log('Navigation and Footer are now only in layout.tsx');
