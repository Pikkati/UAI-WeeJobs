let baseMock = {};
try {
  // Prefer the official mock if available (installed alongside the lib),
  // otherwise fall back to a lightweight in-repo stub to avoid require-time errors.
  // jest.requireActual may throw if the module path doesn't exist.
  baseMock = jest.requireActual('react-native-reanimated/mock');
} catch (e) {
  baseMock = {};
}

module.exports = {
  ...baseMock,
  __esModule: true,
  default: baseMock.default || {},
  // lightweight fallbacks for commonly-used APIs at import-time
  Value: function (initial) { return { __getValue: () => (initial ?? 0), setValue: () => {} }; },
  Event: () => {},
  addListener: () => {},
  removeListener: () => {},
  useSharedValue: (v) => ({ value: v }),
  useAnimatedStyle: () => ({}),
  withTiming: (v) => v,
  withSpring: (v) => v,
  Easing: {
    in: (v) => v,
    out: (v) => v,
    inOut: (v) => v,
  },
  Extrapolate: { CLAMP: 'clamp', EXTEND: 'extend' },
};
