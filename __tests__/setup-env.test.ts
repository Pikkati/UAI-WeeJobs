test('jest environment provides configurable global.window', () => {
  expect(typeof global).toBe('object');
  expect(global.window).toBeDefined();
  const desc = Object.getOwnPropertyDescriptor(global, 'window');
  expect(desc).toBeDefined();
  // Should be writable/configurable in our env
  expect(Boolean(desc.configurable)).toBe(true);
});
