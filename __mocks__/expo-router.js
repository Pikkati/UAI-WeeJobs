// Minimal mock for `expo-router` used in smoke tests
const jestMock = typeof jest !== 'undefined' ? jest : { fn: () => () => {} };

module.exports = {
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ replace: jestMock.fn(), push: jestMock.fn(), back: jestMock.fn() }),
  router: { replace: jestMock.fn(), push: jestMock.fn(), back: jestMock.fn() },
};
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
