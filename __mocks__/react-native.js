const React = require('react');

const host = (type) => (props) => {
  const { children, ...rest } = props || {};
  return React.createElement(type, rest, children);
};

module.exports = {
  View: host('View'),
  Text: host('Text'),
  TextInput: host('TextInput'),
  ScrollView: host('ScrollView'),
  TouchableOpacity: host('TouchableOpacity'),
  Image: host('Image'),
  SafeAreaView: host('SafeAreaView'),
  StyleSheet: {
    create: (s) => s || {},
    flatten: (s) => s,
    absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  },
  Platform: { OS: 'web', select: (obj) => (obj && obj.web) || obj || 'web' },
  Dimensions: { get: () => ({ width: 1024, height: 768 }) },
  Animated: {
    View: host('AnimatedView'),
    ScrollView: host('AnimatedScrollView'),
    Value: function Value(v){ this._value = v; this.setValue = (nv)=>{ this._value = nv } },
    timing: () => ({ start: (cb)=>cb && cb() }),
  },
  NativeModules: {},
  PixelRatio: { get: () => 1 },
  __esModule: true,
};
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

// Ensure StyleSheet API exists with expected helpers used by testing-library
module.exports.StyleSheet = module.exports.StyleSheet || {};
module.exports.StyleSheet.create = module.exports.StyleSheet.create || ((styles) => styles);
module.exports.StyleSheet.flatten = module.exports.StyleSheet.flatten || ((s) => s);
module.exports.StyleSheet.absoluteFillObject = module.exports.StyleSheet.absoluteFillObject || { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 };

// Ensure Alert API exists and auto-invokes the first button handler in tests
module.exports.Alert = module.exports.Alert || {};
module.exports.Alert.alert = module.exports.Alert.alert || ((title, message, buttons) => {
  if (Array.isArray(buttons) && buttons[0] && typeof buttons[0].onPress === 'function') {
    buttons[0].onPress();
  }
});

// Ensure basic React Native host components exist for tests that render JSX.
try {
  const React = require('react');
  const makeHost = (name) => (props) => React.createElement(name, props, props && props.children);

  const hostComponents = [
    'View', 'Text', 'ScrollView', 'TextInput', 'TouchableOpacity', 'Image', 'ActivityIndicator',
    'KeyboardAvoidingView', 'FlatList', 'SafeAreaView', 'Pressable'
  ];

  hostComponents.forEach((c) => {
    if (!module.exports[c]) module.exports[c] = makeHost(c);
  });
} catch (e) {
  // ignore if react isn't available in this environment
}

// Ensure Animated API helpers exist for test environments (Value, timing, interpolate stub)
module.exports.Animated = module.exports.Animated || {};
if (!module.exports.Animated.Value) {
  module.exports.Animated.Value = function Value(v) {
    this._value = v;
    this.setValue = (nv) => { this._value = nv; };
    this.__getValue = () => this._value;
    this.interpolate = () => ({
      __getValue: () => this._value,
      // chainable noop for tests
      interpolate: () => ({ __getValue: () => this._value }),
    });
  };
}
if (!module.exports.Animated.timing) {
  module.exports.Animated.timing = () => ({ start: (cb) => cb && cb() });
}
if (!module.exports.Animated.View) {
  module.exports.Animated.View = (props) => require('react').createElement('AnimatedView', props, props && props.children);
}

// Ensure Platform API exists for test environments
module.exports.Platform = module.exports.Platform || { OS: 'web', select: (obj) => (obj && obj.web) || obj || 'web' };
