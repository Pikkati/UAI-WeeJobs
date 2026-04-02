#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const infile = path.resolve(process.cwd(), 'tmp_inspector_logcat_dump.txt');
if (!fs.existsSync(infile)) { console.error('Log dump not found:', infile); process.exit(2); }
const txt = fs.readFileSync(infile, 'utf8');
const marker = "[expo-router] fallback manifest sample keys=";
const lines = txt.split(/\r?\n/);
let start = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(marker)) { start = i; break; }
}
if (start === -1) { console.error('No fallback keys marker found in log dump.'); process.exit(3); }

let collected = '';
let depth = 0;
let foundStartBracket = false;
for (let i = start; i < lines.length; i++) {
  const line = lines[i];
  // extract the portion after ReactNativeJS: if present, otherwise use the full line tail
  const rnMatch = line.match(/ReactNativeJS:\s*(.*)$/);
  const part = rnMatch ? rnMatch[1] : line;
  if (!foundStartBracket) {
    // Prefer the '[' after the marker text if present on the same line
    let idx = -1;
    const markerPos = part.indexOf(marker);
    if (markerPos !== -1) idx = part.indexOf('[', markerPos + marker.length);
    if (idx === -1) idx = part.indexOf('[');
    if (idx !== -1) {
      foundStartBracket = true;
      depth = 1;
      collected += part.slice(idx);
      // count any additional brackets on the same line
      for (const ch of part.slice(idx + 1)) { if (ch === '[') depth++; else if (ch === ']') { depth--; if (depth === 0) break; } }
      if (depth === 0) break;
    }
  } else {
    collected += ' ' + part.trim();
    for (const ch of part) { if (ch === '[') depth++; else if (ch === ']') { depth--; } }
    if (depth === 0) break;
  }
}

if (!foundStartBracket || depth !== 0) { console.error('Could not extract complete array from log dump.'); process.exit(4); }

// collected now contains a JS-like array but may include single quotes and trailing commas; normalize
let arrJson = collected.replace(/\s+/g, ' ');
arrJson = arrJson.replace(/'([^']*)'/g, '"$1"');
// Remove any trailing commas before closing bracket
arrJson = arrJson.replace(/,\s*\]/g, ']');
try {
  const arr = JSON.parse(arrJson);
  const out = path.resolve(process.cwd(), 'expo-router-fallback-keys.json');
  fs.writeFileSync(out, JSON.stringify(arr, null, 2), 'utf8');
  console.log('Wrote', out, 'with', arr.length, 'keys.');
} catch (e) {
  console.error('Failed to parse array from log dump:', e && e.message ? e.message : e);
  console.error('Raw collected:', collected.slice(0, 2000));
  process.exit(5);
}
