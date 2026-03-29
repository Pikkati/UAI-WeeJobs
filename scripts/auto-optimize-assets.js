#!/usr/bin/env node
/* eslint-env node */
const fs = require('fs');
const path = require('path');

function collectFiles(dir, exts = ['.png', '.jpg', '.jpeg']) {
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

function bytesToHuman(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function optimizeFile(filePath, maxSize) {
  const stat = fs.statSync(filePath);
  if (stat.size <= maxSize) return { changed: false };

  let sharp;
  try {
    sharp = require('sharp');
  } catch (err) {
    console.error('sharp is not installed. Run `npm ci` before running this script.');
    process.exitCode = 2;
    return { changed: false };
  }

  try {
    const image = sharp(filePath);
    const meta = await image.metadata();
    const ext = path.extname(filePath).toLowerCase();
    let pipeline = image;
    const MAX_WIDTH = 1600;
    if (meta.width && meta.width > MAX_WIDTH) pipeline = pipeline.resize({ width: MAX_WIDTH });

    const tmp = `${filePath}.opt`;
    if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
    } else if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
    } else {
      // fallback to webp for unknown types (not expected)
      pipeline = pipeline.webp({ quality: 80 });
    }

    await pipeline.toFile(tmp);
    const newStat = fs.statSync(tmp);
    if (newStat.size < stat.size) {
      const backupDir = path.join(path.dirname(filePath), 'optimized-backup');
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      const backupPath = path.join(backupDir, path.basename(filePath));
      fs.copyFileSync(filePath, backupPath);
      fs.renameSync(tmp, filePath);
      console.log('Optimized:', path.relative(process.cwd(), filePath), '->', bytesToHuman(newStat.size), 'from', bytesToHuman(stat.size));
      return { changed: true };
    }

    // No win — remove tmp
    fs.unlinkSync(tmp);
    console.log('No improvement for', path.relative(process.cwd(), filePath));
    return { changed: false };
  } catch (err) {
    console.error('Failed to optimize', filePath, err && err.message ? err.message : err);
    return { changed: false };
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const dirArg = argv.find((a) => !a.startsWith('--')) || path.join(__dirname, '..', 'assets', 'images');
  const maxIdx = argv.indexOf('--max');
  const maxSize = maxIdx >= 0 ? Number(argv[maxIdx + 1]) : 500 * 1024;

  console.log('Scanning', dirArg, 'for images larger than', maxSize, 'bytes');
  const files = collectFiles(dirArg);
  let changedCount = 0;
  for (const f of files) {
    try {
      const res = await optimizeFile(f, maxSize);
      if (res.changed) changedCount++;
    } catch (e) {
      // Continue on error
    }
  }

  console.log(`Done. Optimized ${changedCount} file(s).`);
  process.exitCode = 0;
}

if (require.main === module) main();
