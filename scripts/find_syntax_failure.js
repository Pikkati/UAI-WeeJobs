const fs = require('fs');
const path = process.argv[2];
if (!path) {
  console.error('Usage: node find_syntax_failure.js <bundle-path>');
  process.exit(2);
}
const s = fs.readFileSync(path, 'utf8');
let lo = 0, hi = s.length;
let lastErr = null;
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  const segment = s.slice(0, mid);
  try {
    // Try to compile the prefix; if it succeeds, move right
    new Function(segment);
    lo = mid + 1;
  } catch (e) {
    lastErr = e.toString();
    hi = mid;
  }
}
console.log('earliest failure index approx:', lo);
console.log('error:', lastErr);
const contextStart = Math.max(0, lo - 80);
const contextEnd = Math.min(s.length, lo + 80);
const ctx = s.slice(contextStart, contextEnd);
console.log('\n--- CONTEXT (hex/utf8) ---');
const buf = Buffer.from(ctx, 'utf8');
const hex = Array.from(buf).map(b => b.toString(16).padStart(2,'0')).join(' ');
console.log(hex);
console.log('\n--- CONTEXT (ascii) ---');
console.log(ctx.replace(/\r/g, '\\r').replace(/\n/g, '\\n'));
