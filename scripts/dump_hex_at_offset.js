#!/usr/bin/env node
const fs = require('fs');
if (process.argv.length < 4) {
  console.error('usage: node dump_hex_at_offset.js <file> <offset> [before] [after]');
  process.exit(2);
}
const file = process.argv[2];
const offset = parseInt(process.argv[3], 10);
const before = parseInt(process.argv[4] || '40', 10);
const after = parseInt(process.argv[5] || '120', 10);
if (!fs.existsSync(file)) {
  console.error('file not found', file);
  process.exit(2);
}
const buf = fs.readFileSync(file);
const start = Math.max(0, offset - before);
const end = Math.min(buf.length, offset + after);
const slice = buf.slice(start, end);
console.log('FILE', file, 'LEN', buf.length, 'OFFSET', offset, 'START', start, 'END', end);
console.log('\n--- ASCII ---\n');
console.log(slice.toString('utf8'));
console.log('\n--- HEX ---\n');
console.log(Array.from(slice).map(b => b.toString(16).padStart(2,'0')).join(' '));
