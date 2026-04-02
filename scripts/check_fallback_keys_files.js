#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const keysFile = path.resolve(process.cwd(), 'expo-router-fallback-keys.json');
if (!fs.existsSync(keysFile)) { console.error('Missing', keysFile); process.exit(2); }
const keys = JSON.parse(fs.readFileSync(keysFile, 'utf8'));
const results = [];
for (const k of keys) {
  const rel = k.replace(/^\.\//, '');
  const p = path.resolve(process.cwd(), 'app', rel);
  const entry = { key: k, path: p, exists: false, hasDefault: false };
  if (fs.existsSync(p)) {
    entry.exists = true;
    try {
      const src = fs.readFileSync(p, 'utf8');
      // naive checks for default export
      if (/export\s+default\s+/m.test(src) || /export\s+\{\s*default\s*\}/m.test(src) || /module\.exports\s*=/.test(src)) {
        entry.hasDefault = true;
      } else {
        // also consider re-exports without default but with named export 'Page' etc.
        if (/export\s+function\s+Page\b|export\s+const\s+Page\b|export\s+class\s+Page\b/.test(src)) {
          // it's a named Page export; treat as OK
          entry.hasDefault = true;
          entry.note = 'has named Page export (treated as default)';
        }
      }
    } catch (e) { entry.error = String(e && e.message ? e.message : e); }
  }
  results.push(entry);
}
const out = path.resolve(process.cwd(), 'expo-router-fallback-keys-summary.json');
fs.writeFileSync(out, JSON.stringify({ ts: Date.now(), results }, null, 2), 'utf8');
console.log('Wrote', out, 'with', results.length, 'entries');
