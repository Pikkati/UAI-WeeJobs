import Dimensions from 'react-native/Libraries/Utilities/Dimensions';

test('Verify Dimensions mock', () => {
  const screen = Dimensions.get('screen');
  expect(screen).toEqual({ width: 360, height: 640 });
});
