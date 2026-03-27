#!/usr/bin/env node
/*
 Simple asset optimization script. Requires dev dependencies:
  - svgo
  - imagemin
  - imagemin-mozjpeg
  - imagemin-pngquant

 Run: node scripts/optimize-assets.js
*/
const { optimize } = require('svgo');
const fs = require('fs');
const path = require('path');
const imagemin = require('imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');

async function optimizeSvgs(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
  for (const file of files) {
    const p = path.join(dir, file);
    const input = fs.readFileSync(p, 'utf8');
    const result = optimize(input, { path: p });
    fs.writeFileSync(p, result.data, 'utf8');
    console.log('Optimized', p);
  }
}

async function optimizeRasters(dir) {
  const files = fs.readdirSync(dir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  if (files.length === 0) return;
  const paths = files.map(f => path.join(dir, f));
  await imagemin(paths, {
    destination: dir,
    plugins: [mozjpeg({ quality: 75 }), pngquant({ quality: [0.7, 0.85] })],
  });
  console.log('Optimized rasters in', dir);
}

async function run() {
  try {
    const iconsDir = path.join(__dirname, '..', 'assets', 'icons');
    const imagesDir = path.join(__dirname, '..', 'assets', 'images');
    if (fs.existsSync(iconsDir)) await optimizeSvgs(iconsDir);
    if (fs.existsSync(imagesDir)) await optimizeRasters(imagesDir);
    console.log('Optimization complete');
  } catch (err) {
    console.error('Optimization error', err);
    process.exitCode = 1;
  }
}

run();
