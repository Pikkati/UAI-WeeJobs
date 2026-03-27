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
