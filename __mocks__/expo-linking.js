const openURL = jest.fn(async (url) => ({ url }));

module.exports = {
  openURL,
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
};
