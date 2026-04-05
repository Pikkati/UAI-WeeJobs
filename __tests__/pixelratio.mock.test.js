jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native');
  return {
    ...actualReactNative,
    PixelRatio: require('../../__mocks__/PixelRatio'),
  };
});

const PixelRatio = require('react-native').PixelRatio;
console.log('Overridden PixelRatio mock in test file:', PixelRatio);

describe('PixelRatio Mock', () => {
  it('should mock roundToNearestPixel', () => {
    const result = PixelRatio.roundToNearestPixel(2.5);
    console.log('Mocked roundToNearestPixel result:', result);
    expect(result).toBe(3);
  });

  it('should mock get', () => {
    const result = PixelRatio.get();
    console.log('Mocked get result:', result);
    expect(result).toBe(1);
  });
});