// Jest-compatible shim for @react-native-async-storage/async-storage
let store = Object.create(null);

const AsyncStorageMock = {
  getItem: jest.fn(async (key) =>
    Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
  ),
  setItem: jest.fn(async (key, value) => {
    store[key] = value;
  }),
  removeItem: jest.fn(async (key) => {
    delete store[key];
  }),
  clear: jest.fn(async () => {
    store = Object.create(null);
  }),
  getAllKeys: jest.fn(async () => Object.keys(store)),
  __INTERNAL_RESET: () => {
    store = Object.create(null);
  },
};

module.exports = {
  __esModule: true,
  default: AsyncStorageMock,
};
