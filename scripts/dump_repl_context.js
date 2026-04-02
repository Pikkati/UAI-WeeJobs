const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const target = process.argv[2] || path.join(repoRoot, 'android', 'app', 'src', 'main', 'assets', 'index.android.bundle');
const radius = parseInt(process.argv[3], 10) || 120;

if (!fs.existsSync(target)) {
  console.error('FILE_NOT_FOUND', target);
  process.exit(2);
}

const buf = fs.readFileSync(target);
const repl = Buffer.from([0xEF, 0xBF, 0xBD]);
const idx = buf.indexOf(repl);

console.log('TARGET:', target);
console.log('SIZE:', buf.length);
console.log('REPLACEMENT_INDEX:', idx);

function hexdump(slice) {
  const hex = [];
  const ascii = [];
  for (let i = 0; i < slice.length; i++) {
    const b = slice[i];
    hex.push(b.toString(16).padStart(2, '0'));
    ascii.push(b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.');
  }
  return { hex: hex.join(' '), ascii: ascii.join('') };
}

if (idx === -1) {
  console.log('No replacement bytes found in file.');
  // Also report inspector marker positions
  const inspectorJson = Buffer.from('expo-router-inspect-all.json', 'utf8');
  const jsonIdx = buf.indexOf(inspectorJson);
  console.log('INSPECTOR_JSON_INDEX:', jsonIdx);
  if (jsonIdx !== -1) {
    const start = Math.max(0, jsonIdx - 80);
    const end = Math.min(buf.length, jsonIdx + 80);
    const s = buf.slice(start, end);
    const d = hexdump(s);
    console.log('Context around inspector JSON (hex):', d.hex);
    console.log('Context around inspector JSON (ascii):', d.ascii);
  }
  process.exit(0);
}

const start = Math.max(0, idx - radius);
const end = Math.min(buf.length, idx + radius + repl.length);
const slice = buf.slice(start, end);
const dump = hexdump(slice);
console.log('CONTEXT_OFFSET_START:', start);
console.log('CONTEXT_OFFSET_END:', end);
console.log('\nHEX\n', dump.hex);
console.log('\nASCII\n', dump.ascii);

// show a small window exactly at the replacement location
const before = Math.max(0, idx - 20);
const after = Math.min(buf.length, idx + 20 + repl.length);
const small = buf.slice(before, after);
const smallDump = hexdump(small);
console.log('\nSMALL_WINDOW_START:', before, 'END:', after);
console.log('\nHEX_SMALL\n', smallDump.hex);
console.log('\nASCII_SMALL\n', smallDump.ascii);

// Also show nearby JS text boundaries (find nearest newline boundaries)
const textStart = buf.lastIndexOf('\n', idx) + 1;
const textEnd = buf.indexOf('\n', idx);
console.log('\nNEAREST_LINE_START:', textStart, 'NEAREST_LINE_END:', textEnd);
if (textStart >=0 && textEnd >= 0) {
  try { 
    const line = buf.slice(textStart, textEnd).toString('utf8');
    console.log('\nLINE (utf8):\n', line);
  } catch (e) {
    console.log('Could not decode nearest line as utf8');
  }
}
