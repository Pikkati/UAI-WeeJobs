const fs = require('fs');
const path = require('path');
try {
  const acorn = require('acorn');
  const file = process.argv[2];
  if (!file) { console.error('usage: node acorn_parse.js <file>'); process.exit(2); }
  if (!fs.existsSync(file)) { console.error('file not found', file); process.exit(2); }
  const src = fs.readFileSync(file, 'utf8');
  try {
    acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script' });
    console.log('parse ok');
  } catch (err) {
    console.error('parse error:', err.message);
    if (err.loc) {
      console.error('at', err.loc);
      const start = Math.max(0, err.pos - 40);
      const end = Math.min(src.length, err.pos + 40);
      const ctx = src.slice(start, end);
      console.error('\n--- CONTEXT ---\n');
      console.error(ctx.replace(/\r/g, '\\r').replace(/\n/g, '\\n'));
    }
    process.exit(1);
  }
} catch (e) {
  console.error('failed to load acorn:', e && e.message);
  process.exit(2);
}
