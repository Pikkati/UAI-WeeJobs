// Minimal mock for react-native-gesture-handler
module.exports = {
  GestureDetector: 'GestureDetector',
  Gesture: {
    Pan: () => ({ run: () => {} }),
  },
  State: {},
  Directions: {},
};
