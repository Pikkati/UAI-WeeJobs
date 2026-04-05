// Mock for PixelRatio
console.log('PixelRatio mock initialized with methods:', Object.keys(module.exports));
module.exports = {
  get: jest.fn(() => 2),
  roundToNearestPixel: jest.fn((value) => Math.round(value)),
};