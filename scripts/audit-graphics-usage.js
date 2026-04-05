#!/usr/bin/env node
/* eslint-env node */
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const manifestPath = path.join(repoRoot, 'assets', 'manifest.json');
const outputMarkdownPath = path.join(repoRoot, 'docs', 'GRAPHICS_USAGE_AUDIT.md');

const scanRoots = [
  path.join(repoRoot, 'app'),
  path.join(repoRoot, 'components'),
  path.join(repoRoot, 'constants'),
  path.join(repoRoot, 'context'),
  path.join(repoRoot, 'lib'),
];

const scanFiles = [path.join(repoRoot, 'app.json')];
const allowedExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.json']);
const graphicsAssetExtensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
  '.gif',
  '.json',
]);
const ignoreDirNames = new Set([
  'node_modules',
  '.expo',
  '.git',
  'coverage',
  'coverage_out',
  'tmp_coverage',
  'tmp_jest_cov',
  'tmp_apk_extracted',
  'extracted_app',
  'build',
  'dist',
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (ignoreDirNames.has(entry.name)) continue;
      walk(path.join(dir, entry.name), acc);
      continue;
    }

    const filePath = path.join(dir, entry.name);
    if (allowedExtensions.has(path.extname(filePath))) {
      acc.push(filePath);
    }
  }
  return acc;
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function normalizeAssetReference(sourceFile, rawRef) {
  if (!rawRef) return null;
  const cleaned = rawRef.replace(/^['"]|['"]$/g, '').trim();
  if (!cleaned.includes('assets/')) return null;

  if (cleaned.startsWith('assets/')) return cleaned;
  if (cleaned.startsWith('./assets/')) return cleaned.replace(/^\.\//, '');

  if (cleaned.startsWith('../') || cleaned.startsWith('./')) {
    const resolved = path.resolve(path.dirname(sourceFile), cleaned);
    const relative = path.relative(repoRoot, resolved);
    return toPosix(relative);
  }

  return cleaned;
}

function isGraphicsAssetRef(assetPath) {
  if (!assetPath) return false;
  if (assetPath === 'assets/manifest.json') return false;
  const ext = path.extname(assetPath).toLowerCase();
  return graphicsAssetExtensions.has(ext);
}

function collectRefsFromText(filePath, content) {
  const refs = [];
  const patterns = [
    /require\((['"][^'"]*assets\/[^'"]+['"])\)/g,
    /source\s*:\s*(['"][^'"]*assets\/[^'"]+['"])/g,
    /"(?:icon|foregroundImage|favicon|image)"\s*:\s*"([^\"]*assets\/[^\"]+)"/g,
    /'((?:\.\.\/|\.\/)?assets\/[^']+)'/g,
    /"((?:\.\.\/|\.\/)?assets\/[^\"]+)"/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const raw = match[1];
      const normalized = normalizeAssetReference(filePath, raw);
      if (normalized && isGraphicsAssetRef(normalized)) refs.push(normalized);
    }
  }

  return refs;
}

function main() {
  const manifest = readJson(manifestPath);
  const manifestPaths = new Set(manifest.assets.map((asset) => asset.path));
  const fileRefs = new Map();

  const filesToScan = [
    ...scanRoots.flatMap((dir) => walk(dir)),
    ...scanFiles.filter((file) => fs.existsSync(file)),
  ];

  for (const filePath of filesToScan) {
    const content = fs.readFileSync(filePath, 'utf8');
    const refs = collectRefsFromText(filePath, content);
    if (!refs.length) continue;

    const repoRelativeFile = toPosix(path.relative(repoRoot, filePath));
    const uniqueRefs = [...new Set(refs)].sort();
    fileRefs.set(repoRelativeFile, uniqueRefs);
  }

  const usageByAsset = new Map();
  for (const [file, refs] of fileRefs.entries()) {
    for (const ref of refs) {
      if (!usageByAsset.has(ref)) usageByAsset.set(ref, []);
      usageByAsset.get(ref).push(file);
    }
  }

  const usedAssetPaths = [...usageByAsset.keys()].sort();
  const usedButMissingInManifest = usedAssetPaths.filter((ref) => !manifestPaths.has(ref));
  const manifestButUnused = [...manifestPaths].filter((ref) => !usageByAsset.has(ref));

  let markdown = '# Graphics Usage Audit\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += '## Summary\n\n';
  markdown += `- Files scanned: ${filesToScan.length}\n`;
  markdown += `- Unique asset references found: ${usedAssetPaths.length}\n`;
  markdown += `- Manifest asset entries: ${manifest.assets.length}\n`;
  markdown += `- Used but missing in manifest: ${usedButMissingInManifest.length}\n`;
  markdown += `- Manifest entries not currently referenced: ${manifestButUnused.length}\n\n`;

  markdown += '## Used asset references\n\n';
  if (usedAssetPaths.length === 0) {
    markdown += '- No asset references found in scanned files.\n\n';
  } else {
    for (const assetPath of usedAssetPaths) {
      markdown += `### \`${assetPath}\`\n\n`;
      const refs = usageByAsset.get(assetPath) || [];
      for (const file of refs) {
        markdown += `- \`${file}\`\n`;
      }
      markdown += '\n';
    }
  }

  markdown += '## Used in code/config but missing in manifest\n\n';
  if (!usedButMissingInManifest.length) {
    markdown += '- None.\n\n';
  } else {
    for (const assetPath of usedButMissingInManifest) {
      markdown += `- \`${assetPath}\`\n`;
    }
    markdown += '\n';
  }

  markdown += '## In manifest but not currently referenced\n\n';
  if (!manifestButUnused.length) {
    markdown += '- None.\n\n';
  } else {
    for (const assetPath of manifestButUnused) {
      markdown += `- \`${assetPath}\`\n`;
    }
    markdown += '\n';
  }

  fs.writeFileSync(outputMarkdownPath, markdown, 'utf8');

  console.log('Graphics usage audit complete.');
  console.log(`- Files scanned: ${filesToScan.length}`);
  console.log(`- Unique asset references found: ${usedAssetPaths.length}`);
  console.log(`- Used but missing in manifest: ${usedButMissingInManifest.length}`);
  console.log(`- Manifest entries not currently referenced: ${manifestButUnused.length}`);
  console.log(`- Wrote report: ${toPosix(path.relative(repoRoot, outputMarkdownPath))}`);
}

main();
