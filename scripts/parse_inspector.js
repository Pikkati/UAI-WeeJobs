#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const inFile = process.argv[2] || path.resolve(process.cwd(), 'expo-router-inspect-all.json');
if (!fs.existsSync(inFile)) {
  console.error('Inspector file not found:', inFile);
  process.exit(2);
}

let raw;
try {
  raw = fs.readFileSync(inFile, 'utf8');
} catch (e) {
  console.error('Failed to read file:', e.message || e);
  process.exit(3);
}

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('Invalid JSON in inspector file:', e.message || e);
  process.exit(4);
}

const results = data && data.results;
if (!results || typeof results !== 'object') {
  console.log('No results object found in inspector JSON. Raw keys:', Object.keys(data || {}));
  if (data && data.resultsCount != null) console.log('resultsCount:', data.resultsCount);
  process.exit(0);
}

const keys = Object.keys(results || {});
const total = keys.length;
const okCount = keys.filter(k => results[k] && results[k].ok).length;
const failKeys = keys.filter(k => !results[k] || results[k].ok === false);
const missingDefault = keys.filter(k => results[k] && !results[k].hasDefault);

console.log('Inspector summary for', inFile);
console.log('- Total keys:', total);
console.log('- OK:', okCount);
console.log('- Failures:', failKeys.length);
console.log('- Missing default export:', missingDefault.length);

if (failKeys.length) {
  console.log('\nFailures (up to 50):');
  failKeys.slice(0, 50).forEach(k => {
    const r = results[k] || {};
    const err = r.error || (r.ok === false ? 'unknown error' : 'no error field');
    console.log('-', k, '→', err);
  });
}

if (missingDefault.length) {
  console.log('\nMissing default exports (up to 50):');
  missingDefault.slice(0, 50).forEach(k => {
    const r = results[k] || {};
    console.log('-', k, 'defaultType=', r.defaultType);
  });
}

// Aggregate unique error messages and counts
const errMap = {};
for (const k of keys) {
  const r = results[k];
  if (r && r.error) {
    errMap[r.error] = (errMap[r.error] || 0) + 1;
  }
}

const errEntries = Object.entries(errMap).sort((a, b) => b[1] - a[1]);
if (errEntries.length) {
  console.log('\nError messages (most common first):');
  errEntries.slice(0, 20).forEach(([msg, c]) => console.log('-', c, '×', msg));
}

// Write a small summary file
const out = {
  file: path.basename(inFile),
  ts: data.ts || Date.now(),
  total,
  ok: okCount,
  failures: failKeys.length,
  missingDefault: missingDefault.length,
  topErrors: errEntries.slice(0, 20)
};
try {
  fs.writeFileSync(path.resolve(process.cwd(), 'expo-router-inspect-summary.json'), JSON.stringify(out, null, 2), 'utf8');
  console.log('\nWrote summary to expo-router-inspect-summary.json');
} catch (e) {
  console.error('Failed writing summary file:', e.message || e);
}
