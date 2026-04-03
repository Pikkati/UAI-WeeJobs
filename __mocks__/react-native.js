// Provide a robust mock for 'react-native' that prefers our local
// rn-native-modules mock but falls back to the real react-native shape
// when available (useful in different test environments).
let RN = {};
try {
  RN = require('./rn-native-modules.js');
} catch (e) {
  try {
    RN = jest.requireActual('react-native');
  } catch (e2) {
    RN = {};
  }
}

module.exports = RN;
module.exports.__esModule = true;
module.exports.default = RN;

// Ensure named properties are available for different transpilation outputs
Object.keys(RN).forEach((k) => {
  try { module.exports[k] = RN[k]; } catch (e) { /* ignore */ }
});

// Provide a small fallback for Easing if not present
if (!module.exports.Easing) {
  module.exports.Easing = {
    in: (fn) => fn,
    out: (fn) => fn,
    inOut: (fn) => fn,
    linear: (t) => t,
    ease: (t) => t,
  };
}
