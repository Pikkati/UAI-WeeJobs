#!/usr/bin/env node
/* eslint-env node */
const fs = require('fs');
const path = require('path');

// Minimal app icon generator that uses `sharp` if available.
// It expects a source master icon at `assets/icons/app-icon.png` (1024x1024).
// If `sharp` is not installed, prints instructions.

const SRC = path.join(__dirname, '..', 'assets', 'icons', 'app-icon.png');
const OUT = path.join(__dirname, '..', 'assets', 'icons', 'generated');
if (!fs.existsSync(SRC)) {
  console.log('No source master icon found at', SRC);
  console.log(
    'Place a 1024x1024 PNG at that path to auto-generate platform icons.',
  );
  process.exit(0);
}
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log(
    'The `sharp` package is not installed. To generate icons automatically, run:',
  );
  console.log('  npm install --save-dev sharp');
  console.log('Then re-run `node scripts/generate-app-icons.js`');
  process.exit(0);
}

const sizes = [48, 72, 96, 144, 192, 512, 1024];
async function generate() {
  for (const s of sizes) {
    const outPath = path.join(OUT, `icon-${s}x${s}.png`);
    await sharp(SRC).resize(s, s).toFile(outPath);
    console.log('Wrote', outPath);
  }
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
