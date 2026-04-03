// Very-early import-time marker: runs before any module imports to help debug cold-start.
(function(){
	try {
		if (typeof globalThis !== 'undefined') {
			globalThis.__EXPO_ROUTER_INSPECTOR_EARLY = { ts: Date.now(), source: 'index-top' };
		}
		if (typeof console !== 'undefined') {
			if (typeof console.error === 'function') {
				console.error('[expo-router-inspector-very-early] bundle-top initialized', JSON.stringify({ ts: Date.now() }));
			} else if (typeof console.log === 'function') {
				console.log('[expo-router-inspector-very-early] bundle-top initialized', Date.now());
			}
		}
	} catch (e) {
		// swallow
	}
})();

// Root entry for bundling; ensure runtime route manifest loads first
import './app/_routesManifest';
import 'expo-router/entry';

// Debug: confirm manifest visibility at the app entry point
try {
	// eslint-disable-next-line no-console
	console.log('[index] __EXPO_ROUTER_KEYS at entry:', typeof globalThis !== 'undefined' ? (globalThis.__EXPO_ROUTER_KEYS && globalThis.__EXPO_ROUTER_KEYS.length) : 'no-global');
} catch (e) {
	// eslint-disable-next-line no-console
	console.log('[index] error reading __EXPO_ROUTER_KEYS', e);
}

// Early instrumentation: write a small file and show a Toast so we can verify manifest presence on-device.
// Delay the write slightly so native modules (expo-file-system) have time to initialize.
// Patch older write API deprecation from expo-file-system by re-exporting legacy if available.
try {
	const FileSystemModule = require('expo-file-system');
	let FileSystem = FileSystemModule && FileSystemModule.default ? FileSystemModule.default : FileSystemModule;
	try {
		const FileSystemLegacy = require('expo-file-system/legacy');
		console.log('[index] FileSystemLegacy available:', !!FileSystemLegacy, 'writeAsStringAsync:', typeof (FileSystemLegacy && FileSystemLegacy.writeAsStringAsync));
		if (FileSystemLegacy && typeof FileSystemLegacy.writeAsStringAsync === 'function') {
			// Force legacy supported API to avoid the deprecation stub behavior.
			FileSystem = FileSystemLegacy;
			if (FileSystemModule && FileSystemModule.default) {
				FileSystemModule.default = FileSystemLegacy;
			}
		}
	} catch (legacyErr) {
		console.log('[index] expo-file-system/legacy load failed:', legacyErr && legacyErr.message);
	}
	console.log('[index] FileSystem details:', {
		fileSystemType: typeof FileSystem,
		hasWrite: FileSystem && typeof FileSystem.writeAsStringAsync === 'function',
		documentDirectory: FileSystem ? FileSystem.documentDirectory : null,
	});
	if (FileSystem && typeof FileSystem.writeAsStringAsync === 'function') {
		const writeAndVerify = async (path, name) => {
			if (!path) {
				console.log('[index] skip write, path null', name);
				return;
			}
			const payload = JSON.stringify({ keysCount: (globalThis.__EXPO_ROUTER_KEYS && globalThis.__EXPO_ROUTER_KEYS.length) || 0, ts: Date.now() });
			try {
				await FileSystem.writeAsStringAsync(path, payload);
				console.log('[index] wrote file:', name, path);
			} catch (e) {
				console.log('[index] write failed:', name, path, e && e.message ? e.message : e);
				return;
			}
			try {
				const text = await FileSystem.readAsStringAsync(path);
				console.log('[index] read file:', name, path, 'contents=', text);
			} catch (e) {
				console.log('[index] read failed:', name, path, e && e.message ? e.message : e);
			}
		};

		const writePayload = () => {
			const targets = [
				{ name: 'appDocument', path: FileSystem.documentDirectory ? `${FileSystem.documentDirectory}routes_manifest_seen.txt` : null },
				{ name: 'appCache', path: FileSystem.cacheDirectory ? `${FileSystem.cacheDirectory}routes_manifest_seen.txt` : null },
				{ name: 'appTemp', path: FileSystem.temporaryDirectory ? `${FileSystem.temporaryDirectory}routes_manifest_seen.txt` : null },
				{ name: 'sdcardDownload', path: '/sdcard/Download/routes_manifest_seen.txt' },
			];

			for (const target of targets) {
				writeAndVerify(target.path, target.name);
			}
		};

		// Give the runtime a short moment to initialize modules before attempting writes.
		setTimeout(writePayload, 2000);
	}
} catch (_err) {}

try {
	const RN = require('react-native');
	const ToastAndroid = (RN && RN.ToastAndroid) || (RN && RN.default && RN.default.ToastAndroid) || null;
	if (ToastAndroid && typeof ToastAndroid.show === 'function') {
		try {
			const count = (globalThis.__EXPO_ROUTER_KEYS && globalThis.__EXPO_ROUTER_KEYS.length) || 'no-global';
			ToastAndroid.show(`[index] __EXPO_ROUTER_KEYS=${count}`, ToastAndroid.LONG);
		} catch (_) {}
	}
} catch (_e) {}
