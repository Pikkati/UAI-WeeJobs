const React = require('react');
const { View } = require('react-native');

const createMock = (name) => {
  const MockComponent = ({ children, ...props }) =>
    React.createElement(View, { ...props, accessibilityLabel: props.accessibilityLabel || name }, children);
  MockComponent.displayName = name;
  return MockComponent;
};

const Svg = createMock('Svg');

module.exports = {
  __esModule: true,
  default: Svg,
  Svg,
  Path: createMock('Path'),
  Circle: createMock('Circle'),
  Rect: createMock('Rect'),
};
