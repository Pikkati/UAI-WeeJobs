console.log('Mocking PlatformConstants');
module.exports = {
  getConstants: jest.fn(() => ({
    isTesting: true,
    reactNativeVersion: {
      major: 0,
      minor: 71,
      patch: 0,
    },
  })),
};