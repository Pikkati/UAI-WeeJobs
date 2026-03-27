module.exports = ({ style, ...rest } = {}) => {
  // Return a simple object placeholder for expo-image usage during tests.
  return null;
};
const React = require('react');

module.exports = {
  Image: (props) => React.createElement('View', props),
};
