console.log('Starting PixelRatio mock tests...');

jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native');
  return {
    ...actualReactNative,
    PixelRatio: require('../../__mocks__/PixelRatio'),
  };
});

const PixelRatio = require('react-native').PixelRatio;
console.log('Overridden PixelRatio mock in test file:', PixelRatio);

describe('PixelRatio Mock Test', () => {
  it('should log PixelRatio mock', () => {
    const PixelRatio = require('PixelRatio');
    console.log('PixelRatio mock test executed', PixelRatio);
    expect(PixelRatio).toBeDefined();
    expect(PixelRatio.get).toBeDefined();
    expect(PixelRatio.get()).toBe(1);
  });
});