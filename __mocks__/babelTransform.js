// Local wrapper to delegate to the installed `babel-jest` transformer.
// This avoids brittle resolution issues across platforms and Jest versions.
try {
  module.exports = require('babel-jest');
} catch (e) {
  // Re-throw with a clearer message for CI logs.
  throw new Error(
    'babel-jest is required for Jest transforms. Ensure it is installed.\n' +
      e.message,
  );
}
