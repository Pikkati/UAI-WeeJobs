const React = require('react');

// Minimal React Native mock for Jest tests: renderable primitives and small helpers
const View = ({ children, ...props }) => React.createElement('View', props, children);
const Text = ({ children, ...props }) => React.createElement('Text', props, children);
const Image = ({ children, ...props }) => React.createElement('Image', props, children);
const TextInput = ({ children, ...props }) => React.createElement('TextInput', props, children);
const ScrollView = ({ children, ...props }) => React.createElement('ScrollView', props, children);
const TouchableOpacity = ({ children, ...props }) => React.createElement('TouchableOpacity', props, children);

const StyleSheet = {
  create: (s) => s,
  flatten: (style) => {
    // If style is an array, merge; otherwise return as-is
    if (Array.isArray(style)) return Object.assign({}, ...style.filter(Boolean));
    return style || {};
  },
};

const Dimensions = {
  get: () => ({ width: 360, height: 640 }),
};

const Platform = {
  OS: 'android',
  select: (obj) => (obj.android || obj.default),
};

const NativeModules = {
  RNVectorIconsManager: {
    getImageForFont: jest.fn(),
    loadFontWithFileName: jest.fn(),
    loadFontWithData: jest.fn(),
  },
};

const Alert = {
  alert: jest.fn(),
};

module.exports = {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  NativeModules,
  Alert,
  // keep react-native Animated/others as noop stubs where needed
  Animated: {
    Value: function () {},
    timing: () => ({ start: () => {} }),
  },
};
