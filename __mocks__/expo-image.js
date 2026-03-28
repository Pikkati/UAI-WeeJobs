const React = require('react');

module.exports = {
  Image: (props) => React.createElement('Image', props),
};
const React = require('react');
const { View } = require('react-native');

// Simple mock for expo-image: render a plain View in tests
module.exports = {
  Image: (props) => React.createElement(View, props),
};
