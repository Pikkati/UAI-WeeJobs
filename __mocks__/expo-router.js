const React = require('react');
const { Text } = require('react-native');

function Link({ children, onPress, ...rest }) {
  return React.createElement(Text, { onPress, ...rest }, children);
}

module.exports = { Link };
const mockPush = jest.fn();
const mockReplace = jest.fn();

module.exports = {
  router: {
    push: mockPush,
    replace: mockReplace,
  },
  __getMockPush: () => mockPush,
  __getMockReplace: () => mockReplace,
};
