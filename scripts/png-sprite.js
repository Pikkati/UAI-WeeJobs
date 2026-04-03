#!/usr/bin/env node
/* eslint-env node */
const fs = require('fs');
const path = require('path');

// Simple PNG sprite generator: stacks PNGs vertically into a single sprite using sharp.
const ICONS_DIR = path.join(__dirname, '..', 'assets', 'icons', 'png');
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sprite');
const OUT_FILE = path.join(OUT_DIR, 'sprite.png');

if (!fs.existsSync(ICONS_DIR)) {
  console.log('No PNG icons directory found at', ICONS_DIR);
  console.log('Place PNG icons (same width) in that folder to generate a sprite.');
  process.exit(0);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('The `sharp` package is not installed. To generate PNG sprites automatically, run:');
  console.log('  npm install --save-dev sharp');
  process.exit(0);
}

const files = fs.readdirSync(ICONS_DIR).filter((f) => f.endsWith('.png'));
if (files.length === 0) {
  console.log('No PNG files found in', ICONS_DIR);
  process.exit(0);
}

async function buildSprite() {
  const imgs = await Promise.all(files.map((f) => sharp(path.join(ICONS_DIR, f)).metadata().then(m => ({ file: f, meta: m }))));
  const width = imgs[0].meta.width;
  const totalHeight = imgs.reduce((sum, i) => sum + i.meta.height, 0);

  const compositeInputs = [];
  let y = 0;
  for (const img of imgs) {
    compositeInputs.push({ input: path.join(ICONS_DIR, img.file), top: y, left: 0 });
    y += img.meta.height;
  }

  await sharp({ create: { width: width, height: totalHeight, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(compositeInputs)
    .png()
    .toFile(OUT_FILE);
  console.log('Wrote PNG sprite to', OUT_FILE);
}

buildSprite().catch((err) => {
  console.error('PNG sprite generation failed:', err);
  process.exit(1);
});
