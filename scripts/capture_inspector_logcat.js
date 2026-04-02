#!/usr/bin/env node
const { spawnSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(process.cwd(), 'expo-router-inspect-all.json');
const MARKER = '[expo-router-inspector-json]';
const SHORT_MARKER = '[expo-router] inspector wrote results keys=';

function tryAdbVersion(cmd) {
  try {
    const r = spawnSync(cmd, ['version'], { encoding: 'utf8' });
    if (!r.error && (r.status === 0 || (r.stdout && r.stdout.toLowerCase().includes('android debug bridge')))) return true;
  } catch (e) {}
  return false;
}

function findAdb() {
  if (tryAdbVersion('adb')) return 'adb';
  try {
    const finder = process.platform === 'win32' ? 'where' : 'which';
    const r = spawnSync(finder, ['adb'], { encoding: 'utf8' });
    if (!r.error && r.stdout) {
      const first = r.stdout.split(/\r?\n/).find(Boolean);
      if (first && tryAdbVersion(first.trim())) return first.trim();
    }
  } catch (e) {}

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
  console.error('adb not found in PATH or common SDK locations. Install platform-tools or run this on a machine with adb.');
  process.exit(2);
}

// determine device
const devices = spawnSync(adbCmd, ['devices', '-l'], { encoding: 'utf8' });
if (devices.error) {
  console.error('Failed to run adb devices:', devices.error.message || devices.error);
  process.exit(3);
}
const lines = devices.stdout.split(/\r?\n/).slice(1).filter(Boolean);
const onlineDevices = lines.filter(l => !/offline|unauthorized/i.test(l) && /\bdevice\b/.test(l));
if (!onlineDevices || onlineDevices.length === 0) {
  console.error('No online devices found. Output:\n' + devices.stdout);
  process.exit(4);
}

const serialArgIndex = process.argv.indexOf('--serial');
const overrideSerial = serialArgIndex >= 0 && process.argv[serialArgIndex + 1] ? process.argv[serialArgIndex + 1] : (process.env.ADB_SERIAL || null);
let deviceSerial;
if (overrideSerial) {
  const match = onlineDevices.find(l => l.startsWith(overrideSerial) || l.includes(overrideSerial));
  if (!match) {
    console.error('Requested serial not found among connected devices. Devices:\n' + onlineDevices.join('\n'));
    process.exit(5);
  }
  console.log('Using provided device serial:', overrideSerial);
  deviceSerial = overrideSerial;
} else if (onlineDevices.length > 1) {
  console.error('Multiple online devices detected. Please rerun with `--serial <DEVICE_SERIAL>`. Devices:\n' + onlineDevices.join('\n'));
  process.exit(6);
} else {
  const deviceLine = onlineDevices[0];
  console.log('Found device:', deviceLine.trim());
  deviceSerial = deviceLine.trim().split(/\s+/)[0];
  console.log('Using device serial:', deviceSerial);
}

const timeoutArgIndex = process.argv.indexOf('--timeout');
const timeout = timeoutArgIndex >= 0 && process.argv[timeoutArgIndex + 1] ? parseInt(process.argv[timeoutArgIndex + 1], 10) : 20000;

// Restart the app to force the inspector to run
try {
  spawnSync(adbCmd, ['-s', deviceSerial, 'shell', 'am', 'force-stop', 'com.weejobs.app']);
  spawnSync(adbCmd, ['-s', deviceSerial, 'shell', 'monkey', '-p', 'com.weejobs.app', '-c', 'android.intent.category.LAUNCHER', '1']);
} catch (e) {
  console.warn('Failed to restart app (continuing to capture logs):', e && e.message ? e.message : e);
}

console.log('Capturing logcat for', timeout, 'ms, looking for', MARKER);

const proc = spawn(adbCmd, ['-s', deviceSerial, 'logcat', '-v', 'time'], { stdio: ['ignore', 'pipe', 'pipe'] });
let buffer = '';
let found = false;

proc.stdout.on('data', d => {
  const s = d.toString('utf8');
  const parts = s.split(/\r?\n/);
  for (const line of parts) {
    if (!line) continue;
    const idx = line.indexOf(MARKER);
    if (idx !== -1) {
      const chunk = line.slice(idx + MARKER.length);
      buffer += chunk;
      // Try to parse — if complete JSON we can exit early
      try {
        const parsed = JSON.parse(buffer);
        fs.writeFileSync(OUT, JSON.stringify(parsed, null, 2), 'utf8');
        console.log('Captured and reassembled inspector JSON to', OUT);
        found = true;
        proc.kill();
        process.exit(0);
      } catch (e) {
        // not complete yet
      }
    }
    // also report short marker so we can tell whether the inspector ran at all
    if (line.indexOf(SHORT_MARKER) !== -1) {
      console.log('SHORT_MARKER:', line.trim());
    }
  }
});

proc.stderr.on('data', d => { process.stderr.write(d.toString('utf8')); });

setTimeout(() => {
  if (!found) {
    if (buffer.length > 0) {
      try { fs.writeFileSync(OUT, buffer, 'utf8'); console.log('Wrote partial buffer to', OUT); } catch (e) { console.error('Failed to write partial buffer:', e && e.message ? e.message : e); }
    } else {
      console.error('No inspector JSON chunks were seen in logcat during the capture window.');
    }
    try { proc.kill(); } catch (e) {}
    process.exit(found ? 0 : 7);
  }
}, timeout);
