#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(repoRoot, 'app', '_routesManifest.js');
const candidates = [
  path.join(repoRoot, 'android', 'app', 'build', 'generated', 'assets', 'react', 'release', 'index.android.bundle'),
  path.join(repoRoot, 'android', 'app', 'build', 'intermediates', 'assets', 'release', 'mergeReleaseAssets', 'index.android.bundle.bak-before-inject'),
  path.join(repoRoot, 'android', 'app', 'src', 'main', 'assets', 'index.android.bundle'),
  path.join(repoRoot, 'android', 'android', 'app', 'src', 'main', 'assets', 'index.android.bundle'),
];
const targetAsset = path.join(repoRoot, 'android', 'app', 'src', 'main', 'assets', 'index.android.bundle');

function findExisting(list) {
  for (const p of list) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const bundleSource = findExisting(candidates);
if (!bundleSource) {
  console.error('No generated bundle found. Checked paths:\n' + candidates.join('\n'));
  process.exitCode = 2;
  process.exit(2);
}
if (!fs.existsSync(manifestPath)) {
  console.error('Manifest file not found at: ' + manifestPath);
  process.exitCode = 3;
  process.exit(3);
}

const manifestContent = fs.readFileSync(manifestPath, 'utf8');
const bundleBuffer = fs.readFileSync(bundleSource);

function isUtf8Buffer(buf) {
  try {
    const s = buf.toString('utf8');
    return Buffer.from(s, 'utf8').equals(buf);
  } catch (e) {
    return false;
  }
}

if (!isUtf8Buffer(bundleBuffer)) {
  console.warn('Bundle appears to be binary/non-UTF8 at:', bundleSource);
  console.warn('Skipping manifest prepend to avoid corrupting a binary Hermes bundle.');
  // Ensure the target asset exists (copy as-is)
  fs.mkdirSync(path.dirname(targetAsset), { recursive: true });
  try {
    if (bundleSource !== targetAsset) fs.copyFileSync(bundleSource, targetAsset);
  } catch (e) {
    console.warn('Could not copy binary bundle to target:', bundleSource, e.message);
  }
  process.exit(0);
}

let bundleContent = bundleBuffer.toString('utf8');

// If the bundle already starts with a top-level assignment, skip only if exact prefix matches
const trimmed = bundleContent.trimStart();
const alreadyHasTop = trimmed.startsWith('globalThis.__EXPO_ROUTER_KEYS');

if (alreadyHasTop) {
  console.log('Bundle already begins with a top-level __EXPO_ROUTER_KEYS assignment — no prepend needed.');
  process.exit(0);
}

const prefix = manifestContent + '\n';
const newContent = prefix + bundleContent;

fs.mkdirSync(path.dirname(targetAsset), { recursive: true });
fs.writeFileSync(targetAsset, newContent, 'utf8');
if (bundleSource !== targetAsset) {
  try {
    fs.writeFileSync(bundleSource, newContent, 'utf8');
  } catch (e) {
    // best-effort: ignore if write fails to generated path
    console.warn('Could not overwrite generated bundle path:', bundleSource, e.message);
  }
}

console.log('Prepended manifest to:', targetAsset);
console.log('Done.');
