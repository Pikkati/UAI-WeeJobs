#!/usr/bin/env node
const { spawnSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const localFile = path.resolve(process.cwd(), 'expo-router-inspect-all.json');

function exitWith(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

// Helper: try to locate adb in PATH or common SDK locations
function tryAdbVersion(cmd) {
  try {
    const r = spawnSync(cmd, ['version'], { encoding: 'utf8' });
    if (!r.error && (r.status === 0 || (r.stdout && r.stdout.toLowerCase().includes('android debug bridge')))) return true;
  } catch (e) {}
  return false;
}

function findAdb() {
  // 1) quick PATH check
  if (tryAdbVersion('adb')) return 'adb';

  // 2) platform-specific where/which
  try {
    const finder = process.platform === 'win32' ? 'where' : 'which';
    const r = spawnSync(finder, ['adb'], { encoding: 'utf8' });
    if (!r.error && r.stdout) {
      const first = r.stdout.split(/\r?\n/).find(Boolean);
      if (first && tryAdbVersion(first.trim())) return first.trim();
    }
  } catch (e) {}

  // 3) environment variables and common SDK paths
  const candidates = [];
  const envs = ['ANDROID_SDK_ROOT', 'ANDROID_HOME', 'ANDROID_SDK_HOME', 'LOCALAPPDATA'];
  envs.forEach(k => { if (process.env[k]) candidates.push(path.join(process.env[k], 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb')); });
  if (process.platform === 'win32') {
    const user = process.env.USERPROFILE || process.env.HOME || '';
    if (user) candidates.push(path.join(user, 'AppData', 'Local', 'Android', 'Sdk', 'platform-tools', 'adb.exe'));
  } else {
    candidates.push('/usr/bin/adb', '/usr/local/bin/adb', path.join(process.env.HOME || '', 'Android', 'Sdk', 'platform-tools', 'adb'));
  }

  for (const c of candidates) {
    try {
      if (c && fs.existsSync(c) && tryAdbVersion(c)) return c;
    } catch (e) {}
  }

  return null;
}

const adbCmd = findAdb();
if (!adbCmd) {
  // As a helpful fallback, search the workspace for any previously-written inspector JSON
  console.warn('adb not found in PATH and could not be located in common SDK locations. Searching workspace for existing inspector JSON...');

  function findFileRecursive(dir, target) {
    try {
      const ents = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of ents) {
        const p = path.join(dir, e.name);
        if (e.isFile() && e.name === target) return p;
        if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.git') {
          const f = findFileRecursive(p, target);
          if (f) return f;
        }
      }
    } catch (e) {}
    return null;
  }

  const found = findFileRecursive(process.cwd(), path.basename(localFile));
  if (found) {
    try { fs.copyFileSync(found, localFile); console.log('Copied existing inspector from', found, 'to', localFile); process.exit(0); } catch (e) { /* fallthrough */ }
  }

  exitWith('adb not found. Install Android platform-tools and add to PATH, or run this script on your development machine with adb available.');
}

// Check for online devices
const devices = spawnSync(adbCmd, ['devices', '-l'], { encoding: 'utf8' });
if (devices.error) exitWith('Failed to run adb devices: ' + devices.error.message);
const lines = devices.stdout.split(/\r?\n/).slice(1).filter(Boolean);
const onlineDevices = lines.filter(l => !/offline|unauthorized/i.test(l) && /\bdevice\b/.test(l));
if (!onlineDevices || onlineDevices.length === 0) {
  console.log('No online device found. Output of `adb devices -l`:\n' + devices.stdout);
  process.exit(3);
}

// allow override via CLI or env
const serialArgIndex = process.argv.indexOf('--serial');
const overrideSerial = serialArgIndex >= 0 && process.argv[serialArgIndex + 1] ? process.argv[serialArgIndex + 1] : (process.env.ADB_SERIAL || null);
// deviceSerial is declared in outer scope so it's visible for adb operations below
let deviceSerial = null;
if (overrideSerial) {
  const match = onlineDevices.find(l => l.startsWith(overrideSerial) || l.includes(overrideSerial));
  if (!match) {
    console.error('Requested serial not found among connected devices. Devices:\n' + onlineDevices.join('\n'));
    process.exit(3);
  }
  console.log('Using provided device serial:', overrideSerial);
  deviceSerial = overrideSerial;
} else if (onlineDevices.length > 1) {
  console.log('Multiple online devices detected. Please rerun with `--serial <DEVICE_SERIAL>` to target the correct device. Devices:\n' + onlineDevices.join('\n'));
  process.exit(3);
} else {
  const deviceLine = onlineDevices[0];
  console.log('Found device:', deviceLine.trim());
  deviceSerial = deviceLine.trim().split(/\s+/)[0];
  console.log('Using device serial:', deviceSerial);
}

const remotes = [
  '/sdcard/Download/expo-router-inspect-all.json',
  '/sdcard/expo-router-inspect-all.json',
  '/data/data/com.weejobs.app/files/expo-router-inspect-all.json'
];

function tryPull(remote) {
  console.log('Checking remote:', remote);
  const ls = spawnSync(adbCmd, ['-s', deviceSerial, 'shell', 'ls', '-l', remote], { encoding: 'utf8' });
  const notFound = (ls.stdout && /No such file|No such file or directory/i.test(ls.stdout)) || (ls.stderr && /No such file|No such file or directory/i.test(ls.stderr));
  if (notFound) {
    console.log('Not found at', remote);
    return false;
  }
  console.log('Attempting adb pull', remote, '->', localFile);
  const pull = spawnSync(adbCmd, ['-s', deviceSerial, 'pull', remote, localFile], { encoding: 'utf8' });
  if (pull.error) {
    console.error('adb pull failed:', pull.error.message || pull.error);
    return false;
  }
  if (fs.existsSync(localFile) && fs.statSync(localFile).size > 0) {
    console.log('Pulled to', localFile);
    return true;
  }
  console.log('adb pull did not produce file. stdout:', pull.stdout || '', 'stderr:', pull.stderr || '');
  return fs.existsSync(localFile);
}

for (const r of remotes) {
  if (tryPull(r)) process.exit(0);
}

// Try run-as method (requires debug build and debuggable app)
console.log('Trying run-as method (requires debug build and app debuggable)');
try {
  const proc = spawn(adbCmd, ['-s', deviceSerial, 'exec-out', 'run-as', 'com.weejobs.app', 'cat', 'files/expo-router-inspect-all.json']);
  const ws = fs.createWriteStream(localFile);
  proc.stdout.pipe(ws);
  proc.stderr.on('data', d => {
    const s = d.toString();
    // Common run-as failure messages
    if (/run-as: package not debuggable|Permission denied/i.test(s)) {
      console.error('run-as reported:', s.trim());
    } else {
      console.error(s.trim());
    }
  });
  proc.on('close', code => {
    ws.end();
    if (fs.existsSync(localFile) && fs.statSync(localFile).size > 0) {
      console.log('Saved via run-as to', localFile);
      process.exit(0);
    }
    console.error('run-as did not produce a file (exit ' + code + '). Ensure the app is a debug build and is debuggable.');
    process.exit(4);
  });
} catch (e) {
  console.error('run-as attempt failed:', e && e.message ? e.message : e);
  process.exit(5);
}
