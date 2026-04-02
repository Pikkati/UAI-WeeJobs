#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function findFiles(dir, name, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return results;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      findFiles(full, name, results);
    } else if (entry.isFile() && entry.name === name) {
      results.push(full);
    }
  }
  return results;
}

const projectRoot = process.cwd();
const bundles = findFiles(projectRoot, 'index.android.bundle');
if (!bundles.length) {
  console.log('No index.android.bundle files found in', projectRoot);
  process.exit(0);
}

const inject = `\ntry{\n  var __expo_router_inspect_results={},__expo_router_inspect_keys=R||globalThis.__EXPO_ROUTER_KEYS||[];\n  for(var __expo_router_i=0;__expo_router_i<(__expo_router_inspect_keys||[]).length;__expo_router_i++){var __expo_router_key=__expo_router_inspect_keys[__expo_router_i];try{var __expo_router_mod;try{typeof e==='function'&&(__expo_router_mod=e(__expo_router_key))}catch(__expo_router_err){if(globalThis&&globalThis.__EXPO_ROUTER_MODULES&&Object.prototype.hasOwnProperty.call(globalThis.__EXPO_ROUTER_MODULES,__expo_router_key))try{__expo_router_mod=globalThis.__EXPO_ROUTER_MODULES[__expo_router_key]()}catch(__expo_router_err2){}else throw __expo_router_err}__expo_router_inspect_results[__expo_router_key]={ok:!!__expo_router_mod,hasDefault:!!(__expo_router_mod&&__expo_router_mod.default),defaultType:typeof(__expo_router_mod&&__expo_router_mod.default)} }catch(__expo_router_e){try{__expo_router_inspect_results[__expo_router_key]={ok:!1,error:String(__expo_router_e&&(__expo_router_e.message||__expo_router_e))}}catch(_){} } }\n  try{var __expo_fs=(typeof A!=='undefined'?A:(typeof globalThis!=='undefined'&&globalThis.__EXPO_FILE_SYSTEM?globalThis.__EXPO_FILE_SYSTEM:null)),__expo_write=__expo_fs&&('function'==typeof __expo_fs.writeAsStringAsync?__expo_fs.writeAsStringAsync:(__expo_fs.writeAsString||null));if(__expo_write){try{__expo_write((__expo_fs.documentDirectory||__expo_fs.DocumentDirectoryPath||'')+'expo-router-inspect-all.json',JSON.stringify({ts:Date.now(),results:__expo_router_inspect_results})).catch(function(){})}catch(_){ }try{__expo_write('/sdcard/Download/expo-router-inspect-all.json',JSON.stringify({ts:Date.now(),results:__expo_router_inspect_results})).catch(function(){})}catch(_){}}}catch(_){ }\n  try{if(typeof _!=='undefined'&&_&&'function'==typeof _.setItem){try{_.setItem('@expo-router/inspect_all',JSON.stringify({ts:Date.now(),results:__expo_router_inspect_results})).catch(function(){})}catch(_){}}}catch(_){ }\n  try{console.log('[expo-router] inspector wrote results keys='+(Object.keys(__expo_router_inspect_results||{}).length))}catch(_){ }\n}catch(_){ }\n`;

// Also provide a version that logs the full JSON to logcat in chunked messages so it can be captured
const injectLogcat = `\ntry{\n  var __expo_router_inspect_results_log=__expo_router_inspect_results||{};\n  try{var __expo_dump=JSON.stringify({ts:Date.now(),results:__expo_router_inspect_results_log});var __expo_chunk=8000;for(var __expo_k=0;__expo_k<__expo_dump.length;__expo_k+=__expo_chunk){try{console.log('[expo-router-inspector-json]'+__expo_dump.slice(__expo_k,__expo_k+__expo_chunk))}catch(__){}}}catch(__expo_e){}\n}catch(_){ }\n`;

function isUtf8Buffer(buf) {
  try {
    const s = buf.toString('utf8');
    return Buffer.from(s, 'utf8').equals(buf);
  } catch (e) {
    return false;
  }
}

for (const file of bundles) {
  try {
    const buf = fs.readFileSync(file);
    if (!isUtf8Buffer(buf)) {
      console.log('Skipping injection for binary/non-UTF8 bundle ->', file);
      continue;
    }
    const text = buf.toString('utf8');
    let patched = text;

    // Append the inspector code at EOF for safety (inserting in-place can
    // break strings or JS lexical structure). Always create a .bak first.
    try {
      const out = text + '\n\n/* expo-router-inspector: appended at EOF */\n' + inject + '\n' + injectLogcat;
      fs.writeFileSync(file + '.bak', text, 'utf8');
      fs.writeFileSync(file, out, 'utf8');
      console.log('Patched (append EOF) ->', file);
      continue;
    } catch (e) {
      console.log('Failed to append injection to', file, e && e.message);
    }
  } catch (err) {
    console.error('Error processing', file, err.message || err);
  }
}

console.log('Done. Backups created alongside patched bundles with .bak suffix.');
