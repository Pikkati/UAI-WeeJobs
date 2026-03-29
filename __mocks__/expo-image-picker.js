<<<<<<< HEAD
=======
const isJest = typeof jest !== 'undefined' && typeof jest.fn === 'function';
const mk = (impl) => (isJest ? jest.fn(impl) : impl);

module.exports = {
  launchImageLibraryAsync: mk(async () => ({ canceled: true })),
  launchCameraAsync: mk(async () => ({ canceled: true })),
};
>>>>>>> 5b2d6a4 (test: add chainable supabase mock, Expo mocks, smoke harness, and test setup tweaks)
const isJest = typeof jest !== 'undefined' && typeof jest.fn === 'function';
const mk = (impl) => (isJest ? jest.fn(impl) : impl);

module.exports = {
  launchImageLibraryAsync: mk(async () => ({ canceled: true })),
  launchCameraAsync: mk(async () => ({ canceled: true })),
};
