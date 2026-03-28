const fs = require('fs');
const path = require('path');

function collectFiles(dir, exts = ['.png', '.jpg', '.jpeg', '.svg']) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...collectFiles(p, exts));
    else if (exts.includes(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}

async function checkAssets(opts = {}) {
  const root = opts.dir || path.join(__dirname, '..', 'assets', 'images');
  const maxSize = typeof opts.maxSizeBytes === 'number' ? opts.maxSizeBytes : 500 * 1024;
  const files = collectFiles(root);
  const oversized = [];
  for (const f of files) {
    try {
      const s = fs.statSync(f).size;
      if (s > maxSize) oversized.push({ path: f, size: s });
    } catch (err) {
      // ignore
    }
  }
  return { scanned: files.length, oversized };
}

if (require.main === module) {
  (async () => {
    const argv = process.argv.slice(2);
    const maxIdx = argv.indexOf('--max');
    const maxSize = maxIdx >= 0 ? Number(argv[maxIdx + 1]) : undefined;
    try {
      const res = await checkAssets({ maxSizeBytes: maxSize });
      console.log(`Scanned ${res.scanned} files, ${res.oversized.length} oversized`);
      if (res.oversized.length > 0) {
        console.log('Oversized files:');
        res.oversized.forEach((r) => console.log(r.path, r.size));
        process.exitCode = 2;
      } else process.exitCode = 0;
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    }
  })();
}

module.exports = { checkAssets };
