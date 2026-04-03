const React = require('react');
const { View } = require('react-native');

function SymbolView(props) {
  // Return a simple React Native View for tests
  return React.createElement(View, props, props.children);
}

const SymbolWeight = {};

module.exports = {
  SymbolView,
  SymbolWeight,
};
