const fs = require('fs');
const path = require('path');

function findFiles(dir, name, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return results;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      findFiles(full, name, results);
    } else if (entry.isFile() && entry.name === name) {
      results.push(full);
    }
  }
  return results;
}

const repoRoot = process.cwd();
const bundles = findFiles(repoRoot, 'index.android.bundle');
if (!bundles.length) {
  console.log('NO_BUNDLES_FOUND');
  process.exit(0);
}

const repl = Buffer.from([0xEF, 0xBF, 0xBD]);
let any = false;
for (const b of bundles) {
  try {
    const buf = fs.readFileSync(b);
    const idx = buf.indexOf(repl);
    const txt = buf.toString('utf8');
    const hasInspectorJson = txt.includes('expo-router-inspect-all.json');
    const hasInspectorLog = txt.includes('[expo-router-inspector-json]');
    console.log('FILE:', b);
    console.log('  SIZE:', buf.length);
    console.log('  REPLACEMENT_INDEX:', idx);
    console.log('  HAS_INSPECTOR_JSON:', hasInspectorJson);
    console.log('  HAS_INSPECTOR_LOG:', hasInspectorLog);
    any = true;
  } catch (e) {
    console.log('ERR reading', b, e.message);
  }
}
if (!any) process.exit(1);
