// Re-export named CommonJS/ESM-compatible exports from our RN native modules mock
const RN = require('./rn-native-modules.js');

// Ensure both CommonJS and ESM consumers get the same shape
module.exports = RN;
module.exports.__esModule = true;
module.exports.default = RN;

// Also copy named properties explicitly to support named imports transpiled in different ways
Object.keys(RN).forEach((k) => {
  try { module.exports[k] = RN[k]; } catch (e) { /* ignore */ }
});
let RN = {};
try {
  RN = jest.requireActual('react-native');
} catch (e) {
  RN = {};
}

const EasingFallback = {
  in: (fn) => fn,
  out: (fn) => fn,
  inOut: (fn) => fn,
  linear: (t) => t,
  ease: (t) => t,
};

module.exports = {
  ...RN,
  Easing: RN.Easing || EasingFallback,
};
