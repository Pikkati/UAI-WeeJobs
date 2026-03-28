const isJest = typeof jest !== 'undefined' && typeof jest.fn === 'function';
const mk = (impl) => (isJest ? jest.fn(impl) : impl);

module.exports = {
  launchImageLibraryAsync: mk(async () => ({ canceled: true })),
  launchCameraAsync: mk(async () => ({ canceled: true })),
};
module.exports = {
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true, assets: [] })),
};
