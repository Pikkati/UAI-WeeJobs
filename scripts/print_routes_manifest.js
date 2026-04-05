const fs = require('fs');
const path = require('path');

const candidates = [
  path.resolve(
    __dirname,
    '..',
    'android',
    'app',
    'src',
    'main',
    'assets',
    'index.android.bundle',
  ),
  path.resolve(
    __dirname,
    '..',
    'android',
    'extracted_app',
    'assets',
    'index.android.bundle',
  ),
];

let found = null;
let content = null;
for (const p of candidates) {
  if (fs.existsSync(p)) {
    try {
      content = fs.readFileSync(p, 'utf8');
      found = p;
      break;
    } catch (e) {
      // skip binary files
    }
  }
}

if (!found) {
  console.error('NO_BUNDLE_FOUND', candidates.join(';'));
  process.exit(1);
}

const re = /globalThis\.__EXPO_ROUTER_KEYS\s*=\s*(\[[\s\S]*?\]);/;
let m = re.exec(content);
if (!m) {
  // fallback: try searching for the identifier alone
  const re2 = /__EXPO_ROUTER_KEYS\s*=\s*(\[[\s\S]*?\]);/;
  m = re2.exec(content);
}

if (!m) {
  console.error('NO_MANIFEST_ASSIGNMENT_FOUND_IN', found);
  process.exit(2);
}

let arrText = m[1];
try {
  const arr = JSON.parse(arrText);
  console.log('FOUND_BUNDLE:', found);
  console.log('KEY_COUNT:', arr.length);
  console.log('FIRST_20:', arr.slice(0, 20));
  const out = path.resolve(
    __dirname,
    '..',
    'android',
    'extracted_app',
    'routes_manifest.json',
  );
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(arr, null, 2), 'utf8');
  console.log('WROTE:', out);
} catch (err) {
  // try a JS eval fallback (less safe but runs in this environment)
  try {
    const arr = new Function('return ' + arrText)();
    console.log('FOUND_BUNDLE (eval):', found);
    console.log('KEY_COUNT:', arr.length);
    console.log('FIRST_20:', arr.slice(0, 20));
    const out = path.resolve(
      __dirname,
      '..',
      'android',
      'extracted_app',
      'routes_manifest.json',
    );
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(arr, null, 2), 'utf8');
    console.log('WROTE:', out);
  } catch (e2) {
    console.error('PARSE_ERROR', e2 && e2.message ? e2.message : e2);
    process.exit(3);
  }
}
