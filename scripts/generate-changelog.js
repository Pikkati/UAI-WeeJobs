#!/usr/bin/env node
const { execSync } = require('child_process');

try {
  console.log('Generating CHANGELOG.md using conventional-changelog...');
  execSync('npx conventional-changelog -p angular -i CHANGELOG.md -s -r 0', {
    stdio: 'inherit',
  });
  console.log('CHANGELOG.md updated.');
} catch (e) {
  console.error('Failed to generate changelog:', e.message);
  process.exit(1);
}
