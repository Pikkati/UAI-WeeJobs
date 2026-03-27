#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Scans assets/icons and assets/images for files that likely need RTL variants.
// Reports missing `*.rtl.svg` or `*.rtl.png` fallbacks when a directional name is present.

const scanDirs = [
  path.join(__dirname, '..', 'assets', 'icons'),
  path.join(__dirname, '..', 'assets', 'images'),
];

function isDirectional(name) {
  // simple heuristic: filenames containing 'left', 'right', 'arrow', 'chevron', 'back'
  return /(left|right|arrow|chevron|back)/i.test(name);
}

function checkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  const warnings = [];
  for (const file of files) {
    const ext = path.extname(file);
    const base = path.basename(file, ext);
    if (!isDirectional(base)) continue;
    // check for rtl variant
    const rtlName = `${base}.rtl${ext}`;
    if (!files.includes(rtlName)) {
      warnings.push({ dir, file, missing: rtlName });
    }
  }
  return warnings;
}

let allWarnings = [];
for (const d of scanDirs) {
  allWarnings = allWarnings.concat(checkDir(d));
}

if (allWarnings.length === 0) {
  console.log('RTL check: no obvious missing RTL asset variants found.');
  process.exit(0);
}

console.log('RTL check: missing RTL asset variants:');
for (const w of allWarnings) {
  console.log(`- ${w.dir}/${w.file} -> missing ${w.missing}`);
}

process.exit(0);
