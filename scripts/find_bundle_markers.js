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
const patterns = [
  '__EXPO_ROUTER_KEYS',
  '[routes-manifest]',
  'routes-manifest',
  'routes_manifest',
  '[expo-router]',
  'expo-router',
];

function findAll(buffer, needle) {
  const results = [];
  let idx = buffer.indexOf(needle, 0);
  while (idx !== -1) {
    results.push(idx);
    idx = buffer.indexOf(needle, idx + 1);
  }
  return results;
}

if (!fs.existsSync(bundlePath)) {
  console.error('BUNDLE_NOT_FOUND', bundlePath);
  process.exit(2);
}

const buf = fs.readFileSync(bundlePath);
console.log('BUNDLE_PATH:', bundlePath, 'SIZE:', buf.length);

for (const p of patterns) {
  const needle = Buffer.from(p, 'ascii');
  const hits = findAll(buf, needle);
  if (hits.length === 0) {
    console.log('NOT_FOUND:', p);
  } else {
    for (const off of hits) {
      const start = Math.max(0, off - 40);
      const end = Math.min(buf.length, off + needle.length + 40);
      const snippet = buf
        .slice(start, end)
        .toString('utf8')
        .replace(/[^\x20-\x7E\n\r]/g, '.');
      console.log(`FOUND:${p}:offset=${off}:context="${snippet}"`);
    }
  }
}
