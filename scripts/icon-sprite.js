#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Simple SVG sprite generator: concatenates SVG symbols from assets/icons/*.svg
// Usage: node scripts/icon-sprite.js

const ICONS_DIR = path.join(__dirname, '..', 'assets', 'icons');
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sprite');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs.readdirSync(ICONS_DIR).filter((f) => f.endsWith('.svg'));
const symbols = files.map((file) => {
  const name = path.basename(file, '.svg');
  let svg = fs.readFileSync(path.join(ICONS_DIR, file), 'utf8');
  // Strip xml and svg root, wrap in symbol
  svg = svg.replace(/<\?xml[\s\S]*?\?>/g, '');
  svg = svg.replace(/<!DOCTYPE[\s\S]*?>/g, '');
  svg = svg.replace(/<svg[^>]*>/i, '');
  svg = svg.replace(/<\/svg>/i, '');
  return `<symbol id="icon-${name}" viewBox="0 0 24 24">${svg}</symbol>`;
});

const sprite = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols.join('\n')}\n</svg>`;
fs.writeFileSync(path.join(OUT_DIR, 'sprite.svg'), sprite, 'utf8');
console.log('Wrote', path.join(OUT_DIR, 'sprite.svg'));
