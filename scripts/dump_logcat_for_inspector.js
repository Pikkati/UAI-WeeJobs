#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function tryAdbVersion(cmd) {
  try { const r = spawnSync(cmd, ['version'], { encoding: 'utf8' }); return !r.error && (r.status === 0 || (r.stdout && r.stdout.toLowerCase().includes('android debug bridge'))); } catch (e) { return false; }
}

function findAdb() {
  if (tryAdbVersion('adb')) return 'adb';
  try { const finder = process.platform === 'win32' ? 'where' : 'which'; const r = spawnSync(finder, ['adb'], { encoding: 'utf8' }); if (!r.error && r.stdout) { const first = r.stdout.split(/\r?\n/).find(Boolean); if (first && tryAdbVersion(first.trim())) return first.trim(); } } catch (e) {}
  const candidates = []; const envs = ['ANDROID_SDK_ROOT','ANDROID_HOME','ANDROID_SDK_HOME','LOCALAPPDATA']; envs.forEach(k=>{ if (process.env[k]) candidates.push(path.join(process.env[k],'platform-tools', process.platform==='win32' ? 'adb.exe' : 'adb')); });
  if (process.platform === 'win32') { const user = process.env.USERPROFILE || process.env.HOME || ''; if (user) candidates.push(path.join(user,'AppData','Local','Android','Sdk','platform-tools','adb.exe')); } else { candidates.push('/usr/bin/adb','/usr/local/bin/adb', path.join(process.env.HOME||'','Android','Sdk','platform-tools','adb')); }
  for (const c of candidates) { try { if (c && fs.existsSync(c) && tryAdbVersion(c)) return c; } catch (e) {} }
  return null;
}

const adbCmd = findAdb();
if (!adbCmd) { console.error('adb not found.'); process.exit(2); }

const devices = spawnSync(adbCmd, ['devices','-l'], { encoding: 'utf8' });
if (devices.error) { console.error('adb devices failed:', devices.error.message||devices.error); process.exit(3); }
const lines = devices.stdout.split(/\r?\n/).slice(1).filter(Boolean);
const onlineDevices = lines.filter(l => !/offline|unauthorized/i.test(l) && /\bdevice\b/.test(l));
if (!onlineDevices || onlineDevices.length === 0) { console.error('No devices'); process.exit(4); }
const serialArgIndex = process.argv.indexOf('--serial');
const overrideSerial = serialArgIndex >= 0 && process.argv[serialArgIndex+1] ? process.argv[serialArgIndex+1] : (process.env.ADB_SERIAL || null);
let deviceSerial;
if (overrideSerial) { const match = onlineDevices.find(l => l.startsWith(overrideSerial) || l.includes(overrideSerial)); if (!match) { console.error('Serial not found'); process.exit(5); } deviceSerial = overrideSerial; } else if (onlineDevices.length > 1) { console.error('Multiple devices; specify --serial'); console.log(onlineDevices.join('\n')); process.exit(6); } else { deviceSerial = onlineDevices[0].trim().split(/\s+/)[0]; }

console.log('Dumping logcat (device:', deviceSerial + ')');
const dump = spawnSync(adbCmd, ['-s', deviceSerial, 'logcat', '-d'], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
if (dump.error) { console.error('logcat failed:', dump.error.message||dump.error); process.exit(7); }
const out = dump.stdout || '';
const file = path.resolve(process.cwd(), 'tmp_inspector_logcat_dump.txt');
fs.writeFileSync(file, out, 'utf8');
console.log('Saved logcat dump to', file);
const linesOut = out.split(/\r?\n/).filter(Boolean).filter(l => /expo-router|expo-router-inspector-json|expo-router\] inspector/.test(l));
if (linesOut.length) {
  console.log('Found matching lines:');
  linesOut.forEach(l => console.log(l));
} else {
  console.log('No matching inspector lines found in logcat dump.');
}
