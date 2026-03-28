// Minimal, self-contained mock for react-native-reanimated used in Jest.
// Avoids requiring 'react-native-reanimated/mock' so tests on CI without the
// optional package won't fail resolving this file.

const useSharedValue = (initial = 0) => ({ value: initial });
const useAnimatedRef = () => ({ current: null });
const useScrollViewOffset = () => ({ value: 0 });
const useAnimatedStyle = (cb) => {
  try {
    return typeof cb === 'function' ? cb() : {};
  } catch (e) {
    return {};
  }
};
const withTiming = (v) => v;
const withSequence = (...args) => args[args.length - 1];
const withRepeat = (v) => v;

const interpolate = (value, inputRange = [0], outputRange = [0]) => {
  const v = Number(value ?? 0);
  if (!Array.isArray(inputRange) || !Array.isArray(outputRange) || inputRange.length !== outputRange.length) {
    return v;
  }
  for (let i = 0; i < inputRange.length - 1; i++) {
    const inMin = inputRange[i];
    const inMax = inputRange[i + 1];
    if (v >= inMin && v <= inMax) {
      const outMin = outputRange[i];
      const outMax = outputRange[i + 1];
      const t = (v - inMin) / ((inMax - inMin) || 1);
      return outMin + (outMax - outMin) * t;
    }
  }
  if (v < inputRange[0]) return outputRange[0];
  return outputRange[outputRange.length - 1];
};

const Animated = {
  View: (props) => (props && props.children) || null,
  Text: (props) => (props && props.children) || null,
  Image: (props) => (props && props.children) || null,
  ScrollView: (props) => (props && props.children) || null,
};

module.exports = {
  __esModule: true,
  default: Animated,
  useSharedValue,
  useAnimatedRef,
  useScrollViewOffset,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  interpolate,
  // no-op fallbacks
  addListener: () => {},
  removeListener: () => {},
};
