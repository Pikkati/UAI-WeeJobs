test('Verify jest-setup.js execution', () => {
  expect(global.__fbBatchedBridgeConfig).toBeDefined();
});