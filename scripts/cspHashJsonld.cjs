/*
 * Computes CSP SHA-256 hash for the inline JSON-LD block in index.html.
 * Usage:
 *   node scripts/cspHashJsonld.cjs
 */

const fs = require('fs');
const crypto = require('crypto');

const INDEX_HTML_PATH = 'index.html';

function main() {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  const match = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/);

  if (!match) {
    console.error('JSON-LD <script type="application/ld+json"> not found in index.html');
    process.exit(1);
  }

  // IMPORTANT: the hash is sensitive to whitespace and line endings.
  // We hash the content exactly as it appears between the tags.
  const content = match[1];

  const hash = crypto.createHash('sha256').update(content, 'utf8').digest('base64');
  process.stdout.write(`sha256-${hash}\n`);
}

main();
