#!/usr/bin/env node
/* eslint-env node */
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const manifestPath = path.join(repoRoot, 'assets', 'manifest.json');
const requiredAssetFields = [
  'id',
  'type',
  'path',
  'fileName',
  'status',
  'usage',
  'alt',
  'accessibilityLabel',
  'themeSupport',
  'rtlSupport',
  'sourceReference',
];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const errors = [];
  const ids = new Set();

  if (!Array.isArray(manifest.assets)) {
    errors.push('`assets` must be an array.');
  }
  if (!Array.isArray(manifest.gaps)) {
    errors.push('`gaps` must be an array.');
  }

  for (const [index, asset] of (manifest.assets || []).entries()) {
    const prefix = `assets[${index}]`;

    for (const field of requiredAssetFields) {
      if (!(field in asset)) {
        errors.push(`${prefix} missing required field: ${field}`);
      }
    }

    if (!isNonEmptyString(asset.id)) {
      errors.push(`${prefix}.id must be a non-empty string`);
    } else if (ids.has(asset.id)) {
      errors.push(`${prefix}.id must be unique: ${asset.id}`);
    } else {
      ids.add(asset.id);
    }

    if (!Array.isArray(asset.usage) || asset.usage.length === 0) {
      errors.push(`${prefix}.usage must be a non-empty array`);
    }

    if (!isNonEmptyString(asset.path)) {
      errors.push(`${prefix}.path must be a non-empty string`);
    } else {
      const assetPath = path.join(repoRoot, asset.path);
      if (!fs.existsSync(assetPath)) {
        errors.push(`${prefix}.path does not exist on disk: ${asset.path}`);
      }
    }

    if (!isNonEmptyString(asset.fileName)) {
      errors.push(`${prefix}.fileName must be a non-empty string`);
    }

    if (!['shipped', 'legacy', 'missing'].includes(asset.status)) {
      errors.push(`${prefix}.status must be one of shipped|legacy|missing`);
    }

    if (!['light', 'dark', 'both'].includes(asset.themeSupport)) {
      errors.push(`${prefix}.themeSupport must be one of light|dark|both`);
    }

    if (!['not-applicable', 'mirrored-required', 'supported'].includes(asset.rtlSupport)) {
      errors.push(`${prefix}.rtlSupport must be one of not-applicable|mirrored-required|supported`);
    }
  }

  for (const [index, gap] of (manifest.gaps || []).entries()) {
    const prefix = `gaps[${index}]`;
    if (!isNonEmptyString(gap.id)) errors.push(`${prefix}.id must be a non-empty string`);
    if (!isNonEmptyString(gap.type)) errors.push(`${prefix}.type must be a non-empty string`);
    if (!isNonEmptyString(gap.recommendedPath)) errors.push(`${prefix}.recommendedPath must be a non-empty string`);
    if (!isNonEmptyString(gap.reason)) errors.push(`${prefix}.reason must be a non-empty string`);
    if (!['high', 'medium', 'low'].includes(gap.priority)) {
      errors.push(`${prefix}.priority must be one of high|medium|low`);
    }
  }

  if (errors.length) {
    console.error('Asset manifest validation failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log('Asset manifest validation passed.');
  console.log(`- Assets checked: ${(manifest.assets || []).length}`);
  console.log(`- Gaps checked: ${(manifest.gaps || []).length}`);
}

main();
