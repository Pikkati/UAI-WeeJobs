const fs = require('fs');
const path = require('path');

const candidates = [
  path.resolve(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'index.android.bundle'),
  path.resolve(__dirname, '..', 'android', 'extracted_app', 'assets', 'index.android.bundle')
];

let bundlePath = null;
let content = null;
for (const p of candidates) {
  if (!fs.existsSync(p)) continue;
  try {
    content = fs.readFileSync(p, 'utf8');
    bundlePath = p;
    break;
  } catch (e) {
    // not a UTF-8 readable file
  }
}

if (!bundlePath) {
  console.error('NO_READABLE_BUNDLE_FOUND');
  process.exit(1);
}

function findArrayTextFromNeedle(str, needle) {
  const idx = str.indexOf(needle);
  if (idx === -1) return null;
  const arrStart = str.indexOf('[', idx);
  if (arrStart === -1) return null;
  let i = arrStart;
  let depth = 0;
  let inString = false;
  let quote = null;
  for (; i < str.length; i++) {
    const ch = str[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === quote) { inString = false; quote = null; }
      continue;
    }
    if (ch === '"' || ch === "'") { inString = true; quote = ch; continue; }
    if (ch === '[') depth++;
    if (ch === ']') { depth--; if (depth === 0) return str.slice(arrStart, i + 1); }
  }
  return null;
}

const needles = ['globalThis.__EXPO_ROUTER_KEYS', '__EXPO_ROUTER_KEYS'];
let arrayText = null;
for (const n of needles) {
  const t = findArrayTextFromNeedle(content, n);
  if (t) { arrayText = t; break; }
}

if (!arrayText) {
  console.error('ARRAY_TEXT_NOT_FOUND_IN_BUNDLE', bundlePath);
  process.exit(2);
}

// Try JSON.parse first (bundle uses double quotes normally)
let arr = null;
try {
  arr = JSON.parse(arrayText);
} catch (e) {
  // fallback to JS eval (less safe) to handle non-JSON but JS-literal arrays
  try {
    arr = (new Function('return ' + arrayText))();
  } catch (e2) {
    const out = path.resolve(__dirname, '..', 'android', 'extracted_app', 'routes_manifest.raw.txt');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, arrayText, 'utf8');
    console.error('PARSE_FAILED; raw array written to', out, e2 && e2.message);
    process.exit(3);
  }
}

const outPath = path.resolve(__dirname, '..', 'android', 'extracted_app', 'routes_manifest.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(arr, null, 2), 'utf8');
console.log('WROTE:', outPath);
console.log('KEY_COUNT:', Array.isArray(arr) ? arr.length : 'not-array');
console.log('FIRST_20:', Array.isArray(arr) ? arr.slice(0, 20) : arr);
