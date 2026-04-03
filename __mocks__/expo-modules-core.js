// Mock for expo-modules-core
module.exports = {
  Platform: {
    OS: 'ios',
    select: (obj) => obj.ios,
  },
  requireNativeModule: jest.fn(),
};
