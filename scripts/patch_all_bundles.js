const fs = require('fs');
const path = require('path');

function findFiles(dir, name, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return results;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      findFiles(full, name, results);
    } else if (entry.isFile() && entry.name === name) {
      results.push(full);
    }
  }
  return results;
}

function isEscaped(s, idx) {
  let bs = 0;
  for (let i = idx - 1; i >= 0 && s[i] === '\\'; i--) bs++;
  return bs % 2 === 1;
}

const projectRoot = process.cwd();
const bundles = findFiles(projectRoot, 'index.android.bundle');
if (!bundles.length) {
  console.log('No index.android.bundle files found in', projectRoot);
  process.exit(0);
}

const needle = "[expo-router] getDirectoryTree: using fallback manifest";
let patchedCount = 0;
let skippedCount = 0;

for (const file of bundles) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const idx = raw.indexOf(needle);
    if (idx === -1) {
      skippedCount++;
      continue;
    }

    // find unescaped opening single-quote before idx
    let open = -1;
    for (let i = idx; i >= 0; i--) {
      if (raw[i] === "'" && !isEscaped(raw, i)) { open = i; break; }
    }
    if (open === -1) {
      console.warn('OPEN_QUOTE_NOT_FOUND for', file);
      skippedCount++;
      continue;
    }

    // find unescaped closing single-quote after open
    let close = -1;
    for (let i = open + 1; i < raw.length; i++) {
      if (raw[i] === "'" && !isEscaped(raw, i)) { close = i; break; }
    }
    if (close === -1) {
      console.warn('CLOSE_QUOTE_NOT_FOUND for', file);
      skippedCount++;
      continue;
    }

    const fragment = raw.slice(open + 1, close);
    if (!fragment.includes('\n') && !fragment.includes('\r')) {
      console.log('NO_LITERAL_NEWLINES_INSIDE for', file);
      skippedCount++;
      continue;
    }

    let fixedFragment = fragment.replace(/\r\n/g, '\\\\n').replace(/\r/g, '\\\\n').replace(/\n/g, '\\\\n');

    // Escape single quotes that are not already escaped so the fragment
    // remains a valid single-quoted string inside the bundle.
    function escapeSingleQuotes(str) {
      let out = '';
      for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (ch === "'") {
          // count preceding backslashes
          let k = i - 1;
          let bs = 0;
          while (k >= 0 && str[k] === '\\') { bs++; k--; }
          if (bs % 2 === 0) {
            out += "\\'";
          } else {
            out += "'";
          }
        } else {
          out += ch;
        }
      }
      return out;
    }

    fixedFragment = escapeSingleQuotes(fixedFragment);
    const fixed = raw.slice(0, open + 1) + fixedFragment + raw.slice(close);

    // backup (avoid overwriting existing .bak)
    const bak = file + '.bak';
    if (!fs.existsSync(bak)) {
      fs.writeFileSync(bak, raw, 'utf8');
    } else {
      // write an indexed backup
      let i = 1;
      while (fs.existsSync(`${bak}.${i}`)) i++;
      fs.writeFileSync(`${bak}.${i}`, raw, 'utf8');
    }

    fs.writeFileSync(file, fixed, 'utf8');
    console.log('PATCHED', file);
    patchedCount++;
  } catch (err) {
    console.error('Error processing', file, err && err.message);
  }
}

console.log('Done. patched=', patchedCount, 'skipped=', skippedCount, 'total=', bundles.length);
