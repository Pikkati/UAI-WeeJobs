const fs = require('fs');
const path = process.argv[2] || 'pulled_base_extracted/assets/index.android.bundle';
const offset = parseInt(process.argv[3] || '2474158', 10);
if (!fs.existsSync(path)) { console.error('FILE_NOT_FOUND', path); process.exit(2); }
const s = fs.readFileSync(path, 'utf8');
const startSearch = Math.max(0, offset - 2000);
const endSearch = Math.min(s.length, offset + 2000);
const ctx = s.slice(startSearch, endSearch);
console.log('FILE', path);
console.log('OFFSET', offset, 'CTX_START', startSearch, 'CTX_END', endSearch);
console.log('\n--- CONTEXT UTF8 ---\n');
console.log(ctx.replace(/\r/g,'\\r').replace(/\n/g,'\\n'));

function findUnescaped(ch, from, dir) {
  if (dir === 'back') {
    for (let i = from; i >= 0 && i >= startSearch; i--) {
      if (s[i] === ch && s[i-1] !== '\\') return i;
    }
    return -1;
  } else {
    for (let i = from; i < s.length && i <= endSearch; i++) {
      if (s[i] === ch && s[i-1] !== '\\') return i;
    }
    return -1;
  }
}

const openSingle = findUnescaped("'", offset, 'back');
const closeSingle = openSingle === -1 ? -1 : findUnescaped("'", openSingle+1, 'forward');
const openDouble = findUnescaped('"', offset, 'back');
const closeDouble = openDouble === -1 ? -1 : findUnescaped('"', openDouble+1, 'forward');
const openBacktick = findUnescaped('`', offset, 'back');
const closeBacktick = openBacktick === -1 ? -1 : findUnescaped('`', openBacktick+1, 'forward');

console.log('\n--- QUOTE LOCATIONS ---');
console.log('openSingle', openSingle, 'closeSingle', closeSingle);
console.log('openDouble', openDouble, 'closeDouble', closeDouble);
console.log('openBacktick', openBacktick, 'closeBacktick', closeBacktick);

if (openSingle !== -1) {
  const before = Math.max(0, openSingle - 80);
  const after = Math.min(s.length, (closeSingle === -1 ? openSingle + 200 : closeSingle + 20));
  console.log('\n--- SINGLE QUOTE SLICE ---\n', s.slice(before, after).replace(/\r/g,'\\r').replace(/\n/g,'\\n'));
}

if (openDouble !== -1) {
  const before = Math.max(0, openDouble - 80);
  const after = Math.min(s.length, (closeDouble === -1 ? openDouble + 200 : closeDouble + 20));
  console.log('\n--- DOUBLE QUOTE SLICE ---\n', s.slice(before, after).replace(/\r/g,'\\r').replace(/\n/g,'\\n'));
}

if (openBacktick !== -1) {
  const before = Math.max(0, openBacktick - 80);
  const after = Math.min(s.length, (closeBacktick === -1 ? openBacktick + 200 : closeBacktick + 20));
  console.log('\n--- BACKTICK SLICE ---\n', s.slice(before, after).replace(/\r/g,'\\r').replace(/\n/g,'\\n'));
}
