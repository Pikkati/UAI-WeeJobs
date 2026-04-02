const fs = require('fs');
const p = process.argv[2] || 'd:/MyProjectsUAI/weejobs/android/tmp_pulled_base_extracted_round2/assets/index.android.bundle';
const s = fs.readFileSync(p,'utf8');
const len = s.length;
let state = 'normal';
let startPos = null;
let templateStack = [];
function skipString(i, quote) {
  i++;
  while (i < len) {
    if (s[i] === '\\') i += 2;
    else if (s[i] === quote) return i + 1;
    else i++;
  }
  return i;
}
function skipLineComment(i) {
  while (i < len && s[i] !== '\n') i++;
  return i;
}
function skipBlockComment(i) {
  i += 2;
  while (i < len) {
    if (s[i] === '*' && s[i + 1] === '/') return i + 2;
    i++;
  }
  return i;
}

let i = 0;
for (; i < len; i++) {
  const ch = s[i];
  const next = s[i + 1];
  if (state === 'normal') {
    if (ch === "'") { i = skipString(i, "'") - 1; continue; }
    if (ch === '"') { i = skipString(i, '"') - 1; continue; }
    if (ch === '/' && next === '/') { i = skipLineComment(i) - 1; continue; }
    if (ch === '/' && next === '*') { i = skipBlockComment(i) - 1; continue; }
    if (ch === '`' && s[i - 1] !== '\\') { state = 'template'; startPos = i; templateStack = []; continue; }
  } else if (state === 'template') {
    if (ch === '\\') { i++; continue; }
    if (ch === '`' && s[i - 1] !== '\\' && templateStack.length === 0) {
      state = 'normal'; startPos = null; continue;
    }
    if (ch === '$' && next === '{') { templateStack.push('{'); i++; continue; }
    if (ch === '{' && templateStack.length > 0) { templateStack.push('{'); continue; }
    if (ch === '}' && templateStack.length > 0) { templateStack.pop(); continue; }
    // inside ${...} expression, skip strings
    if (templateStack.length > 0 && ch === "'") { i = skipString(i, "'") - 1; continue; }
    if (templateStack.length > 0 && ch === '"') { i = skipString(i, '"') - 1; continue; }
    if (templateStack.length > 0 && ch === '/' && next === '/') { i = skipLineComment(i) - 1; continue; }
    if (templateStack.length > 0 && ch === '/' && next === '*') { i = skipBlockComment(i) - 1; continue; }
  }
}

if (state === 'template') {
  const before = Math.max(0, startPos - 80);
  const after = Math.min(len, startPos + 80);
  const ctx = s.slice(before, after);
  const line = s.slice(0, startPos).split(/\r?\n/).length;
  const col = startPos - Math.max(s.lastIndexOf('\n', startPos - 1), -1) - 1;
  console.log('UNCLOSED_TEMPLATE_START', startPos, 'LINE', line, 'COL', col);
  console.log('\n---CONTEXT_ASCII---\n', ctx.replace(/\r/g,'\\r').replace(/\n/g,'\\n'));
  console.log('\n---CONTEXT_HEX---\n', Buffer.from(ctx,'utf8').toString('hex').match(/.{1,2}/g).join(' '));
  process.exit(0);
} else {
  console.log('NO_UNCLOSED_TEMPLATE_FOUND');
}
