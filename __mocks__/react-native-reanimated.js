module.exports = {
  ...jest.requireActual('react-native-reanimated/mock'),
  // lightweight implementations for hooks used in components during tests
  useSharedValue: (v) => ({ value: v }),
  useAnimatedStyle: (fn) => fn(),
  withTiming: (v) => v,
  withSequence: (...args) => args[args.length - 1] || args[0],
  withRepeat: (v, _times) => v,
  // override any heavy animation APIs used at import-time
  Value: function () {
    return { __getValue: () => 0, setValue: () => {} };
  },
  Event: () => {},
  addListener: () => {},
  removeListener: () => {},
};

// Provide a minimal default export with an Animated.View that maps to RN View
try {
  // eslint-disable-next-line global-require
  const RN = require('react-native');
  const React = require('react');
  // Provide a minimal Animated.View component that renders a normal RN View
  module.exports.default = {
    View: (props) => React.createElement(RN.View, props),
  };
} catch (e) {
  // ignore if react-native is not available in environment
}
