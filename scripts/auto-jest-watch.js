#!/usr/bin/env node
/* eslint-env node */
// Automate sending 'f' and 'q' to a Jest watch session.
// Usage: node scripts/auto-jest-watch.js

const { spawn } = require('child_process');

// Prefer npx when available, fall back to npm for environments without npx.
const isWin = process.platform === 'win32';
let jest;
try {
  // Prefer running the local jest binary directly via node if available.
  const jestBin = require.resolve('jest/bin/jest');
  jest = spawn(process.execPath, [jestBin, '--watchAll'], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
} catch {
  // Fallback: try npx/npm if resolving jest failed.
  let cmd, args;
  if (!isWin) {
    cmd = 'npx';
    args = ['jest', '--watchAll'];
  } else {
    cmd = 'npm';
    args = ['test', '--', '--watchAll'];
  }
  jest = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
}

jest.stdout.on('data', (data) => {
  const text = data.toString();
  process.stdout.write(text);

  // Configuration via environment variables
  const FAIL_DELAY_MS = parseInt(process.env.JEST_AUTOWATCH_FAIL_DELAY_MS || '300', 10);
  const QUIT_DELAY_MS = parseInt(process.env.JEST_AUTOWATCH_QUIT_DELAY_MS || '500', 10);
  const MAX_RETRIES = parseInt(process.env.JEST_AUTOWATCH_MAX_RETRIES || '1', 10);
  const ALWAYS_QUIT = (process.env.JEST_AUTOWATCH_ALWAYS_QUIT || 'true') === 'true';

  // Internal state stored on process to survive handler re-creation
  process._jestAuto = process._jestAuto || { retriesLeft: MAX_RETRIES, sentF: false, sentQ: false };
  const state = process._jestAuto;

  // Detect Jest summary lines indicating failures or completed runs
  const failedMatch = text.match(/Test Suites:\s*(\d+) failed/m);
  const passedMatch = text.match(/Test Suites:\s*(\d+) passed/m) || text.match(/Ran all test suites\./m);

  if (failedMatch) {
    const failed = parseInt(failedMatch[1], 10) || 0;
    if (failed > 0 && state.retriesLeft > 0 && !state.sentF) {
      // Run only failed tests
      setTimeout(() => {
        try { jest.stdin.write('f\n'); console.log('Sent key: f'); } catch (e) { console.error(e); }
      }, FAIL_DELAY_MS);
      state.sentF = true;
      state.retriesLeft -= 1;
    } else if (failed > 0 && (state.retriesLeft <= 0 || !ALWAYS_QUIT) && !state.sentQ) {
      // After retries exhausted, quit if configured
      if (ALWAYS_QUIT) {
        setTimeout(() => { try { jest.stdin.write('q\n'); console.log('Sent key: q'); } catch (e) { console.error(e); } }, QUIT_DELAY_MS);
        state.sentQ = true;
      }
    }
  } else if (passedMatch) {
    // No failures — optionally quit
    if (ALWAYS_QUIT && !state.sentQ) {
      setTimeout(() => { try { jest.stdin.write('q\n'); console.log('Sent key: q'); } catch (e) { console.error(e); } }, QUIT_DELAY_MS);
      state.sentQ = true;
    }
  }
});
jest.stderr.on('data', (d) => process.stderr.write(d.toString()));

jest.on('exit', (code, signal) => {
  console.log(`Jest exited with code=${code} signal=${signal}`);
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  try { jest.kill('SIGINT'); } catch {}
  process.exit(0);
});
