#!/usr/bin/env node
const { execSync } = require('child_process');

// Generate badge URLs for branches matching pattern
const owner = 'getnudged';
const repo = 'weejobs';
const workflowFile = 'release-dry-run.yml';

try {
  const branchesRaw = execSync('git for-each-ref --format="%(refname:short)" refs/heads').toString();
  const branches = branchesRaw.split(/\r?\n/).filter(Boolean).filter(b => b.startsWith('chore/remediate/'));
  if (branches.length === 0) {
    console.log('No remediation branches found locally.');
    process.exit(0);
  }
  console.log('# Branch-specific badge URLs');
  branches.forEach(b => {
    const url = `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}/badge.svg?branch=${encodeURIComponent(b)}`;
    console.log(`- ${b}: ${url}`);
  });
} catch (e) {
  console.error('Failed to generate badge links:', e.message);
  process.exit(1);
}
