// Wrapper for react-native/jest/setup to avoid `Cannot redefine property: window` errors
try {
  // eslint-disable-next-line global-require
  require('react-native/jest/setup');
} catch (err) {
  // If the error is the window redefinition error, swallow it and continue.
  // eslint-disable-next-line no-console
  console.error('[rn-jest-setup-wrapper] react-native/jest/setup threw:', err && err.message);
  if (err && err.message && err.message.includes('Cannot redefine property: window')) {
    // eslint-disable-next-line no-console
    console.warn('[rn-jest-setup-wrapper] Ignored window redefine error from react-native/jest/setup');
  } else {
    throw err;
  }
}
