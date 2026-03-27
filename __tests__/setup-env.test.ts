test('jest environment provides global window object', () => {
  expect(typeof global).toBe('object');
  expect(global.window).toBeDefined();
  const desc = Object.getOwnPropertyDescriptor(global, 'window');
  expect(desc).toBeDefined();

  // jsdom may provide a non-configurable `window` alias, but it should always be present
  if (desc) {
    expect(desc.enumerable).toBe(true);
    expect(global.window).toBe(global);
  }
});
