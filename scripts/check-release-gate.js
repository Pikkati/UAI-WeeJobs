#!/usr/bin/env node
const fs = require('fs');
const child = require('child_process');

function readJsonFromGit(ref, path) {
  try {
    const out = child.execSync(`git show ${ref}:${path}`, { encoding: 'utf8' });
    return JSON.parse(out);
  } catch (e) {
    return null;
  }
}

function main() {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const pkgVersion = pkg.version;

  const baseRef = process.env.GITHUB_BASE_REF || 'origin/UAI-Development';
  // Ensure the base ref is fetched
  try {
    child.execSync(`git fetch origin ${baseRef.split('/').pop()}`, {
      stdio: 'ignore',
    });
  } catch (e) {}

  const basePkg = readJsonFromGit(
    `origin/${baseRef.split('/').pop()}`,
    'package.json',
  );
  const baseVersion = basePkg && basePkg.version ? basePkg.version : null;

  const changelog = fs.existsSync('CHANGELOG.md')
    ? fs.readFileSync('CHANGELOG.md', 'utf8')
    : '';

  let ok = true;

  if (!baseVersion) {
    console.log(
      'Warning: could not determine base branch package.json version; skipping strict checks.',
    );
    process.exit(0);
  }

  if (pkgVersion === baseVersion) {
    console.log(
      `No version bump detected (version=${pkgVersion}). If you intended a release, bump package.json version.`,
    );
    // If CHANGELOG contains a new version entry but package.json didn't change, fail
    const changelogHasVersion = new RegExp(
      pkgVersion.replace(/\./g, '\\.'),
      'm',
    ).test(changelog);
    if (changelogHasVersion) {
      console.error(
        'Changelog contains this version but package.json was not bumped. Please bump package.json version.',
      );
      ok = false;
    }
  } else {
    console.log(
      `Version bump detected: base=${baseVersion} -> head=${pkgVersion}`,
    );
    const changelogHasNew = new RegExp(
      pkgVersion.replace(/\./g, '\\.'),
      'm',
    ).test(changelog);
    if (!changelogHasNew) {
      console.error(
        'Package version was bumped but CHANGELOG.md does not contain an entry for the new version. Please add a changelog entry.',
      );
      ok = false;
    }
  }

  if (!ok) process.exit(1);
  console.log('Release gate checks passed.');
}

main();
