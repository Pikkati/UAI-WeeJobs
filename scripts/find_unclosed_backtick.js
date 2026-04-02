const fs = require('fs');
const p = process.argv[2] || 'd:/MyProjectsUAI/weejobs/android/tmp_pulled_base_extracted_round2/assets/index.android.bundle';
const s = fs.readFileSync(p,'utf8');
let positions = [];
for (let i = 0; i < s.length; i++) {
  if (s[i] === '`' && s[i - 1] !== '\\') positions.push(i);
}
if (positions.length % 2 === 0) {
  console.log('NO_UNCLOSED_BACKTICK');
  process.exit(0);
}
const last = positions[positions.length - 1];
const before = Math.max(0, last - 80);
const after = Math.min(s.length, last + 80);
const ctx = s.slice(before, after);
const linesBefore = s.slice(0, last).split(/\r?\n/);
const lineNum = linesBefore.length;
const col = last - s.lastIndexOf('\n', last - 1) - 1;
console.log('UNCLOSED_BACKTICK_INDEX', last, 'LINE', lineNum, 'COL', col);
console.log('\n---CONTEXT_ASCII---\n', ctx.replace(/\r/g,'\\r').replace(/\n/g,'\\n'));
console.log('\n---CONTEXT_HEX---\n', Buffer.from(ctx, 'utf8').toString('hex').match(/.{1,2}/g).join(' '));
