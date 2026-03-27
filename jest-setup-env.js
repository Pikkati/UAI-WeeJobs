// Ensure required environment variables for tests that import supabase
try {
	if (typeof process === 'undefined') {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		global.process = { env: {} };
	}
	if (!process.env) process.env = {};
	if (typeof process.env.EXPO_PUBLIC_SUPABASE_URL === 'undefined') {
		process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
	}
	if (typeof process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY === 'undefined') {
		process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon';
	}
} catch (e) {
	// ignore environment setup errors in constrained runtimes
}
