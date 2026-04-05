jest.mock('react-native/Libraries/Utilities/PixelRatio', () => require('../__mocks__/PixelRatio'));

const PixelRatio = require('react-native/Libraries/Utilities/PixelRatio');

describe('PixelRatio Mock', () => {
  it('should mock roundToNearestPixel', () => {
    const result = PixelRatio.roundToNearestPixel(2.5);
    console.log('Mocked roundToNearestPixel result:', result);
    expect(result).toBe(3);
  });
});