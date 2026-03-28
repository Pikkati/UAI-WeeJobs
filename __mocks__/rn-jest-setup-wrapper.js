// Wrapper for react-native/jest/setup to avoid `Cannot redefine property: window` errors
try {
  // eslint-disable-next-line global-require
  require('react-native/jest/setup');
} catch (err) {
  // Only print the error in debug mode to avoid noisy test logs
  const WEEJOBS_DEBUG = typeof process !== 'undefined' && !!process.env && !!process.env.WEEJOBS_DEBUG;
  if (WEEJOBS_DEBUG) {
    // eslint-disable-next-line no-console
    console.error('[rn-jest-setup-wrapper] react-native/jest/setup threw:', err && err.message);
  }
  if (err && err.message && err.message.includes('Cannot redefine property: window')) {
    if (WEEJOBS_DEBUG) {
      // eslint-disable-next-line no-console
      console.warn('[rn-jest-setup-wrapper] Ignored window redefine error from react-native/jest/setup');
    }
  } else {
    throw err;
  }
}
