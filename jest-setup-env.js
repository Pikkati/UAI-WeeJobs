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
  // Ensure __DEV__ is defined for expo packages that expect it
  if (typeof global.__DEV__ === 'undefined') global.__DEV__ = false;
  if (
    typeof globalThis !== 'undefined' &&
    typeof globalThis.__DEV__ === 'undefined'
  )
    globalThis.__DEV__ = global.__DEV__;
  // Ensure NODE_ENV is set to 'test' for libraries that branch on it
  if (typeof process.env.NODE_ENV === 'undefined')
    process.env.NODE_ENV = 'test';
} catch {
  // ignore environment setup errors in constrained runtimes
}
