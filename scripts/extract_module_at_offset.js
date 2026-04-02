#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function usage() {
  console.error('usage: node extract_module_at_offset.js <bundle> <offset>');
  process.exit(2);
}

if (process.argv.length < 4) usage();
const bundlePath = process.argv[2];
const offset = parseInt(process.argv[3], 10);
if (!fs.existsSync(bundlePath)) {
  console.error('bundle not found:', bundlePath);
  process.exit(2);
}
const raw = fs.readFileSync(bundlePath);
const src = raw.toString('utf8');
if (isNaN(offset) || offset < 0 || offset >= src.length) {
  console.error('invalid offset');
  process.exit(2);
}

function findLastD(beforeIdx) {
  const needle = '__d(';
  let idx = src.lastIndexOf(needle, beforeIdx);
  return idx;
}

const start = findLastD(offset);
if (start === -1) {
  console.error('could not find __d( before offset', offset);
  process.exit(2);
}

// find opening parenthesis of __d invocation
const openParen = src.indexOf('(', start);
if (openParen === -1) {
  console.error('malformed __d(');
  process.exit(2);
}

let i = openParen + 1;
let parenDepth = 1;
let inString = false;
let stringChar = null;

function charAt(j) { return src.charCodeAt(j); }

while (i < src.length && parenDepth > 0) {
  const ch = charAt(i);
  if (inString) {
    if (ch === 92) { // backslash
      i += 2; // skip escaped char
      continue;
    }
    if (ch === stringChar.charCodeAt(0)) {
      inString = false;
      stringChar = null;
      i++;
      continue;
    }
    if (stringChar === '`') {
      // handle ${ ... } expressions inside template literals
      if (ch === 36 && charAt(i+1) === 123) { // ${
        i += 2;
        let braceDepth = 1;
        while (i < src.length && braceDepth > 0) {
          const c2 = charAt(i);
          if (c2 === 92) { i += 2; continue; }
          if (c2 === 39 || c2 === 34 || c2 === 96) {
            const q = String.fromCharCode(c2);
            i++;
            while (i < src.length) {
              const cc = charAt(i);
              if (cc === 92) { i += 2; continue; }
              if (cc === q.charCodeAt(0)) { i++; break; }
              i++;
            }
            continue;
          }
          if (c2 === 123) { braceDepth++; i++; }
          else if (c2 === 125) { braceDepth--; i++; }
          else i++;
        }
        continue;
      }
    }
    i++;
    continue;
  }
  // not in string
  if (ch === 39 || ch === 34 || ch === 96) {
    inString = true;
    stringChar = String.fromCharCode(ch);
    i++;
    continue;
  }
  if (ch === 40) { parenDepth++; i++; continue; }
  if (ch === 41) { parenDepth--; i++; if (parenDepth === 0) break; continue; }
  i++;
}

if (parenDepth !== 0) {
  console.error('failed to find matching ) for __d(');
  process.exit(2);
}

const end = i; // index of ')' position +1
let tail = end+1;
// include trailing semicolon if present
if (src[end] === ';') tail = end+1;

const moduleText = src.slice(start, tail);
const outPath = path.join(__dirname, `extracted_module_${start}.js`);
fs.writeFileSync(outPath, moduleText, 'utf8');
console.error('wrote', outPath, 'length', moduleText.length);

// attempt to extract function body
const fnMatch = moduleText.match(/function\s*\([^)]*\)\s*\{/);
if (!fnMatch) {
  console.error('could not locate function(...) { in module');
  process.exit(0);
}
const fnStart = moduleText.indexOf(fnMatch[0]);
const bodyOpen = moduleText.indexOf('{', fnStart);
// find matching brace for function body
let j = bodyOpen + 1;
let braceDepth = 1;
inString = false;
stringChar = null;
while (j < moduleText.length && braceDepth > 0) {
  const ch = moduleText.charCodeAt(j);
  if (inString) {
    if (ch === 92) { j += 2; continue; }
    if (ch === stringChar.charCodeAt(0)) { inString = false; stringChar = null; j++; continue; }
    if (stringChar === '`') {
      if (ch === 36 && moduleText.charCodeAt(j+1) === 123) {
        j += 2; let bd = 1; while (j < moduleText.length && bd > 0) {
          const c2 = moduleText.charCodeAt(j);
          if (c2 === 92) { j += 2; continue; }
          if (c2 === 39 || c2 === 34 || c2 === 96) {
            const q = String.fromCharCode(c2); j++; while (j < moduleText.length) { const cc = moduleText.charCodeAt(j); if (cc === 92) { j += 2; continue; } if (cc === q.charCodeAt(0)) { j++; break; } j++; } continue;
          }
          if (c2 === 123) { bd++; j++; }
          else if (c2 === 125) { bd--; j++; }
          else j++;
        }
        continue;
      }
    }
    j++; continue;
  }
  if (ch === 39 || ch === 34 || ch === 96) { inString = true; stringChar = String.fromCharCode(ch); j++; continue; }
  if (ch === 123) { braceDepth++; j++; continue; }
  if (ch === 125) { braceDepth--; j++; if (braceDepth === 0) break; continue; }
  j++;
}

if (braceDepth !== 0) {
  console.error('failed to find function body end');
  process.exit(0);
}
// exclude the final closing '}' of the function body (j is after the '}' char)
const body = moduleText.slice(bodyOpen+1, j-1);
const bodyOut = path.join(__dirname, `extracted_module_${start}_body.js`);
fs.writeFileSync(bodyOut, body, 'utf8');
console.error('wrote function body to', bodyOut, 'len', body.length);

// attempt to parse via new Function for syntax errors
try {
  // new Function expects function body; wrap in parentheses to allow return at top-level
  new Function(body);
  console.error('Function(body) compiled successfully — no top-level syntax error detected');
} catch (err) {
  console.error('parse error from new Function:', String(err && err.message));
}

console.log('MODULE_START', start, 'MODULE_END', tail, 'MODULE_LEN', moduleText.length);
