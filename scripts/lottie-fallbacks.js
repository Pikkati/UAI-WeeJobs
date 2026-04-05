#!/usr/bin/env node
/* eslint-env node */
const fs = require('fs');
const path = require('path');

// Lottie fallback script: ensures a PNG fallback exists for each Lottie file.
// If a real renderer isn't installed, creates a small placeholder PNG using sharp.

const LOTTIE_DIR = path.join(__dirname, '..', 'assets', 'lottie');
const FALLBACK_DIR = path.join(LOTTIE_DIR, 'fallbacks');

if (!fs.existsSync(LOTTIE_DIR)) {
  console.log('No lottie directory at', LOTTIE_DIR);
  console.log('Place .json Lottie files there to manage fallbacks.');
  process.exit(0);
}

if (!fs.existsSync(FALLBACK_DIR))
  fs.mkdirSync(FALLBACK_DIR, { recursive: true });

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log(
    '`sharp` not installed. To generate PNG fallbacks automatically, run:',
  );
  console.log('  npm install --save-dev sharp');
  console.log('Fallback placeholders will not be generated automatically.');
  process.exit(0);
}

const files = fs.readdirSync(LOTTIE_DIR).filter((f) => f.endsWith('.json'));
if (files.length === 0) {
  console.log('No Lottie JSON files found in', LOTTIE_DIR);
  process.exit(0);
}

async function ensureFallbacks() {
  for (const file of files) {
    const name = path.basename(file, '.json');
    const out = path.join(FALLBACK_DIR, `${name}.png`);
    if (!fs.existsSync(out)) {
      // create a small placeholder 400x400 PNG
      await sharp({
        create: {
          width: 400,
          height: 400,
          channels: 4,
          background: { r: 240, g: 240, b: 240, alpha: 1 },
        },
      })
        .png()
        .toFile(out);
      console.log('Created placeholder fallback for', file, '->', out);
    } else {
      console.log('Fallback exists for', file);
    }
  }
}

ensureFallbacks().catch((err) => {
  console.error('Lottie fallback generation failed:', err);
  process.exit(1);
});
