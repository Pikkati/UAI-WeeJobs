// Mock for PixelRatio
console.log('PixelRatio mock loaded');
module.exports = {
  roundToNearestPixel: jest.fn((value) => {
    console.log('PixelRatio.roundToNearestPixel called with:', value);
    return value;
  }),
  get: jest.fn(() => {
    console.log('PixelRatio.get called');
    return 1;
  }),
};