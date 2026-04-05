const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(
  __dirname,
  '..',
  'android',
  'extracted_app',
  'assets',
  'index.android.bundle',
);
if (!fs.existsSync(bundlePath)) {
  console.error('BUNDLE_NOT_FOUND', bundlePath);
  process.exit(2);
}
const buf = fs.readFileSync(bundlePath);
const needles = ['globalThis.__EXPO_ROUTER_KEYS', '__EXPO_ROUTER_KEYS'];
let needleIdx = -1;
let needleName = null;
for (const n of needles) {
  const i = buf.indexOf(Buffer.from(n, 'ascii'));
  if (i >= 0) {
    needleIdx = i;
    needleName = n;
    break;
  }
}
if (needleIdx < 0) {
  console.error('NEEDLE_NOT_FOUND');
  process.exit(2);
}
console.log('FOUND_NEEDLE', needleName, needleIdx);

function findArrayStart(start) {
  // find '=' then '[' (within reasonable forward window)
  let eq = -1;
  for (let i = start; i < Math.min(buf.length, start + 4096); i++) {
    if (buf[i] === 61) {
      eq = i;
      break;
    } // '='
  }
  const searchStart = eq >= 0 ? eq : start;
  for (let i = searchStart; i < Math.min(buf.length, start + 131072); i++) {
    if (buf[i] === 91) return i; // '['
  }
  return -1;
}

const arrStart = findArrayStart(needleIdx);
if (arrStart < 0) {
  console.error('ARRAY_START_NOT_FOUND');
  process.exit(3);
}

// Parse bracket-matched array, handling quoted strings and escapes
let i = arrStart;
let depth = 0;
let inString = false;
let quoteChar = null;
let endIdx = -1;
for (; i < buf.length; i++) {
  const c = buf[i];
  if (inString) {
    if (c === 92) {
      i++;
      continue;
    } // skip escaped char
    if (c === quoteChar) {
      inString = false;
      quoteChar = null;
    }
    continue;
  } else {
    if (c === 34 || c === 39) {
      inString = true;
      quoteChar = c;
      continue;
    } // " or '
    if (c === 91) {
      depth++;
    }
    if (c === 93) {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
}
if (endIdx < 0) {
  console.error('ARRAY_END_NOT_FOUND');
  process.exit(4);
}

const snippetBuf = buf.slice(arrStart, endIdx + 1);
const snippet = snippetBuf.toString('utf8').replace(/[^	\n\r\x20-\x7E]/g, '.');
console.log('ARRAY_SNIPPET:', snippet);

// Extract string literals inside the array
const re = /'([^']*)'|"([^"]*)"/g;
const items = [];
let m;
while ((m = re.exec(snippet))) {
  items.push(m[1] || m[2]);
}
console.log('STRING_COUNT:', items.length);
console.log('FIRST_100_STRINGS:', items.slice(0, 100).join(', '));
process.exit(0);
