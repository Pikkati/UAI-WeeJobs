#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Simple SVG optimizer wrapper. Uses `svgo` if available; otherwise prints instructions.
const ICONS_DIR = path.join(__dirname, '..', 'assets', 'icons');

let SVGO;
try {
  SVGO = require('svgo');
} catch (e) {
  console.log('`svgo` is not installed. To optimize SVGs automatically, run:');
  console.log('  npm install --save-dev svgo');
  process.exit(0);
}

const { optimize } = SVGO;
const files = fs.readdirSync(ICONS_DIR).filter((f) => f.endsWith('.svg'));
for (const file of files) {
  const p = path.join(ICONS_DIR, file);
  const input = fs.readFileSync(p, 'utf8');
  const result = optimize(input, { path: p });
  fs.writeFileSync(p, result.data, 'utf8');
  console.log('Optimized', p);
}
