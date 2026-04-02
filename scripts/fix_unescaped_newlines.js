const fs = require('fs');
const path = process.argv[2] || 'android/app/src/main/assets/index.android.bundle';
if (!fs.existsSync(path)) { console.error('FILE_NOT_FOUND', path); process.exit(2); }
const s = fs.readFileSync(path, 'utf8');
const needle = "[expo-router] getDirectoryTree: using fallback manifest";
const idx = s.indexOf(needle);
if (idx === -1) {
  console.error('NEEDLE_NOT_FOUND');
  process.exit(3);
}
// find unescaped single quote before idx
function findUnescapedBack(ch, from) {
  for (let i = from; i >= 0; i--) {
    if (s[i] === ch && s[i-1] !== '\\') return i;
  }
  return -1;
}
function findUnescapedForward(ch, from) {
  for (let i = from; i < s.length; i++) {
    if (s[i] === ch && s[i-1] !== '\\') return i;
  }
  return -1;
}
const open = findUnescapedBack("'", idx);
if (open === -1) { console.error('OPEN_QUOTE_NOT_FOUND'); process.exit(4); }
const close = findUnescapedForward("'", open+1);
if (close === -1) { console.error('CLOSE_QUOTE_NOT_FOUND'); process.exit(5); }
console.log('FOUND_QUOTE_RANGE', open, close, 'LEN', close-open+1);
const fragment = s.slice(open+1, close);
// If fragment contains literal LF characters, replace them with escaped \n
if (!fragment.includes('\n') && !fragment.includes('\r')) {
  console.log('NO_LITERAL_NEWLINES_INSIDE');
  process.exit(0);
}
const fixedFragment = fragment.replace(/\r\n/g, '\\n').replace(/\r/g, '\\n').replace(/\n/g, '\\n');
const fixed = s.slice(0, open+1) + fixedFragment + s.slice(close);
// backup
fs.writeFileSync(path + '.bak', s, 'utf8');
fs.writeFileSync(path, fixed, 'utf8');
console.log('PATCHED', path, 'backup at', path + '.bak');
