module.exports = {
  ...jest.requireActual('react-native-reanimated/mock'),
  // override any heavy animation APIs used at import-time
  Value: function () { return { __getValue: () => 0, setValue: () => {} }; },
  Event: () => {},
  addListener: () => {},
  removeListener: () => {},
};
