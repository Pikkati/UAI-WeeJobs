const Dimensions = {
  get: jest.fn((key) => {
    console.log('Mock Dimensions.get called with key:', key);
    if (key === 'screen') {
      console.log('Returning mock screen dimensions:', Dimensions.screen);
      return Dimensions.screen;
    }
    console.log('Returning mock window dimensions:', Dimensions.window);
    return Dimensions.window;
  }),
  screen: {
    width: 1080,
    height: 1920,
    scale: 2,
    fontScale: 1,
  },
  window: {
    width: 1080,
    height: 1920,
    scale: 2,
    fontScale: 1,
  },
};

console.log('Mock Dimensions module loaded:', Dimensions);

module.exports = Dimensions;