const isJest = typeof jest !== 'undefined' && typeof jest.fn === 'function';

const noopAsync = async () => null;

const storage = {
  getItem: isJest ? jest.fn(async (k) => null) : noopAsync,
  setItem: isJest ? jest.fn(async (k, v) => null) : noopAsync,
  removeItem: isJest ? jest.fn(async (k) => null) : noopAsync,
  clear: isJest ? jest.fn(async () => null) : noopAsync,
};

module.exports = {
  __esModule: true,
  default: storage,
  ...storage,
};
