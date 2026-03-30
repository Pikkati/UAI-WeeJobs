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
try {
	const FileSystemModule = require('expo-file-system');
	const FileSystem = FileSystemModule && FileSystemModule.default ? FileSystemModule.default : FileSystemModule;
	if (FileSystem && typeof FileSystem.writeAsStringAsync === 'function') {
		const base = FileSystem.documentDirectory || '';
		const path = `${base}routes_manifest_seen.txt`;
		const payload = JSON.stringify({ keysCount: (globalThis.__EXPO_ROUTER_KEYS && globalThis.__EXPO_ROUTER_KEYS.length) || 0, ts: Date.now() });
		FileSystem.writeAsStringAsync(path, payload).catch(() => {});
		try {
			const sdPath = '/sdcard/Download/routes_manifest_seen.txt';
			FileSystem.writeAsStringAsync(sdPath, payload).catch(() => {});
		} catch (_e) {}
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
