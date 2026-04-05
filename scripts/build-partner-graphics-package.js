#!/usr/bin/env node
/* eslint-env node */
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const outputRoot = path.join(repoRoot, 'assets', 'source', 'partner-handoff', 'graphics-package');
const manifestPath = path.join(repoRoot, 'assets', 'manifest.json');
const sourceMapPath = path.join(repoRoot, 'assets', 'source', 'figma-exports', 'weejobs-starter-source-map.json');

const docsToCopy = [
  'docs/GRAPHICS_REQUIREMENTS.md',
  'docs/ASSETS.md',
  'docs/ASSETS_GUIDELINES.md',
  'docs/FIGMA_SYNC_WORKFLOW.md',
  'docs/GRAPHICS_PREVIEW_SURFACE.md',
  'docs/EXTERNAL_PARTNER_GRAPHICS_HANDOFF.md',
];

const alwaysInclude = [
  'assets/images/weejobs-logo.png',
  'assets/images/hero-handyman.png',
  'assets/images/icon.png',
  'assets/images/adaptive-icon.png',
  'assets/images/favicon.png',
  'assets/images/splash-icon.png',
  'assets/source/figma-exports/weejobs-starter-source-map.json',
];

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyRelative(relativePath) {
  const from = path.join(repoRoot, relativePath);
  const to = path.join(outputRoot, relativePath);
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const sourceMap = JSON.parse(fs.readFileSync(sourceMapPath, 'utf8'));

  const editableAssets = manifest.assets.filter((asset) =>
    asset.status === 'shipped' && /\.(svg|json)$/i.test(asset.path)
  );
  const referenceAssets = alwaysInclude
    .map((relativePath) => manifest.assets.find((asset) => asset.path === relativePath) || { path: relativePath })
    .filter(Boolean);

  rmDir(outputRoot);
  ensureDir(outputRoot);

  const copied = new Set();
  for (const asset of editableAssets) {
    copyRelative(asset.path);
    copied.add(asset.path);
  }
  for (const asset of referenceAssets) {
    if (!copied.has(asset.path) && fs.existsSync(path.join(repoRoot, asset.path))) {
      copyRelative(asset.path);
      copied.add(asset.path);
    }
  }
  for (const doc of docsToCopy) {
    if (fs.existsSync(path.join(repoRoot, doc))) {
      copyRelative(doc);
      copied.add(doc);
    }
  }

  const packageManifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    packageName: 'weejobs-external-partner-graphics-package',
    packageRoot: 'assets/source/partner-handoff/graphics-package',
    editableAssetCount: editableAssets.length,
    referenceAssetCount: referenceAssets.length,
    docsIncluded: docsToCopy.filter((doc) => fs.existsSync(path.join(repoRoot, doc))),
    editableAssets: editableAssets.map((asset) => ({
      id: asset.id,
      type: asset.type,
      path: asset.path,
      sourceReference: asset.sourceReference || null,
    })),
    sourceMap: {
      file: 'assets/source/figma-exports/weejobs-starter-source-map.json',
      entries: sourceMap.entries.length,
    },
    partnerNotes: [
      'SVG and Lottie JSON files are the primary editable sources in this package.',
      'PNG assets included here are reference outputs for context, not the preferred editable source.',
      'If a live Figma file is introduced later, map it in the included source-map file and sourceReference fields.',
    ],
  };

  const packageReadme = `# WeeJobs External Partner Graphics Package

Generated: ${packageManifest.generatedAt}

## Start here

This package is the curated graphics handoff for an external design/production partner.

Editable source assets are included as:

- SVG files for logos, icons, illustrations, badges, avatars, and favicons
- JSON for starter Lottie motion assets

Reference outputs are included for context where the app still ships PNG-based assets.

## Key files

- package-manifest.json - machine-readable inventory of the handoff package
- assets/source/figma-exports/weejobs-starter-source-map.json - source-to-export mapping
- docs/EXTERNAL_PARTNER_GRAPHICS_HANDOFF.md - editing and return guidance
- docs/GRAPHICS_REQUIREMENTS.md - design constraints and export expectations

## Editing guidance

1. Edit SVG or JSON sources rather than PNG outputs whenever possible.
2. Preserve lowercase kebab-case naming.
3. Keep directional icon RTL counterparts in sync.
4. Update the source-map file if source ownership or editable paths change.

## Scope snapshot

- Editable assets: ${packageManifest.editableAssetCount}
- Reference assets: ${packageManifest.referenceAssetCount}
`;

  fs.writeFileSync(
    path.join(outputRoot, 'package-manifest.json'),
    JSON.stringify(packageManifest, null, 2),
    'utf8'
  );
  fs.writeFileSync(path.join(outputRoot, 'README.md'), packageReadme, 'utf8');

  console.log('Partner graphics package generated.');
  console.log(`- Output: ${path.relative(repoRoot, outputRoot)}`);
  console.log(`- Editable assets: ${editableAssets.length}`);
  console.log(`- Reference assets: ${referenceAssets.length}`);
}

main();
