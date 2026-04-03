const React = require('react');
const { Text } = require('react-native');

function Link({ children, onPress, ...rest }) {
  return React.createElement(Text, { onPress, ...rest }, children);
}

const mockPush = jest.fn();
const mockReplace = jest.fn();

module.exports = {
  Link,
  router: {
    push: mockPush,
    replace: mockReplace,
  },
  __getMockPush: () => mockPush,
  __getMockReplace: () => mockReplace,
};
