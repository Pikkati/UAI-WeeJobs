// Minimal mock for react-native NativeModules expected by jest-expo setup
const mock = {
  NativeUnimoduleProxy: {
    viewManagersMetadata: {},
  },
  UIManager: {},
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
  },
  ImageLoader: {},
  ImageViewManager: {},
};

// Provide minimal StyleSheet and primitives used by components so tests can render
mock.StyleSheet = { create: (s) => s, flatten: (s) => s };
// Create tiny functional component mocks so tests can access props/defaultProps
const React = require('react');
const createComponent = (name, host = 'View') => {
  const Comp = (props) => React.createElement(host, props, props.children);
  Comp.displayName = name;
  return Comp;
};

mock.Text = createComponent('Text', 'Text');
mock.Text.defaultProps = { allowFontScaling: false };
mock.TextInput = createComponent('TextInput', 'Text');
mock.TextInput.defaultProps = { allowFontScaling: false };
mock.View = createComponent('View');
mock.KeyboardAvoidingView = createComponent('KeyboardAvoidingView', 'View');
mock.TouchableOpacity = createComponent('TouchableOpacity');
mock.ScrollView = createComponent('ScrollView');

// Minimal Animated mock to satisfy components that use Animated.Value, spring, timing
mock.Animated = {
  Value: function (v) {
    const obj = {
      _value: v,
      setValue(x) { this._value = x; },
      // simple interpolate stub used in style transforms
      interpolate() { return { __isAnimated: true }; },
    };
    return obj;
  },
  // Provide a simple ValueXY used by some screens
  ValueXY: function () {
    const xy = {
      x: { _value: 0, setValue(v) { this._value = v; } },
      y: { _value: 0, setValue(v) { this._value = v; } },
      setValue(v) {
        if (v && v.x != null) this.x.setValue(v.x);
        if (v && v.y != null) this.y.setValue(v.y);
      },
      getLayout() { return {}; },
    };
    return xy;
  },
  // Expose Animated.View so JSX mounts correctly in tests
  View: createComponent('AnimatedView', 'View'),
  // createAnimatedComponent should return the underlying host component
  createAnimatedComponent: (Comp) => Comp,
  spring: (val, cfg) => ({ start: (cb) => { if (typeof cb === 'function') cb(); } }),
  timing: (val, cfg) => ({ start: (cb) => { if (typeof cb === 'function') cb(); } }),
  sequence: (arr) => ({ start: (cb) => { if (typeof cb === 'function') cb(); } }),
};

// Provide Modal and ActivityIndicator primitives used by some components in tests
mock.Modal = createComponent('Modal');
mock.ActivityIndicator = createComponent('ActivityIndicator');

// Minimal Alert mock
mock.Alert = { alert: jest.fn() };

// Provide Dimensions mock used by some components
mock.Dimensions = { get: (_key) => ({ width: 375, height: 667 }) };

// Provide Platform mock so modules that read Platform.OS at import-time don't fail
mock.Platform = {
  OS: 'ios',
  select: (obj) => (obj && (obj.ios ?? obj.default ?? obj.android ?? null)),
};

// Export shape that supports CommonJS and ESM default interop used by jest
module.exports = mock;
module.exports.__esModule = true;
module.exports.default = mock;
