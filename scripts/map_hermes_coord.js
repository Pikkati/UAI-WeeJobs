const fs = require('fs');
const path = require('path');
const target = process.argv[2] || path.join(process.cwd(), 'pulled_base_extracted', 'assets', 'index.android.bundle');
const lineArg = process.argv[3] || '1339';
const colArg = process.argv[4] || '1756';
const lineNum = parseInt(lineArg, 10);
const colNum = parseInt(colArg, 10);

if (!fs.existsSync(target)) {
  console.error('FILE_NOT_FOUND', target);
  process.exit(2);
}

const s = fs.readFileSync(target, 'utf8');
const lines = s.split(/\r?\n/);
if (lineNum > lines.length) {
  console.log('FILE_LINES', lines.length);
  console.log('Requested line beyond file; exiting');
  process.exit(0);
}
let offset = 0;
for (let i = 0; i < lineNum - 1; i++) {
  offset += lines[i].length + 1; // account for newline
}
// Hermes columns are 1-based; convert to 0-based char offset
offset += Math.max(0, colNum - 1);

console.log('LINE', lineNum, 'COL', colNum, 'CHAR_OFFSET', offset, 'FILE_SIZE', s.length);
const contextStart = Math.max(0, offset - 300);
const contextEnd = Math.min(s.length, offset + 300);
const ctx = s.slice(contextStart, contextEnd);
console.log('\n--- CONTEXT UTF8 ---\n');
console.log(ctx.replace(/\r/g, '\\r').replace(/\n/g, '\\n'));

const hex = Buffer.from(ctx, 'utf8').toString('hex').match(/.{1,2}/g).join(' ');
console.log('\n--- CONTEXT HEX ---\n');
console.log(hex);
