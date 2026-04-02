#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function findBackups(dir) {
  const results = [];
  function walk(d) {
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch (e) {
      return;
    }
    for (const entry of entries) {
      const name = entry.name;
      const full = path.join(d, name);
      if (entry.isDirectory()) {
        if (name === 'node_modules' || name === '.git' || name === '.gradle') continue;
        walk(full);
      } else if (entry.isFile() && name === 'index.android.bundle.bak-before-inject') {
        results.push(full);
      }
    }
  }
  walk(dir);
  return results;
}

const repoRoot = process.cwd();
const backups = findBackups(repoRoot);
if (!backups.length) {
  console.log('No .bak-before-inject backups found.');
  process.exit(0);
}
let restored = 0;
for (const bak of backups) {
  const dir = path.dirname(bak);
  const target = path.join(dir, 'index.android.bundle');
  try {
    fs.copyFileSync(bak, target);
    console.log(`Restored ${target} from ${bak}`);
    restored++;
  } catch (err) {
    console.error(`Failed to restore ${target} from ${bak}: ${err.message}`);
  }
}
console.log(`Done. Restored ${restored} files from ${backups.length} backups.`);
