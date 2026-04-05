const React = require('react');

module.exports = {
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }) =>
    React.createElement(React.Fragment, null, children),
  SafeAreaConsumer: ({ children }) =>
    children({ top: 0, right: 0, bottom: 0, left: 0 }),
};
